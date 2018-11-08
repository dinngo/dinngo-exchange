pragma solidity ^0.4.24;

import "../Dinngo.sol";

contract DinngoMock is Dinngo {

    constructor(address dinngoWallet, address dinngoToken)
        Dinngo(dinngoWallet, dinngoToken)
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

    event TestMaker(uint256 fillAmountTrade, uint256 restAmountTarget);
    function processMakerMock(bytes order, uint256 amountTarget)
        external
    {
        SettleAmount memory s = SettleAmount(0, amountTarget);
        _processMaker(s, order);
        emit TestMaker(s.fillAmountTrade, s.restAmountTarget);
    }
}
