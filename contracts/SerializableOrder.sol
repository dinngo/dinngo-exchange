pragma solidity ^0.4.24;

import "./Seriality/src/Seriality.sol";
import "./Order.sol";

contract SerializableOrder is Order, Seriality {
    uint constant order_size = 174;
    uint constant unsigned_order_size = 109;

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

        uintToBytes(offset, _nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, _DGOPrice, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, _v, buffer);
        offset -= sizeOfUint(8);

        bytes32ToBytes(offset, _r, buffer);
        offset -= 32;

        bytes32ToBytes(offset, _s, buffer);

        return buffer;
    }

    function hashOrder(
        uint32 _userID,
        uint16 _tokenGetID,
        uint256 _amountGet,
        uint16 _tokenGiveID,
        uint256 _amountGive,
        uint8 _fee,
        uint256 _DGOPrice,
        uint32 _nonce
    )
        public
        returns (bytes32)
    {
        bytes memory buffer = new bytes(unsigned_order_size);
        uint offset = unsigned_order_size;

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

        uintToBytes(offset, _nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, _DGOPrice, buffer);

        return keccak256(buffer);
    }

    function testHash() public returns (bytes32) {
        return hashOrder(
            323,
            123,
            23 ether,
            321,
            43 ether,
            1,
            2000,
            17
        );
    }

    function testSerialize() public returns (bytes) {
        // signed with 0x627306090abab3a6e1400e9345bc60c78a8bef57
        return serializeOrder(
            323,
            123,
            23 ether,
            321,
            43 ether,
            1,
            2000,
            17,
            0xbc0d6e379e0dabce205aa6c599ac8b9fcb04c39007f7b988d013e535c4496120,
            0x0ad5694d7af2dab7bc9283fa9944af162f6fa880dad299b780958a99581a7120,
            0x01
        );
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

        nonce = bytesToUint32(offset, ser_data);
        offset -= sizeOfUint(32);

        DGOPrice = bytesToUint256(offset, ser_data);
        offset -= sizeOfUint(256);

        v = bytesToUint8(offset, ser_data);
        offset -= sizeOfUint(8);

        r = bytesToBytes32(offset, ser_data);
        offset -= 32;

        s = bytesToBytes32(offset, ser_data);

        _validateOrder(
            userID,
            tokenGetID,
            amountGet,
            tokenGiveID,
            amountGive,
            fee,
            DGOPrice,
            nonce,
            r,
            s,
            v
        );
    }
}
