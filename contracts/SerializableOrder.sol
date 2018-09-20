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
     * @param _mainTokenID The token ID of main token in the order
     * @param _mainAmount The main token amount
     * @param _subTokenID The token ID of sub token in the order
     * @param _subAmount The sub token amount
     * @param _config Order configurations
     * Bit 0: is buy order or not
     * Bit 1: is fee paid by major token or not
     * Bit 2-7: TBD
     * @param _feePrice The fee token price when order is created
     * @param _nonce The nonce of order
     * @param _r Signature r
     * @param _s Signature s
     * @param _v Signature v
     * @return buffer The serialized hex string
     */
    function serializeOrder(
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
        public
        pure
        returns (bytes memory buffer)
    {
        buffer = new bytes(order_size);
        uint offset = order_size;

        uintToBytes(offset, _userID, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, _mainTokenID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, _mainAmount, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, _subTokenID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, _subAmount, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, _config, buffer);
        offset -= sizeOfUint(8);

        uintToBytes(offset, _nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, _feePrice, buffer);
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
     * @param _mainTokenID The token ID of main token in the order
     * @param _mainAmount The main token amount
     * @param _subTokenID The token ID of sub token in the order
     * @param _subAmount The sub token amount
     * @param _config Order configuration
     * Bit 0: is buy order
     * Bit 1: is paid by major token
     * Bit 2-7: TBD
     * @param _feePrice The fee token price when order is created
     * @param _nonce The nonce of order
     * @return hash The hash value of order
     */
    function hashOrder(
        uint32 _userID,
        uint16 _mainTokenID,
        uint256 _mainAmount,
        uint16 _subTokenID,
        uint256 _subAmount,
        uint8 _config,
        uint256 _feePrice,
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

        uintToBytes(offset, _mainTokenID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, _mainAmount, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, _subTokenID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, _subAmount, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, _config, buffer);
        offset -= sizeOfUint(8);

        uintToBytes(offset, _nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, _feePrice, buffer);

        hash = keccak256(buffer);
    }

    // @dev To be removed
    function testHash() public pure returns (bytes32) {
        return hashOrder(
            1,
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
            1,
            123,
            23 ether,
            321,
            43 ether,
            1,
            2000,
            17,
            0x4d7d48db3242b9029d8ae67f5c86fafffd8a2168fc5aa6071e55c504d55a678e,
            0x690cb3cbd35a82fa20d98c45ada097dc07f7235174ea6bf0efb12f9359cca96b,
            0x00
        );
    }

    /**
     * @notice Deserialize the order hex and output order components
     * @dev Mind the deserialization sequence
     * @param ser_data The serialized hex string
     * @return userID The user ID of order maker
     * @return mainTokenID The token ID of main token in the order
     * @return mainAmount The main token amount
     * @return subTokenID The token ID of sub topken in the order
     * @return subAmount The sub token amount
     * @return config Fee related configuration.
     * Bit 0: is buy order
     * Bit 1: is paid by major token
     * Bit 2-7: TBD
     * @return feePrice The fee token price when order is created
     * @return nonce The nonce of order
     * @return r Signature r
     * @return s Signature s
     * @return v Signature v
     */
    function deserializeOrder(bytes ser_data) public view
        returns (
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
    {
        uint offset = order_size;
        userID = bytesToUint32(offset, ser_data);
        offset -= sizeOfUint(32);

        mainTokenID = bytesToUint16(offset, ser_data);
        offset -= sizeOfUint(16);

        mainAmount = bytesToUint256(offset, ser_data);
        offset -= sizeOfUint(256);

        subTokenID = bytesToUint16(offset, ser_data);
        offset -= sizeOfUint(16);

        subAmount = bytesToUint256(offset, ser_data);
        offset -= sizeOfUint(256);

        config = bytesToUint8(offset, ser_data);
        offset -= sizeOfUint(8);

        nonce = bytesToUint32(offset, ser_data);
        offset -= sizeOfUint(32);

        feePrice = bytesToUint256(offset, ser_data);
        offset -= sizeOfUint(256);

        v = bytesToUint8(offset, ser_data);
        offset -= sizeOfUint(8);

        r = bytesToBytes32(offset, ser_data);
        offset -= 32;

        s = bytesToBytes32(offset, ser_data);

        _validateOrder(
            userID,
            mainTokenID,
            mainAmount,
            subTokenID,
            subAmount,
            config,
            feePrice,
            nonce,
            r,
            s,
            v
        );
    }

    /**
     * @notice Get user ID from the serialized order data
     * @param ser_data Serialized order data
     * @return userID User ID
     */
    function getUserID(bytes ser_data) public pure returns (uint32 userID) {
        userID = bytesToUint32(order_size, ser_data);
    }

    /**
     * @notice Get main token ID from the serialized order data
     * @param ser_data Serialized order data
     * @return mainTokenID Main token ID
     */
    function getMainTokenID(bytes ser_data) public pure returns (uint16 mainTokenID) {
        mainTokenID = bytesToUint16(order_size - 4 , ser_data);
    }

    /**
     * @notice Get main token amount from the serialized order data
     * @param ser_data Serialized order data
     * @return mainAmount Main token amount
     */
    function getMainAmount(bytes ser_data) public pure returns (uint256 mainAmount) {
        mainAmount = bytesToUint256(order_size - 6, ser_data);
    }

    /**
     * @notice Get sub token ID from the serialized order data
     * @param ser_data Serialized order data
     * @return subTokenID Sub token ID
     */
    function getSubTokenID(bytes ser_data) public pure returns (uint16 subTokenID) {
        subTokenID = bytesToUint16(order_size - 38, ser_data);
    }

    /**
     * @notice Get sub token amount from the serialized order data
     * @param ser_data Serialized order data
     * @return subAmount Sub token amount
     */
    function getSubAmount(bytes ser_data) public pure returns (uint256 subAmount) {
        subAmount = bytesToUint256(order_size - 40, ser_data);
    }

    /**
     * @notice Get config from the serialized order data
     * @param ser_data Serialized order data
     * @return config Configuration
     */
    function getConfig(bytes ser_data) public pure returns (uint8 config) {
        config = bytesToUint8(order_size - 72, ser_data);
    }

    /**
     * @notice Check if the order is a buy order
     * @param ser_data Serialized order data
     * @return fBuy Is buy order or not
     */
    function isBuy(bytes ser_data) public pure returns (bool fBuy) {
        fBuy = (bytesToUint8(order_size - 72, ser_data) & MASK_IS_BUY != 0);
    }

    /**
     * @notice Check if the fee is paid by main token
     * @param ser_data Serialized order data
     * @return fMain Is the fee paid in main token or not
     */
    function isMain(bytes ser_data) public pure returns (bool fMain) {
        fMain = (bytesToUint8(order_size - 72, ser_data) & MASK_IS_MAIN != 0);
    }

    /**
     * @notice Get nonce from the serialized order data
     * @param ser_data Serialized order data
     * @return nonce Nonce
     */
    function getNonce(bytes ser_data) public pure returns (uint32 nonce) {
        nonce = bytesToUint32(order_size - 73, ser_data);
    }

    /**
     * @notice Get fee price from the serialized order data
     * @param ser_data Serialized order data
     * @return feePrice Fee price
     */
    function getFeePrice(bytes ser_data) public pure returns (uint256 feePrice) {
        feePrice = bytesToUint256(order_size - 77, ser_data);
    }

    /**
     * @notice Get v from the serialized order data
     * @param ser_data Serialized order data
     * @return v Signature v
     */
    function getV(bytes ser_data) public pure returns (uint8 v) {
        v = bytesToUint8(order_size - 109, ser_data);
    }

    /**
     * @notice Get r from the serialized order data
     * @param ser_data Serialized order data
     * @return r Signature r
     */
    function getR(bytes ser_data) public pure returns (bytes32 r) {
        r = bytesToBytes32(order_size - 110, ser_data);
    }

    /**
     * @notice Get s from the serialized order data
     * @param ser_data Serialized order data
     * @return s Signature s
     */
    function getS(bytes ser_data) public pure returns (bytes32 s) {
        s = bytesToBytes32(order_size - 142, ser_data);
    }

    /**
     * @notice Get hash from the serialized order data
     * @param ser_data Serialized order data
     * @return hash Order hash without signature
     */
    function getHash(bytes ser_data) public pure returns (bytes32 hash) {
        require(ser_data.length >= unsigned_order_size);
        bytes memory tempBytes;
        uint offset = unsigned_order_size;

        assembly {
            tempBytes := mload(0x40)

            let lengthmod := and(offset, 31)

            let mc := add(add(tempBytes, lengthmod), mul(0x20, iszero(lengthmod)))
            let end := add(mc, offset)

            for {
                let cc := add(add(add(ser_data, lengthmod), mul(0x20, iszero(lengthmod))), 65)
            } lt(mc, end) {
                mc := add(mc, 0x20)
                cc := add(cc, 0x20)
            } {
                mstore(mc, mload(cc))
            }
            mstore(tempBytes, offset)

            mstore(0x40, and(add(mc, 31), not(31)))
        }

        hash = keccak256(tempBytes);
    }
}
