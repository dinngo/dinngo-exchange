pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ECRecovery.sol";

/**
 * @title Dinngo
 * @dev Main exchange contract for Dinngo
 */
contract Dinngo {
    using SafeMath for uint256;
    using ECRecovery for bytes32;

    mapping (address => mapping (address => uint256)) private balance;

    function deposit(address token, uint256 amount) public returns (bool) {
        return true;
    }

    function withdraw(address token, uint256 amount) public returns (bool) {
        return true;
    }

    function settle() public returns (bool) {
        return true;
    }

}
