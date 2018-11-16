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

    mapping (address => mapping (address => uint256)) public balances;
    mapping (bytes32 => uint256) public orderFills;
    mapping (uint256 => address) public userID_Address;
    mapping (uint256 => address) public tokenID_Address;
    mapping (address => uint8) public userRanks;
    mapping (address => uint8) public tokenRanks;

    event AddUser(uint256 userID, address indexed user);
    event AddToken(uint256 tokenID, address indexed token);
    event Deposit(address token, address indexed user, uint256 amount, uint256 balance);
    event Withdraw(address token, address indexed user, uint256 amount, uint256 balance);
    event Trade(
        address indexed user,
        bool isBuy,
        address indexed tokenTarget,
        uint256 amountTarget,
        address indexed tokenTrade,
        uint256 amountTrade
    );

    /**
     * @dev Maker and taker fee rate is defined here.
     * @param dinngoWallet The main address of dinngo
     * @param dinngoToken The contract address of DGO
     */
    constructor(address dinngoWallet, address dinngoToken) public {
        userID_Address[0] = dinngoWallet;
        userRanks[dinngoWallet] = 255;
        tokenID_Address[0] = address(0);
        tokenID_Address[1] = dinngoToken;
    }

    /**
     * @dev All ether directly sent to contract will be refunded
     */
    function() public payable {
        revert();
    }

    /**
     * @notice Add the address to the user list. Event AddUser will be emitted
     * after execution.
     * @dev Record the user list to map the user address to a specific user ID, in
     * order to compact the data size when transferring user address information
     * @param id The user id to be assigned
     * @param user The user address to be added
     */
    function addUser(uint32 id, address user) external onlyOwner {
        require(user != address(0));
        require(userRanks[user] == 0);
        require(userID_Address[id] == address(0));
        userID_Address[id] = user;
        userRanks[user] = 1;
        emit AddUser(id, user);
    }

    /**
     * @notice Remove the address from the user list.
     * @param user The user address to be added
     */
    function removeUser(address user) external onlyOwner {
        require(user != address(0));
        require(userRanks[user] != 0);
        userRanks[user] = 0;
    }

    /**
     * @notice Add the token to the token list. Event AddToken will be emitted
     * after execution.
     * @dev Record the token list to map the token contract address to a specific
     * token ID, in order to compact the data size when transferring token contract
     * address information
     * @param id The token id to be assigned
     * @param token The token contract address to be added
     */
    function addToken(uint16 id, address token) external onlyOwner {
        require(token != address(0));
        require(tokenRanks[token] == 0);
        require(tokenID_Address[id] == address(0));
        tokenID_Address[id] = token;
        tokenRanks[token] = 1;
        emit AddToken(id, token);
    }

    /**
     * @notice Remove the token to the token list.
     * @dev Record the token list to map the token contract address to a specific
     * token ID, in order to compact the data size when transferring token contract
     * address information
     * @param token The token contract address to be added
     */
    function removeToken(address token) external onlyOwner {
        require(token != address(0));
        require(tokenRanks[token] != 0);
        tokenRanks[token] = 0;
    }

    /**
     * @notice Update the rank of user. Can only be called by owner.
     * @param user The user address
     * @param rank The rank to be assigned
     */
    function updateUserRank(address user, uint8 rank) external onlyOwner {
        require(user != address(0));
        require(rank != 0);
        require(userRanks[user] != 0);
        require(userRanks[user] != rank);
        userRanks[user] = rank;
    }

    /**
     * @notice Update the rank of token. Can only be called by owner.
     * @param token The token contract address.
     * @param rank The rank to be assigned.
     */
    function updateTokenRank(address token, uint8 rank) external onlyOwner {
        require(token != address(0));
        require(rank != 0);
        require(tokenRanks[token] != 0);
        require(tokenRanks[token] != rank);
        tokenRanks[token] = rank;
    }

    /**
     * @notice The deposit function for ether. The ether that is sent with the function
     * call will be deposited. The first time user will be added to the user list.
     * Event Deposit will be emitted after execution.
     */
    function deposit() external payable {
        require(!_isLocking(msg.sender));
        require(_isValidUser(msg.sender));
        require(msg.value > 0);
        balances[0][msg.sender] = balances[0][msg.sender].add(msg.value);
        emit Deposit(0, msg.sender, msg.value, balances[0][msg.sender]);
    }

    /**
     * @notice The deposit function for tokens. The first time user will be added to
     * the user list. Event Deposit will be emitted after execution.
     * @param token Address of the token contract to be deposited
     * @param amount Amount of the token to be depositied
     */
    function depositToken(address token, uint256 amount) external {
        require(!_isLocking(msg.sender));
        require(_isValidUser(msg.sender));
        require(token != address(0));
        require(amount > 0);
        ERC20(token).safeTransferFrom(msg.sender, this, amount);
        balances[token][msg.sender] = balances[token][msg.sender].add(amount);
        emit Deposit(token, msg.sender, amount, balances[token][msg.sender]);
    }

    /**
     * @notice The withdraw function for ether. Event Withdraw will be emitted
     * after execution. User needs to be locked before calling withdraw.
     * @param amount The amount to be withdrawn.
     */
    function withdraw(uint256 amount) external {
        require(_isLocked(msg.sender));
        require(_isValidUser(msg.sender));
        require(amount > 0);
        require(amount <= balances[0][msg.sender]);
        msg.sender.transfer(amount);
        balances[0][msg.sender] = balances[0][msg.sender].sub(amount);
        emit Withdraw(0, msg.sender, amount, balances[0][msg.sender]);
    }

    /**
     * @notice The withdraw function for tokens. Event Withdraw will be emitted
     * after execution. User needs to be locked before calling withdraw.
     * @param token The token contract address to be withdrawn.
     * @param amount The token amount to be withdrawn.
     */
    function withdrawToken(address token, uint256 amount) external {
        require(_isLocked(msg.sender));
        require(_isValidUser(msg.sender));
        require(token != address(0));
        require(amount > 0);
        require(amount <= balances[token][msg.sender]);
        ERC20(token).safeTransfer(msg.sender, amount);
        balances[token][msg.sender] = balances[token][msg.sender].sub(amount);
        emit Withdraw(token, msg.sender, amount, balances[token][msg.sender]);
    }

    /**
     * @notice The withdraw function that can only be triggered by owner.
     * Event Withdraw will be emitted after execution.
     * @param withdrawal The serialized withdrawal data
     */
    function withdrawByAdmin(bytes withdrawal) external onlyOwner {
        address user = userID_Address[_getWithdrawalUserID(withdrawal)];
        address token = tokenID_Address[_getWithdrawalTokenID(withdrawal)];
        uint256 amount = _getWithdrawalAmount(withdrawal);
        uint256 amountFee = _getWithdrawalFee(withdrawal);
        address tokenFee = _isWithdrawalFeeETH(withdrawal)? address(0) : tokenID_Address[1];
        uint256 balance = balances[token][user].sub(amount);
        require(_isValidUser(user));
        _verifySig(
            user,
            _getWithdrawalHash(withdrawal),
            _getWithdrawalR(withdrawal),
            _getWithdrawalS(withdrawal),
            _getWithdrawalV(withdrawal)
        );
        if (token == address(0)) {
            user.transfer(amount);
        } else {
            ERC20(token).safeTransfer(user, amount);
        }
        if (tokenFee == token) {
            balance = balance.sub(amountFee);
        } else {
            balances[tokenFee][user] = balances[tokenFee][user].sub(amountFee);
        }
        balances[tokenFee][userID_Address[0]] =
            balances[tokenFee][userID_Address[0]].add(amountFee);
        balances[token][user] = balance;
        emit Withdraw(token, user, amount, balance);
    }

    struct SettleAmount {
        uint256 fillAmountTrade;
        uint256 restAmountTarget;
    }

    /**
     * @notice The settle function for orders. First order is taker order and the followings
     * are maker orders.
     * param orders The serialized orders.
     */
    function settle(bytes orders) external onlyOwner {
        uint256 nOrder = _getOrderCount(orders);
        require(nOrder >= 2);
        bytes memory order = _getOrder(orders, 0);
        uint256 amountTarget = _getOrderAmountTarget(order);
        uint256 amountTrade = _getOrderAmountTrade(order);
        SettleAmount memory s = SettleAmount(0, amountTarget);
        for (uint i = 1; i < nOrder; i++) {
            bytes memory makerOrder = _getOrder(orders, i);
            uint256 makerAmountTarget = _getOrderAmountTarget(makerOrder);
            uint256 makerAmountTrade = _getOrderAmountTrade(makerOrder);
            require(amountTarget.div(amountTrade) >= makerAmountTrade.div(makerAmountTarget));
            _processMaker(s, makerOrder);
        }
        uint256 fillAmountTarget = amountTarget.sub(s.restAmountTarget);
        // calculate trade
        _trade(fillAmountTarget, s.fillAmountTrade, order);
    }

    /**
     * @notice Process the maker order
     * @param s The current status of settlement
     * @param order The processing order
     */
    function _processMaker(SettleAmount s, bytes order) internal {
        // fetch current status of taker order
        SettleAmount memory tmp = s;
        // try to meet
        uint256 _amountTarget = _getOrderAmountTarget(order);
        uint256 _amountTrade = _getOrderAmountTrade(order);
        uint256 amountTrade = _amountTrade.mul(
            _amountTarget.sub(orderFills[_getOrderHash(order)])
        ).div(_amountTarget);
        amountTrade = amountTrade < tmp.restAmountTarget? amountTrade: tmp.restAmountTarget;
        uint256 amountTarget = _amountTarget.mul(amountTrade).div(_amountTrade);
        tmp.restAmountTarget = tmp.restAmountTarget.sub(amountTrade);
        tmp.fillAmountTrade = tmp.fillAmountTrade.add(amountTarget);
        // calculate trade
        _trade(amountTarget, amountTrade, order);
    }

    /**
     * @notice Process the trade by the providing information
     * @param amountTarget The provided amount to be traded
     * @param amountTrade The amount to be requested
     * @param order The order that triggerred the trading
     */
    function _trade(uint256 amountTarget, uint256 amountTrade, bytes order) internal {
        // Get parameters
        address user = userID_Address[_getOrderUserID(order)];
        require(_isValidUser(user));
        bytes32 hash = _getOrderHash(order);
        // Get target and trade
        address tokenTarget = tokenID_Address[_getOrderTokenIDTarget(order)];
        address tokenTrade = tokenID_Address[_getOrderTokenIDTrade(order)];
        uint256 balanceTarget = balances[tokenTarget][user].sub(amountTarget);
        uint256 balanceTrade = balances[tokenTrade][user].add(amountTrade);
        // GetFee
        address tokenFee = _isOrderFeeMain(order)? (_isOrderBuy(order)? tokenTarget: tokenTrade): tokenID_Address[1];
        uint256 amountFee = _getOrderTradeFee(order).mul(amountTarget).div(_getOrderAmountTarget(order));
        if (orderFills[hash] == 0) {
            _verifySig(user, hash, _getOrderR(order), _getOrderS(order), _getOrderV(order));
            amountFee = amountFee.add(_getOrderGasFee(order));
        }
        emit Trade
        (
            user,
            _isOrderBuy(order),
            tokenTarget,
            amountTarget,
            tokenTrade,
            amountTrade
        );
        orderFills[hash] = orderFills[hash].add(amountTarget);
        if (tokenFee == tokenTarget)
            balanceTarget = balanceTarget.sub(amountFee);
        else if (tokenFee == tokenTrade)
            balanceTrade = balanceTrade.sub(amountFee);
        else
            balances[tokenFee][user] = balances[tokenFee][user].sub(amountFee);
        balances[tokenFee][userID_Address[0]] =
            balances[tokenFee][userID_Address[0]].add(amountFee);
        balances[tokenTarget][user] = balanceTarget;
        balances[tokenTrade][user] = balanceTrade;
    }

    function _isValidUser(address user) internal view returns (bool) {
        return userRanks[user] != 0;
    }

    function _isValidToken(address token) internal view returns (bool) {
        return tokenRanks[token] != 0;
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
