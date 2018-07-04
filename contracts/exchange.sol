pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ECRecovery.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

/**
 * @title Dinngo
 * @dev Main exchange contract for Dinngo
 */
contract Dinngo {
    using SafeMath for uint256;
    using ECRecovery for bytes32;
    using SafeERC20 for ERC20;

    mapping (address => mapping (address => uint256)) private balance;

    event Deposit(address token, address user, uint256 amount);

    function deposit() public payable {
        require(msg.value > 0);
        balance[0][msg.sender] = balance[0][msg.sender].add(msg.value);
        emit Deposit(0, msg.sender, msg.value);
    }

    function depositToken(address token, uint256 amount) public {
        require(token != address(0));
        require(amount > 0);
        ERC20(token).safeTransferFrom(msg.sender, this, amount);
        balance[token][msg.sender] = balance[token][msg.sender].add(amount);
        emit Deposit(token, msg.sender, amount);
    }

    function withdraw(address token, uint256 amount) public returns (bool) {
        return true;
    }

    function settle() public returns (bool) {
        return true;
    }

}
