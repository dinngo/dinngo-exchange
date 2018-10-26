pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ECRecovery.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

import "./SerializableOrder.sol";
import "./SerializableWithdrawal.sol";
import "./UserLock.sol";


/**
 * @title Dinngo
 * @author Ben Huang
 * @notice Main exchange contract for Dinngo
 */
contract Dinngo is SerializableOrder, SerializableWithdrawal, UserLock, Ownable {
    using ECRecovery for bytes32;
    using SafeERC20 for ERC20;
    using SafeMath for uint256;

    mapping (address => mapping (address => uint256)) public balance;
    mapping (bytes32 => uint256) public orderFill;
    mapping (uint256 => address) public userID_Address;
    mapping (uint256 => address) public tokenID_Address;
    mapping (address => uint8) public userRank;
    mapping (address => uint8) public tokenRank;
    mapping (uint8 => uint256) public takerFee;
    mapping (uint8 => uint256) public makerFee;
    uint256 constant BASE = 10000;
    uint256 private _userCount;
    uint256 private _tokenCount;

    event AddUser(uint256 userID, address indexed user);
    event AddToken(uint256 tokenID, address indexed token);
    event Deposit(address token, address indexed user, uint256 amount, uint256 balance);
    event Withdraw(address token, address indexed user, uint256 amount, uint256 balance);
    event Trade(
        address indexed user,
        bool isBuy,
        address indexed tokenMain,
        uint256 amountMain,
        address indexed tokenSub,
        uint256 amountSub
    );

    /**
     * @dev Maker and taker fee rate is defined here.
     * @param dinngoWallet The main address of dinngo
     * @param dinngoToken The contract address of DGO
     */
    constructor(address dinngoWallet, address dinngoToken) public {
        _userCount = 0;
        _tokenCount = 1;
        userID_Address[0] = dinngoWallet;
        userRank[dinngoWallet] = 255;
        tokenID_Address[0] = address(0);
        tokenID_Address[1] = dinngoToken;
        takerFee[1] = 20;
        takerFee[2] = 19;
        takerFee[3] = 17;
        takerFee[4] = 15;
        takerFee[5] = 12;
        takerFee[6] = 9;
        takerFee[7] = 6;
        takerFee[8] = 2;
        makerFee[1] = 10;
        makerFee[2] = 9;
        makerFee[3] = 7;
        makerFee[4] = 5;
        makerFee[5] = 2;
    }

    /**
     * @dev All ether directly sent to contract will be refunded
     */
    function() public payable {
        revert();
    }

    /**
     * @notice Add the token to the token list. Event AddToken will be emitted
     * after execution.
     * @dev Record the token list to map the token contract address to a specific
     * token ID, in order to compact the data size when transferring token contract
     * address information
     * @param token The token contract address to be added
     */
    function addToken(address token) external onlyOwner {
        require(tokenRank[token] == 0);
        require(token != address(0));
        _tokenCount++;
        tokenID_Address[_tokenCount] = token;
        tokenRank[token] = 1;
        emit AddToken(_tokenCount, token);
    }

    /**
     * @notice Update the rank of user. Can only be called by owner.
     * @param user The user address
     * @param rank The rank to be assigned
     */
    function updateUserRank(address user, uint8 rank) external onlyOwner {
        require(user != address(0));
        require(userRank[user] != 0);
        require(userRank[user] != rank);
        userRank[user] = rank;
    }

    /**
     * @notice Update the rank of token. Can only be called by owner.
     * @param token The token contract address.
     * @param rank The rank to be assigned.
     */
    function updateTokenRank(address token, uint8 rank) external onlyOwner {
        require(token != address(0));
        require(tokenRank[token] != 0);
        require(tokenRank[token] != rank);
        tokenRank[token] = rank;
    }

    /**
     * @notice The deposit function for ether. The ether that is sent with the function
     * call will be deposited. The first time user will be added to the user list.
     * Event Deposit will be emitted after execution.
     */
    function deposit() external payable {
        require(!_isLocking(msg.sender));
        require(msg.value > 0);
        balance[0][msg.sender] = balance[0][msg.sender].add(msg.value);
        _addUser(msg.sender);
        emit Deposit(0, msg.sender, msg.value, balance[0][msg.sender]);
    }

    /**
     * @notice The deposit function for tokens. The first time user will be added to
     * the user list. Event Deposit will be emitted after execution.
     * @param token Address of the token contract to be deposited
     * @param amount Amount of the token to be depositied
     */
    function depositToken(address token, uint256 amount) external {
        require(!_isLocking(msg.sender));
        require(token != address(0));
        require(amount > 0);
        ERC20(token).safeTransferFrom(msg.sender, this, amount);
        balance[token][msg.sender] = balance[token][msg.sender].add(amount);
        _addUser(msg.sender);
        emit Deposit(token, msg.sender, amount, balance[token][msg.sender]);
    }

    /**
     * @notice The withdraw function for ether. Event Withdraw will be emitted
     * after execution. User needs to be locked before calling withdraw.
     * @param amount The amount to be withdrawn.
     */
    function withdraw(uint256 amount) external {
        require(_isLocked(msg.sender));
        require(amount > 0);
        require(amount <= balance[0][msg.sender]);
        msg.sender.transfer(amount);
        balance[0][msg.sender] = balance[0][msg.sender].sub(amount);
        emit Withdraw(0, msg.sender, amount, balance[0][msg.sender]);
    }

    /**
     * @notice The withdraw function for tokens. Event Withdraw will be emitted
     * after execution. User needs to be locked before calling withdraw.
     * @param token The token contract address to be withdrawn.
     * @param amount The token amount to be withdrawn.
     */
    function withdrawToken(address token, uint256 amount) external {
        require(_isLocked(msg.sender));
        require(token != address(0));
        require(amount > 0);
        require(amount <= balance[token][msg.sender]);
        ERC20(token).safeTransfer(msg.sender, amount);
        balance[token][msg.sender] = balance[token][msg.sender].sub(amount);
        emit Withdraw(token, msg.sender, amount, balance[token][msg.sender]);
    }

    /**
     * @notice The withdraw function that can only be triggered by owner.
     * Event Withdraw will be emitted after execution.
     * @param withdrawal The serialized withdrawal data
     */
    function withdrawByAdmin(bytes withdrawal) external onlyOwner {
        require(_getWithdrawalAmount(withdrawal) > 0);
        address user = userID_Address[_getWithdrawalUserID(withdrawal)];
        address token = tokenID_Address[_getWithdrawalTokenID(withdrawal)];
        _verifySig(
            user,
            _getWithdrawalHash(withdrawal),
            _getWithdrawalR(withdrawal),
            _getWithdrawalS(withdrawal),
            _getWithdrawalV(withdrawal)
        );
        require(_getWithdrawalAmount(withdrawal) <= balance[token][user]);
        if (token == address(0)) {
            user.transfer(_getWithdrawalAmount(withdrawal));
        } else {
            ERC20(token).safeTransfer(user, _getWithdrawalAmount(withdrawal));
        }
        balance[token][user] = balance[token][user].sub(_getWithdrawalAmount(withdrawal));
        if (_isWithdrawalETH(withdrawal)) {
            _payFee(tokenID_Address[0], user, _getWithdrawalFee(withdrawal));
        } else {
            _payFee(tokenID_Address[1], user, _getWithdrawalFee(withdrawal));
        }
        emit Withdraw(token, user, _getWithdrawalAmount(withdrawal), balance[token][user]);
    }

    /**
     * @notice The settle function for orders. First order is taker order and the followings
     * are maker orders.
     * @param orders The serialized orders.
     */
    function settle(bytes orders) external onlyOwner {
        require(_getOrderCount(orders) >= 2);
        bytes memory takerOrder = _getOrder(orders, 0);
        address taker = userID_Address[_getOrderUserID(takerOrder)];
        require(_getOrderAmountMain(takerOrder) > 0);
        require(_getOrderAmountSub(takerOrder) > 0);
        require(_getOrderFeePrice(takerOrder) > 0);
        _verifySig(taker, _getOrderHash(takerOrder), _getOrderR(takerOrder), _getOrderS(takerOrder), _getOrderV(takerOrder));
        require(!_isLocking(taker));
        SettleAmount memory s = SettleAmount(0, _getOrderAmountSub(takerOrder));
        for (uint i = 1; i < _getOrderCount(orders); i++) {
            _processMaker(s, _getOrder(orders, i));
        }
        uint256 fillAmountSub = _getOrderAmountSub(takerOrder).sub(s.restAmountSub);
        if (_isOrderBuy(takerOrder)) {
            balance[tokenID_Address[_getOrderTokenIDSub(takerOrder)]][taker] =
                balance[tokenID_Address[_getOrderTokenIDSub(takerOrder)]][taker].add(fillAmountSub);
            balance[tokenID_Address[_getOrderTokenIDMain(takerOrder)]][taker] =
                balance[tokenID_Address[_getOrderTokenIDMain(takerOrder)]][taker].sub(s.fillAmountMain);
        } else {
            balance[tokenID_Address[_getOrderTokenIDSub(takerOrder)]][taker] =
                balance[tokenID_Address[_getOrderTokenIDSub(takerOrder)]][taker].sub(fillAmountSub);
            balance[tokenID_Address[_getOrderTokenIDMain(takerOrder)]][taker] =
                balance[tokenID_Address[_getOrderTokenIDMain(takerOrder)]][taker].add(s.fillAmountMain);
        }
        emit Trade
        (
            taker,
            _isOrderBuy(takerOrder),
            tokenID_Address[_getOrderTokenIDMain(takerOrder)],
            s.fillAmountMain,
            tokenID_Address[_getOrderTokenIDSub(takerOrder)],
            fillAmountSub
        );
        bytes32 hash = _getOrderHash(takerOrder);
        orderFill[hash] = orderFill[hash].add(fillAmountSub);
        // calculate fee
        _payTradingFee(
            true,
            _isOrderFeeMain(takerOrder)? tokenID_Address[_getOrderTokenIDMain(takerOrder)] : tokenID_Address[1],
            taker,
            _getOrderFeePrice(takerOrder),
            s.fillAmountMain
        );
    }

    /**
     * @notice Add the address to the user list. Event AddUser will be emitted
     * after execution.
     * @dev Record the user list to map the user address to a specific user ID, in
     * order to compact the data size when transferring user address information
     * @param user The user address to be added
     */
    function _addUser(address user) internal {
        require(user != address(0));
        if (userRank[user] != 0)
            return;
        _userCount++;
        userID_Address[_userCount] = user;
        userRank[user] = 1;
        emit AddUser(_userCount, user);
    }

    /**
     * @notice Fee paying process
     * @param token The fee token
     * @param user The user paying fee
     * @param amount The fee amount
     */
    function _payFee(address token, address user, uint256 amount) internal {
        require(user != address(0));
        if (token == tokenID_Address[1])
            amount = amount.div(2);
        balance[token][user] = balance[token][user].sub(amount);
        balance[token][userID_Address[0]] = balance[token][userID_Address[0]].add(amount);
    }

    /**
     * @notice Trading fee calculation
     * @dev feePrice should be divided by BASE
     * @param isTaker If the order is a taker order
     * @param tokenFee The fee token
     * @param user The user paying fee
     * @param feePrice The fee price comparing to the main token
     * @param amount The trading amount based on main token
     */
    function _payTradingFee(
        bool isTaker,
        address tokenFee,
        address user,
        uint256 feePrice,
        uint256 amount
    )
        internal
    {
        require(user != address(0));
        uint256 amountFee = amount.mul(isTaker? takerFee[userRank[user]] : makerFee[userRank[user]]).div(BASE);
        amountFee = amountFee.mul(feePrice).div(BASE);
        _payFee(tokenFee, user, amountFee);
    }

    struct SettleAmount {
        uint256 fillAmountMain;
        uint256 restAmountSub;
    }

    /**
     * @notice Process the maker order
     * @param s Record the accumulated trading information of maker orders
     * @param order The maker order
     */
    function _processMaker(SettleAmount s, bytes order) internal {
        require(_getOrderAmountMain(order) > 0);
        require(_getOrderAmountSub(order) > 0);
        require(_getOrderFeePrice(order) > 0);
        address user = userID_Address[_getOrderUserID(order)];
        _verifySig(user, _getOrderHash(order), _getOrderR(order), _getOrderS(order), _getOrderV(order));
        require(!_isLocking(user));
        // trade
        SettleAmount memory tmp = s;
        uint256 tradeAmountSub = (tmp.restAmountSub < _getOrderAmountSub(order))? tmp.restAmountSub : _getOrderAmountSub(order);
        uint256 tradeAmountMain = _trade(
            _isOrderBuy(order),
            user,
            tokenID_Address[_getOrderTokenIDMain(order)],
            _getOrderAmountMain(order),
            tokenID_Address[_getOrderTokenIDSub(order)],
            _getOrderAmountSub(order),
            tradeAmountSub
        );
        bytes32 hash = _getOrderHash(order);
        orderFill[hash] = orderFill[hash].add(tradeAmountSub);
        // calculate fee
        _payTradingFee(
            false,
            _isOrderFeeMain(order)? _getOrderTokenIDMain(order) : tokenID_Address[1],
            user,
            _getOrderFeePrice(order),
            tradeAmountMain
        );
        tmp.restAmountSub = tmp.restAmountSub.sub(tradeAmountSub);
        tmp.fillAmountMain = tmp.fillAmountMain.add(tradeAmountMain);
    }

    /**
     * @notice Trading process. Event Trade will be emitted after execution.
     * @param isBuy If the trade is a buying process
     * @param user The trading user
     * @param tokenMain The trading main token
     * @param amountMain The trading main token amount
     * @param tokenSub The trading sub token
     * @param amountSub The trading sub token amount
     * @param amountTrade The target sub token amount to be traded
     * @return amount The calculated main token amount to be traded to meet the target
     */
    function _trade(
        bool isBuy,
        address user,
        address tokenMain,
        uint256 amountMain,
        address tokenSub,
        uint256 amountSub,
        uint256 amountTrade
    )
        internal
        returns (uint256 amount)
    {
        require(user != address(0));
        amount = amountTrade.mul(amountMain).div(amountSub);
        if (isBuy) {
            balance[tokenSub][user] = balance[tokenSub][user].add(amountTrade);
            balance[tokenMain][user] = balance[tokenMain][user].sub(amount);
        } else {
            balance[tokenSub][user] = balance[tokenSub][user].sub(amountTrade);
            balance[tokenMain][user] = balance[tokenMain][user].add(amount);
        }
        emit Trade(user, isBuy, tokenMain, amount, tokenSub, amountTrade);
    }

    /**
     * @notice Verify if the data is signed by the given user and signature
     * @param user The signing user
     * @param hash The data hash to be verified
     * @param r The signature R
     * @param s The signature S
     * @param v The signature V
     */
    function _verifySig(address user, bytes32 hash, bytes32 r, bytes32 s, uint8 v) internal pure {
        // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
        if (v < 27) {
          v += 27;
        }
        require(v == 27 || v == 28);

        address sigAddr = ecrecover(hash.toEthSignedMessageHash(), v, r, s);
        require(user == sigAddr);
    }
}
