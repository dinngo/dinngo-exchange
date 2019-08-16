pragma solidity ^0.5.0
;

import "../proxy/Proxy.sol";
import "./DummyImplementation.sol";

contract ProxyMock is Proxy, DummyImplementation {

    constructor(address implementation) Proxy(implementation) public {}

    function implementation() view external returns (address) {
        return _implementation();
    }

}
