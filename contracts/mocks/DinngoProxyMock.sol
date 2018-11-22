pragma solidity ^0.4.24;

import "../DinngoProxy.sol";

contract DinngoProxyMock is DinngoProxy {

    constructor(address dinngoWallet, address dinngoToken, address impl)
        DinngoProxy(dinngoWallet, dinngoToken, impl)
        public
    {
    }

    function setUserBalance(address user, address token, uint256 amount) external {
        balances[token][user] = amount;
    }

    function setUser(uint256 userID, address user, uint8 rank) external {
        userID_Address[userID] = user;
        userRanks[user] = rank;
    }

    function setToken(uint256 tokenID, address token, uint8 rank) external {
        tokenID_Address[tokenID] = token;
        tokenRanks[token] = rank;
    }
}
