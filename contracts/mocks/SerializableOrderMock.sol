pragma solidity ^0.5.0;

import "../SerializableOrder.sol";

contract SerializableOrderMock is SerializableOrder{
    constructor () public {
    }

    function getOrderUserIDMock(bytes calldata ser_data) external pure returns (uint32 userID) {
        return _getOrderUserID(ser_data);
    }

    function getOrderTokenIDTargetMock(bytes calldata ser_data) external pure returns (uint16 tokenTarget) {
        return _getOrderTokenIDTarget(ser_data);
    }

    function getOrderAmountTargetMock(bytes calldata ser_data) external pure returns (uint256 amountTarget) {
        return _getOrderAmountTarget(ser_data);
    }

    function getOrderTokenIDTradeMock(bytes calldata ser_data) external pure returns (uint16 tokenTrade) {
        return _getOrderTokenIDTrade(ser_data);
    }

    function getOrderAmountTradeMock(bytes calldata ser_data) external pure returns (uint256 amountTrade) {
        return _getOrderAmountTrade(ser_data);
    }

    function isOrderBuyMock(bytes calldata ser_data) external pure returns (bool fBuy) {
        return _isOrderBuy(ser_data);
    }

    function isOrderFeeMainMock(bytes calldata ser_data) external pure returns (bool fMain) {
        return _isOrderFeeMain(ser_data);
    }

    function getOrderNonceMock(bytes calldata ser_data) external pure returns (uint32 nonce) {
        return _getOrderNonce(ser_data);
    }

    function getOrderTradeFeeMock(bytes calldata ser_data) external pure returns (uint256 tradeFee) {
        return _getOrderTradeFee(ser_data);
    }

    function getOrderGasFeeMock(bytes calldata ser_data) external pure returns (uint256 gasFee) {
        return _getOrderGasFee(ser_data);
    }

    function getOrderVMock(bytes calldata ser_data) external pure returns (uint8 v) {
        return _getOrderV(ser_data);
    }

    function getOrderRMock(bytes calldata ser_data) external pure returns (bytes32 r) {
        return _getOrderR(ser_data);
    }

    function getOrderSMock(bytes calldata ser_data) external pure returns (bytes32 s) {
        return _getOrderS(ser_data);
    }

    function getOrderHashMock(bytes calldata ser_data) external pure returns (bytes32 hash) {
        return _getOrderHash(ser_data);
    }

    function getOrderMock(bytes calldata ser_data, uint index) external pure returns (bytes memory order_data) {
        return _getOrder(ser_data, index);
    }

    function getOrderCountMock(bytes calldata ser_data) external pure returns (uint amount) {
        return _getOrderCount(ser_data);
    }

}
