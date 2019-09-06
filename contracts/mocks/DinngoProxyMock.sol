pragma solidity ^0.5.0;

import "../DinngoProxy.sol";

contract DinngoProxyMock is DinngoProxy {
    event AddUser(uint256 userID, address indexed user);
    event AddToken(uint256 tokenID, address indexed token);
    event Deposit(address token, address indexed user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address indexed user,
        uint256 amount,
        uint256 balance,
        address tokenFee,
        uint256 amountFee
    );
    event Trade(
        address indexed user,
        bool isBuy,
        address indexed tokenBase,
        uint256 amountBase,
        address indexed tokenQuote,
        uint256 amountQuote,
        address tokenFee,
        uint256 amountFee
    );
    event Transfer(
        address indexed from,
        address indexed to,
        address token,
        uint256 amount,
        address feeToken,
        uint256 feeAmount
    );
    event Lock(address indexed user, uint256 lockTime);
    event Unlock(address indexed user);

    constructor(address payable dinngoWallet, address dinngoToken, address impl)
        DinngoProxy(dinngoWallet, dinngoToken, impl)
        public
    {
    }

    function setUserBalance(address user, address token, uint256 amount) external {
        balances[token][user] = amount;
    }

    function setUser(uint256 userID, address payable user, uint8 rank) external {
        userID_Address[userID] = user;
        userRanks[user] = rank;
    }

    function setToken(uint256 tokenID, address token, uint8 rank) external {
        tokenID_Address[tokenID] = token;
        tokenRanks[token] = rank;
    }

    function fillOrder(bytes32 hash, uint256 amount) external {
        orderFills[hash] = orderFills[hash].add(amount);
    }
}
