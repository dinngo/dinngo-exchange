pragma solidity ^0.4.24;

/**
 * @title Order
 * @author Ben Huang
 * @notice Maintaining order structure
 */
contract Order {

    /**
     * @dev Validate the order information. Can be extended.
     * @param _userID The user ID of order maker
     * @param _tokenGetID The token ID of the order is getting
     * @param _amountGet The getting amount
     * @param _tokenGiveID The token ID of the order is giving
     * @param _amountGive The giving amount
     * @param _fee Fee related configuration.
     * Bit 0: is buy order
     * Bit 1: is paid by major token
     * Bit 2-7: TBD
     * @param _feePrice The fee token price when order is created
     * @param _nonce The nonce of order
     * @param _r Signature r
     * @param _s Signature s
     * @param _v Signature v
     */
    function _validateOrder(
        uint32 _userID,
        uint16 _tokenGetID,
        uint256 _amountGet,
        uint16 _tokenGiveID,
        uint256 _amountGive,
        uint8 _fee,
        uint256 _feePrice,
        uint32 _nonce,
        bytes32 _r,
        bytes32 _s,
        uint8 _v
    )
        internal view
    {
        // extend by overriding
        require(_amountGet != 0);
        require(_amountGive != 0);
        require(_feePrice != 0);
    }

}
