pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ECRecovery.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";


/**
 * @title Dinngo
 * @author Ben Huang
 * @notice Main exchange contract for Dinngo
 */
contract Dinngo is Ownable {
    using SafeMath for uint256;
    using ECRecovery for bytes32;
    using SafeERC20 for ERC20;

    mapping (address => mapping (address => uint256)) private balance;
    mapping (uint256 => address) private userID_Address;
    mapping (address => uint8) private userRank;
    uint256 private userCount;
    mapping (uint256 => address) private tokenID_Address;
    mapping (address => uint8) private tokenRank;
    uint256 private tokenCount;

    event AddUser(uint256 userID, address user);
    event AddToken(uint256 tokenID, address token);
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    /**
     * @param dinngoWallet The main address of dinngo
     * @param dinngoToken The contract address of DGO
     */
    constructor (address dinngoWallet, address dinngoToken) public {
        userCount = 0;
        tokenCount = 1;
        userID_Address[0] = dinngoWallet;
        userRank[dinngoWallet] = 255;
        tokenID_Address[1] = dinngoToken;
    }

    /**
     * @notice The deposit function for ether. The ether that is sent with the function
     * call will be deposited. The first time user will be added to the user list.
     * Event Deposit will be emitted after execution.
     */
    function deposit() external payable {
        require(msg.value > 0);
        balance[0][msg.sender] = balance[0][msg.sender].add(msg.value);
        addUser(msg.sender);
        emit Deposit(0, msg.sender, msg.value, balance[0][msg.sender]);
    }

    /**
     * @notice The deposit function for tokens. The first time user will be added to
     * the user list. Event Deposit will be emitted after execution.
     * @param token Address of the token contract to be deposited
     * @param amount Amount of the token to be depositied
     */
    function depositToken(address token, uint256 amount) external {
        require(token != address(0));
        require(amount > 0);
        ERC20(token).safeTransferFrom(msg.sender, this, amount);
        balance[token][msg.sender] = balance[token][msg.sender].add(amount);
        addUser(msg.sender);
        emit Deposit(token, msg.sender, amount, balance[token][msg.sender]);
    }

    /**
     * @notice Add the address to the user list. Event AddUser will be emitted
     * after execution.
     * @dev Record the user list to map the user address to a specific user ID, in
     * order to compact the data size when transferring user address information
     * @param user The user address to be added
     */
    function addUser(address user) internal {
        if (userRank[user] != 0)
            return;
        userCount++;
        userID_Address[userCount] = user;
        userRank[user] = 1;
        emit AddUser(userCount, user);
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
        tokenCount++;
        tokenID_Address[tokenCount] = token;
        tokenRank[token] = 1;
        emit AddToken(tokenCount, token);
    }

    /**
     * @notice Update the rank of user. Can only be called by owner.
     * @param user The user address
     * @param rank The rank to be assigned
     */
    function updateUserRank(address user, uint8 rank) external onlyOwner {
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
        require(tokenRank[token] != 0);
        require(tokenRank[token] != rank);
        tokenRank[token] = rank;
    }

    /**
     * @notice The withdraw function for ether. Event Withdraw will be emitted
     * after execution.
     * @param amount The amount to be withdrawn.
     */
    function withdraw(uint256 amount) external {
        require(amount > 0);
        require(amount <= balance[0][msg.sender]);
        msg.sender.transfer(amount);
        balance[0][msg.sender] = balance[0][msg.sender].sub(amount);
        emit Withdraw(0, msg.sender, amount, balance[0][msg.sender]);
    }

    /**
     * @notice The withdraw function for tokens. Event Withdraw will be emitted
     * after execution.
     * @param token The token contract address to be withdrawn.
     * @param amount The token amount to be withdrawn.
     */
    function withdrawToken(address token, uint256 amount) external {
        require(token != address(0));
        require(amount > 0);
        require(amount <= balance[token][msg.sender]);
        ERC20(token).safeTransfer(msg.sender, amount);
        balance[token][msg.sender] = balance[token][msg.sender].sub(amount);
        emit Withdraw(token, msg.sender, amount, balance[token][msg.sender]);
    }

    /**
     * @notice Get the user balance of given token
     * @param token The token contract address
     * @param user The user address
     */
    function getBalance(address token, address user) external view returns (uint256) {
        return balance[token][user];
    }

    /**
     * @notice Get the user address of given address
     * @param userID The user ID
     */
    function getUserAddress(uint256 userID) external view returns (address) {
        return userID_Address[userID];
    }

    /**
     * @notice Get the token address of given address
     * @param tokenID The token ID
     */
    function getTokenAddress(uint256 tokenID) external view returns (address) {
        return tokenID_Address[tokenID];
    }

    /**
     * @notice Get the rank of given address
     * @param user The user address
     */
    function getUserRank(address user) external view returns (uint8 retr) {
       retr = userRank[user];
    }

    /**
     * @notice Get the rank of given token
     * @param token The token address
     */
    function getTokenRank(address token) external view returns (uint8 retr) {
       retr = tokenRank[token];
    }

    function settle() public returns (bool) {
        return true;
    }

}
