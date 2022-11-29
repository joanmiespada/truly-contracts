
const { expect } = require('chai');
const truffleAssert = require('truffle-assertions');
const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const Web3 = require('web3');

// Load compiled artifacts
const MyNFT = artifacts.require('LightNFT');
const mockdata = require('../mockdata');

// Start test block
contract('LightNFT gas', function (accounts) {

    const owner = accounts[0];
    const creator1 = accounts[9];
    const creator2 = accounts[8];
    const creator3 = accounts[7];

    const buyer1 = accounts[6];
    const buyer2 = accounts[5];
    const buyer3 = accounts[4];


    beforeEach(async function () {
        // Deploy a new Box contract for each test
        // console.log('beforeEach -> owner address: ' + owner )
        this.mynft = await MyNFT.new({ from: owner });
        this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

    });


    it('8.0 buy an NFT - gas movement', async function () {


        var balanceOwnerWei = await this.web3.eth.getBalance(owner);
        var balanceContractWei = await this.web3.eth.getBalance(this.mynft.address);
        var balanceBuyer1Wei = await this.web3.eth.getBalance(buyer1);
        var balanceCreator1Wei = await this.web3.eth.getBalance(creator1);
        //var balanceOnwerEther = this.web3.utils.fromWei(balance, 'ether');

        expect(balanceContractWei).eq('0');
        let tx;

        const nft = mockdata[0];
        const pvp = 10; // in ethers
        const originalPriceWei = this.web3.utils.toWei(pvp.toString(), 'ether'); // in weis
        tx = await this.mynft.mint(
            creator1,
            nft.token,
            //nft.uriFile,
            nft.hashFile,
            //nft.uriMetaFile,
            //nft.hashMetaFile,
            originalPriceWei,
            //nft.uriLicense,
            //nft.copyright,
            { from: owner }
        );
        // owner pay the minting
        const balanceOwnerAfterMintWei = await this.web3.eth.getBalance(owner);
        let costForOwner = (BN(balanceOwnerWei).sub(BN(balanceOwnerAfterMintWei))).toString();
        let costForOwnerInETH = this.web3.utils.fromWei(costForOwner, 'ether'); // ojo aqui!!!!! aqui tenemos el coste
        expect(BN(costForOwner).gt(BN('0'))).to.be.true;
        // creator1 don't pay anything when minting
        const balanceCreator1AfterMintWei = await this.web3.eth.getBalance(creator1);
        let costForCreator1 = (BN(balanceCreator1Wei).sub(BN(balanceCreator1AfterMintWei))).toString();
        expect(BN(costForCreator1).eq(BN('0'))).to.be.true;

        //let's purchase the NFT
        //const newCopyright = "new licence buyer1";
        //const newLicense = "new copyright buyer1";
        const newPvp = 25; //in eth
        const newPriceWeis = this.web3.utils.toWei(newPvp.toString(), 'ether'); // in weis

        tx = await this.mynft.buy(nft.token, newPriceWeis, { from: buyer1, value: originalPriceWei });

        //Buyer 1 must pay gas fees + original price
        var balanceBuyer1AfterPurchaseWei = await this.web3.eth.getBalance(buyer1);
        var totalCost = (BN(balanceBuyer1Wei).sub(BN(balanceBuyer1AfterPurchaseWei))).toString();
        expect(BN(totalCost).gt(BN(originalPriceWei))).to.be.true;
        expect(BN(balanceBuyer1AfterPurchaseWei).lt(BN(balanceBuyer1Wei))).to.be.true;
        // Fees must match
        var feesExpected = (BN(totalCost).sub(BN(originalPriceWei))).toString();
        var feesReal = (BN(tx.receipt.gasUsed).mul(BN(tx.receipt.effectiveGasPrice))).toString();
        expect(feesExpected).eq(feesReal);
        //Owner must have no change in its balance
        var balanceOwnerAfterPurchaseWei = await this.web3.eth.getBalance(owner);
        costForOwner = (BN(balanceOwnerAfterMintWei).sub(BN(balanceOwnerAfterPurchaseWei))).toString();
        expect(BN(costForOwner).eq(BN('0'))).to.be.true;
        //Creator must have no change in its balance
        var balanceCreator1AfterPurchaseWei = await this.web3.eth.getBalance(creator1);
        costForCreator1 = (BN(balanceCreator1AfterMintWei).sub(BN(balanceCreator1AfterPurchaseWei))).toString();
        expect(BN(costForCreator1).eq(BN('0'))).to.be.true;

        //contract holds the money
        var balanceContractAfterPurchaseWei = await this.web3.eth.getBalance(this.mynft.address);
        expect(balanceContractAfterPurchaseWei).eq(originalPriceWei);

        // let's withdraw the money for each owner
        var balanceCreator1BeforeWithdrawWei = await this.web3.eth.getBalance(creator1);
        var balanceBuyer1BeforeWithdrawWei = await this.web3.eth.getBalance(buyer1);
        var balanceOwnerBeforeWithdrawWei = await this.web3.eth.getBalance(owner);
        var balanceContractBeforeWithdrawWei = await this.web3.eth.getBalance(this.mynft.address);
        tx = await this.mynft.withdraw(nft.token, { from: creator1 });
        var balanceCreator1AfterWithdrawWei = await this.web3.eth.getBalance(creator1);
        var balanceBuyer1AfterWithdrawWei = await this.web3.eth.getBalance(buyer1);
        var balanceOwnerAfterWithdrawWei = await this.web3.eth.getBalance(owner);
        var balanceContractAfterWithdrawWei = await this.web3.eth.getBalance(this.mynft.address);

        //creator 1 must be: previusFunds + fees + netRevenues == currentFunds + fees
        let netRevenues = (BN(balanceCreator1AfterWithdrawWei).sub(BN(balanceCreator1BeforeWithdrawWei))).toString();
        expect(BN(netRevenues).gt(BN('0'))).to.be.true;
        feesReal = (BN(tx.receipt.gasUsed).mul(BN(tx.receipt.effectiveGasPrice))).toString();
        expect(BN(feesReal).gt(BN('0'))).to.be.true;
        expect((BN(balanceCreator1BeforeWithdrawWei).add(BN(feesReal)).add(BN(netRevenues)))
            .eq(BN(balanceCreator1AfterWithdrawWei).add(BN(feesReal))))
            .to.be.true;
        // contract must be: currentAmount+revenues+fees == beforeAmount
        expect((BN(balanceContractAfterWithdrawWei).add(BN(netRevenues)).add(BN(feesReal))).eq(BN(balanceContractBeforeWithdrawWei)))
            .to.be.true;

        //Owner must have no change in its balance
        costForOwner = (BN(balanceOwnerAfterWithdrawWei).sub(BN(balanceOwnerBeforeWithdrawWei))).toString();
        expect(BN(costForOwner).eq(BN('0'))).to.be.true;
        //Buyer1 must have no change in its balance
        let costForBuyer1 = (BN(balanceBuyer1AfterWithdrawWei).sub(BN(balanceBuyer1BeforeWithdrawWei))).toString();
        expect(BN(costForBuyer1).eq(BN('0'))).to.be.true;

        //expected money for creator1
        const expectedIncomesForCreator1 = (pvp / 100) * 70; // 70% of pvp, 30% is for owner
        const expectedIncomesForCreator1Weis = this.web3.utils.toWei(expectedIncomesForCreator1.toString(), 'ether'); // in weis
        expect(
            BN(netRevenues).add(BN(feesReal)).eq(BN(expectedIncomesForCreator1Weis))
        ).to.be.true;



        //other amount of money to owner

        balanceContractBeforeWithdrawWei = await this.web3.eth.getBalance(this.mynft.address);
        balanceOwnerBeforeWithdrawWei = await this.web3.eth.getBalance(owner);
        tx = await this.mynft.withdraw(nft.token, { from: owner });
        balanceOwnerAfterWithdrawWei = await this.web3.eth.getBalance(owner);
        balanceContractAfterWithdrawWei = await this.web3.eth.getBalance(this.mynft.address);


        netRevenues = (BN(balanceOwnerAfterWithdrawWei).sub(BN(balanceOwnerBeforeWithdrawWei))).toString();
        expect(BN(netRevenues).gt(BN('0'))).to.be.true;
        feesReal = (BN(tx.receipt.gasUsed).mul(BN(tx.receipt.effectiveGasPrice))).toString();
        expect(BN(feesReal).gt(BN('0'))).to.be.true;
        expect((BN(balanceOwnerBeforeWithdrawWei).add(BN(feesReal)).add(BN(netRevenues)))
            .eq(BN(balanceOwnerAfterWithdrawWei).add(BN(feesReal))))
            .to.be.true;
        // contract must be: currentAmount+revenues+fees == beforeAmount
        expect((BN(balanceContractAfterWithdrawWei).add(BN(netRevenues)).add(BN(feesReal))).eq(BN(balanceContractBeforeWithdrawWei)))
            .to.be.true;
        // contract must be 0 funds
        expect(BN(balanceContractAfterWithdrawWei).eq(BN('0'))).to.be.true;

        //expected money for owner
        const expectedIncomesForOwner = (pvp / 100) * 30; // 30% is for owner
        const expectedIncomesForOwnerWeis = this.web3.utils.toWei(expectedIncomesForOwner.toString(), 'ether'); // in weis
        expect(
            BN(netRevenues).add(BN(feesReal)).eq(BN(expectedIncomesForOwnerWeis))
        ).to.be.true;

    });

    it('8.1 buy an NFT and withdraw funds no owner - no gas movement', async function () {

        //when someone that isn't the owner try to get money, nothing happens. No funds movement.

        let tx;

        const nft = mockdata[0];
        const pvp = 10; // in ethers
        const originalPriceWei = this.web3.utils.toWei(pvp.toString(), 'ether'); // in weis
        tx = await this.mynft.mint(
            creator1,
            nft.token,
            //nft.uriFile,
            nft.hashFile,
            //nft.uriMetaFile,
            //nft.hashMetaFile,
            originalPriceWei,
            //nft.uriLicense,
            //nft.copyright,
            { from: owner }
        );
        var balanceCreator1BeforeWithdrawWei = await this.web3.eth.getBalance(creator1);
        var balanceBuyer1BeforeWithdrawWei = await this.web3.eth.getBalance(buyer1);
        var balanceOwnerBeforeWithdrawWei = await this.web3.eth.getBalance(owner);
        var balanceContractBeforeWithdrawWei = await this.web3.eth.getBalance(this.mynft.address);
        try {
            tx = await this.mynft.withdraw(nft.token, { from: creator2 });
            expect.fail();
        } catch (ex) {

            var balanceCreator1AfterWithdrawWei = await this.web3.eth.getBalance(creator1);
            var balanceBuyer1AfterWithdrawWei = await this.web3.eth.getBalance(buyer1);
            var balanceOwnerAfterWithdrawWei = await this.web3.eth.getBalance(owner);
            var balanceContractAfterWithdrawWei = await this.web3.eth.getBalance(this.mynft.address);


            let diff = (BN(balanceOwnerAfterWithdrawWei).sub(BN(balanceOwnerBeforeWithdrawWei))).toString();
            expect(BN(diff).eq(BN('0'))).to.be.true;

            diff = (BN(balanceBuyer1AfterWithdrawWei).sub(BN(balanceBuyer1BeforeWithdrawWei))).toString();
            expect(BN(diff).eq(BN('0'))).to.be.true;

            diff = (BN(balanceContractAfterWithdrawWei).sub(BN(balanceContractBeforeWithdrawWei))).toString();
            expect(BN(diff).eq(BN('0'))).to.be.true;

            diff = (BN(balanceCreator1AfterWithdrawWei).sub(BN(balanceCreator1BeforeWithdrawWei))).toString();
            expect(BN(diff).eq(BN('0'))).to.be.true;
        }

    });
/*
    it('8.2 withdraw super fast', async function () {
        await Promise.all(mockdata.map((nft, index) => {
            return this.mynft.mint(
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
        }));

        //let's purchase the NFT
        const newCopyright = "new licence buyer1";
        const newLicense = "new copyright buyer1";
        const newPvp = 25; //in eth
        const newPriceWeis = this.web3.utils.toWei(newPvp.toString(), 'ether'); // in weis

        tx = await this.mynft.buy(mockdata[0].token, newLicense, newCopyright, newPriceWeis, { from: buyer1, value: mockdata[0].price });
        tx = await this.mynft.buy(mockdata[1].token, newLicense, newCopyright, newPriceWeis, { from: buyer1, value: mockdata[1].price});
        tx = await this.mynft.buy(mockdata[2].token, newLicense, newCopyright, newPriceWeis, { from: buyer1, value: mockdata[2].price});


        let blk1 = await time.latestBlock();
        tx = await this.mynft.withdraw(mockdata[0].token, { from: creator1 });
        try {
            let blk2 = await time.latestBlock();
            tx = await this.mynft.withdraw(mockdata[1].token, { from: creator1 });
            expect.fail();
        } catch (ex) {
            if(ex.message === 'expect.fail()')
                expect.fail();
            expect(ex).not.be.empty;
        }
        await time.advanceBlock();
        try{
            tx = await this.mynft.withdraw(mockdata[1].token, { from: creator1 });
            expect(tx).not.be.empty;
        } catch (ex) {
            expect.fail();
        }

    });
*/

});