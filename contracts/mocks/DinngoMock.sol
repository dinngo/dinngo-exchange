pragma solidity ^0.4.24;

import "../Dinngo.sol";

contract DinngoMock is Dinngo {

    constructor(address _dinngoWallet, address _dinngoToken)
        Dinngo(_dinngoWallet, _dinngoToken)
        public
    {
    }

    function setUserBalance(address user, address token, uint256 amount) external {
        balance[token][user] = amount;
    }

    function setUser(uint256 userID, address user, uint8 rank) external {
        userID_Address[userID] = user;
        userRank[user] = rank;
    }

    function setToken(uint256 tokenID, address token, uint8 rank) external {
        tokenID_Address[tokenID] = token;
        tokenRank[token] = rank;
    }

    function addUserMock(address user) external {
        addUser(user);
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
        payTradingFee(isTaker, tokenFee, user, feePrice, amount);
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
        amount = trade(isBuy, user, tokenMain, amountMain, tokenSub, amountSub, amountTrade);
    }

    event TestMaker(uint256 fillAmountMain, uint256 restAmountSub);
    function processMakerMock(bytes _order, uint256 _tradeAmountSub)
        external
    {
        SettleAmount memory s = SettleAmount(0, _tradeAmountSub);
        _processMaker(s, _order);
        emit TestMaker(s.fillAmountMain, s.restAmountSub);
    }
}
