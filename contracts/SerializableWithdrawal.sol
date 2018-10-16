pragma solidity ^0.4.24;

import "bytes/BytesLib.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Seriality/src/Seriality.sol";
import "./Withdrawal.sol";

/**
 * @title Serializable Withdrawal
 * @author Ben Huang
 * @notice Let withdrawal support serialization and deserialization
 */
contract SerializableWithdrawal is Withdrawal, Seriality {
    using SafeMath for uint256;
    using BytesLib for bytes;

    uint constant public WITHDRAWAL_SIZE = 140;
    uint constant public UNSIGNED_WITHDRAWAL_SIZE = 75;
    uint8 constant internal MASK_IS_ETH = 0x01;

    /**
     * @notice Serialize the withdrawal and output a hex string
     * @dev Mind the serialization sequence
     * @param _userID The user ID of withdrawer
     * @param _tokenID The token ID of withdrawal
     * @param _amount The withdrawal amount
     * @param _config The withdrawal configurations
     * Bit 0: is fee paid by ETH or DGO
     * Bit 1-7: TBD
     * @param _fee The fee amount
     * @param _nonce The nonce of withdrawal
     * @param _r Signature r
     * @param _s Signature s
     * @param _v Signature v
     * @return buffer The serialized hex string
     */
    function serializeWithdrawal(
        uint32 _userID,
        uint16 _tokenID,
        uint256 _amount,
        uint8 _config,
        uint256 _fee,
        uint32 _nonce,
        bytes32 _r,
        bytes32 _s,
        uint8 _v
    )
        public
        pure
        returns (bytes memory buffer)
    {
        buffer = new bytes(WITHDRAWAL_SIZE);
        uint offset = WITHDRAWAL_SIZE;

        uintToBytes(offset, _userID, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, _tokenID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, _amount, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, _config, buffer);
        offset -= sizeOfUint(8);

        uintToBytes(offset, _nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, _fee, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, _v, buffer);
        offset -= sizeOfUint(8);

        bytes32ToBytes(offset, _r, buffer);
        offset -= 32;

        bytes32ToBytes(offset, _s, buffer);
    }
    /**
     * @notice Hash the withdrawal content to be signed
     * @dev Mind the sequence
     * @param _userID The user ID of withdrawer
     * @param _tokenID The token ID of withdrawal
     * @param _amount The withdrawal amount
     * @param _config Withdrawal configuration
     * Bit 0: is fee paid by ETH or DGO
     * Bit 1-7: TBD
     * @param _fee The fee amount
     * @param _nonce The nonce of withdraw
     * @return hash The hash value of withdrawal
     */
    function hashWithdrawal(
        uint32 _userID,
        uint16 _tokenID,
        uint256 _amount,
        uint8 _config,
        uint256 _fee,
        uint32 _nonce
    )
        public
        pure
        returns (bytes32 hash)
    {
        bytes memory buffer = new bytes(UNSIGNED_WITHDRAWAL_SIZE);
        uint offset = UNSIGNED_WITHDRAWAL_SIZE;

        uintToBytes(offset, _userID, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, _tokenID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, _amount, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, _config, buffer);
        offset -= sizeOfUint(8);

        uintToBytes(offset, _nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, _fee, buffer);

        hash = keccak256(buffer);
    }

    // @dev To be removed
    function testWithdrawalHash() public pure returns (bytes32) {
        return hashWithdrawal(
            12,
            0,
            11.5 ether,
            2,
            1000,
            10
        );
    }

    // @dev To be removed
    function testWithdrawalSerialize() public pure returns (bytes) {
        return serializeWithdrawal(
            12,
            0,
            11.5 ether,
            2,
            1000,
            10,
            0x46b4a6fb4f1efc688f6b461825dd686fa19f8cbb014ab8e33e88a220c23eb5e8,
            0x75f47c89a6031ea52f092f0ae79f44489ad462a1513d24ffa10f5efde1b797ba,
            0x00
        );
    }

    /**
     * @notice Deserialize the withdrawal hex and output withdrawal components
     * @dev Mind the deserialization sequence
     * @param ser_data The serialized hex string
     * @return userID The user ID of withdrawer
     * @return tokenID The token ID of withdrawal
     * @return amount The withdrawal amount
     * @return config Fee related configuration.
     * Bit 0: is fee paid by ETH or DGO
     * Bit 1-7: TBD
     * @return fee The fee amount
     * @return nonce The nonce of withdrawal
     * @return r Signature r
     * @return s Signature s
     * @return v Signature v
     */
    function deserializeWithdrawal(bytes ser_data) public view
        returns (
            uint32 userID,
            uint16 tokenID,
            uint256 amount,
            uint8 config,
            uint256 fee,
            uint32 nonce,
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        uint offset = WITHDRAWAL_SIZE;
        userID = bytesToUint32(offset, ser_data);
        offset -= sizeOfUint(32);

        tokenID = bytesToUint16(offset, ser_data);
        offset -= sizeOfUint(16);

        amount = bytesToUint256(offset, ser_data);
        offset -= sizeOfUint(256);

        config = bytesToUint8(offset, ser_data);
        offset -= sizeOfUint(8);

        nonce = bytesToUint32(offset, ser_data);
        offset -= sizeOfUint(32);

        fee = bytesToUint256(offset, ser_data);
        offset -= sizeOfUint(256);

        v = bytesToUint8(offset, ser_data);
        offset -= sizeOfUint(8);

        r = bytesToBytes32(offset, ser_data);
        offset -= 32;

        s = bytesToBytes32(offset, ser_data);
    }

    /**
     * @notice Get user ID from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return userID User ID
     */
    function getWithdrawalUserID(bytes ser_data) internal pure returns (uint32 userID) {
        userID = bytesToUint32(WITHDRAWAL_SIZE, ser_data);
    }

    /**
     * @notice Get token ID from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return tokenID Withdrawal token ID
     */
    function getWithdrawalTokenID(bytes ser_data) internal pure returns (uint16 tokenID) {
        tokenID = bytesToUint16(WITHDRAWAL_SIZE - 4 , ser_data);
    }

    /**
     * @notice Get amount from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return amount Withdrawal token amount
     */
    function getWithdrawalAmount(bytes ser_data) internal pure returns (uint256 amount) {
        amount = bytesToUint256(WITHDRAWAL_SIZE - 6, ser_data);
    }

    /**
     * @notice Get config from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return config Configuration
     */
    function getWithdrawalConfig(bytes ser_data) internal pure returns (uint8 config) {
        config = bytesToUint8(WITHDRAWAL_SIZE - 38, ser_data);
    }

    /**
     * @notice Check if the fee is paid by main token
     * @param ser_data Serialized withdrawal data
     * @return fETH Is the fee paid in ETH or DGO
     */
    function isWithdrawalETH(bytes ser_data) internal pure returns (bool fETH) {
        fETH = (bytesToUint8(WITHDRAWAL_SIZE - 38, ser_data) & MASK_IS_ETH != 0);
    }

    /**
     * @notice Get nonce from the serialized withrawal data
     * @param ser_data Serialized withdrawal data
     * @return nonce Nonce
     */
    function getWithdrawalNonce(bytes ser_data) internal pure returns (uint32 nonce) {
        nonce = bytesToUint32(WITHDRAWAL_SIZE - 39, ser_data);
    }

    /**
     * @notice Get fee amount from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return fee Fee amount
     */
    function getWithdrawalFee(bytes ser_data) internal pure returns (uint256 fee) {
        fee = bytesToUint256(WITHDRAWAL_SIZE - 43, ser_data);
    }

    /**
     * @notice Get v from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return v Signature v
     */
    function getWithdrawalV(bytes ser_data) internal pure returns (uint8 v) {
        v = bytesToUint8(WITHDRAWAL_SIZE - 75, ser_data);
    }

    /**
     * @notice Get r from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return r Signature r
     */
    function getWithdrawalR(bytes ser_data) internal pure returns (bytes32 r) {
        r = bytesToBytes32(WITHDRAWAL_SIZE - 76, ser_data);
    }

    /**
     * @notice Get s from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return s Signature s
     */
    function getWithdrawalS(bytes ser_data) internal pure returns (bytes32 s) {
        s = bytesToBytes32(WITHDRAWAL_SIZE - 108, ser_data);
    }

    /**
     * @notice Get hash from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return hash Withdrawal hash without signature
     */
    function getWithdrawalHash(bytes ser_data) internal pure returns (bytes32 hash) {
        hash = keccak256(ser_data.slice(65, UNSIGNED_WITHDRAWAL_SIZE));
    }
}
