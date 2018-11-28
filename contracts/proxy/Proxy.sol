pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/utils/Address.sol';
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract Proxy is Ownable {
    using Address for address;

    // keccak256 hash of "dinngo.proxy.implementation"
    bytes32 private constant IMPLEMENTATION_SLOT =
        0x3b2ff02c0f36dba7cc1b20a669e540b974575f04ef71846d482983efb03bebb4;

    event Upgraded(address indexed implementation);

    constructor(address implementation) public {
        assert(IMPLEMENTATION_SLOT == keccak256("dinngo.proxy.implementation"));
        _setImplementation(implementation);
    }

    function upgrade(address implementation) external onlyOwner {
        _setImplementation(implementation);
        emit Upgraded(implementation);
    }

    function _setImplementation(address implementation) internal {
        require(implementation.isContract(),
            "Implementation address should be a contract address"
        );
        bytes32 slot = IMPLEMENTATION_SLOT;

        assembly {
            sstore(slot, implementation)
        }
    }

    function _implementation() internal view returns (address implementation) {
        bytes32 slot = IMPLEMENTATION_SLOT;

        assembly {
            implementation := sload(slot)
        }
    }
}
