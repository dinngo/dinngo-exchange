pragma solidity ^0.5.0;

import "./BadERC20.sol";

contract BadToken is BadERC20 {
    string public constant name = "BadToken";
    string public constant symbol = "BAD";
    uint8 public constant decimals = 18;

    uint256 public constant INITIAL_SUPPLY = 10000 * (10 ** uint256(decimals));

    constructor() public {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
