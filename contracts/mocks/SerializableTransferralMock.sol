pragma solidity ^0.5.0;

import "../SerializableTransferral.sol";

contract SerializableTransferralMock is SerializableTransferral {
    function getTransferralFrom(bytes calldata ser_data) external pure returns (address from) {
        return _getTransferralFrom(ser_data);
    }

    function isTransferralFeeMain(bytes calldata ser_data) external pure returns (bool fFeeETH) {
        return _isTransferralFeeMain(ser_data);
    }

    function getTransferralNonce(bytes calldata ser_data) external pure returns (uint256 nonce) {
        return _getTransferralNonce(ser_data);
    }

    function getTransferralCount(bytes calldata ser_data) external pure returns (uint256 n) {
        return _getTransferralCount(ser_data);
    }

    function getTransferralTo(bytes calldata ser_data, uint index) external pure returns (address to) {
        return _getTransferralTo(ser_data, index);
    }

    function getTransferralTokenID(bytes calldata ser_data, uint index) external pure returns (uint256 tokenID) {
        return _getTransferralTokenID(ser_data, index);
    }

    function getTransferralAmount(bytes calldata ser_data, uint index) external pure returns (uint256 amount) {
        return _getTransferralAmount(ser_data, index);
    }

    function getTransferralFee(bytes calldata ser_data, uint index) external pure returns (uint256 fee) {
        return _getTransferralFee(ser_data, index);
    }

    function getTransferralV(bytes calldata ser_data) external pure returns (uint8 v) {
        return _getTransferralV(ser_data);
    }

    function getTransferralR(bytes calldata ser_data) external pure returns (bytes32 r) {
        return _getTransferralR(ser_data);
    }

    function getTransferralS(bytes calldata ser_data) external pure returns (bytes32 s) {
        return _getTransferralS(ser_data);
    }

    function getTransferralHash(bytes calldata ser_data) external pure returns (bytes32 hash) {
        return _getTransferralHash(ser_data);
    }
}
