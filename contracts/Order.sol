pragma solidity ^0.4.24;

/**
 * @title Order
 * @author Ben Huang
 * @notice Maintaining order structure
 */
contract Order {

    /**
     * @dev Validate the order information. Can be extended.
     * @param userID The user ID of order maker
     * @param mainTokenID The token ID of main token in the order
     * @param mainAmount The main token amount
     * @param subTokenID The token ID of sub token in the order
     * @param subAmount The sub token amount
     * @param config Fee related configuration.
     * Bit 0: is buy order
     * Bit 1: is paid by major token
     * Bit 2-7: TBD
     * @param feePrice The fee token price when order is created
     * @param nonce The nonce of order
     * @param r Signature r
     * @param s Signature s
     * @param v Signature v
     */
    function _validateOrder(
        uint32 userID,
        uint16 mainTokenID,
        uint256 mainAmount,
        uint16 subTokenID,
        uint256 subAmount,
        uint8 config,
        uint256 feePrice,
        uint32 nonce,
        bytes32 r,
        bytes32 s,
        uint8 v
    )
        internal view
    {
        // extend by overriding
        require(mainAmount != 0);
        require(subAmount != 0);
        require(feePrice != 0);
    }
}
