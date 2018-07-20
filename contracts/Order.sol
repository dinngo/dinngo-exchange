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
     * @param _fee The fee providing method
     * @param _DGOPrice The DGO price when order is created (for paying fee)
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
        uint256 _DGOPrice,
        uint32 _nonce,
        bytes32 _r,
        bytes32 _s,
        uint8 _v
    )
        internal view returns (bool)
    {
        // to be overriden
    }

}
