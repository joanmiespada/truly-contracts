
const { expect } = require('chai');
const truffleAssert = require('truffle-assertions');
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const MyNFT = artifacts.require('PureNFT');
const mockdata = require('./mockdata');

// Start test block
contract('PureNFT', function (accounts) {

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

    it('1.0 owner contract', async function () {

        await this.mynft.getTotalMinted({ from: owner });
        await truffleAssert.reverts(
            this.mynft.getTotalMinted({ from: creator1 }),
        );
    });
    // Test case
    it('2.0 create new NFTs', async function () {
        // Store a value
        //console.log('createNFT -> owner address: ' + owner)
        let nft = mockdata[0];

        let tx;

        tx = await this.mynft.getTotalMinted();
        expect(tx.toString()).to.equal('0');

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

        //expect(tx).not.be.empty;
        expectEvent(tx, 'Minted', { owner: creator1, token: nft.token });
        tx = await this.mynft.getTotalMinted();
        expect(tx.toString()).to.equal('1');

        nft = mockdata[1];
        tx = await this.mynft.mint(
            creator2,
            nft.token,
            nft.uriFile,
            nft.hashFile,
            nft.uriMetaFile,
            nft.hashMetaFile,
            nft.price,
            nft.uriLicense,
            nft.copyright
        );
        truffleAssert.eventEmitted(tx, 'Minted', (ev) => {
            return ev.owner == creator2 && ev.token == nft.token
        });
        tx = await this.mynft.getTotalMinted();
        expect(tx.toString()).to.equal('2');

        nft = mockdata[2];
        tx = await this.mynft.mint(
            creator3,
            nft.token,
            nft.uriFile,
            nft.hashFile,
            nft.uriMetaFile,
            nft.hashMetaFile,
            nft.price,
            nft.uriLicense,
            nft.copyright
        );

        expectEvent(tx, 'Minted', { owner: creator3, token: nft.token });
        tx = await this.mynft.getTotalMinted();
        expect(tx.toString()).to.equal('3');

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

        expect(tx[0][0]).eq(owner);
        expect(tx[1][0].toString()).eq('30');

        expect(tx[0][1]).eq(creator1);
        expect(tx[1][1].toString()).eq('70');

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
            await this.mynft.transferOwnership(creator1, 'xyz' , creator1, 10, { from: owner });
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }
        try {
            await this.mynft.transferOwnership(creator1, 'xyz' , owner, 10, { from: owner });
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

        expect(tx[0][0]).eq(owner);
        expect(tx[1][0].toString()).eq('30');

        expect(tx[0][1]).eq(creator1);
        expect(tx[1][1].toString()).eq('70');

        tx = await this.mynft.transferOwnership(creator1, nft.token, owner, 50, { from: owner });

        expectEvent(tx, 'Transfered', { token: nft.token, percentatge: BN(50), from: creator1, newFromPercentatge: BN(20), to: owner, newToPercentate: BN(80) });

        tx = await this.mynft.getOnwersByToken(nft.token);

        expect(tx[0][0]).eq(owner);
        expect(tx[1][0].toString()).eq('80');

        expect(tx[0][1]).eq(creator1);
        expect(tx[1][1].toString()).eq('20');


    });


    /*
      it('non owner cannot mint', async function () {
    
      const token = await this.mynft.safeMint(
          account9, 'http://s3/test1.mp4',
          'hash_mp4', 'http://s3/test.json', 
          'hash_meta', '8:00pm' , { from: other });
    
        // Test a transaction reverts
        await expectRevert(token, 'Ownable: caller is not the owner',
        );
      });
    
    });
    */

});