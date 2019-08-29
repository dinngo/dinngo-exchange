pragma solidity ^0.5.0;

import "bytes/BytesLib.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title Serializable Order
 * @author Ben Huang
 * @notice Let order support serialization and deserialization
 */
contract SerializableOrder {
    using SafeMath for uint256;
    using BytesLib for bytes;

    uint constant public ORDER_SIZE = 206;
    uint constant public UNSIGNED_ORDER_SIZE = 141;
    uint8 constant internal _MASK_IS_BUY = 0x01;
    uint8 constant internal _MASK_IS_MAIN = 0x02;

    /**
     * @notice Get user ID from the serialized order data
     * @param ser_data Serialized order data
     * @return userID User ID
     */
    function _getOrderUserID(bytes memory ser_data) internal pure returns (uint256 userID) {
        userID = ser_data.toUint32(ORDER_SIZE - 4);
    }

    /**
     * @notice Get base token ID from the serialized order data
     * @param ser_data Serialized order data
     * @return tokenBase Base token ID
     */
    function _getOrderTokenIDBase(bytes memory ser_data) internal pure returns (uint256 tokenBase) {
        tokenBase = ser_data.toUint16(ORDER_SIZE - 6);
    }

    /**
     * @notice Get base token amount from the serialized order data
     * @param ser_data Serialized order data
     * @return amountBase Base token amount
     */
    function _getOrderAmountBase(bytes memory ser_data) internal pure returns (uint256 amountBase) {
        amountBase = ser_data.toUint(ORDER_SIZE - 38);
    }

    /**
     * @notice Get quote token ID from the serialized order data
     * @param ser_data Serialized order data
     * @return tokenQuote Quote token ID
     */
    function _getOrderTokenIDQuote(bytes memory ser_data) internal pure returns (uint256 tokenQuote) {
        tokenQuote = ser_data.toUint16(ORDER_SIZE - 40);
    }

    /**
     * @notice Get quote token amount from the serialized order data
     * @param ser_data Serialized order data
     * @return amountQuote Quote token amount
     */
    function _getOrderAmountQuote(bytes memory ser_data) internal pure returns (uint256 amountQuote) {
        amountQuote = ser_data.toUint(ORDER_SIZE - 72);
    }

    /**
     * @notice Check if the order is a buy order
     * @param ser_data Serialized order data
     * @return fBuy Is buy order or not
     */
    function _isOrderBuy(bytes memory ser_data) internal pure returns (bool fBuy) {
        fBuy = (ser_data.toUint8(ORDER_SIZE - 73) & _MASK_IS_BUY != 0);
    }

    /**
     * @notice Check if the fee is paid by main token
     * @param ser_data Serialized order data
     * @return fMain Is the fee paid in main token or not
     */
    function _isOrderFeeMain(bytes memory ser_data) internal pure returns (bool fMain) {
        fMain = (ser_data.toUint8(ORDER_SIZE - 73) & _MASK_IS_MAIN != 0);
    }

    /**
     * @notice Get nonce from the serialized order data
     * @param ser_data Serialized order data
     * @return nonce Nonce
     */
    function _getOrderNonce(bytes memory ser_data) internal pure returns (uint256 nonce) {
        nonce = ser_data.toUint32(ORDER_SIZE - 77);
    }

    /**
     * @notice Get handling fee from the serialized order data
     * @param ser_data Serialized order data
     * @return fee Fee amount
     */
    function _getOrderHandleFee(bytes memory ser_data) internal pure returns (uint256 handleFee) {
        handleFee = ser_data.toUint(ORDER_SIZE - 109);
    }

    /**
     * @notice Get gas fee from the serialized order data
     * @param ser_data Serialized order data
     * @return fee Fee amount
     */
    function _getOrderGasFee(bytes memory ser_data) internal pure returns (uint256 gasFee) {
        gasFee = ser_data.toUint(ORDER_SIZE - 141);
    }

    /**
     * @notice Get v from the serialized order data
     * @param ser_data Serialized order data
     * @return v Signature v
     */
    function _getOrderV(bytes memory ser_data) internal pure returns (uint8 v) {
        v = ser_data.toUint8(ORDER_SIZE - 142);
    }

    /**
     * @notice Get r from the serialized order data
     * @param ser_data Serialized order data
     * @return r Signature r
     */
    function _getOrderR(bytes memory ser_data) internal pure returns (bytes32 r) {
        r = ser_data.toBytes32(ORDER_SIZE - 174);
    }

    /**
     * @notice Get s from the serialized order data
     * @param ser_data Serialized order data
     * @return s Signature s
     */
    function _getOrderS(bytes memory ser_data) internal pure returns (bytes32 s) {
        s = ser_data.toBytes32(ORDER_SIZE - 206);
    }

    /**
     * @notice Get hash from the serialized order data
     * @param ser_data Serialized order data
     * @return hash Order hash without signature
     */
    function _getOrderHash(bytes memory ser_data) internal pure returns (bytes32 hash) {
        hash = keccak256(ser_data.slice(65, UNSIGNED_ORDER_SIZE));
    }

    /**
     * @notice Fetch the serialized order data with the given index
     * @param ser_data Serialized order data
     * @param index The index of order to be fetched
     * @return order_data The fetched order data
     */
    function _getOrder(bytes memory ser_data, uint index) internal pure returns (bytes memory order_data) {
        require(index < _getOrderCount(ser_data));
        order_data = ser_data.slice(ORDER_SIZE.mul(index), ORDER_SIZE);
    }

    /**
     * @notice Count the order amount
     * @param ser_data Serialized order data
     * @return amount Order amount
     */
    function _getOrderCount(bytes memory ser_data) internal pure returns (uint256 amount) {
        amount = ser_data.length.div(ORDER_SIZE);
    }
}
