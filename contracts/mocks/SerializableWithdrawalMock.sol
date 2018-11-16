pragma solidity ^0.4.24;

import "../SerializableWithdrawal.sol";

contract SerializableWithdrawalMock is SerializableWithdrawal {
    constructor() public {
    }

    /**
     * @notice Serialize the withdrawal and output a hex string
     * @dev Mind the serialization sequence
     * @param userID The user ID of withdrawer
     * @param tokenID The token ID of withdrawal
     * @param amount The withdrawal amount
     * @param config The withdrawal configurations
     * Bit 0: is fee paid by ETH or DGO
     * Bit 1-7: TBD
     * @param fee The fee amount
     * @param nonce The nonce of withdrawal
     * @param r Signature r
     * @param s Signature s
     * @param v Signature v
     * @return buffer The serialized hex string
     */
    function serializeWithdrawal(
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
        public
        pure
        returns (bytes memory buffer)
    {
        buffer = new bytes(WITHDRAWAL_SIZE);
        uint offset = WITHDRAWAL_SIZE;

        uintToBytes(offset, userID, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, tokenID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, amount, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, config, buffer);
        offset -= sizeOfUint(8);

        uintToBytes(offset, nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, fee, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, v, buffer);
        offset -= sizeOfUint(8);

        bytes32ToBytes(offset, r, buffer);
        offset -= 32;

        bytes32ToBytes(offset, s, buffer);
    }

    /**
     * @notice Hash the withdrawal content to be signed
     * @dev Mind the sequence
     * @param userID The user ID of withdrawer
     * @param tokenID The token ID of withdrawal
     * @param amount The withdrawal amount
     * @param config Withdrawal configuration
     * Bit 0: is fee paid by ETH or DGO
     * Bit 1-7: TBD
     * @param fee The fee amount
     * @param nonce The nonce of withdraw
     * @return hash The hash value of withdrawal
     */
    function hashWithdrawal(
        uint32 userID,
        uint16 tokenID,
        uint256 amount,
        uint8 config,
        uint256 fee,
        uint32 nonce
    )
        public
        pure
        returns (bytes32 hash)
    {
        bytes memory buffer = new bytes(UNSIGNED_WITHDRAWAL_SIZE);
        uint offset = UNSIGNED_WITHDRAWAL_SIZE;

        uintToBytes(offset, userID, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, tokenID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, amount, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, config, buffer);
        offset -= sizeOfUint(8);

        uintToBytes(offset, nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, fee, buffer);

        hash = keccak256(buffer);
    }

    /**
    test withdrawal1
        {11, 11, 3 ether, 0, 0.01 ether, 3}
        hash:
            0xc73b805a44ca67043d0eb99234ced3032c0ac658232bf3b8e60b5fd641f13f63
        signature (by 0x627306090abab3a6e1400e9345bc60c78a8bef57):
            0xff082cf088f83143f4c81253d8e1f0a4b67be4c0036fcc96fce640b8a6bfbfad
            0x11327a5d4c094374f596d51b2edfd3461acb31e0c2e3395eb94d51912116e2b7
            0x01
        hex:
            0x11327a5d4c094374f596d51b2edfd3461acb31e0c2e3395eb94d51912116e2b7ff082cf088f83143f4c81253d8e1f0a4b67be4c0036fcc96fce640b8a6bfbfad01000000000000000000000000000000000000000000000000002386f26fc10000000000030000000000000000000000000000000000000000000000000029a2241af62c0000000b0000000b
    test withdrawal2
        {11, 0, 2 ether, 1, 0.005 ether, 4}
        hash:
            0x5da079753c00ab7d0a895a805ee0f9dcec5414d7bb74a546c0965a7d3862bedb
        signature (by 0x627306090abab3a6e1400e9345bc60c78a8bef57):
            0xcbab9d2e50d30a98f207c50f3d7e5b8dd80c4d9aa4f9e7a6bff89813b7f31303
            0x794b55b74debf180f7b0428238032dee64b2622d6a4c1d04faa4a3b4c6d6e584
            0x01
        hex:
            0x794b55b74debf180f7b0428238032dee64b2622d6a4c1d04faa4a3b4c6d6e584cbab9d2e50d30a98f207c50f3d7e5b8dd80c4d9aa4f9e7a6bff89813b7f31303010000000000000000000000000000000000000000000000000011c37937e0800000000004010000000000000000000000000000000000000000000000001bc16d674ec8000000000000000b
    */
    // @dev To be removed
    function testWithdrawalHash() public pure returns (bytes32) {
        return hashWithdrawal(
            11,
            0,
            2 ether,
            1,
            0.005 ether,
            4
        );
    }

    // @dev To be removed
    function testWithdrawalSerialize() public pure returns (bytes) {
        return serializeWithdrawal(
            11,
            0,
            2 ether,
            1,
            0.005 ether,
            4,
            0xcbab9d2e50d30a98f207c50f3d7e5b8dd80c4d9aa4f9e7a6bff89813b7f31303,
            0x794b55b74debf180f7b0428238032dee64b2622d6a4c1d04faa4a3b4c6d6e584,
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
    function deserializeWithdrawal(bytes ser_data) public pure
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
        return _getWithdrawalUserID(ser_data);
    }

    function getWithdrawalTokenIDMock(bytes ser_data) external pure returns (uint16 tokenID) {
        return _getWithdrawalTokenID(ser_data);
    }

    function getWithdrawalAmountMock(bytes ser_data) external pure returns (uint256 amount) {
        return _getWithdrawalAmount(ser_data);
    }

    function isWithdrawalFeeETHMock(bytes ser_data) external pure returns (bool fFeeETH) {
        return _isWithdrawalFeeETH(ser_data);
    }

    function getWithdrawalNonceMock(bytes ser_data) external pure returns (uint32 nonce) {
        return _getWithdrawalNonce(ser_data);
    }

    function getWithdrawalFeeMock(bytes ser_data) external pure returns (uint256 fee) {
        return _getWithdrawalFee(ser_data);
    }

    function getWithdrawalVMock(bytes ser_data) external pure returns (uint8 v) {
        return _getWithdrawalV(ser_data);
    }

    function getWithdrawalRMock(bytes ser_data) external pure returns (bytes32 r) {
        return _getWithdrawalR(ser_data);
    }

    function getWithdrawalSMock(bytes ser_data) external pure returns (bytes32 s) {
        return _getWithdrawalS(ser_data);
    }

    function getWithdrawalHashMock(bytes ser_data) external pure returns (bytes32 hash) {
        return _getWithdrawalHash(ser_data);
    }
}
