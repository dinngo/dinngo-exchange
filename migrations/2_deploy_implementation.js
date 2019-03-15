const dinngoImplementation = artifacts.require('./Dinngo.sol');

module.exports = function(deployer) {
    deployer.deploy(dinngoImplementation);
};
