pragma solidity ^0.4.24;

import "../SerializableWithdrawal.sol";

contract SerializableWithdrawalMock is SerializableWithdrawal {
    constructor() public {
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
