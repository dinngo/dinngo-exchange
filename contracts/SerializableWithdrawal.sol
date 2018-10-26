pragma solidity ^0.4.24;

import "bytes/BytesLib.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Seriality/src/Seriality.sol";

/**
 * @title Serializable Withdrawal
 * @author Ben Huang
 * @notice Let withdrawal support serialization and deserialization
 */
contract SerializableWithdrawal is Seriality {
    using SafeMath for uint256;
    using BytesLib for bytes;

    uint constant public WITHDRAWAL_SIZE = 140;
    uint constant public UNSIGNED_WITHDRAWAL_SIZE = 75;
    uint8 constant internal _MASK_IS_ETH = 0x01;

    /**
     * @notice Get user ID from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return userID User ID
     */
    function _getWithdrawalUserID(bytes ser_data) internal pure returns (uint32 userID) {
        userID = bytesToUint32(WITHDRAWAL_SIZE, ser_data);
    }

    /**
     * @notice Get token ID from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return tokenID Withdrawal token ID
     */
    function _getWithdrawalTokenID(bytes ser_data) internal pure returns (uint16 tokenID) {
        tokenID = bytesToUint16(WITHDRAWAL_SIZE - 4 , ser_data);
    }

    /**
     * @notice Get amount from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return amount Withdrawal token amount
     */
    function _getWithdrawalAmount(bytes ser_data) internal pure returns (uint256 amount) {
        amount = bytesToUint256(WITHDRAWAL_SIZE - 6, ser_data);
    }

    /**
     * @notice Get config from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return config Configuration
     */
    function _getWithdrawalConfig(bytes ser_data) internal pure returns (uint8 config) {
        config = bytesToUint8(WITHDRAWAL_SIZE - 38, ser_data);
    }

    /**
     * @notice Check if the fee is paid by main token
     * @param ser_data Serialized withdrawal data
     * @return fETH Is the fee paid in ETH or DGO
     */
    function _isWithdrawalETH(bytes ser_data) internal pure returns (bool fETH) {
        fETH = (bytesToUint8(WITHDRAWAL_SIZE - 38, ser_data) & _MASK_IS_ETH != 0);
    }

    /**
     * @notice Get nonce from the serialized withrawal data
     * @param ser_data Serialized withdrawal data
     * @return nonce Nonce
     */
    function _getWithdrawalNonce(bytes ser_data) internal pure returns (uint32 nonce) {
        nonce = bytesToUint32(WITHDRAWAL_SIZE - 39, ser_data);
    }

    /**
     * @notice Get fee amount from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return fee Fee amount
     */
    function _getWithdrawalFee(bytes ser_data) internal pure returns (uint256 fee) {
        fee = bytesToUint256(WITHDRAWAL_SIZE - 43, ser_data);
    }

    /**
     * @notice Get v from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return v Signature v
     */
    function _getWithdrawalV(bytes ser_data) internal pure returns (uint8 v) {
        v = bytesToUint8(WITHDRAWAL_SIZE - 75, ser_data);
    }

    /**
     * @notice Get r from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return r Signature r
     */
    function _getWithdrawalR(bytes ser_data) internal pure returns (bytes32 r) {
        r = bytesToBytes32(WITHDRAWAL_SIZE - 76, ser_data);
    }

    /**
     * @notice Get s from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return s Signature s
     */
    function _getWithdrawalS(bytes ser_data) internal pure returns (bytes32 s) {
        s = bytesToBytes32(WITHDRAWAL_SIZE - 108, ser_data);
    }

    /**
     * @notice Get hash from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return hash Withdrawal hash without signature
     */
    function _getWithdrawalHash(bytes ser_data) internal pure returns (bytes32 hash) {
        hash = keccak256(ser_data.slice(65, UNSIGNED_WITHDRAWAL_SIZE));
    }
}
