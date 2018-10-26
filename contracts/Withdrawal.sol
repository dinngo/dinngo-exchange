pragma solidity ^0.4.24;

/**
 * @title Withdraw
 * @author Ben Huang
 * @notice Maintaining withdraw structure
 */
contract Withdrawal {

    /**
     * @dev Validate the withdrawal information. Can be extended.
     * @param amount The withdrawal amount.
     */
    function _validateWithdrawal(uint256 amount) internal view {
        require(amount > 0);
    }

    /**
     * @dev Validate the withdrawal token information. Can be extended.
     * @param token The withdrawal token address.
     * @param amount The withdrawal token amount.
     */
    function _validateWithdrawalToken(address token, uint256 amount) internal view {
        require(token != address(0));
        require(amount > 0);
    }

}
