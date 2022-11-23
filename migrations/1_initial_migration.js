var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer,network, accounts) {
  if(network === "development") {

    deployer.deploy(Migrations, {from: accounts[0]});

  }else{
    console.log("not yes implementes");
  }
};
