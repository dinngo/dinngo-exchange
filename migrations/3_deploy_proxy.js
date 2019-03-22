const dinngoImplementation = artifacts.require('./Dinngo.sol');
const dinngoProxy = artifacts.require('./DinngoProxy.sol');
const walletAddress = "0x386ccaf2d8e9b0af533193bb738fab5be28da0c2"; /*Exchage wallet address*/
const tokenContract = "0x2419db9a9fe5a36a29ced12e07f9c5f699edad5e"; /*DGO token contract address*/

module.exports = function(deployer) {
    deployer.deploy(dinngoProxy, walletAddress, tokenContract, dinngoImplementation.address);
};
