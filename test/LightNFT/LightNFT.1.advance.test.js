
const { expect } = require('chai');
const truffleAssert = require('truffle-assertions');
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const MyNFT = artifacts.require('LightNFT');
const mockdata = require('./mockdata');

// Start test block
contract('LightNFT advance', function (accounts) {

    const owner = accounts[0];
    const creator1 = accounts[9];
    const creator2 = accounts[8];
    const creator3 = accounts[7];
    //console.log('test main -> owner address: ' + owner )

    beforeEach(async function () {
        // Deploy a new Box contract for each test
        // console.log('beforeEach -> owner address: ' + owner )
        this.mynft = await MyNFT.new({ from: owner });
    });


    it('3.0 retrive content from an NFT', async function () {

        let nft = mockdata[0];
        let tx;

        tx = await this.mynft.mint(
            creator1,
            nft.token,
            nft.uriFile,
            nft.hashFile,
            nft.uriMetaFile,
            nft.hashMetaFile,
            nft.price,
            nft.uriLicense,
            nft.copyright
        );

        tx = await this.mynft.getContentByToken(nft.token);

        expect(tx.uriFile).eq(nft.uriFile)
        expect(tx.hashFile).eq(nft.hashFile)
        expect(tx.uriMetaFile).eq(nft.uriMetaFile)
        expect(tx.hashMetaFile).eq(nft.hashMetaFile)
        expect(tx.price.toString()).eq(String(nft.price))
        expect(tx.uriLicense).eq(nft.uriLicense)
        expect(tx.copyright).eq(nft.copyright)
        expect(tx.state).eq('Active')

        try {
            tx = await this.mynft.getContentByToken('xyz');
        } catch (ex) {
            expect(ex).not.be.empty;
        }

    });

    it('4.0 retrive owners from an NFT', async function () {

        let nft = mockdata[0];
        let tx;

        tx = await this.mynft.mint(
            creator1,
            nft.token,
            nft.uriFile,
            nft.hashFile,
            nft.uriMetaFile,
            nft.hashMetaFile,
            nft.price,
            nft.uriLicense,
            nft.copyright
        );

        tx = await this.mynft.getOnwersByToken(nft.token);

        expect(tx[0].owner).eq(owner);
        expect(tx[0].percentatge).eq('30');

        expect(tx[1].owner).eq(creator1);
        expect(tx[1].percentatge).eq('70');

    });


    it('5.0 change ownership among owners', async function () {
        const nft = mockdata[1];
        let tx = await this.mynft.mint( //only creator1 has 70% and owner has 30%
            creator1,
            nft.token,
            nft.uriFile,
            nft.hashFile,
            nft.uriMetaFile,
            nft.hashMetaFile,
            nft.price,
            nft.uriLicense,
            nft.copyright
        );
        try {
            await this.mynft.transferOwnership(creator1, 'xyz', creator1, 10, { from: owner });
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }
        try {
            await this.mynft.transferOwnership(creator1, 'xyz', owner, 10, { from: owner });
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }
        try {
            await this.mynft.transferOwnership(creator2, nft.token, creator3, 50, { from: creator3 });
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }
        try {
            await this.mynft.transferOwnership(creator2, nft.token, creator3, 50, { from: owner });
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }
        try {
            await this.mynft.transferOwnership(creator2, nft.token, creator3, 50, { from: owner });
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }
        try {
            await this.mynft.transferOwnership(creator3, nft.token, creator2, 50, { from: owner });
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }
        try {
            await this.mynft.transferOwnership(creator1, nft.token, owner, 90, { from: owner });
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }
        try {
            await this.mynft.transferOwnership(creator1, nft.token, creator2, 10, { from: owner });
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }


        tx = await this.mynft.getOnwersByToken(nft.token);

        expect(tx[0].owner).eq(owner);
        expect(tx[0].percentatge).eq('30');

        expect(tx[1].owner).eq(creator1);
        expect(tx[1].percentatge).eq('70');

        const len = tx.length;

        tx = await this.mynft.transferOwnership(creator1, nft.token, owner, 50, { from: owner });

        expectEvent(tx, 'Transfered', { token: nft.token, percentatge: BN(50), from: creator1, newFromPercentatge: BN(20), to: owner, newToPercentate: BN(80) });

        tx = await this.mynft.getOnwersByToken(nft.token);

        expect(tx[0].owner).eq(owner);
        expect(tx[0].percentatge).eq('80');

        expect(tx[1].owner).eq(creator1);
        expect(tx[1].percentatge).eq('20');

        expect(tx.length).be.eq(len);

    });

    it('6.0 disable/enable token', async function () {

        let nft = mockdata[0];
        let tx;

        tx = await this.mynft.mint(
            creator1,
            nft.token,
            nft.uriFile,
            nft.hashFile,
            nft.uriMetaFile,
            nft.hashMetaFile,
            nft.price,
            nft.uriLicense,
            nft.copyright, 
            { from: owner }
        );

        const newLicense = "new copyright buyer1";
        const newCopyright = "new licence buyer1";
        const buyer1 = accounts[6];
        tx = await this.mynft.disableByToken(nft.token, { from: owner });
        expectEvent(tx, 'DisabledToken', {token: nft.token});

        try {
            tx = await this.mynft.buy(nft.token, newLicense, newCopyright, 1000, { from: buyer1, value: nft.price+1 });
            expect.fail()
        } catch (ex) {
            expect(ex).not.be.empty;
            //expectRevert(ex);
        }

        tx = await this.mynft.getContentByToken(nft.token);
        expect(tx.state).eq('Inactive');

        tx = await this.mynft.enableByToken(nft.token, { from: owner });
        expectEvent(tx, 'EnabledToken', {token: nft.token});

        tx = await this.mynft.getContentByToken(nft.token);
        expect(tx.state).eq('Active');

        try {
            tx = await this.mynft.buy(nft.token, newLicense, newCopyright, 1000, { from: buyer1, value: nft.price+1 });
            expectEvent(tx, 'Sold', { buyer: buyer1, token: nft.token, amount: BN( nft.price+1 ), newLicense: newLicense, newCopyright: newCopyright });
        } catch (ex) {
            expect.fail();
        }

    });

    

});