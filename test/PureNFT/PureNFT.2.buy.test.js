
const { expect } = require('chai');
const truffleAssert = require('truffle-assertions');
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const MyNFT = artifacts.require('PureNFT');
const mockdata = require('../mockdata');

// Start test block
contract('PureNFT buy', function (accounts) {

    const owner = accounts[0];
    const creator1 = accounts[9];
    const creator2 = accounts[8];
    const creator3 = accounts[7];

    const buyer1 = accounts[6];
    const buyer2 = accounts[5];
    const buyer3 = accounts[4];

    //console.log('test main -> owner address: ' + owner )

    beforeEach(async function () {
        // Deploy a new Box contract for each test
        // console.log('beforeEach -> owner address: ' + owner )
        this.mynft = await MyNFT.new({ from: owner });
        await Promise.all(mockdata.map((nft, index) => {
            return this.mynft.mint(
                accounts[9 - index],
                nft.token,
                nft.uriFile,
                nft.hashFile,
                nft.uriMetaFile,
                nft.hashMetaFile,
                nft.price,
                nft.uriLicense,
                nft.copyright
            );
        }));


    });


    it('7.0 buy an NFT', async function () {

        let tx;

        const nft = mockdata[0];
        tx = await this.mynft.getContentByToken(nft.token);

        expect(tx.uriLicense).eq(nft.uriLicense)
        expect(tx.copyright).eq(nft.copyright)

        const newCopyright = "new licence buyer1";
        const newLicense = "new copyright buyer1";
        const newPrice = 1000;
        const adquiredBy = 100;
        tx = await this.mynft.buy(nft.token, newLicense, newCopyright, newPrice, { from: buyer1, value: adquiredBy });

        expectEvent(tx, 'Sold', { buyer: buyer1, token: nft.token, amount: BN(adquiredBy), newLicense: newLicense, newCopyright: newCopyright });

        tx = await this.mynft.getContentByToken(nft.token);
        expect(tx.uriLicense).eq(newLicense);
        expect(tx.copyright).eq(newCopyright);
        expect(tx.price.toNumber()).eq(newPrice);

        tx = await this.mynft.getPendingWithdrawsByToken(nft.token);

        expect(tx[0].owner).eq(owner);
        expect(tx[0].percentatge).eq('0');
        expect(tx[0].amount).eq('30');

        expect(tx[1].owner).eq(creator1);
        expect(tx[1].percentatge).eq('0');
        expect(tx[1].amount).eq('70');

        expect(tx[2].owner).eq(buyer1);
        expect(tx[2].percentatge).eq('100');
        expect(tx[2].amount).eq('0');

    });


    it('7.1 try to buy an NFT below the 100 threshold', async function () {

        let tx;
        const nft = mockdata[0];
        tx = await this.mynft.getContentByToken(nft.token);

        expect(tx.uriLicense).eq(nft.uriLicense)
        expect(tx.copyright).eq(nft.copyright)

        const newCopyright = "new licence buyer1";
        const newLicense = "new copyright buyer1";
        await expectRevert.unspecified(this.mynft.buy(nft.token, newLicense, newCopyright, 1000, { from: buyer1, value: 90 }));

    });

    it('7.1.1 try to buy an NFT without enough money', async function () {

        let tx;
        const nft = mockdata[1];
        tx = await this.mynft.getContentByToken(nft.token);

        expect(tx.uriLicense).eq(nft.uriLicense)
        expect(tx.copyright).eq(nft.copyright)

        const newCopyright = "new licence buyer1";
        const newLicense = "new copyright buyer1";
        await expectRevert.unspecified(this.mynft.buy(nft.token, newLicense, newCopyright, 1000, { from: buyer1, value: 499 }));

    });

    it('7.2 withdraw money', async function () {
        let tx;

        const nft = mockdata[0];

        const newCopyright = "new licence buyer1";
        const newLicense = "new copyright buyer1";
        const newPrice = 10000;
        const adquiredBy = 1000;

        let expectedMoneyOwner = (adquiredBy / 100) * 30;
        let expectedMoneyCreator = (adquiredBy / 100) * 70;

        tx = await this.mynft.buy(nft.token, newLicense, newCopyright, newPrice, { from: buyer1, value: BN(adquiredBy) });

        expectEvent(tx, 'Sold', { buyer: buyer1, token: nft.token, amount: BN(adquiredBy), newLicense: newLicense, newCopyright: newCopyright });

        tx = await this.mynft.getPendingWithdrawsByToken(nft.token, { from: owner });

        expect(tx[0].owner).eq(owner);
        expect(tx[0].percentatge).eq('0');
        expect(tx[0].amount).eq(expectedMoneyOwner.toString());

        expect(tx[1].owner).eq(creator1);
        expect(tx[1].percentatge).eq('0');
        expect(tx[1].amount).eq(expectedMoneyCreator.toString());

        expect(tx[2].owner).eq(buyer1);
        expect(tx[2].percentatge).eq('100');
        expect(tx[2].amount).eq('0');

        tx = await this.mynft.withdraw(nft.token, { from: creator1 });

        expectEvent(tx, 'Withdrawn', { seller: creator1, amount: BN(expectedMoneyCreator) });

        tx = await this.mynft.getPendingWithdrawsByToken(nft.token, { from: owner });

        expect(tx[0].owner).eq(owner);
        expect(tx[0].percentatge).eq('0');
        expect(tx[0].amount).eq(expectedMoneyOwner.toString());

        expect(tx[1].owner).eq(creator1);
        expect(tx[1].percentatge).eq('0');
        expect(tx[1].amount).eq('0');

        expect(tx[2].owner).eq(buyer1);
        expect(tx[2].percentatge).eq('100');
        expect(tx[2].amount).eq('0');


        tx = await this.mynft.withdraw(nft.token, { from: owner });
        expectEvent(tx, 'Withdrawn', { seller: owner, amount: BN(expectedMoneyOwner) });

        tx = await this.mynft.getPendingWithdrawsByToken(nft.token, { from: owner });

        expect(tx[0].owner).eq(owner);
        expect(tx[0].percentatge).eq('0');
        expect(tx[0].amount).eq('0');

        expect(tx[1].owner).eq(creator1);
        expect(tx[1].percentatge).eq('0');
        expect(tx[1].amount).eq('0');

        expect(tx[2].owner).eq(buyer1);
        expect(tx[2].percentatge).eq('100');
        expect(tx[2].amount).eq('0');



    });

    it('7.3 withdraw peding not contract owner', async function () {

        try {
            const nft = mockdata[0];
            tx = await this.mynft.getPendingWithdrawsByToken(nft.token, { from: buyer1 });
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }
        try {
            const nft = mockdata[0];
            tx = await this.mynft.getPendingWithdrawsByToken(nft.token, { from: creator1 });
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }

    });

    it('7.4 getWithdrawsAvailableByToken ', async function () {

        let tx;

        const nft = mockdata[0];

        const newCopyright = "new licence buyer1";
        const newLicense = "new copyright buyer1";
        const newPrice = 10000;
        const adquiredBy = 1000;

        tx = await this.mynft.buy(nft.token, newLicense, newCopyright, newPrice, { from: buyer1, value: BN(adquiredBy) });

        tx = await this.mynft.getWithdrawsForMeByToken(nft.token, { from: owner });
        expect(tx.toString()).eq('300');
        tx = await this.mynft.getWithdrawsForMeByToken(nft.token, { from: creator1 });
        expect(tx.toString()).eq('700');
        tx = await this.mynft.getWithdrawsForMeByToken(nft.token, { from: buyer1 });
        expect(tx.toString()).eq('0');

        try{
            tx = await this.mynft.getWithdrawsForMeByToken(nft.token, { from: buyer2 });
            expect.fail();
        }catch(ex){
            expect(ex).not.be.empty;
        }

    });

});