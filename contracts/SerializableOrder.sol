pragma solidity ^0.4.24;

import "bytes/BytesLib.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Seriality/src/Seriality.sol";
import "./Order.sol";

/**
 * @title Serializable Order
 * @author Ben Huang
 * @notice Let order support serialization and deserialization
 */
contract SerializableOrder is Order, Seriality {
    using SafeMath for uint256;
    using BytesLib for bytes;

    uint constant public ORDER_SIZE = 174;
    uint constant public UNSIGNED_ORDER_SIZE = 109;
    uint8 constant internal MASK_IS_BUY = 0x01;
    uint8 constant internal MASK_IS_MAIN = 0x02;

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
        uint offset = ORDER_SIZE;
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
    }

    /**
     * @notice Get user ID from the serialized order data
     * @param ser_data Serialized order data
     * @return userID User ID
     */
    function getUserID(bytes ser_data) public pure returns (uint32 userID) {
        userID = bytesToUint32(ORDER_SIZE, ser_data);
    }

    /**
     * @notice Get main token ID from the serialized order data
     * @param ser_data Serialized order data
     * @return tokenMain Main token ID
     */
    function getTokenMain(bytes ser_data) public pure returns (uint16 tokenMain) {
        tokenMain = bytesToUint16(ORDER_SIZE - 4 , ser_data);
    }

    /**
     * @notice Get main token amount from the serialized order data
     * @param ser_data Serialized order data
     * @return amountMain Main token amount
     */
    function getAmountMain(bytes ser_data) public pure returns (uint256 amountMain) {
        amountMain = bytesToUint256(ORDER_SIZE - 6, ser_data);
    }

    /**
     * @notice Get sub token ID from the serialized order data
     * @param ser_data Serialized order data
     * @return tokenSub Sub token ID
     */
    function getTokenSub(bytes ser_data) public pure returns (uint16 tokenSub) {
        tokenSub = bytesToUint16(ORDER_SIZE - 38, ser_data);
    }

    /**
     * @notice Get sub token amount from the serialized order data
     * @param ser_data Serialized order data
     * @return amountSub Sub token amount
     */
    function getAmountSub(bytes ser_data) public pure returns (uint256 amountSub) {
        amountSub = bytesToUint256(ORDER_SIZE - 40, ser_data);
    }

    /**
     * @notice Get config from the serialized order data
     * @param ser_data Serialized order data
     * @return config Configuration
     */
    function getConfig(bytes ser_data) public pure returns (uint8 config) {
        config = bytesToUint8(ORDER_SIZE - 72, ser_data);
    }

    /**
     * @notice Check if the order is a buy order
     * @param ser_data Serialized order data
     * @return fBuy Is buy order or not
     */
    function isBuy(bytes ser_data) public pure returns (bool fBuy) {
        fBuy = (bytesToUint8(ORDER_SIZE - 72, ser_data) & MASK_IS_BUY != 0);
    }

    /**
     * @notice Check if the fee is paid by main token
     * @param ser_data Serialized order data
     * @return fMain Is the fee paid in main token or not
     */
    function isMain(bytes ser_data) public pure returns (bool fMain) {
        fMain = (bytesToUint8(ORDER_SIZE - 72, ser_data) & MASK_IS_MAIN != 0);
    }

    /**
     * @notice Get nonce from the serialized order data
     * @param ser_data Serialized order data
     * @return nonce Nonce
     */
    function getNonce(bytes ser_data) public pure returns (uint32 nonce) {
        nonce = bytesToUint32(ORDER_SIZE - 73, ser_data);
    }

    /**
     * @notice Get fee price from the serialized order data
     * @param ser_data Serialized order data
     * @return feePrice Fee price
     */
    function getFeePrice(bytes ser_data) public pure returns (uint256 feePrice) {
        feePrice = bytesToUint256(ORDER_SIZE - 77, ser_data);
    }

    /**
     * @notice Get v from the serialized order data
     * @param ser_data Serialized order data
     * @return v Signature v
     */
    function getV(bytes ser_data) public pure returns (uint8 v) {
        v = bytesToUint8(ORDER_SIZE - 109, ser_data);
    }

    /**
     * @notice Get r from the serialized order data
     * @param ser_data Serialized order data
     * @return r Signature r
     */
    function getR(bytes ser_data) public pure returns (bytes32 r) {
        r = bytesToBytes32(ORDER_SIZE - 110, ser_data);
    }

    /**
     * @notice Get s from the serialized order data
     * @param ser_data Serialized order data
     * @return s Signature s
     */
    function getS(bytes ser_data) public pure returns (bytes32 s) {
        s = bytesToBytes32(ORDER_SIZE - 142, ser_data);
    }

    /**
     * @notice Get hash from the serialized order data
     * @param ser_data Serialized order data
     * @return hash Order hash without signature
     */
    function getHash(bytes ser_data) public pure returns (bytes32 hash) {
        hash = keccak256(ser_data.slice(65, UNSIGNED_ORDER_SIZE));
    }

    /**
     * @notice Fetch the serialized order data with the given index
     * @param ser_data Serialized order data
     * @param index The index of order to be fetched
     * @return order_data The fetched order data
     */
    function getOrder(bytes ser_data, uint index) public pure returns (bytes order_data) {
        require(ORDER_SIZE.mul(index.add(1)) <= ser_data.length);
        uint nOrder = ser_data.length.div(ORDER_SIZE);
        order_data = ser_data.slice(ORDER_SIZE.mul(index), ORDER_SIZE);
    }

    /**
     * @notice Count the order amount
     * @param ser_data Serialized order data
     * @return amount Order amount
     */
    function getOrderCount(bytes ser_data) internal pure returns (uint amount) {
        amount = ser_data.length.div(ORDER_SIZE);
    }
}
