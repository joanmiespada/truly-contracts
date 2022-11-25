require('dotenv').config();

var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer,network, accounts) {
  if(network === "development") {

    deployer.deploy(Migrations, {from: accounts[0]});

  }else if(network==="goerli" || network==="sepolia"){

    deployer.deploy(Migrations, {from: process.env.METAMASK_ADDRESS_CONTRACT_OWNER });

  }else{
    console.log("not yet implemented, please check migration file");
  }
};
