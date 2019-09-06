pragma solidity ^0.5.0;

interface ISign {
    function signed(bytes32 hash) external view returns (bool);
}
