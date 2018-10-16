pragma solidity ^0.4.24;

/**
 * @title Withdraw
 * @author Ben Huang
 * @notice Maintaining withdraw structure
 */
contract Withdrawal {

    /**
     * @dev Validate the withdrawal information. Can be extended.
     * @param _amount The withdrawal amount.
     */
    function _validateWithdrawal(uint256 _amount) internal view {
        require(_amount > 0);
    }

    /**
     * @dev Validate the withdrawal token information. Can be extended.
     * @param _token The withdrawal token address.
     * @param _amount The withdrawal token amount.
     */
    function _validateWithdrawalToken(address _token, uint256 _amount) internal view {
        require(_token != address(0));
        require(_amount > 0);
    }

}
