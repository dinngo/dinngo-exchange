pragma solidity ^0.4.24;

import "../SerializableOrder.sol";

contract SerializableOrderMock is SerializableOrder {
    constructor () public {
    }

    function deserializeOrder(bytes ser_data) public pure
        returns (
            uint32 userID,
            uint16 tokenIDTarget,
            uint256 amountTarget,
            uint16 tokenIDTrade,
            uint256 amountTrade,
            uint8 config,
            uint256 tradeFee,
            uint256 gasFee,
            uint32 nonce,
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        uint offset = ORDER_SIZE;
        userID = bytesToUint32(offset, ser_data);
        offset -= sizeOfUint(32);

        tokenIDTarget = bytesToUint16(offset, ser_data);
        offset -= sizeOfUint(16);

        amountTarget = bytesToUint256(offset, ser_data);
        offset -= sizeOfUint(256);

        tokenIDTrade = bytesToUint16(offset, ser_data);
        offset -= sizeOfUint(16);

        amountTrade = bytesToUint256(offset, ser_data);
        offset -= sizeOfUint(256);

        config = bytesToUint8(offset, ser_data);
        offset -= sizeOfUint(8);

        nonce = bytesToUint32(offset, ser_data);
        offset -= sizeOfUint(32);

        tradeFee = bytesToUint256(offset, ser_data);
        offset -= sizeOfUint(256);

        gasFee = bytesToUint256(offset, ser_data);
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
     * @param tokenIDTarget The token ID of target token in the order
     * @param amountTarget The target token amount
     * @param tokenIDTrade The token ID of trade token in the order
     * @param amountTrade The trade token amount
     * @param config Order configurations
     * Bit 0: is buy order or not
     * Bit 1: is fee paid by major token or not
     * Bit 2-7: TBD
     * @param tradeFee The trading fee of this order
     * @param gasFee The gas fee of this order
     * @param nonce The nonce of order
     * @param r Signature r
     * @param s Signature s
     * @param v Signature v
     * @return buffer The serialized hex string
     */
    function serializeOrder(
        uint32 userID,
        uint16 tokenIDTarget,
        uint256 amountTarget,
        uint16 tokenIDTrade,
        uint256 amountTrade,
        uint8 config,
        uint256 tradeFee,
        uint256 gasFee,
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

        uintToBytes(offset, tokenIDTarget, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, amountTarget, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, tokenIDTrade, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, amountTrade, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, config, buffer);
        offset -= sizeOfUint(8);

        uintToBytes(offset, nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, tradeFee, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, gasFee, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, v, buffer);
        offset -= sizeOfUint(8);

        bytes32ToBytes(offset, r, buffer);
        offset -= 32;

        bytes32ToBytes(offset, s, buffer);
    }

    // @dev To be removed

    /**
     * @notice Hash the order content to be signed
     * @dev Mind the sequence
     * @param userID The user ID of order maker
     * @param tokenIDTarget The token ID of target token in the order
     * @param amountTarget The target token amount
     * @param tokenIDTrade The token ID of trade token in the order
     * @param amountTrade The trade token amount
     * @param config Order configuration
     * Bit 0: is buy order
     * Bit 1: is paid by major token
     * Bit 2-7: TBD
     * @param tradeFee The trading fee of order
     * @param gasFee The gas fee of order
     * @param nonce The nonce of order
     * @return hash The hash value of order
     */
    function hashOrder(
        uint32 userID,
        uint16 tokenIDTarget,
        uint256 amountTarget,
        uint16 tokenIDTrade,
        uint256 amountTrade,
        uint8 config,
        uint256 tradeFee,
        uint256 gasFee,
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

        uintToBytes(offset, tokenIDTarget, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, amountTarget, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, tokenIDTrade, buffer);
        offset -= sizeOfUint(16);

        uintToBytes(offset, amountTrade, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, config, buffer);
        offset -= sizeOfUint(8);

        uintToBytes(offset, nonce, buffer);
        offset -= sizeOfUint(32);

        uintToBytes(offset, tradeFee, buffer);
        offset -= sizeOfUint(256);

        uintToBytes(offset, gasFee, buffer);

        hash = keccak256(buffer);
    }

    function getOrderUserIDMock(bytes ser_data) external pure returns (uint32 userID) {
        return _getOrderUserID(ser_data);
    }

    function getOrderTokenIDTargetMock(bytes ser_data) external pure returns (uint16 tokenTarget) {
        return _getOrderTokenIDTarget(ser_data);
    }

    function getOrderAmountTargetMock(bytes ser_data) external pure returns (uint256 amountTarget) {
        return _getOrderAmountTarget(ser_data);
    }

    function getOrderTokenIDTradeMock(bytes ser_data) external pure returns (uint16 tokenTrade) {
        return _getOrderTokenIDTrade(ser_data);
    }

    function getOrderAmountTradeMock(bytes ser_data) external pure returns (uint256 amountTrade) {
        return _getOrderAmountTrade(ser_data);
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

    function getOrderTradeFeeMock(bytes ser_data) external pure returns (uint256 tradeFee) {
        return _getOrderTradeFee(ser_data);
    }

    function getOrderGasFeeMock(bytes ser_data) external pure returns (uint256 gasFee) {
        return _getOrderGasFee(ser_data);
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
