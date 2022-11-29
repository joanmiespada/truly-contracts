require('dotenv').config();
// var MyContract = artifacts.require("./MyContract.sol");
var PureNFT = artifacts.require("./PureNFT.sol");

module.exports = async function(deployer, network, accounts) {
  // deployer.deploy(MyContract);
  if(network === "ethdevelopment") {

    await deployer.deploy(PureNFT , {from: accounts[0]});
    const purenft = await PureNFT.deployed();

    console.log("PureNFT deployed successfully at address: ", purenft.address, " at network: ", network );

  }else if(network === "goerli" || network === "sepolia" || network === "ethmainnet"){

    const address = process.env.METAMASK_ADDRESS_CONTRACT_OWNER;
    console.log("deploy contract from address: ", address )

    await deployer.deploy(PureNFT , {from: address });
    const purenft = await PureNFT.deployed();

    console.log("PureNFT deployed successfully at address: ", purenft.address, " at network: ", network );

  }else if( network === "nile" || network==="tronmainnet"){

    await deployer.deploy(PureNFT , {from: process.env.TRONLINK_ADDRESS_CONTRACT_OWNER });
    const purenft = await PureNFT.deployed();

    console.log("PureNFT deployed successfully at address: ", purenft.address, " at network: ", network );
  }else{
    console.log("not yet implemented, please check deploy files")
  }
};
