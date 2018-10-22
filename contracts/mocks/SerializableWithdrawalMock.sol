pragma solidity ^0.4.24;

import "../SerializableWithdrawal.sol";

contract SerializableWithdrawalMock is SerializableWithdrawal {
    constructor () public {
    }

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
            11,
            0,
            23 ether,
            1,
            0.1 ether,
            17
        );
    }

    // @dev To be removed
    function testWithdrawalSerialize() public pure returns (bytes) {
        return serializeWithdrawal(
            11,
            0,
            23 ether,
            1,
            0.1 ether,
            17,
            0x2ff29230014283c7b30f7edaa75cb8b4f397fbc6fd438acdfabed16330f9fb6d,
            0x5216167f7eb4f43cdfa1a094b1525ff00ec19d8fd33fef5383cb553f56f8c61c,
            0x01
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

    function getWithdrawalUserIDMock(bytes ser_data) external pure returns (uint32 userID) {
        return getWithdrawalUserID(ser_data);
    }

    function getWithdrawalTokenIDMock(bytes ser_data) external pure returns (uint16 tokenID) {
        return getWithdrawalTokenID(ser_data);
    }

    function getWithdrawalAmountMock(bytes ser_data) external pure returns (uint256 amount) {
        return getWithdrawalAmount(ser_data);
    }

    function getWithdrawalConfigMock(bytes ser_data) external pure returns (uint8 config) {
        return getWithdrawalConfig(ser_data);
    }

    function isWithdrawalETHMock(bytes ser_data) external pure returns (bool fETH) {
        return isWithdrawalETH(ser_data);
    }

    function getWithdrawalNonceMock(bytes ser_data) external pure returns (uint32 nonce) {
        return getWithdrawalNonce(ser_data);
    }

    function getWithdrawalFeeMock(bytes ser_data) external pure returns (uint256 fee) {
        return getWithdrawalFee(ser_data);
    }

    function getWithdrawalVMock(bytes ser_data) external pure returns (uint8 v) {
        return getWithdrawalV(ser_data);
    }

    function getWithdrawalRMock(bytes ser_data) external pure returns (bytes32 r) {
        return getWithdrawalR(ser_data);
    }

    function getWithdrawalSMock(bytes ser_data) external pure returns (bytes32 s) {
        return getWithdrawalS(ser_data);
    }

    function getWithdrawalHashMock(bytes ser_data) external pure returns (bytes32 hash) {
        return getWithdrawalHash(ser_data);
    }
}
