pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ECRecovery.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

/**
 * @title Dinngo
 * @author Ben Huang
 * @notice Main exchange contract for Dinngo
 */
contract Dinngo {
    using SafeMath for uint256;
    using ECRecovery for bytes32;
    using SafeERC20 for ERC20;

    mapping (address => mapping (address => uint256)) private balance;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    function deposit() external payable {
        require(msg.value > 0);
        balance[0][msg.sender] = balance[0][msg.sender].add(msg.value);
        emit Deposit(0, msg.sender, msg.value, balance[0][msg.sender]);
    }

    function depositToken(address token, uint256 amount) external {
        require(token != address(0));
        require(amount > 0);
        ERC20(token).safeTransferFrom(msg.sender, this, amount);
        balance[token][msg.sender] = balance[token][msg.sender].add(amount);
        emit Deposit(token, msg.sender, amount, balance[token][msg.sender]);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0);
        require(amount <= balance[0][msg.sender]);
        msg.sender.transfer(amount);
        balance[0][msg.sender] = balance[0][msg.sender].sub(amount);
        emit Withdraw(0, msg.sender, amount, balance[0][msg.sender]);
    }

    function withdrawToken(address token, uint256 amount) external {
        require(token != address(0));
        require(amount > 0);
        require(amount <= balance[token][msg.sender]);
        ERC20(token).safeTransfer(msg.sender, amount);
        balance[token][msg.sender] = balance[token][msg.sender].sub(amount);
        emit Withdraw(token, msg.sender, amount, balance[token][msg.sender]);
    }

    function getBalance(address token, address user) external view returns (uint256) {
        return balance[token][user];
    }

    function settle() public returns (bool) {
        return true;
    }

}
