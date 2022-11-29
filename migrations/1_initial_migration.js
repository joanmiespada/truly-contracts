require('dotenv').config();

var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer,network, accounts) {
  if(network === "ethdevelopment") {

    deployer.deploy(Migrations, {from: accounts[0]});

  }else if(network==="goerli" || network==="sepolia" || network === "ethmainnet"){

    const address = process.env.METAMASK_ADDRESS_CONTRACT_OWNER;
    console.log("deploy migration from address: ", address )
    deployer.deploy(Migrations, {from: address  });

  }else if(network==="nile" || network==="tronmainnet" ){

    deployer.deploy(Migrations, {from: process.env.TRONLINK_ADDRESS_CONTRACT_OWNER });

  }else{
    console.log("not yet implemented, please check migration file");
  }
};
