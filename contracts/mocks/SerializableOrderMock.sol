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
    function deserializeOrder(bytes ser_data) public pure
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
     * @param userID The user ID of order maker
     * @param mainTokenID The token ID of main token in the order
     * @param mainAmount The main token amount
     * @param subTokenID The token ID of sub token in the order
     * @param subAmount The sub token amount
     * @param config Order configurations
     * Bit 0: is buy order or not
     * Bit 1: is fee paid by major token or not
     * Bit 2-7: TBD
     * @param feePrice The fee token price when order is created
     * @param nonce The nonce of order
     * @param r Signature r
     * @param s Signature s
     * @param v Signature v
     * @return buffer The serialized hex string
     */
    function serializeOrder(
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
        public
        pure
        returns (bytes memory buffer)
    {
        buffer = new bytes(ORDER_SIZE);
        uint offset = ORDER_SIZE;

        uintToBytes(offset, userID, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, mainTokenID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, mainAmount, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, subTokenID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, subAmount, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, config, buffer);
        offset -= sizeOfUint(8);

        uintToBytes(offset, nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, feePrice, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, v, buffer);
        offset -= sizeOfUint(8);

        bytes32ToBytes(offset, r, buffer);
        offset -= 32;

        bytes32ToBytes(offset, s, buffer);
    }

    /**
    test order1
        {11, 0, 3 ether, 11, 100 ether, 1, 10, 1}
        hash:
            0xa1179f9c81f330f47cbde5e73ff87a87c1195bc5a056dad4df90b3ff3844ca71
        signature (by 0x627306090abab3a6e1400e9345bc60c78a8bef57):
            0xdbc2b281c271363b56d54f448ceb6ed8dd4df17534cde8d31b5fe9bb4be00ffd
            0x53a433772f03b5eec7d04a51454cf7bde16e0cd1c39595b96f6a22919e4d524f
            0x00
        hex:
            0x53a433772f03b5eec7d04a51454cf7bde16e0cd1c39595b96f6a22919e4d524fdbc2b281c271363b56d54f448ceb6ed8dd4df17534cde8d31b5fe9bb4be00ffd00000000000000000000000000000000000000000000000000000000000000000a00000001010000000000000000000000000000000000000000000000056bc75e2d63100000000b00000000000000000000000000000000000000000000000029a2241af62c000000000000000b
    test order2
        {12, 0, 1.5 ether, 11, 80 ether, 2, 10000, 2}
        hash:
            0x41a07794e4f991056ec1316f7a5c3a63ed88a877e68a186921699ea23d365936
        signature (by 0xf17f52151ebef6c7334fad080c5704d77216b732):
            0x88a8db71e4b326496be169cb18c95df1d5456a2a8718713a4a0a57a5a159ebe2
            0x1eac339001c458855fc4a6b41212bf3f590507f8eb1cf251d3c0445b9a94dff8
            0x01
        hex:
            0x1eac339001c458855fc4a6b41212bf3f590507f8eb1cf251d3c0445b9a94dff888a8db71e4b326496be169cb18c95df1d5456a2a8718713a4a0a57a5a159ebe20100000000000000000000000000000000000000000000000000000000000027100000000202000000000000000000000000000000000000000000000004563918244f400000000b00000000000000000000000000000000000000000000000014d1120d7b16000000000000000c
    */
    // @dev To be removed
    function testHash() public pure returns (bytes32) {
        return hashOrder(
            12,
            0,
            1.5 ether,
            11,
            80 ether,
            2,
            10000,
            2
        );
    }

    // @dev To be removed
    function testSerialize() public pure returns (bytes) {
        return serializeOrder(
            12,
            0,
            1.5 ether,
            11,
            80 ether,
            2,
            10000,
            2,
            0x88a8db71e4b326496be169cb18c95df1d5456a2a8718713a4a0a57a5a159ebe2,
            0x1eac339001c458855fc4a6b41212bf3f590507f8eb1cf251d3c0445b9a94dff8,
            0x01
        );
    }

    // @dev To be removed
    function testSerialize2() public pure returns (bytes) {
        bytes memory hex1;
        hex1 = serializeOrder(
            11,
            0,
            3 ether,
            11,
            100 ether,
            1,
            10,
            1,
            0xdbc2b281c271363b56d54f448ceb6ed8dd4df17534cde8d31b5fe9bb4be00ffd,
            0x53a433772f03b5eec7d04a51454cf7bde16e0cd1c39595b96f6a22919e4d524f,
            0x00
        );
        bytes memory hex2;
        hex2 = serializeOrder(
            12,
            0,
            1.5 ether,
            11,
            80 ether,
            2,
            10000,
            2,
            0x88a8db71e4b326496be169cb18c95df1d5456a2a8718713a4a0a57a5a159ebe2,
            0x1eac339001c458855fc4a6b41212bf3f590507f8eb1cf251d3c0445b9a94dff8,
            0x01
        );

        return hex1.concat(hex2);
    }

    /**
     * @notice Hash the order content to be signed
     * @dev Mind the sequence
     * @param userID The user ID of order maker
     * @param mainTokenID The token ID of main token in the order
     * @param mainAmount The main token amount
     * @param subTokenID The token ID of sub token in the order
     * @param subAmount The sub token amount
     * @param config Order configuration
     * Bit 0: is buy order
     * Bit 1: is paid by major token
     * Bit 2-7: TBD
     * @param feePrice The fee token price when order is created
     * @param nonce The nonce of order
     * @return hash The hash value of order
     */
    function hashOrder(
        uint32 userID,
        uint16 mainTokenID,
        uint256 mainAmount,
        uint16 subTokenID,
        uint256 subAmount,
        uint8 config,
        uint256 feePrice,
        uint32 nonce
    )
        public
        pure
        returns (bytes32 hash)
    {
        bytes memory buffer = new bytes(UNSIGNED_ORDER_SIZE);
        uint offset = UNSIGNED_ORDER_SIZE;

        uintToBytes(offset, userID, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, mainTokenID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, mainAmount, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, subTokenID, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, subAmount, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, config, buffer);
        offset -= sizeOfUint(8);

        uintToBytes(offset, nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, feePrice, buffer);

        hash = keccak256(buffer);
    }

    function getOrderUserIDMock(bytes ser_data) external pure returns (uint32 userID) {
        return _getOrderUserID(ser_data);
    }

    function getOrderTokenIDMainMock(bytes ser_data) external pure returns (uint16 tokenMain) {
        return _getOrderTokenIDMain(ser_data);
    }

    function getOrderAmountMainMock(bytes ser_data) external pure returns (uint256 amountMain) {
        return _getOrderAmountMain(ser_data);
    }

    function getOrderTokenIDSubMock(bytes ser_data) external pure returns (uint16 tokenSub) {
        return _getOrderTokenIDSub(ser_data);
    }

    function getOrderAmountSubMock(bytes ser_data) external pure returns (uint256 amountSub) {
        return _getOrderAmountSub(ser_data);
    }

    function isOrderBuyMock(bytes ser_data) external pure returns (bool fBuy) {
        return _isOrderBuy(ser_data);
    }

    function isOrderFeeMainMock(bytes ser_data) external pure returns (bool fMain) {
        return _isOrderFeeMain(ser_data);
    }

    function getOrderNonceMock(bytes ser_data) external pure returns (uint32 nonce) {
        return _getOrderNonce(ser_data);
    }

    function getOrderFeePriceMock(bytes ser_data) external pure returns (uint256 feePrice) {
        return _getOrderFeePrice(ser_data);
    }

    function getOrderVMock(bytes ser_data) external pure returns (uint8 v) {
        return _getOrderV(ser_data);
    }

    function getOrderRMock(bytes ser_data) external pure returns (bytes32 r) {
        return _getOrderR(ser_data);
    }

    function getOrderSMock(bytes ser_data) external pure returns (bytes32 s) {
        return _getOrderS(ser_data);
    }

    function getOrderHashMock(bytes ser_data) external pure returns (bytes32 hash) {
        return _getOrderHash(ser_data);
    }

    function getOrderMock(bytes ser_data, uint index) external pure returns (bytes order_data) {
        return _getOrder(ser_data, index);
    }

    function getOrderCountMock(bytes ser_data) external pure returns (uint amount) {
        return _getOrderCount(ser_data);
    }

}
