// var MyContract = artifacts.require("./MyContract.sol");
var PureNFT = artifacts.require("./PureNFT.sol");

module.exports = function(deployer, network, accounts) {
  // deployer.deploy(MyContract);
  if(network === "development") {
    deployer.deploy(PureNFT , {from: accounts[0]});
  }else{
    console.log("not implemented")
  }
};
