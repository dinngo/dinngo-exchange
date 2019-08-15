pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "../migrate/Migratable.sol";

contract DummyTarget is Migratable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    mapping (address => mapping (address => uint256)) public balances;

    function migrateTo(address user, address token, uint256 amount) payable external {
        if (token == address(0)) {
            require(msg.value == amount);
            balances[address(0)][user] = balances[address(0)][user].add(amount);
        } else {
            balances[token][user] = balances[token][user].add(amount);
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }
    }
}
