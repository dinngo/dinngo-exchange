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
     * @param _mainTokenID The token ID of main token in the order
     * @param _mainAmount The main token amount
     * @param _subTokenID The token ID of sub token in the order
     * @param _subAmount The sub token amount
     * @param _config Fee related configuration.
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
        uint16 _mainTokenID,
        uint256 _mainAmount,
        uint16 _subTokenID,
        uint256 _subAmount,
        uint8 _config,
        uint256 _feePrice,
        uint32 _nonce,
        bytes32 _r,
        bytes32 _s,
        uint8 _v
    )
        internal view
    {
        // extend by overriding
        require(_mainAmount != 0);
        require(_subAmount != 0);
        require(_feePrice != 0);
    }

}
