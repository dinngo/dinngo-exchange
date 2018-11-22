pragma solidity ^0.4.24;

import "./proxy/Proxy.sol";

/**
 * @title UserLock
 * @author Ben Huang
 * @notice Maintain a structure for user to announce lock
 */
contract UserLockProxy is Proxy {
    mapping (address => uint256) public lockTimes;

    uint256 constant internal _PROCESS_TIME = 3 days;

    /**
     * @notice Announce lock of the sender
     */
    function lock() external {
        require(_implementation.delegatecall(bytes4(keccak256("lock()"))));
    }

    /**
     * @notice Unlock the sender
     */
    function unlock() external {
        require(_implementation.delegatecall(bytes4(keccak256("unlock()"))));
    }
}
