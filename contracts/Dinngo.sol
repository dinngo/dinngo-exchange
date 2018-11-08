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
    mapping (uint8 => uint256) public takerFees;
    mapping (uint8 => uint256) public makerFees;
    mapping (address => uint8) public userRanks;
    mapping (address => uint8) public tokenRanks;
    uint256 constant BASE = 10000;

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
        userID_Address[0] = dinngoWallet;
        userRanks[dinngoWallet] = 255;
        tokenID_Address[0] = address(0);
        tokenID_Address[1] = dinngoToken;
        takerFees[1] = 20;
        takerFees[2] = 19;
        takerFees[3] = 17;
        takerFees[4] = 15;
        takerFees[5] = 12;
        takerFees[6] = 9;
        takerFees[7] = 6;
        takerFees[8] = 2;
        makerFees[1] = 10;
        makerFees[2] = 9;
        makerFees[3] = 7;
        makerFees[4] = 5;
        makerFees[5] = 2;
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
        require(_getWithdrawalAmount(withdrawal) > 0);
        address user = userID_Address[_getWithdrawalUserID(withdrawal)];
        require(_isValidUser(user));
        address token = tokenID_Address[_getWithdrawalTokenID(withdrawal)];
        _verifySig(
            user,
            _getWithdrawalHash(withdrawal),
            _getWithdrawalR(withdrawal),
            _getWithdrawalS(withdrawal),
            _getWithdrawalV(withdrawal)
        );
        require(_getWithdrawalAmount(withdrawal) <= balances[token][user]);
        if (token == address(0)) {
            user.transfer(_getWithdrawalAmount(withdrawal));
        } else {
            ERC20(token).safeTransfer(user, _getWithdrawalAmount(withdrawal));
        }
        balances[token][user] = balances[token][user].sub(_getWithdrawalAmount(withdrawal));
        if (_isWithdrawalETH(withdrawal)) {
            _payFee(tokenID_Address[0], user, _getWithdrawalFee(withdrawal));
        } else {
            _payFee(tokenID_Address[1], user, _getWithdrawalFee(withdrawal));
        }
        emit Withdraw(token, user, _getWithdrawalAmount(withdrawal), balances[token][user]);
    }

    struct SettleAmount {
        uint256 fillAmountTrade;
        uint256 restAmountTarget;
    }

    /**
     * @notice The settle function for orders. First order is taker order and the followings
     * are maker orders.
     * @param orders The serialized orders.
     */
    function settle(bytes orders) external onlyOwner {
        require(_getOrderCount(orders) >= 2);
        bytes memory order = _getOrder(orders, 0);
        address user = userID_Address[_getOrderUserID(order)];
        _verifySig(user, _getOrderHash(order), _getOrderR(order), _getOrderS(order), _getOrderV(order));
        SettleAmount memory s = SettleAmount(0, _getOrderAmountTarget(order));
        for (uint i = 1; i < _getOrderCount(orders); i++) {
            _processMaker(s, _getOrder(orders, i));
        }
        uint256 fillAmountTarget = _getOrderAmountTarget(order).sub(s.restAmountTarget);
        // calculate trade
        balances[tokenID_Address[_getOrderTokenIDTarget(order)]][user] =
            balances[tokenID_Address[_getOrderTokenIDTarget(order)]][user].sub(fillAmountTarget);
        balances[tokenID_Address[_getOrderTokenIDTrade(order)]][user] =
            balances[tokenID_Address[_getOrderTokenIDTrade(order)]][user].add(s.fillAmountTrade);
        emit Trade
        (
            user,
            _isOrderBuy(order),
            tokenID_Address[_getOrderTokenIDTarget(order)],
            fillAmountTarget,
            tokenID_Address[_getOrderTokenIDTrade(order)],
            s.fillAmountTrade
        );
        bytes32 hash = _getOrderHash(order);
        orderFills[hash] = orderFills[hash].add(fillAmountTarget);
        // calculate fee
        uint256 amountFee = _getOrderFee(order).mul(fillAmountTarget).div(_getOrderAmountTarget(order));
        if (_isOrderFeeMain(order)) {
            if (_isOrderBuy(order)) {
                balances[tokenID_Address[_getOrderTokenIDTarget(order)]][user] =
                    balances[tokenID_Address[_getOrderTokenIDTarget(order)]][user].sub(amountFee);
                balances[tokenID_Address[_getOrderTokenIDTarget(order)]][userID_Address[0]] =
                    balances[tokenID_Address[_getOrderTokenIDTarget(order)]][userID_Address[0]].add(amountFee);
            } else {
                balances[tokenID_Address[_getOrderTokenIDTrade(order)]][user] =
                    balances[tokenID_Address[_getOrderTokenIDTrade(order)]][user].sub(amountFee);
                balances[tokenID_Address[_getOrderTokenIDTrade(order)]][userID_Address[0]] =
                    balances[tokenID_Address[_getOrderTokenIDTrade(order)]][userID_Address[0]].add(amountFee);
            }
        } else {
            balances[tokenID_Address[1]][user] =
                balances[tokenID_Address[1]][user].sub(amountFee);
            balances[tokenID_Address[1]][userID_Address[0]] =
                balances[tokenID_Address[1]][userID_Address[0]].add(amountFee);
        }
    }

    function _isValidUser(address user) internal view returns (bool) {
        return userRanks[user] != 0;
    }

    function _isValidToken(address token) internal view returns (bool) {
        return tokenRanks[token] != 0;
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
        balances[token][user] = balances[token][user].sub(amount);
        balances[token][userID_Address[0]] = balances[token][userID_Address[0]].add(amount);
    }

    function _processMaker(SettleAmount s, bytes order) internal {
        address user = userID_Address[_getOrderUserID(order)];
        _verifySig(user, _getOrderHash(order), _getOrderR(order), _getOrderS(order), _getOrderV(order));
        // fetch current status of taker order
        SettleAmount memory tmp = s;
        // try to meet
        uint256 amountTrade = _getOrderAmountTrade(order).mul(
            _getOrderAmountTarget(order).sub(orderFills[_getOrderHash(order)])
        ).div(_getOrderAmountTarget(order));
        amountTrade = amountTrade < tmp.restAmountTarget? amountTrade: tmp.restAmountTarget;
        uint256 amountTarget = _getOrderAmountTarget(order).mul(amountTrade).div(_getOrderAmountTrade(order));
        // calculate trade
        balances[tokenID_Address[_getOrderTokenIDTarget(order)]][user] =
            balances[tokenID_Address[_getOrderTokenIDTarget(order)]][user].sub(amountTarget);
        balances[tokenID_Address[_getOrderTokenIDTrade(order)]][user] =
            balances[tokenID_Address[_getOrderTokenIDTrade(order)]][user].add(amountTrade);
        // calculate fee
        uint256 amountFee = _getOrderFee(order).mul(amountTarget).div(_getOrderAmountTarget(order));
        if (_isOrderFeeMain(order)) {
            if (_isOrderBuy(order)) {
                balances[tokenID_Address[_getOrderTokenIDTarget(order)]][user] =
                    balances[tokenID_Address[_getOrderTokenIDTarget(order)]][user].sub(amountFee);
                balances[tokenID_Address[_getOrderTokenIDTarget(order)]][userID_Address[0]] =
                    balances[tokenID_Address[_getOrderTokenIDTarget(order)]][userID_Address[0]].add(amountFee);
            } else {
                balances[tokenID_Address[_getOrderTokenIDTrade(order)]][user] =
                    balances[tokenID_Address[_getOrderTokenIDTrade(order)]][user].sub(amountFee);
                balances[tokenID_Address[_getOrderTokenIDTrade(order)]][userID_Address[0]] =
                    balances[tokenID_Address[_getOrderTokenIDTrade(order)]][userID_Address[0]].add(amountFee);
            }
        } else {
            balances[tokenID_Address[1]][user] =
                balances[tokenID_Address[1]][user].sub(amountFee);
            balances[tokenID_Address[1]][userID_Address[0]] =
                balances[tokenID_Address[1]][userID_Address[0]].add(amountFee);
        }
        bytes32 hash = _getOrderHash(order);
        orderFills[hash] = orderFills[hash].add(amountTarget);
        emit Trade
        (
            user,
            _isOrderBuy(order),
            tokenID_Address[_getOrderTokenIDTarget(order)],
            amountTarget,
            tokenID_Address[_getOrderTokenIDTrade(order)],
            amountTrade
        );

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
