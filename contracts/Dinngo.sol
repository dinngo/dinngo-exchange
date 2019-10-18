pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "bytes/BytesLib.sol";

import "./SerializableOrder.sol";
import "./SerializableWithdrawal.sol";
import "./SerializableMigration.sol";
import "./SerializableTransferral.sol";
import "./migrate/Migratable.sol";
import "./sign/ISign.sol";

/**
 * @title Dinngo
 * @author Ben Huang
 * @notice Main exchange contract for Dinngo
 */
contract Dinngo is
    SerializableOrder,
    SerializableWithdrawal,
    SerializableMigration,
    SerializableTransferral
{
    // Storage alignment
    address private _owner;
    mapping (address => bool) private admins;
    uint256 private _nAdmin;
    uint256 private _nLimit;
    // end
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using BytesLib for bytes;

    uint256 public processTime;

    mapping (address => mapping (address => uint256)) public balances;
    mapping (bytes32 => uint256) public orderFills;
    mapping (uint256 => address payable) public userID_Address;
    mapping (uint256 => address) public tokenID_Address;
    mapping (address => uint256) public nonces;
    mapping (address => uint256) public ranks;
    mapping (address => uint256) public lockTimes;

    address public walletOwner;
    address public DGOToken;
    uint8 public eventConf;

    // On/Off by _isEventUserOn()
    event AddUser(uint256 userID, address indexed user);
    // On/Off by _isEventTokenOn()
    event AddToken(uint256 tokenID, address indexed token);
    // On/Off by _isEventFundsOn()
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
    // On/Off by _isEventUserOn()
    event Lock(address indexed user, uint256 lockTime);
    event Unlock(address indexed user);

    uint256 constant public version = 2;

    uint8 constant internal _MASK_EVENT_USER = 0x01;
    uint8 constant internal _MASK_EVENT_TOKEN = 0x02;
    uint8 constant internal _MASK_EVENT_FUNDS = 0x04;

    /**
     * @dev All ether directly sent to contract will be refunded
     */
    function() external payable {
        revert();
    }

    /**
     * @dev bit 0: user event
     *      bit 1: token event
     *      bit 2: funds event
     * @notice Set the event switch configuration.
     * @param conf Event configuration
     */
    function setEvent(uint8 conf) external {
        require(eventConf != conf);
        eventConf = conf;
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
        require(ranks[user] == 0);
        require(id < 2**32);
        if (userID_Address[id] == address(0))
            userID_Address[id] = user;
        else
            require(userID_Address[id] == user);
        ranks[user] = 1;
        if (_isEventUserOn())
            emit AddUser(id, user);
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
        require(ranks[token] == 0);
        require(id < 2**16);
        if (tokenID_Address[id] == address(0))
            tokenID_Address[id] = token;
        else
            require(tokenID_Address[id] == token);
        ranks[token] = 1;
        if (_isEventTokenOn())
            emit AddToken(id, token);
    }

    /**
     * @notice Update the rank of user or token.
     * @param addr The address to be updated.
     * @param rank The rank to be assigned.
     */
    function updateRank(address addr, uint256 rank) external {
        require(addr != address(0));
        require(rank != 0);
        require(ranks[addr] != 0);
        require(ranks[addr] != rank);
        ranks[addr] = rank;
    }

    /**
     * @notice Remove the user or token.
     * @dev The rank is set to 0 to remove.
     * @param addr The address to be removed.
     */
    function remove(address addr) external {
        require(addr != address(0));
        require(ranks[addr] != 0);
        ranks[addr] = 0;
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
        if (_isEventFundsOn())
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
        require(_isValid(token));
        require(amount > 0);
        balances[token][msg.sender] = balances[token][msg.sender].add(amount);
        if (_isEventFundsOn())
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
        require(_isValid(msg.sender));
        require(amount > 0);
        balances[address(0)][msg.sender] = balances[address(0)][msg.sender].sub(amount);
        if (_isEventFundsOn())
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
        require(_isValid(msg.sender));
        require(_isValid(token));
        require(amount > 0);
        balances[token][msg.sender] = balances[token][msg.sender].sub(amount);
        if (_isEventFundsOn())
            emit Withdraw(token, msg.sender, amount, balances[token][msg.sender], address(0), 0);
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /**
     * @notice The extract function for fee in ether. Can only be triggered by
     * the dinngo wallet owner.
     * @param amount The amount to be withdrawn
     */
    function extractFee(uint256 amount) external {
        require(amount > 0);
        require(msg.sender == walletOwner);
        balances[address(0)][address(0)] = balances[address(0)][address(0)].sub(amount);
        msg.sender.transfer(amount);
    }

    /**
     * @notice The extract function for fee in token. Can only be triggered by
     * the dinngo wallet owner.
     * @param token The token contract address to be withdrawn
     * @param amount The amount to be withdrawn
     */
    function extractTokenFee(address token, uint256 amount) external {
        require(amount > 0);
        require(msg.sender ==  walletOwner);
        require(token != address(0));
        balances[token][address(0)] = balances[token][address(0)].sub(amount);
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /**
     * @notice The function to get the balance from fee account.
     * @param token The token of the balance to be queried
     */
    function getWalletBalance(address token) external view returns (uint256) {
        return balances[token][address(0)];
    }

    /**
     * @notice The function to change the owner of fee wallet.
     * @param newOwner The new wallet owner to be assigned
     */
    function changeWalletOwner(address newOwner) external {
        require(newOwner != address(0));
        require(newOwner != walletOwner);
        walletOwner = newOwner;
    }

    /**
     * @notice The withdraw function that can only be triggered by owner.
     * Event Withdraw will be emitted after execution.
     * @param withdrawal The serialized withdrawal data
     */
    function withdrawByAdmin(bytes calldata withdrawal, bytes calldata signature) external {
        address payable user = userID_Address[_getWithdrawalUserID(withdrawal)];
        require(_isValid(user), "user invalid");
        uint256 nonce = _getWithdrawalNonce(withdrawal);
        require(nonce > nonces[user], "nonce invalid");
        nonces[user] = nonce;
        _verifySig(user, _getWithdrawalHash(withdrawal), signature);
        uint256 tokenID = _getWithdrawalTokenID(withdrawal);
        address token = tokenID == 0? address(0) : tokenID_Address[tokenID];
        uint256 amount = _getWithdrawalAmount(withdrawal);
        uint256 amountFee = _getWithdrawalFee(withdrawal);
        uint256 balance = balances[token][user];
        bool fFeeMain = _isWithdrawalFeeMain(withdrawal);

        if (fFeeMain) {
            balance = balance.sub(amount).sub(amountFee);
            balances[token][address(0)] = balances[token][address(0)].add(amountFee);
        } else {
            balance = balance.sub(amount);
            balances[DGOToken][user] = balances[DGOToken][user].sub(amountFee);
            balances[DGOToken][address(0)] = balances[DGOToken][address(0)].add(amountFee);
        }
        balances[token][user] = balance;

        if (_isEventFundsOn()) {
            if (fFeeMain)
                emit Withdraw(token, user, amount, balance, token, amountFee);
            else
                emit Withdraw(token, user, amount, balance, DGOToken, amountFee);
        }

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
    function migrateByAdmin(bytes calldata migration, bytes calldata signature) external {
        address target = _getMigrationTarget(migration);
        address user = userID_Address[_getMigrationUserID(migration)];
        uint256 nToken = _getMigrationCount(migration);
        require(_isValid(user), "user invalid");
        _verifySig(user, _getWithdrawalHash(migration), signature);
        for (uint i = 0; i < nToken; i++) {
            address token = tokenID_Address[_getMigrationTokenID(migration, i)];
            uint256 balance = balances[token][user];
            require(balance != 0, "0 amount");
            balances[token][user] = 0;
            if (token == address(0)) {
                Migratable(target).migrateTo.value(balance)(user, token, balance);
            } else {
                IERC20(token).safeApprove(target, balance);
                Migratable(target).migrateTo(user, token, balance);
            }
        }
    }

    /**
     * @notice The migration handler
     * @param user The user address to receive the migrated amount.
     * @param token The token address to be migrated.
     * @param amount The amount to be migrated.
     */
    function migrateTo(address user, address token, uint256 amount) payable external {
        balances[token][user] = balances[token][user].add(amount);
        if (token == address(0)) {
            require(msg.value == amount);
        } else {
            _isValid(token);
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }
    }

    /**
     * @notice The transfer function that can only be triggered by admin.
     * Event transfer will be emitted after execution.
     * @param transferral The serialized transferral data.
     */
    function transferByAdmin(bytes calldata transferral, bytes calldata signature) external {
        address from = _getTransferralFrom(transferral);
        bool fFeeMain = _isTransferralFeeMain(transferral);
        uint256 feeDGO = 0;
        uint256 nTransferral = _getTransferralCount(transferral);
        if (signature.length == 65) {
            _verifySig(from, _getTransferralHash(transferral), signature);
            require(_isValid(from), "user invalid");
        } else {
            require(ISign(from).signed(_getTransferralHash(transferral)), 'contract sign failed');
        }
        uint256 nonce = _getTransferralNonce(transferral);
        require(nonce > nonces[from], "nonce invalid");
        nonces[from] = nonce;
        for (uint256 i = 0; i < nTransferral; i++) {
            address to = _getTransferralTo(transferral, i);
            address token = tokenID_Address[_getTransferralTokenID(transferral, i)];
            uint256 amount = _getTransferralAmount(transferral, i);
            uint256 fee = _getTransferralFee(transferral, i);
            if (fFeeMain) {
                balances[token][from] = balances[token][from].sub(amount).sub(fee);
                balances[token][to] = balances[token][to].add(amount);
                balances[token][address(0)] = balances[token][address(0)].add(fee);
                if (_isEventFundsOn())
                    emit Transfer(from, to, token, amount, token, fee);
            } else {
                balances[token][from] = balances[token][from].sub(amount);
                balances[token][to] = balances[token][to].add(amount);
                feeDGO = feeDGO.add(fee);
                if (_isEventFundsOn())
                    emit Transfer(from, to, token, amount, DGOToken, fee);
            }
        }
        if (!fFeeMain) {
            balances[DGOToken][from] = balances[DGOToken][from].sub(feeDGO);
            balances[DGOToken][address(0)] = balances[DGOToken][address(0)].add(feeDGO);
        }
    }

    /**
     * @notice The settle function for orders. First order is taker order and the followings
     * are maker orders.
     * @param orders The serialized orders.
     */
    function settle(bytes calldata orders, bytes calldata signatures) external {
        // Deal with the order list
        uint256 nOrder = _getOrderCount(orders);
        // Get the first order as the taker order
        bytes memory takerOrder = _getOrder(orders, 0);
        uint256[4] memory takerAmounts; //[takerAmountBase, restAmountBase, fillAmountBase, fillAmountQuote]
        takerAmounts[0] = _getOrderAmountBase(takerOrder);
        takerAmounts[1] = takerAmounts[0].sub(orderFills[_getOrderHash(takerOrder)]);
        takerAmounts[2] = takerAmounts[1];
        takerAmounts[3] = 0;
        bool fBuy = _isOrderBuy(takerOrder);
        // Parse maker orders
        for (uint256 i = 1; i < nOrder; i++) {
            // Get ith order as the maker order
            bytes memory makerOrder = _getOrder(orders, i);
            require(fBuy != _isOrderBuy(makerOrder), "buy/buy or sell/sell");
            uint256 makerAmountBase = _getOrderAmountBase(makerOrder);
            uint256 makerAmountQuote = _getOrderAmountQuote(makerOrder);
            if (fBuy) {
                require(
                    makerAmountQuote <= _getOrderAmountQuote(takerOrder).mul(makerAmountBase).div(takerAmounts[0]),
                    "buy high"
                );
            } else {
                require(
                    makerAmountQuote >= _getOrderAmountQuote(takerOrder).mul(makerAmountBase).div(takerAmounts[0]),
                    "sell low"
                );
            }
            uint256 amountBase = makerAmountBase.sub(orderFills[_getOrderHash(makerOrder)]);
            amountBase = (amountBase <= takerAmounts[1])? amountBase : takerAmounts[1];
            uint256 amountQuote = makerAmountQuote.mul(amountBase).div(makerAmountBase);
            takerAmounts[1] = takerAmounts[1].sub(amountBase);
            takerAmounts[3] = takerAmounts[3].add(amountQuote);
            // Trade amountBase and amountQuote for maker order
            bytes memory sig = signatures.slice(i.mul(65), 65);
            _trade(amountBase, amountQuote, makerOrder, sig);
        }
        // Sum the trade amount
        takerAmounts[2] = takerAmounts[2].sub(takerAmounts[1]);
        // Trade amountBase and amountQuote for taker order
        bytes memory sig = signatures.slice(0, 65);
        _trade(takerAmounts[2], takerAmounts[3], takerOrder, sig);
    }

    /**
     * @notice Announce lock of the sender
     */
    function lock() external {
        require(!_isLocking(msg.sender));
        lockTimes[msg.sender] = now.add(processTime);
        if (_isEventUserOn())
            emit Lock(msg.sender, lockTimes[msg.sender]);
    }

    /**
     * @notice Unlock the sender
     */
    function unlock() external {
        require(_isLocking(msg.sender));
        lockTimes[msg.sender] = 0;
        if (_isEventUserOn())
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
    function _trade(uint256 amountBase, uint256 amountQuote, bytes memory order, bytes memory signature) internal {
        require(amountBase != 0, "0 amount base");
        // Get parameters
        address user = userID_Address[_getOrderUserID(order)];
        bytes32 hash = _getOrderHash(order);
        address tokenQuote = tokenID_Address[_getOrderTokenIDQuote(order)];
        address tokenBase = tokenID_Address[_getOrderTokenIDBase(order)];
        address tokenFee;
        uint256 amountFee =
            _getOrderHandleFee(order).mul(amountBase).div(_getOrderAmountBase(order));
        require(_isValid(user), "user invalid");
        // Trade and fee setting
        if (orderFills[hash] == 0) {
            _verifySig(user, hash, signature);
            amountFee = amountFee.add(_getOrderGasFee(order));
        }
        bool fBuy = _isOrderBuy(order);
        if (fBuy) {
            balances[tokenQuote][user] = balances[tokenQuote][user].sub(amountQuote);
            if (_isOrderFeeMain(order)) {
                tokenFee = tokenBase;
                balances[tokenBase][user] = balances[tokenBase][user].add(amountBase).sub(amountFee);
                balances[tokenBase][address(0)] = balances[tokenBase][address(0)].add(amountFee);
            } else {
                tokenFee = DGOToken;
                balances[tokenBase][user] = balances[tokenBase][user].add(amountBase);
                balances[tokenFee][user] = balances[tokenFee][user].sub(amountFee);
                balances[tokenFee][address(0)] = balances[tokenFee][address(0)].add(amountFee);
            }
        } else {
            balances[tokenBase][user] = balances[tokenBase][user].sub(amountBase);
            if (_isOrderFeeMain(order)) {
                tokenFee = tokenQuote;
                balances[tokenQuote][user] = balances[tokenQuote][user].add(amountQuote).sub(amountFee);
                balances[tokenQuote][address(0)] = balances[tokenQuote][address(0)].add(amountFee);
            } else {
                tokenFee = DGOToken;
                balances[tokenQuote][user] = balances[tokenQuote][user].add(amountQuote);
                balances[tokenFee][user] = balances[tokenFee][user].sub(amountFee);
                balances[tokenFee][address(0)] = balances[tokenFee][address(0)].add(amountFee);
            }
        }
        // Order fill
        orderFills[hash] = orderFills[hash].add(amountBase);
        if (_isEventFundsOn())
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
     * @dev Check if the user or token is valid
     * @param addr The address to be checked.
     */
    function _isValid(address addr) internal view returns (bool) {
        return ranks[addr] != 0;
    }

    function _verifySig(address user, bytes32 hash, bytes memory signature) internal pure {
        // Divide the signature in r, s and v variables
        bytes32 r;
        bytes32 s;
        uint8 v;

        // ecrecover takes the signature parameters, and the only way to get them
        // currently is to use assembly.
        // solhint-disable-next-line no-inline-assembly
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        require(uint256(s) <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0);

        // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
        if (v < 27) {
            v += 27;
        }
        require(v == 27 || v == 28);

        address sigAddr = ecrecover(hash.toEthSignedMessageHash(), v, r, s);
        require(user == sigAddr, "sig failed");
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

    function _isEventUserOn() internal view returns (bool) {
        return (eventConf & _MASK_EVENT_USER != 0);
    }

    function _isEventTokenOn() internal view returns (bool) {
        return (eventConf & _MASK_EVENT_TOKEN != 0);
    }

    function _isEventFundsOn() internal view returns (bool) {
        return (eventConf & _MASK_EVENT_FUNDS != 0);
    }
}
