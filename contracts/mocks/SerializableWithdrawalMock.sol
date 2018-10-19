pragma solidity ^0.4.24;

import "../SerializableWithdrawal.sol";

contract SerializableWithdrawalMock is SerializableWithdrawal {
    constructor () public {
    }

    function getWithdrawalUserIDMock(bytes ser_data) external pure returns (uint32 userID) {
        return getWithdrawalUserID(ser_data);
    }

    function getWithdrawalTokenIDMock(bytes ser_data) external pure returns (uint16 tokenID) {
        return getWithdrawalTokenID(ser_data);
    }

    function getWithdrawalAmountMock(bytes ser_data) external pure returns (uint256 amount) {
        return getWithdrawalAmount(ser_data);
    }

    function getWithdrawalConfigMock(bytes ser_data) external pure returns (uint8 config) {
        return getWithdrawalConfig(ser_data);
    }

    function isWithdrawalETHMock(bytes ser_data) external pure returns (bool fETH) {
        return isWithdrawalETH(ser_data);
    }

    function getWithdrawalNonceMock(bytes ser_data) external pure returns (uint32 nonce) {
        return getWithdrawalNonce(ser_data);
    }

    function getWithdrawalFeeMock(bytes ser_data) external pure returns (uint256 fee) {
        return getWithdrawalFee(ser_data);
    }

    function getWithdrawalVMock(bytes ser_data) external pure returns (uint8 v) {
        return getWithdrawalV(ser_data);
    }

    function getWithdrawalRMock(bytes ser_data) external pure returns (bytes32 r) {
        return getWithdrawalR(ser_data);
    }

    function getWithdrawalSMock(bytes ser_data) external pure returns (bytes32 s) {
        return getWithdrawalS(ser_data);
    }

    function getWithdrawalHashMock(bytes ser_data) external pure returns (bytes32 hash) {
        return getWithdrawalHash(ser_data);
    }
}
