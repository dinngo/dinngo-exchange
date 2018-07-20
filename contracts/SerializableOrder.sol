pragma solidity ^0.4.24;

import "./Seriality/src/Seriality.sol";

contract SerializableOrder is Seriality {
    uint constant order_size = 174;

    function serializeOrder(
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
        public
        returns (bytes)
    {
        bytes memory buffer = new bytes(order_size);
        uint offset = order_size;

        uintToBytes(offset, _userID, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, _tokenGetID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, _amountGet, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, _tokenGiveID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, _amountGive, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, _fee, buffer);
        offset -= sizeOfUint(8);

        uintToBytes(offset, _DGOPrice, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, _nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, _v, buffer);
        offset -= sizeOfUint(8);

        bytes32ToBytes(offset, _r, buffer);
        offset -= 32;

        bytes32ToBytes(offset, _s, buffer);

        return buffer;
    }

    function deserializeOrder(bytes ser_data) public
        returns (
            uint32 userID,
            uint16 tokenGetID,
            uint256 amountGet,
            uint16 tokenGiveID,
            uint256 amountGive,
            uint8 fee,
            uint256 DGOPrice,
            uint32 nonce,
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        uint offset = order_size;
        userID = bytesToUint32(offset, ser_data);
        offset -= sizeOfUint(32);

        tokenGetID = bytesToUint16(offset, ser_data);
        offset -= sizeOfUint(16);

        amountGet = bytesToUint256(offset, ser_data);
        offset -= sizeOfUint(256);

        tokenGiveID = bytesToUint16(offset, ser_data);
        offset -= sizeOfUint(16);

        amountGive = bytesToUint256(offset, ser_data);
        offset -= sizeOfUint(256);

        fee = bytesToUint8(offset, ser_data);
        offset -= sizeOfUint(8);

        DGOPrice = bytesToUint256(offset, ser_data);
        offset -= sizeOfUint(256);

        nonce = bytesToUint32(offset, ser_data);
        offset -= sizeOfUint(32);

        v = bytesToUint8(offset, ser_data);
        offset -= sizeOfUint(8);

        r = bytesToBytes32(offset, ser_data);
        offset -= 32;

        s = bytesToBytes32(offset, ser_data);
    }
}
