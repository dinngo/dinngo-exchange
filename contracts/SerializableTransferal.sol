pragma solidity ^0.5.0;

import "bytes/BytesLib.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title Serializable Transferal
 * @author Ben Huang
 * @notice Let transferal support serialization and deserialization
 */
contract SerializableTransferal {
    using SafeMath for uint256;
    using BytesLib for bytes;

    uint constant public TRANSFERAL_1_SIZE = 25;
    uint constant public RECEIVER_SIZE = 86;
    uint8 constant internal _MASK_IS_ETH = 0x01;

    /**
     * @notice Get from address from the serialized transferal data
     * @param ser_data Serialized transferal data
     * @return from User address
     */
    function _getTransferalFrom(bytes memory ser_data) internal pure returns (address from) {
        from = ser_data.toAddress(ser_data.length - 20);
    }

    /**
     * @notice Check if the fee is paid by transferal token
     * @param ser_data Serialized transferal data
     * @return fETH Is the fee paid in transferal token or DGO
     */
    function _isTransferalFeeMain(bytes memory ser_data) internal pure returns (bool fFeeETH) {
        fFeeETH = (ser_data.toUint8(ser_data.length - 21) & _MASK_IS_ETH != 0);
    }

    /**
     * @notice Get nonce from the serialized transferal data
     * @param ser_data Serialized transferal data
     * @return nonce Nonce
     */
    function _getTransferalNonce(bytes memory ser_data) internal pure returns (uint256 nonce) {
        nonce = ser_data.toUint32(ser_data.length - 25);
    }

    /**
     * @notice Get receiver count
     * @param ser_data Serialized transferal data
     * @return n The transferal receiver amount
     */
    function _getTransferalCount(bytes memory ser_data) internal pure returns (uint256 n) {
        n = (ser_data.length - TRANSFERAL_1_SIZE) / RECEIVER_SIZE;
    }

    /**
     * @notice Get receiver address to be transferred to
     * @param ser_data Serialized transferal data
     * @param index The index of receiver address to be transferred to
     * @return to The address to be transferred to
     */
    function _getTransferalTo(bytes memory ser_data, uint index) internal pure returns (address to) {
        require(index < _getTransferalCount(ser_data));
        to = ser_data.toAddress(ser_data.length - TRANSFERAL_1_SIZE - (RECEIVER_SIZE.mul(index)) - 20);
    }

    /**
     * @notice Get token address to be transferred
     * @param ser_data Serialized transferal data
     * @param index The index of token address to be transferred to
     * @return token The token address to be transferred
     */
    function _getTransferalTokenID(bytes memory ser_data, uint index) internal pure returns (uint256 token) {
        require(index < _getTransferalCount(ser_data));
        token = ser_data.toUint16(ser_data.length - TRANSFERAL_1_SIZE - (RECEIVER_SIZE.mul(index)) - 22);
    }

    /**
     * @notice Get token amount to be transferred
     * @param ser_data Serialized transferal data
     * @param index The index of token amount to be transferred to
     * @return amount The amount to be transferred
     */
    function _getTransferalAmount(bytes memory ser_data, uint index) internal pure returns (uint256 amount) {
        require(index < _getTransferalCount(ser_data));
        amount = ser_data.toUint(ser_data.length - TRANSFERAL_1_SIZE - (RECEIVER_SIZE.mul(index)) - 54);
    }

    /**
     * @notice Get token amount to be transferred
     * @param ser_data Serialized transferal data
     * @param index The index of token amount to be transferred to
     * @return fee The fee amount
     */
    function _getTransferalFee(bytes memory ser_data, uint index) internal pure returns (uint256 fee) {
        require(index < _getTransferalCount(ser_data));
        fee = ser_data.toUint(ser_data.length - TRANSFERAL_1_SIZE - (RECEIVER_SIZE.mul(index)) - 86);
    }

    /**
     * @notice Get hash from the serialized transferal data
     * @param ser_data Serialized transferal data
     * @return hash Transferal hash without signature
     */
    function _getTransferalHash(bytes memory ser_data) internal pure returns (bytes32 hash) {
        hash = keccak256(ser_data);
    }
}
