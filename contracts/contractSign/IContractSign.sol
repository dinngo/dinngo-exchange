pragma solidity ^0.5.0;

interface IContractSign {
    function signed(bytes32 hash) external view returns (bool);
}
