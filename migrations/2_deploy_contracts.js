// var MyContract = artifacts.require("./MyContract.sol");
var PureNFT = artifacts.require("./PureNFT.sol");

module.exports = function(deployer) {
  // deployer.deploy(MyContract);
  deployer.deploy(PureNFT);
};
