require('dotenv').config();
// var MyContract = artifacts.require("./MyContract.sol");

//var MyNFT = artifacts.require("./PureNFT.sol");
var NFT = artifacts.require("./LightNFT.sol");
var SimpleTest = artifacts.require("./SimpleTest.sol");

module.exports = async function (deployer, network, accounts) {
  // deployer.deploy(MyContract);
  if (network === "development") {

    await deployer.deploy(NFT, { from: accounts[0] });
    const nft = await NFT.deployed();

    console.log("NFT deployed successfully at address: ", nft.address, " at network: ", network);

    await deployer.deploy(SimpleTest, { from: accounts[0] });
    const simple = await SimpleTest.deployed();

    console.log("SimpleTest deployed successfully at address: ", simple.address, " at network: ", network);

  } else if (network === "goerli" || network==="goerli-fork" || network === "sepolia" || network === "ethmainnet") {

    const address = process.env.METAMASK_ADDRESS_CONTRACT_OWNER;
    console.log("deploy contract from address: ", address)

    await deployer.deploy(NFT, { from: address });
    const nft = await NFT.deployed();

    console.log("NFT deployed successfully at address: ", nft.address, " at network: ", network);

  } else if (network === "nile" || network === "tronmainnet") {

    await deployer.deploy(NFT, { from: process.env.TRONLINK_ADDRESS_CONTRACT_OWNER });
    const nft = await NFT.deployed();

    console.log("NFT deployed successfully at address: ", nft.address, " at network: ", network);
  } else {
    console.log("not yet implemented, please check deploy files")
  }
};
