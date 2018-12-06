pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

import "./SerializableOrder.sol";
import "./SerializableWithdrawal.sol";
import "./proxy/Proxy.sol";


/**
 * @title Dinngo
 * @author Ben Huang
 * @notice Main exchange contract for Dinngo
 */
contract DinngoProxy is Ownable, Proxy {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    uint256 public processTime;

    mapping (address => mapping (address => uint256)) public balances;
    mapping (bytes32 => uint256) public orderFills;
    mapping (uint256 => address) public userID_Address;
    mapping (uint256 => address) public tokenID_Address;
    mapping (address => uint8) public userRanks;
    mapping (address => uint8) public tokenRanks;
    mapping (address => uint256) public lockTimes;

    /**
     * @dev User ID 0 is the management wallet.
     * Token ID 0 is ETH (address 0). Token ID 1 is DGO.
     * @param dinngoWallet The main address of dinngo
     * @param dinngoToken The contract address of DGO
     */
    constructor(address dinngoWallet, address dinngoToken, address impl) Proxy(impl) public {
        processTime = 90 days;
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
        require(_implementation().delegatecall(bytes4(keccak256("addUser(uint32,address)")), id, user));
    }

    /**
     * @notice Remove the address from the user list.
     * @dev The user rank is set to 0 to remove the user.
     * @param user The user address to be added
     */
    function removeUser(address user) external onlyOwner {
        require(_implementation().delegatecall(bytes4(keccak256("removeUser(address)")), user));
    }

    /**
     * @notice Update the rank of user. Can only be called by owner.
     * @param user The user address
     * @param rank The rank to be assigned
     */
    function updateUserRank(address user, uint8 rank) external onlyOwner {
        require(_implementation().delegatecall(bytes4(keccak256("updateUserRank(address,uint8)")), user, rank));
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
        require(_implementation().delegatecall(bytes4(keccak256("addToken(uint16,address)")), id, token));
    }

    /**
     * @notice Remove the token to the token list.
     * @dev The token rank is set to 0 to remove the token.
     * @param token The token contract address to be removed.
     */
    function removeToken(address token) external onlyOwner {
        require(_implementation().delegatecall(bytes4(keccak256("removeToken(address)")), token));
    }

    /**
     * @notice Update the rank of token. Can only be called by owner.
     * @param token The token contract address.
     * @param rank The rank to be assigned.
     */
    function updateTokenRank(address token, uint8 rank) external onlyOwner {
        require(_implementation().delegatecall(bytes4(keccak256("updateTokenRank(address,uint8)")), token, rank));
    }

    /**
     * @notice The deposit function for ether. The ether that is sent with the function
     * call will be deposited. The first time user will be added to the user list.
     * Event Deposit will be emitted after execution.
     */
    function deposit() external payable {
        require(_implementation().delegatecall(bytes4(keccak256("deposit()"))));
    }

    /**
     * @notice The deposit function for tokens. The first time user will be added to
     * the user list. Event Deposit will be emitted after execution.
     * @param token Address of the token contract to be deposited
     * @param amount Amount of the token to be depositied
     */
    function depositToken(address token, uint256 amount) external {
        require(_implementation().delegatecall(bytes4(keccak256("depositToken(address,uint256)")), token, amount));
    }

    /**
     * @notice The withdraw function for ether. Event Withdraw will be emitted
     * after execution. User needs to be locked before calling withdraw.
     * @param amount The amount to be withdrawn.
     */
    function withdraw(uint256 amount) external {
        require(_implementation().delegatecall(bytes4(keccak256("withdraw(uint256)")), amount));
    }

    /**
     * @notice The withdraw function for tokens. Event Withdraw will be emitted
     * after execution. User needs to be locked before calling withdraw.
     * @param token The token contract address to be withdrawn.
     * @param amount The token amount to be withdrawn.
     */
    function withdrawToken(address token, uint256 amount) external {
        require(_implementation().delegatecall(bytes4(keccak256("withdrawToken(address,uint256)")), token, amount));
    }

    /**
     * @notice The withdraw function that can only be triggered by owner.
     * Event Withdraw will be emitted after execution.
     * @param withdrawal The serialized withdrawal data
     */
    function withdrawByAdmin(bytes withdrawal) external onlyOwner {
        require(_implementation().delegatecall(bytes4(keccak256("withdrawByAdmin(bytes)")), 0x20, withdrawal.length, withdrawal));
    }

    /**
     * @notice The settle function for orders. First order is taker order and the followings
     * are maker orders.
     * @param orders The serialized orders.
     */
    function settle(bytes orders) external onlyOwner {
        require(_implementation().delegatecall(bytes4(keccak256("settle(bytes)")), 0x20, orders.length, orders));
    }

    /**
     * @notice Announce lock of the sender
     */
    function lock() external {
        require(_implementation().delegatecall(bytes4(keccak256("lock()"))));
    }

    /**
     * @notice Unlock the sender
     */
    function unlock() external {
        require(_implementation().delegatecall(bytes4(keccak256("unlock()"))));
    }

    /**
     * @notice Change the processing time of locking the user address
     */
    function changeProcessTime(uint256 time) external onlyOwner {
        require(_implementation().delegatecall(bytes4(keccak256("changeProcessTime(uint256)")), time));
    }
}
