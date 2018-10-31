pragma solidity ^0.4.24;

/**
 * @title UserLock
 * @author Ben Huang
 * @notice Maintain a structure for user to announce lock
 */
contract UserLock {
    mapping (address => uint256) public lockTimes;

    uint256 constant internal _PROCESS_TIME = 3 days;

    event Lock(address indexed user, uint256 lockTime);
    event Unlock(address indexed user);

    /**
     * @notice Announce lock of the sender
     */
    function lock() external {
        require(!_isLocking(msg.sender));
        lockTimes[msg.sender] = now + _PROCESS_TIME;
        emit Lock(msg.sender, lockTimes[msg.sender]);
    }

    /**
     * @notice Unlock the sender
     */
    function unlock() external {
        require(_isLocking(msg.sender));
        lockTimes[msg.sender] = 0;
        emit Unlock(msg.sender);
    }

    /**
     * @notice Return if the give user has announced lock
     * @param user The user address to be queried
     * @return Query result
     */
    function _isLocking(address user) internal view returns (bool) {
        return lockTimes[user] > 0;
    }

    /**
     * @notice Return if the user is locked
     * @param user The user address to be queried
     */
    function _isLocked(address user) internal view returns (bool) {
        return _isLocking(user) && lockTimes[user] < now;
    }
}
