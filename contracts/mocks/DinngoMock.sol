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

    function payTradingFeeMock(
        bool isTaker,
        address tokenFee,
        address user,
        uint256 feePrice,
        uint256 amount
    )
        external
    {
        _payTradingFee(isTaker, tokenFee, user, feePrice, amount);
    }

    function tradeMock(
        bool isBuy,
        address user,
        address tokenMain,
        uint256 amountMain,
        address tokenSub,
        uint256 amountSub,
        uint256 amountTrade
    )
        external
        returns (uint256 amount) {
        amount = _trade(isBuy, user, tokenMain, amountMain, tokenSub, amountSub, amountTrade);
    }

    event TestMaker(uint256 fillAmountMain, uint256 restAmountSub);
    function processMakerMock(bytes order, uint256 tradeAmountSub)
        external
    {
        SettleAmount memory s = SettleAmount(0, tradeAmountSub);
        _processMaker(s, order);
        emit TestMaker(s.fillAmountMain, s.restAmountSub);
    }
}
