pragma solidity ^0.5.0;

import "bytes/BytesLib.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title Serializable Transferral
 * @author Ben Huang
 * @notice Let transferral support serialization and deserialization
 */
contract SerializableTransferral {
    using SafeMath for uint256;
    using BytesLib for bytes;

    uint constant public TRANSFERRAL_1_SIZE = 53;
    uint constant public RECEIVER_SIZE = 86;
    uint8 constant internal _MASK_IS_ETH = 0x01;

    /**
     * @notice Get from address from the serialized transferral data
     * @param ser_data Serialized transferral data
     * @return from User address
     */
    function _getTransferralFrom(bytes memory ser_data) internal pure returns (address from) {
        from = ser_data.toAddress(ser_data.length - 4);
    }

    /**
     * @notice Check if the fee is paid by transferral token
     * @param ser_data Serialized transferral data
     * @return fETH Is the fee paid in transferral token or DGO
     */
    function _isTransferralFeeMain(bytes memory ser_data) internal pure returns (bool fFeeETH) {
        fFeeETH = (ser_data.toUint8(ser_data.length - 5) & _MASK_IS_ETH != 0);
    }

    /**
     * @notice Get nonce from the serialized transferral data
     * @param ser_data Serialized transferral data
     * @return nonce Nonce
     */
    function _getTransferralNonce(bytes memory ser_data) internal pure returns (uint256 nonce) {
        nonce = ser_data.toUint(ser_data.length - 37);
    }

    /**
     * @notice Get receiver count
     * @param ser_data Serialized transferral data
     * @return n The transferral receiver amount
     */
    function _getTransferralCount(bytes memory ser_data) internal pure returns (uint256 n) {
        n = (ser_data.length - TRANSFERRAL_1_SIZE) / RECEIVER_SIZE;
    }

    /**
     * @notice Get receiver address to be transferred to
     * @param ser_data Serialized transferral data
     * @param index The index of receiver address to be transferred to
     * @return to The address to be transferred to
     */
    function _getTransferralTo(bytes memory ser_data, uint index) internal pure returns (address to) {
        require(index < _getTransferralCount(ser_data));
        to = ser_data.toAddress(ser_data.length - TRANSFERRAL_1_SIZE - (RECEIVER_SIZE.mul(index + 1)) - 20);
    }

    /**
     * @notice Get token address to be transferred
     * @param ser_data Serialized transferral data
     * @param index The index of token address to be transferred to
     * @return token The token address to be transferred
     */
    function _getTransferralTokenID(bytes memory ser_data, uint index) internal pure returns (uint256 token) {
        require(index < _getTransferralCount(ser_data));
        token = ser_data.toUint16(ser_data.length - TRANSFERRAL_1_SIZE - (RECEIVER_SIZE.mul(index + 1)) - 22);
    }

    /**
     * @notice Get token amount to be transferred
     * @param ser_data Serialized transferral data
     * @param index The index of token amount to be transferred to
     * @return amount The amount to be transferred
     */
    function _getTransferralAmount(bytes memory ser_data, uint index) internal pure returns (uint256 amount) {
        require(index < _getTransferralCount(ser_data));
        amount = ser_data.toUint(ser_data.length - TRANSFERRAL_1_SIZE - (RECEIVER_SIZE.mul(index + 1)) - 54);
    }

    /**
     * @notice Get token amount to be transferred
     * @param ser_data Serialized transferral data
     * @param index The index of token amount to be transferred to
     * @return fee The fee amount
     */
    function _getTransferralFee(bytes memory ser_data, uint index) internal pure returns (uint256 fee) {
        require(index < _getTransferralCount(ser_data));
        fee = ser_data.toUint(ser_data.length - TRANSFERRAL_1_SIZE - (RECEIVER_SIZE.mul(index + 1)) - 86);
    }

    /**
     * @notice Get hash from the serialized transferral data
     * @param ser_data Serialized transferral data
     * @return hash Transferral hash without signature
     */
    function _getTransferralHash(bytes memory ser_data) internal pure returns (bytes32 hash) {
        hash = keccak256(ser_data);
    }
}
