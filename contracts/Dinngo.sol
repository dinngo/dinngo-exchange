pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

import "./Administrable.sol";
import "./SerializableOrder.sol";
import "./SerializableWithdrawal.sol";

/**
 * @title Dinngo
 * @author Ben Huang
 * @notice Main exchange contract for Dinngo
 */
contract Dinngo is Ownable, Administrable, SerializableOrder, SerializableWithdrawal {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    uint256 public processTime;

    mapping (address => mapping (address => uint256)) public balances;
    mapping (bytes32 => uint256) public orderFills;
    mapping (uint256 => address payable) public userID_Address;
    mapping (uint256 => address) public tokenID_Address;
    mapping (address => uint256) public userRanks;
    mapping (address => uint256) public tokenRanks;
    mapping (address => uint256) public lockTimes;

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
    event Lock(address indexed user, uint256 lockTime);
    event Unlock(address indexed user);

    /**
     * @dev All ether directly sent to contract will be refunded
     */
    function() external payable {
        revert();
    }

    /**
     * @notice Add the address to the user list. Event AddUser will be emitted
     * after execution.
     * @dev Record the user list to map the user address to a specific user ID, in
     * order to compact the data size when transferring user address information
     * @dev id should be less than 2**32
     * @param id The user id to be assigned
     * @param user The user address to be added
     */
    function addUser(uint256 id, address payable user) external {
        require(user != address(0));
        require(userRanks[user] == 0);
        require(id < 2**32);
        if (userID_Address[id] == address(0))
            userID_Address[id] = user;
        else
            require(userID_Address[id] == user);
        userRanks[user] = 1;
        emit AddUser(id, user);
    }

    /**
     * @notice Remove the address from the user list.
     * @dev The user rank is set to 0 to remove the user.
     * @param user The user address to be added
     */
    function removeUser(address user) external {
        require(user != address(0));
        require(userRanks[user] != 0);
        userRanks[user] = 0;
    }

    /**
     * @notice Update the rank of user. Can only be called by owner.
     * @param user The user address
     * @param rank The rank to be assigned
     */
    function updateUserRank(address user, uint256 rank) external {
        require(user != address(0));
        require(rank != 0);
        require(userRanks[user] != 0);
        require(userRanks[user] != rank);
        userRanks[user] = rank;
    }

    /**
     * @notice Add the token to the token list. Event AddToken will be emitted
     * after execution.
     * @dev Record the token list to map the token contract address to a specific
     * token ID, in order to compact the data size when transferring token contract
     * address information
     * @dev id should be less than 2**16
     * @param id The token id to be assigned
     * @param token The token contract address to be added
     */
    function addToken(uint256 id, address token) external {
        require(token != address(0));
        require(tokenRanks[token] == 0);
        require(id < 2**16);
        if (tokenID_Address[id] == address(0))
            tokenID_Address[id] = token;
        else
            require(tokenID_Address[id] == token);
        tokenRanks[token] = 1;
        emit AddToken(id, token);
    }

    /**
     * @notice Remove the token to the token list.
     * @dev The token rank is set to 0 to remove the token.
     * @param token The token contract address to be removed.
     */
    function removeToken(address token) external {
        require(token != address(0));
        require(tokenRanks[token] != 0);
        tokenRanks[token] = 0;
    }

    /**
     * @notice Update the rank of token. Can only be called by owner.
     * @param token The token contract address.
     * @param rank The rank to be assigned.
     */
    function updateTokenRank(address token, uint256 rank) external {
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
        require(msg.value > 0);
        balances[address(0)][msg.sender] = balances[address(0)][msg.sender].add(msg.value);
        emit Deposit(address(0), msg.sender, msg.value, balances[address(0)][msg.sender]);
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
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
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
        balances[address(0)][msg.sender] = balances[address(0)][msg.sender].sub(amount);
        emit Withdraw(address(0), msg.sender, amount, balances[address(0)][msg.sender]);
        msg.sender.transfer(amount);
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
        balances[token][msg.sender] = balances[token][msg.sender].sub(amount);
        emit Withdraw(token, msg.sender, amount, balances[token][msg.sender]);
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /**
     * @notice The withdraw function that can only be triggered by owner.
     * Event Withdraw will be emitted after execution.
     * @param withdrawal The serialized withdrawal data
     */
    function withdrawByAdmin(bytes calldata withdrawal) external {
        address payable user = userID_Address[_getWithdrawalUserID(withdrawal)];
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
        if (tokenFee == token) {
            balance = balance.sub(amountFee);
        } else {
            balances[tokenFee][user] = balances[tokenFee][user].sub(amountFee);
        }
        balances[tokenFee][userID_Address[0]] =
            balances[tokenFee][userID_Address[0]].add(amountFee);
        balances[token][user] = balance;
        emit Withdraw(token, user, amount, balance);
        if (token == address(0)) {
            user.transfer(amount);
        } else {
            IERC20(token).safeTransfer(user, amount);
        }
    }

    /**
     * @notice The settle function for orders. First order is taker order and the followings
     * are maker orders.
     * @param orders The serialized orders.
     */
    function settle(bytes calldata orders) external {
        // Deal with the order list
        uint256 nOrder = _getOrderCount(orders);
        // Get the first order as the taker order
        bytes memory takerOrder = _getOrder(orders, 0);
        bytes32 takerHash = _getOrderHash(takerOrder);
        uint256 takerAmountTarget = _getOrderAmountTarget(takerOrder).sub(orderFills[takerHash]);
        uint256 fillAmountTrade = 0;
        uint256 restAmountTarget = takerAmountTarget;
        // Parse maker orders
        for (uint i = 1; i < nOrder; i++) {
            // Get ith order as the maker order
            bytes memory makerOrder = _getOrder(orders, i);
            require(_isOrderBuy(takerOrder) != _isOrderBuy(makerOrder));
            uint256 makerAmountTrade = _getOrderAmountTrade(makerOrder);
            uint256 makerAmountTarget = _getOrderAmountTarget(makerOrder);
            bytes32 makerHash = _getOrderHash(makerOrder);
            // Calculate the amount to be executed
            uint256 amountTarget = makerAmountTarget.sub(orderFills[makerHash]);
            amountTarget = amountTarget <= restAmountTarget? amountTarget : restAmountTarget;
            uint256 amountTrade = makerAmountTrade.mul(amountTarget).div(makerAmountTarget);
            restAmountTarget = restAmountTarget.sub(amountTarget);
            fillAmountTrade = fillAmountTrade.add(amountTrade);
            // Trade amountTarget and amountTrade for maker order
            _trade(amountTarget, amountTrade, makerOrder);
        }
        // Sum the trade amount and check
        restAmountTarget = takerAmountTarget.sub(restAmountTarget);
        if (_isOrderBuy(takerOrder)) {
            require(fillAmountTrade.mul(_getOrderAmountTarget(takerOrder))
                <= _getOrderAmountTrade(takerOrder).mul(restAmountTarget));
        } else {
            require(fillAmountTrade.mul(_getOrderAmountTarget(takerOrder))
                >= _getOrderAmountTrade(takerOrder).mul(restAmountTarget));
        }
        // Trade amountTarget and amountTrade for taker order
        _trade(restAmountTarget, fillAmountTrade, takerOrder);
    }

    /**
     * @notice Announce lock of the sender
     */
    function lock() external {
        require(!_isLocking(msg.sender));
        lockTimes[msg.sender] = now + processTime;
        emit Lock(msg.sender, lockTimes[msg.sender]);
    }

    /**
     * @notice Unlock the sender
     */
    function unlock() external {
        require(_isLocking(msg.sender));
        lockTimes[msg.sender] = 0;
        emit Unlock(msg.sender);
    }

    /**
     * @notice Change the processing time of locking the user address
     */
    function changeProcessTime(uint256 time) external {
        require(processTime != time);
        processTime = time;
    }

    /**
     * @notice Process the trade by the providing information
     * @dev Price equal amountTrade/amountTarget
     * @param amountTarget The provided amount to be traded
     * @param amountTrade The amount to be requested
     * @param order The order that triggered the trading
     */
    function _trade(uint256 amountTarget, uint256 amountTrade, bytes memory order) internal {
        require(amountTarget != 0);
        // Get parameters
        address user = userID_Address[_getOrderUserID(order)];
        bytes32 hash = _getOrderHash(order);
        address tokenTrade = tokenID_Address[_getOrderTokenIDTrade(order)];
        address tokenTarget = tokenID_Address[_getOrderTokenIDTarget(order)];
        uint256 balanceTrade;
        uint256 balanceTarget;
        require(_isValidUser(user));
        // Trade
        if (_isOrderBuy(order)) {
            balanceTrade = balances[tokenTrade][user].sub(amountTrade);
            balanceTarget = balances[tokenTarget][user].add(amountTarget);
        } else {
            balanceTrade = balances[tokenTrade][user].add(amountTrade);
            balanceTarget = balances[tokenTarget][user].sub(amountTarget);
        }
        // Get fee
        address tokenFee = _isOrderFeeMain(order)? tokenTrade : tokenID_Address[1];
        uint256 amountFee = _getOrderTradeFee(order).mul(amountTarget).div(_getOrderAmountTarget(order));
        // Order fill
        if (orderFills[hash] == 0) {
            _verifySig(user, hash, _getOrderR(order), _getOrderS(order), _getOrderV(order));
            amountFee = amountFee.add(_getOrderGasFee(order));
        }
        orderFills[hash] = orderFills[hash].add(amountTarget);
        if (tokenFee == tokenTarget) {
            balanceTarget = balanceTarget.sub(amountFee);
        } else if (tokenFee == tokenTrade) {
            balanceTrade = balanceTrade.sub(amountFee);
        } else {
            balances[tokenFee][user] = balances[tokenFee][user].sub(amountFee);
        }
        balances[tokenFee][userID_Address[0]] = balances[tokenFee][userID_Address[0]].add(amountFee);
        balances[tokenTarget][user] = balanceTarget;
        balances[tokenTrade][user] = balanceTrade;
        emit Trade
        (
            user,
            _isOrderBuy(order),
            tokenTarget,
            amountTarget,
            tokenTrade,
            amountTrade
        );
    }

    /**
     * @dev Check if the user is valid
     * @param user The user address to be checked.
     */
    function _isValidUser(address user) internal view returns (bool) {
        return userRanks[user] != 0;
    }

    /**
     * @dev Check if the token is valid
     * @param token The token address to be checked.
     */

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

    /**
     * @notice Return if the give user has announced lock
     * @param user The user address to be queried
     * @return Query result
     */
    function _isLocking(address user) internal view returns (bool) {
        return lockTimes[user] > 0;
    }

    /**
     * @notice Return if the user is locked
     * @param user The user address to be queried
     */
    function _isLocked(address user) internal view returns (bool) {
        return _isLocking(user) && lockTimes[user] < now;
    }
}
