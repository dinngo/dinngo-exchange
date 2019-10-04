pragma solidity ^0.5.0;

import "../SerializableWithdrawal.sol";

contract SerializableWithdrawalMock is SerializableWithdrawal {
    constructor() public {
    }

    function getWithdrawalUserIDMock(bytes calldata ser_data) external pure returns (uint256 userID) {
        return _getWithdrawalUserID(ser_data);
    }

    function getWithdrawalTokenIDMock(bytes calldata ser_data) external pure returns (uint256 tokenID) {
        return _getWithdrawalTokenID(ser_data);
    }

    function getWithdrawalAmountMock(bytes calldata ser_data) external pure returns (uint256 amount) {
        return _getWithdrawalAmount(ser_data);
    }

    function isWithdrawalFeeMainMock(bytes calldata ser_data) external pure returns (bool fFeeETH) {
        return _isWithdrawalFeeMain(ser_data);
    }

    function getWithdrawalNonceMock(bytes calldata ser_data) external pure returns (uint256 nonce) {
        return _getWithdrawalNonce(ser_data);
    }

    function getWithdrawalFeeMock(bytes calldata ser_data) external pure returns (uint256 fee) {
        return _getWithdrawalFee(ser_data);
    }

    function getWithdrawalHashMock(bytes calldata ser_data) external pure returns (bytes32 hash) {
        return _getWithdrawalHash(ser_data);
    }
}
