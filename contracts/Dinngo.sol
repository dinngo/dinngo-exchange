pragma solidity 0.5.6;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

import "./SerializableOrder.sol";
import "./SerializableWithdrawal.sol";
import "./SerializableMigration.sol";
import "./migrate/Migratable.sol";

/**
 * @title Dinngo
 * @author Ben Huang
 * @notice Main exchange contract for Dinngo
 */
contract Dinngo is SerializableOrder, SerializableWithdrawal, SerializableMigration {
    // Storage alignment
    address private _owner;
    mapping (address => bool) private admins;
    uint256 private _nAdmin;
    uint256 private _nLimit;
    // end
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

    address public dinngoWallet;
    address public DGOToken;

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
        require(token != address(0));
        require(!_isLocking(msg.sender));
        require(_isValidToken(token));
        require(amount > 0);
        balances[token][msg.sender] = balances[token][msg.sender].add(amount);
        emit Deposit(token, msg.sender, amount, balances[token][msg.sender]);
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
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
        emit Withdraw(address(0), msg.sender, amount, balances[address(0)][msg.sender], address(0), 0);
        msg.sender.transfer(amount);
    }

    /**
     * @notice The withdraw function for tokens. Event Withdraw will be emitted
     * after execution. User needs to be locked before calling withdraw.
     * @param token The token contract address to be withdrawn.
     * @param amount The token amount to be withdrawn.
     */
    function withdrawToken(address token, uint256 amount) external {
        require(token != address(0));
        require(_isLocked(msg.sender));
        require(_isValidUser(msg.sender));
        require(_isValidToken(token));
        require(amount > 0);
        balances[token][msg.sender] = balances[token][msg.sender].sub(amount);
        emit Withdraw(token, msg.sender, amount, balances[token][msg.sender], address(0), 0);
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
        address tokenFee = _isWithdrawalFeeETH(withdrawal)? address(0) : DGOToken;
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
        balances[tokenFee][dinngoWallet] =
            balances[tokenFee][dinngoWallet].add(amountFee);
        balances[token][user] = balance;
        emit Withdraw(token, user, amount, balance, tokenFee, amountFee);
        if (token == address(0)) {
            user.transfer(amount);
        } else {
            IERC20(token).safeTransfer(user, amount);
        }
    }

    /**
     * @notice The migrate function the can only triggered by admin.
     * Event Migrate will be emitted after execution.
     * @param migration The serialized migration data
     */
    function migrateByAdmin(bytes calldata migration) external {
        address target = _getMigrationTarget(migration);
        address user = userID_Address[_getMigrationUserID(migration)];
        uint256 nToken = _getMigrationCount(migration);
        require(_isValidUser(user));
        _verifySig(
            user,
            _getMigrationHash(migration),
            _getMigrationR(migration),
            _getMigrationS(migration),
            _getMigrationV(migration)
        );
        for (uint i = 0; i < nToken; i++) {
            address token = tokenID_Address[_getMigrationTokenID(migration, i)];
            uint256 balance = balances[token][user];
            require(balance != 0);
            balances[token][user] = 0;
            if (token == address(0)) {
                Migratable(target).migrateTo.value(balance)(user, token, balance);
            } else {
                IERC20(token).approve(target, balance);
                Migratable(target).migrateTo(user, token, balance);
            }
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
        uint256 totalAmountBase = _getOrderAmountBase(takerOrder);
        uint256 takerAmountBase = totalAmountBase.sub(orderFills[_getOrderHash(takerOrder)]);
        uint256 fillAmountQuote = 0;
        uint256 restAmountBase = takerAmountBase;
        bool fBuy = _isOrderBuy(takerOrder);
        // Parse maker orders
        for (uint i = 1; i < nOrder; i++) {
            // Get ith order as the maker order
            bytes memory makerOrder = _getOrder(orders, i);
            require(fBuy != _isOrderBuy(makerOrder));
            uint256 makerAmountBase = _getOrderAmountBase(makerOrder);
            // Calculate the amount to be executed
            uint256 amountBase = makerAmountBase.sub(orderFills[_getOrderHash(makerOrder)]);
            amountBase = amountBase <= restAmountBase? amountBase : restAmountBase;
            uint256 amountQuote = _getOrderAmountQuote(makerOrder).mul(amountBase).div(makerAmountBase);
            restAmountBase = restAmountBase.sub(amountBase);
            fillAmountQuote = fillAmountQuote.add(amountQuote);
            // Trade amountBase and amountQuote for maker order
            _trade(amountBase, amountQuote, makerOrder);
        }
        // Sum the trade amount and check
        takerAmountBase = takerAmountBase.sub(restAmountBase);
        if (fBuy) {
            require(fillAmountQuote.mul(totalAmountBase)
                <= _getOrderAmountQuote(takerOrder).mul(takerAmountBase));
        } else {
            require(fillAmountQuote.mul(totalAmountBase)
                >= _getOrderAmountQuote(takerOrder).mul(takerAmountBase));
        }
        // Trade amountBase and amountQuote for taker order
        _trade(takerAmountBase, fillAmountQuote, takerOrder);
    }

    /**
     * @notice Announce lock of the sender
     */
    function lock() external {
        require(!_isLocking(msg.sender));
        lockTimes[msg.sender] = now.add(processTime);
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
     * @param amountBase The provided amount to be traded
     * @param amountQuote The amount to be requested
     * @param order The order that triggered the trading
     */
    function _trade(uint256 amountBase, uint256 amountQuote, bytes memory order) internal {
        require(amountBase != 0);
        // Get parameters
        address user = userID_Address[_getOrderUserID(order)];
        bytes32 hash = _getOrderHash(order);
        address tokenQuote = tokenID_Address[_getOrderTokenIDQuote(order)];
        address tokenBase = tokenID_Address[_getOrderTokenIDBase(order)];
        address tokenFee;
        uint256 amountFee =
            _getOrderTradeFee(order).mul(amountBase).div(_getOrderAmountBase(order));
        require(_isValidUser(user));
        // Trade and fee setting
        if (orderFills[hash] == 0) {
            _verifySig(user, hash, _getOrderR(order), _getOrderS(order), _getOrderV(order));
            amountFee = amountFee.add(_getOrderGasFee(order));
        }
        bool fBuy = _isOrderBuy(order);
        if (fBuy) {
            balances[tokenQuote][user] = balances[tokenQuote][user].sub(amountQuote);
            if (_isOrderFeeMain(order)) {
                tokenFee = tokenBase;
                balances[tokenBase][user] = balances[tokenBase][user].add(amountBase).sub(amountFee);
                balances[tokenBase][dinngoWallet] = balances[tokenBase][dinngoWallet].add(amountFee);
            } else {
                tokenFee = DGOToken;
                balances[tokenBase][user] = balances[tokenBase][user].add(amountBase);
                balances[tokenFee][user] = balances[tokenFee][user].sub(amountFee);
                balances[tokenFee][dinngoWallet] = balances[tokenFee][dinngoWallet].add(amountFee);
            }
        } else {
            balances[tokenBase][user] = balances[tokenBase][user].sub(amountBase);
            if (_isOrderFeeMain(order)) {
                tokenFee = tokenQuote;
                balances[tokenQuote][user] = balances[tokenQuote][user].add(amountQuote).sub(amountFee);
                balances[tokenQuote][dinngoWallet] = balances[tokenQuote][dinngoWallet].add(amountFee);
            } else {
                tokenFee = DGOToken;
                balances[tokenQuote][user] = balances[tokenQuote][user].add(amountQuote);
                balances[tokenFee][user] = balances[tokenFee][user].sub(amountFee);
                balances[tokenFee][dinngoWallet] = balances[tokenFee][dinngoWallet].add(amountFee);
            }
        }
        // Order fill
        orderFills[hash] = orderFills[hash].add(amountBase);
        emit Trade
        (
            user,
            fBuy,
            tokenBase,
            amountBase,
            tokenQuote,
            amountQuote,
            tokenFee,
            amountFee
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
