require('dotenv').config();
// var MyContract = artifacts.require("./MyContract.sol");

//var MyNFT = artifacts.require("./PureNFT.sol");
var NFT = artifacts.require("./LightNFT.sol");

module.exports = async function (deployer, network, accounts) {
  // deployer.deploy(MyContract);
  if (network === "development") {

    await deployer.deploy(NFT, { from: accounts[0] });
    const nft = await NFT.deployed();

    console.log("NFT deployed successfully at address: ", nft.address, " at network: ", network);

  } else if (network === "goerli" || network === "sepolia" || network === "ethmainnet") {

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
