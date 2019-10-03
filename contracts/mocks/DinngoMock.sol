pragma solidity ^0.5.0;

import "../Dinngo.sol";

contract DinngoMock is Dinngo {

    constructor() public
    {
    }

    function setUserBalance(address user, address token, uint256 amount) external {
        balances[token][user] = amount;
    }

    function setUser(uint256 userID, address payable user, uint8 rank) external {
        userID_Address[userID] = user;
        ranks[user] = rank;
    }

    function setToken(uint256 tokenID, address token, uint8 rank) external {
        tokenID_Address[tokenID] = token;
        ranks[token] = rank;
    }

}
