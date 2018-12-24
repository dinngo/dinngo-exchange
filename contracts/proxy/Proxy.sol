pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/utils/Address.sol';
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Proxy interface for Dinngo exchange contract.
 * @author Ben Huang
 * @dev Referenced the proxy contract from zeppelin-os project.
 * https://github.com/zeppelinos/zos/tree/master/packages/lib
 */
contract Proxy is Ownable {
    using Address for address;

    // keccak256 hash of "dinngo.proxy.implementation"
    bytes32 private constant IMPLEMENTATION_SLOT =
        0x3b2ff02c0f36dba7cc1b20a669e540b974575f04ef71846d482983efb03bebb4;

    event Upgraded(address indexed implementation);

    constructor(address implementation) internal {
        assert(IMPLEMENTATION_SLOT == keccak256("dinngo.proxy.implementation"));
        _setImplementation(implementation);
    }

    /**
     * @notice Upgrade the implementation contract. Can only be triggered
     * by the owner. Emits the Upgraded event.
     * @param implementation The new implementation address.
     */
    function upgrade(address implementation) external onlyOwner {
        _setImplementation(implementation);
        emit Upgraded(implementation);
    }

    /**
     * @dev Set the implementation address in the storage slot.
     * @param implementation The new implementation address.
     */
    function _setImplementation(address implementation) internal {
        require(implementation.isContract(),
            "Implementation address should be a contract address"
        );
        bytes32 slot = IMPLEMENTATION_SLOT;

        assembly {
            sstore(slot, implementation)
        }
    }

    /**
     * @dev Returns the current implementation address.
     */
    function _implementation() internal view returns (address implementation) {
        bytes32 slot = IMPLEMENTATION_SLOT;

        assembly {
            implementation := sload(slot)
        }
    }
}
