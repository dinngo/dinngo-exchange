pragma solidity 0.5.6;

import "../migrate/Migratable.sol";

contract DummyTarget is Migratable {
    mapping (address => mapping (address => uint256)) public balances;

    function migrateTo(address user, address token, uint256 amount) payable external {
        if (token == address(0)) {
            require(msg.value == amount);

        } else {
            IERC20(token).safeTransferFrom(msg.sender, this, amount);
        }
    }
}
