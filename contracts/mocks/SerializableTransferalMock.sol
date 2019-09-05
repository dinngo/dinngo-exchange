pragma solidity ^0.5.0;

import "../SerializableTransferal.sol";

contract SerializableTransferalMock is SerializableTransferal {
    function getTransferalFromMock(bytes calldata ser_data) external pure returns (address from) {
        return _getTransferalFrom(ser_data);
    }

    function isTransferalFeeMainMock(bytes calldata ser_data) external pure returns (bool fFeeETH) {
        return _isTransferalFeeMain(ser_data);
    }

    function getTransferalNonceMock(bytes calldata ser_data) external pure returns (uint256 nonce) {
        return _getTransferalNonce(ser_data);
    }

    function getTransferalCountMock(bytes calldata ser_data) external pure returns (uint256 n) {
        return _getTransferalCount(ser_data);
    }

    function getTransferalToMock(bytes calldata ser_data, uint index) external pure returns (address to) {
        return _getTransferalTo(ser_data, index);
    }

    function getTransferalTokenIDMock(bytes calldata ser_data, uint index) external pure returns (uint256 tokenID) {
        return _getTransferalTokenID(ser_data, index);
    }

    function getTransferalAmountMock(bytes calldata ser_data, uint index) external pure returns (uint256 amount) {
        return _getTransferalAmount(ser_data, index);
    }

    function getTransferalFeeMock(bytes calldata ser_data, uint index) external pure returns (uint256 fee) {
        return _getTransferalFee(ser_data, index);
    }

    function getTransferalHashMock(bytes calldata ser_data) external pure returns (bytes32 hash) {
        return _getTransferalHash(ser_data);
    }
}
