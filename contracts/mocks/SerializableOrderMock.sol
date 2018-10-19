pragma solidity ^0.4.24;

import "../SerializableOrder.sol";

contract SerializableOrderMock is SerializableOrder {
    constructor () public {
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
        buffer = new bytes(ORDER_SIZE);
        uint offset = ORDER_SIZE;

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
      test order
        {11,0,23 ether,11,43 ether,1,2000,17}
        hash:
            0x30fb1686eefe31b098fb1e2e418ceeffe3b3a5effbf5a50cd1483e420244a6c7
        signature (by 0x627306090abab3a6e1400e9345bc60c78a8bef57):
            0xb3b5ac4d8911c21371e6206d8ef790be1861aa819c6b802a2ebd849e9e214a86
            0x0a6dc56354ded2afa70070011218247d8ee31ae796925025d45dd7f15e5ffdc2
            0x01
        hex:
            0x0a6dc56354ded2afa70070011218247d8ee31ae796925025d45dd7f15e5ffdc2b3b5ac4d8911c21371e6206d8ef790be1861aa819c6b802a2ebd849e9e214a860100000000000000000000000000000000000000000000000000000000000007d0000000110100000000000000000000000000000000000000000000000254beb02d1dcc0000000b0000000000000000000000000000000000000000000000013f306a2409fc000000000000000b

        {12,0,11.5 ether,11,21.5 ether,2,1000,10}
        hash:
            0xc6df8e62380ee431b4049d1af5602368f567b53816a6780189fbcd1435b667d4
        signature (by 0xf17f52151ebef6c7334fad080c5704d77216b732):
            0x46b4a6fb4f1efc688f6b461825dd686fa19f8cbb014ab8e33e88a220c23eb5e8
            0x75f47c89a6031ea52f092f0ae79f44489ad462a1513d24ffa10f5efde1b797ba
            0x00
        hex:
            0x75f47c89a6031ea52f092f0ae79f44489ad462a1513d24ffa10f5efde1b797ba46b4a6fb4f1efc688f6b461825dd686fa19f8cbb014ab8e33e88a220c23eb5e80000000000000000000000000000000000000000000000000000000000000003e80000000a020000000000000000000000000000000000000000000000012a5f58168ee60000000b0000000000000000000000000000000000000000000000009f98351204fe000000000000000c
    */
    // @dev To be removed
    function testHash() public pure returns (bytes32) {
        return hashOrder(
            12,
            0,
            11.5 ether,
            11,
            21.5 ether,
            2,
            1000,
            10
        );
    }

    // @dev To be removed
    function testSerialize() public pure returns (bytes) {
        return serializeOrder(
            12,
            0,
            11.5 ether,
            11,
            21.5 ether,
            2,
            1000,
            10,
            0x46b4a6fb4f1efc688f6b461825dd686fa19f8cbb014ab8e33e88a220c23eb5e8,
            0x75f47c89a6031ea52f092f0ae79f44489ad462a1513d24ffa10f5efde1b797ba,
            0x00
        );
    }

    // @dev To be removed
    function testSerialize2() public pure returns (bytes) {
        bytes memory hex1;
        hex1 = serializeOrder(
            11,
            0,
            23 ether,
            11,
            43 ether,
            1,
            2000,
            17,
            0xb3b5ac4d8911c21371e6206d8ef790be1861aa819c6b802a2ebd849e9e214a86,
            0x0a6dc56354ded2afa70070011218247d8ee31ae796925025d45dd7f15e5ffdc2,
            0x01
        );
        bytes memory hex2;
        hex2 = serializeOrder(
            12,
            0,
            11.5 ether,
            11,
            21.5 ether,
            2,
            1000,
            10,
            0x46b4a6fb4f1efc688f6b461825dd686fa19f8cbb014ab8e33e88a220c23eb5e8,
            0x75f47c89a6031ea52f092f0ae79f44489ad462a1513d24ffa10f5efde1b797ba,
            0x00
        );

        return hex1.concat(hex2);
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
        bytes memory buffer = new bytes(UNSIGNED_ORDER_SIZE);
        uint offset = UNSIGNED_ORDER_SIZE;

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

    function getUserIDMock(bytes ser_data) external pure returns (uint32 userID) {
        return getUserID(ser_data);
    }

    function getTokenMainMock(bytes ser_data) external pure returns (uint16 tokenMain) {
        return getTokenMain(ser_data);
    }

    function getAmountMainMock(bytes ser_data) external pure returns (uint256 amountMain) {
        return getAmountMain(ser_data);
    }

    function getTokenSubMock(bytes ser_data) external pure returns (uint16 tokenSub) {
        return getTokenSub(ser_data);
    }

    function getAmountSubMock(bytes ser_data) external pure returns (uint256 amountSub) {
        return getAmountSub(ser_data);
    }

    function isBuyMock(bytes ser_data) external pure returns (bool fBuy) {
        return isBuy(ser_data);
    }

    function isMainMock(bytes ser_data) external pure returns (bool fMain) {
        return isMain(ser_data);
    }

    function getNonceMock(bytes ser_data) external pure returns (uint32 nonce) {
        return getNonce(ser_data);
    }

    function getFeePriceMock(bytes ser_data) external pure returns (uint256 feePrice) {
        return getFeePrice(ser_data);
    }

    function getVMock(bytes ser_data) external pure returns (uint8 v) {
        return getV(ser_data);
    }

    function getRMock(bytes ser_data) external pure returns (bytes32 r) {
        return getR(ser_data);
    }

    function getSMock(bytes ser_data) external pure returns (bytes32 s) {
        return getS(ser_data);
    }

    function getHashMock(bytes ser_data) external pure returns (bytes32 hash) {
        return getHash(ser_data);
    }

    function getOrderMock(bytes ser_data, uint index) external pure returns (bytes order_data) {
        return getOrder(ser_data, index);
    }

    function getOrderCountMock(bytes ser_data) internal pure returns (uint amount) {
        return getOrderCount(ser_data);
    }

}
