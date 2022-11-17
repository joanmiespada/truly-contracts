
const { expect } = require('chai');
const truffleAssert = require('truffle-assertions');
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const MyNFT = artifacts.require('PureNFT');
const mockdata = require('./mockdata');

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


    it('6.0 buy an NFT', async function () {

        let tx;

        const nft = mockdata[0];
        tx = await this.mynft.getContentByToken(nft.token);

        expect(tx.uriLicense).eq(nft.uriLicense)
        expect(tx.copyright).eq(nft.copyright)

        const newCopyright = "new licence buyer1";
        const newLicense = "new copyright buyer1";
        tx = await this.mynft.buy(nft.token, newLicense, newCopyright, { from: buyer1, value: 11 });

        expect(tx).not.empty;
        tx = await this.mynft.getContentByToken(nft.token);
        expect(tx.uriLicense).eq(newLicense)
        expect(tx.copyright).eq(newCopyright)

        tx = await this.mynft.getOnwersByToken(nft.token);

        expect(tx[0][0]).eq(owner);
        expect(tx[1][0].toString()).eq('0');

        expect(tx[0][1]).eq(creator1);
        expect(tx[1][1].toString()).eq('0');

        expect(tx[0][2]).eq(buyer1);
        expect(tx[1][2].toString()).eq('100');

    });

    it('6.1 try to buy an NFT without enough money', async function () {

        let tx;
        try {
            const nft = mockdata[0];
            tx = await this.mynft.getContentByToken(nft.token);

            expect(tx.uriLicense).eq(nft.uriLicense)
            expect(tx.copyright).eq(nft.copyright)

            const newCopyright = "new licence buyer1";
            const newLicense = "new copyright buyer1";
            tx = await this.mynft.buy(nft.token, newLicense, newCopyright, { from: buyer1, value: 2 });
            expect.fail()
        } catch (ex) {
            expect(ex).not.be.empty;
        }


    });




});