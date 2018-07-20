pragma solidity ^0.4.24;

contract Order {
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
        internal returns (bool)
    {
        // override
    }
}
