require('dotenv').config();
// var MyContract = artifacts.require("./MyContract.sol");
var PureNFT = artifacts.require("./PureNFT.sol");

module.exports = async function(deployer, network, accounts) {
  // deployer.deploy(MyContract);
  if(network === "development") {

    await deployer.deploy(PureNFT , {from: accounts[0]});
    const purenft = await PureNFT.deployed();

    console.log("PureNFT deployed successfully at address: ", purenft.address, " at network: ", network );

  }else if(network === "goerli" ){

    await deployer.deploy(PureNFT , {from: process.env.METAMASK_ADDRESS_CONTRACT_OWNER });
    const purenft = await PureNFT.deployed();

    console.log("PureNFT deployed successfully at address: ", purenft.address, " at network: ", network );


  }else{
    console.log("not implemented")
  }
};
