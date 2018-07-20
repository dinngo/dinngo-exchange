pragma solidity ^0.4.24;

import "./Seriality/src/Seriality.sol";
import "./Order.sol";

/**
 * @title Serializable Order
 * @author Ben Huang
 * @notice Let order support serialization and deserialization
 */
contract SerializableOrder is Order, Seriality {

    uint constant public order_size = 174;
    uint constant public unsigned_order_size = 109;

    /**
     * @notice Serialize the order and output a hex string
     * @dev Mind the serialization sequence
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
     * @return buffer The serialized hex string
     */
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
        pure
        returns (bytes memory buffer)
    {
        buffer = new bytes(order_size);
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
    }

    /**
     * @notice Hash the order content to be signed
     * @dev Mind the sequence
     * @param _userID The user ID of order maker
     * @param _tokenGetID The token ID of the order is getting
     * @param _amountGet The getting amount
     * @param _tokenGiveID The token ID of the order is giving
     * @param _amountGive The giving amount
     * @param _fee The fee providing method
     * @param _DGOPrice The DGO price when order is created (for paying fee)
     * @param _nonce The nonce of order
     * @return hash The hash value of order
     */
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
        pure
        returns (bytes32 hash)
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

        hash = keccak256(buffer);
    }

    // @dev To be removed
    function testHash() public pure returns (bytes32) {
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

    // @dev To be removed
    function testSerialize() public pure returns (bytes) {
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

    /**
     * @notice Deserialize the order hex and output order components
     * @dev Mind the deserialization sequence
     * @param ser_data The serialized hex string
     * @return userID The user ID of order maker
     * @return tokenGetID The token ID of the order is getting
     * @return amountGet The getting amount
     * @return tokenGiveID The token ID of the order is giving
     * @return amountGive The giving amount
     * @return fee The fee providing method
     * @return DGOPrice The DGO price when order is created (for paying fee)
     * @return nonce The nonce of order
     * @return r Signature r
     * @return s Signature s
     * @return v Signature v
     */
    function deserializeOrder(bytes ser_data) public view
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
