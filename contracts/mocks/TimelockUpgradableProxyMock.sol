pragma solidity ^0.4.24;

import "../proxy/TimelockUpgradableProxy.sol";
import "./DummyImplementation.sol";

contract TimelockUpgradableProxyMock is TimelockUpgradableProxy, DummyImplementation {

    constructor(address implementation) Proxy(implementation) public {}

    function implementation() view external returns (address) {
        return _implementation();
    }

    function time() view external returns (uint256) {
        return _time();
    }

    function registration() view external returns (address) {
        return _registration();
    }

}
