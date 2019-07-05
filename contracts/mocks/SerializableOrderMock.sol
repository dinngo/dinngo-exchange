pragma solidity 0.5.6;

import "../SerializableOrder.sol";

contract SerializableOrderMock is SerializableOrder{
    constructor () public {
    }

    function getOrderUserIDMock(bytes calldata ser_data) external pure returns (uint256 userID) {
        return _getOrderUserID(ser_data);
    }

    function getOrderTokenIDBaseMock(bytes calldata ser_data) external pure returns (uint256 tokenBase) {
        return _getOrderTokenIDBase(ser_data);
    }

    function getOrderAmountBaseMock(bytes calldata ser_data) external pure returns (uint256 amountBase) {
        return _getOrderAmountBase(ser_data);
    }

    function getOrderTokenIDQuoteMock(bytes calldata ser_data) external pure returns (uint256 tokenQuote) {
        return _getOrderTokenIDQuote(ser_data);
    }

    function getOrderAmountQuoteMock(bytes calldata ser_data) external pure returns (uint256 amountQuote) {
        return _getOrderAmountQuote(ser_data);
    }

    function isOrderBuyMock(bytes calldata ser_data) external pure returns (bool fBuy) {
        return _isOrderBuy(ser_data);
    }

    function isOrderFeeMainMock(bytes calldata ser_data) external pure returns (bool fMain) {
        return _isOrderFeeMain(ser_data);
    }

    function getOrderNonceMock(bytes calldata ser_data) external pure returns (uint256 nonce) {
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

    function getOrderCountMock(bytes calldata ser_data) external pure returns (uint256 amount) {
        return _getOrderCount(ser_data);
    }

}
