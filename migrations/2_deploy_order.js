const SerializableOrder = artifacts.require('./SerializableOrder.sol');

module.exports = function(deployer) {
  deployer.deploy(SerializableOrder).then(() => {
    return SerializableOrder.deployed();
  });
};
