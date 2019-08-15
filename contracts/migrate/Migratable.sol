pragma solidity ^0.5.0;

interface Migratable {
    function migrateTo(address user, address token, uint256 amount) payable external;
}
