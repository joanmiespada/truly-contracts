
const { expect, assert } = require('chai');
const truffleAssert = require('truffle-assertions');
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const MyNFT = artifacts.require('PureNFT');
const mockdata = require('./mockdata');

// Start test block
contract('PureNFT basic', function (accounts) {

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


    it('2.1 errors creating nfts without enough info', async function () {

        const nft = mockdata[1];

        try {
            await this.mynft.mint( //only creator1 has 70% and owner has 30%
                '',
                nft.token,
                nft.uriFile,
                nft.hashFile,
                nft.uriMetaFile,
                nft.hashMetaFile,
                nft.price,
                nft.uriLicense,
                nft.copyright
            )
            assert.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }

        try {
            let tx = await this.mynft.mint( //only creator1 has 70% and owner has 30%
                '0',
                nft.token,
                nft.uriFile,
                nft.hashFile,
                nft.uriMetaFile,
                nft.hashMetaFile,
                nft.price,
                nft.uriLicense,
                nft.copyright
            );
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }
        try {
            let tx = await this.mynft.mint( //only creator1 has 70% and owner has 30%
                creator1,
                '',
                nft.uriFile,
                nft.hashFile,
                nft.uriMetaFile,
                nft.hashMetaFile,
                nft.price,
                nft.uriLicense,
                nft.copyright
            );
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }
        try {
            let tx = await this.mynft.mint( //only creator1 has 70% and owner has 30%
                creator1,
                'token repe',
                nft.uriFile,
                nft.hashFile,
                nft.uriMetaFile,
                nft.hashMetaFile,
                nft.price,
                nft.uriLicense,
                nft.copyright
            );
            tx = await this.mynft.mint( //only creator1 has 70% and owner has 30%
                creator2,
                'token repe',
                nft.uriFile,
                nft.hashFile,
                nft.uriMetaFile,
                nft.hashMetaFile,
                nft.price,
                nft.uriLicense,
                nft.copyright
            );
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }
        try {
            let tx = await this.mynft.mint( //only creator1 has 70% and owner has 30%
                creator1,
                nft.token,
                '',
                nft.hashFile,
                nft.uriMetaFile,
                nft.hashMetaFile,
                nft.price,
                nft.uriLicense,
                nft.copyright
            );
            expect.fail();
        } catch (ex) {
            expect(ex).not.be.empty;
        }

    });


});