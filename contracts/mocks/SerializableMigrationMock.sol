pragma solidity 0.5.6;

import "../SerializableMigration.sol";

contract SerializableMigrationMock is SerializableMigration {
    constructor() public {
    }

    function getMigrationTargetMock(bytes calldata ser_data) external pure returns (address target) {
        return _getMigrationTarget(ser_data);
    }

    function getMigrationUserIDMock(bytes calldata ser_data) external pure returns (uint256 userID) {
        return _getMigrationUserID(ser_data);
    }

    function getMigrationCountMock(bytes calldata ser_data) external pure returns (uint256 n) {
        return _getMigrationCount(ser_data);
    }

    function getMigrationTokenIDMock(bytes calldata ser_data, uint index) external pure returns (uint256 tokenID) {
        return _getMigrationTokenID(ser_data, index);
    }

    function getMigrationVMock(bytes calldata ser_data) external pure returns (uint8 v) {
        return _getMigrationV(ser_data);
    }

    function getMigrationRMock(bytes calldata ser_data) external pure returns (bytes32 r) {
        return _getMigrationR(ser_data);
    }

    function getMigrationSMock(bytes calldata ser_data) external pure returns (bytes32 s) {
        return _getMigrationS(ser_data);
    }

    function getMigrationHashMock(bytes calldata ser_data) external pure returns (bytes32 hash) {
        return _getMigrationHash(ser_data);
    }
}
