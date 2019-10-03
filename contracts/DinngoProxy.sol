pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./Administrable.sol";
import "./proxy/Proxy.sol";


/**
 * @title Dinngo
 * @author Ben Huang
 * @notice Main exchange contract for Dinngo
 */
contract DinngoProxy is Ownable, Administrable, Proxy {
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

    uint256 constant public version = 2;

    /**
     * @dev User ID 0 is the management wallet.
     * Token ID 0 is ETH (address 0). Token ID 1 is DGO.
     * @param _walletOwner The fee wallet owner
     * @param _dinngoToken The contract address of DGO
     * @param _impl The implementation contract address
     */
    constructor(
        address payable _walletOwner,
        address _dinngoToken,
        address _impl
    ) Proxy(_impl) public {
        processTime = 90 days;
        walletOwner = _walletOwner;
        tokenID_Address[0] = address(0);
        ranks[address(0)] = 1;
        tokenID_Address[1] = _dinngoToken;
        ranks[_dinngoToken] = 1;
        DGOToken = _dinngoToken;
        eventConf = 0xff;
    }

    /**
     * @dev All ether directly sent to contract will be refunded
     */
    function() external payable {
        revert();
    }

    function setEvent(uint8 conf) external onlyAdmin {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("setEvent(uint8)", conf)
        );
        require(ok);
    }

    /**
     * @notice Add the address to the user list. Event AddUser will be emitted
     * after execution.
     * @dev Record the user list to map the user address to a specific user ID, in
     * order to compact the data size when transferring user address information
     * @param id The user id to be assigned
     * @param user The user address to be added
     */
    function addUser(uint256 id, address user) external onlyAdmin {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("addUser(uint256,address)", id, user)
        );
        require(ok);
    }

    /**
     * @notice Remove the address from the user list.
     * @dev The user rank is set to 0 to remove the user.
     * @param user The user address to be removed
     */
    function removeUser(address user) external onlyAdmin {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("remove(address)", user)
        );
        require(ok);
    }

    /**
     * @notice Update the rank of user. Can only be called by admin.
     * @param user The user address
     * @param rank The rank to be assigned
     */
    function updateUserRank(address user, uint256 rank) external onlyAdmin {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("updateRank(address,uint256)", user, rank)
        );
        require(ok);
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
    function addToken(uint256 id, address token) external onlyOwner {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("addToken(uint256,address)", id, token)
        );
        require(ok);
    }

    /**
     * @notice Remove the token from the token list.
     * @dev The token rank is set to 0 to remove the token.
     * @param token The token contract address to be removed.
     */
    function removeToken(address token) external onlyOwner {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("remove(address)", token)
        );
        require(ok);
    }

    /**
     * @notice Update the rank of token. Can only be called by owner.
     * @param token The token contract address.
     * @param rank The rank to be assigned.
     */
    function updateTokenRank(address token, uint256 rank) external onlyOwner {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("updateRank(address,uint256)", token, rank)
        );
        require(ok);
    }

    function activateAdmin(address admin) external onlyOwner {
        _activateAdmin(admin);
    }

    function deactivateAdmin(address admin) external onlyOwner {
        _safeDeactivateAdmin(admin);
    }

    /**
     * @notice Force-deactivate allows owner to deactivate admin even there will be
     * no admin left. Should only be executed under emergency situation.
     */
    function forceDeactivateAdmin(address admin) external onlyOwner {
        _deactivateAdmin(admin);
    }

    function setAdminLimit(uint256 n) external onlyOwner {
        _setAdminLimit(n);
    }

    /**
     * @notice The deposit function for ether. The ether that is sent with the function
     * call will be deposited. The first time user will be added to the user list.
     * Event Deposit will be emitted after execution.
     */
    function deposit() external payable {
        (bool ok,) = _implementation().delegatecall(abi.encodeWithSignature("deposit()"));
        require(ok);
    }

    /**
     * @notice The deposit function for tokens. The first time user will be added to
     * the user list. Event Deposit will be emitted after execution.
     * @param token Address of the token contract to be deposited
     * @param amount Amount of the token to be depositied
     */
    function depositToken(address token, uint256 amount) external {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("depositToken(address,uint256)", token, amount)
        );
        require(ok);
    }

    /**
     * @notice The withdraw function for ether. Event Withdraw will be emitted
     * after execution. User needs to be locked before calling withdraw.
     * @param amount The amount to be withdrawn.
     */
    function withdraw(uint256 amount) external {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("withdraw(uint256)", amount)
        );
        require(ok);
    }

    /**
     * @notice The withdraw function for tokens. Event Withdraw will be emitted
     * after execution. User needs to be locked before calling withdraw.
     * @param token The token contract address to be withdrawn.
     * @param amount The token amount to be withdrawn.
     */
    function withdrawToken(address token, uint256 amount) external {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("withdrawToken(address,uint256)", token, amount)
        );
        require(ok);
    }

    /**
     * @notice The function to extract the fee from the fee account. This function can
     * only be triggered by the income wallet owner.
     * @param amount The amount to be extracted
     */
    function extractFee(uint256 amount) external {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("extractFee(uint256)", amount)
        );
        require(ok);
    }

    /**
     * @notice The function to extract the fee from the fee account. This function can
     * only be triggered by the income wallet owner.
     * @param token The token to be extracted
     * @param amount The amount to be extracted
     */
    function extractTokenFee(address token, uint256 amount) external {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("extractTokenFee(address,uint256)", token, amount)
        );
        require(ok);
    }

    /**
     * @notice The function to get the balance from fee account.
     * @param token The token of the balance to be queried
     */
    function getWalletBalance(address token) external returns (uint256 balance) {
        (bool ok, bytes memory ret) = _implementation().delegatecall(
            abi.encodeWithSignature("getWalletBalance(address)", token)
        );
        require(ok);
        balance = abi.decode(ret, (uint256));
    }

    /**
     * @notice The function to change the owner of fee wallet.
     * @param newOwner The new wallet owner to be assigned
     */
    function changeWalletOwner(address newOwner) external onlyOwner {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("changeWalletOwner(address)", newOwner)
        );
        require(ok);
    }

    /**
     * @notice The withdraw function that can only be triggered by owner.
     * Event Withdraw will be emitted after execution.
     * @param withdrawal The serialized withdrawal data
     */
    function withdrawByAdmin(bytes calldata withdrawal, bytes calldata signature) external onlyAdmin {
        (bool ok, bytes memory ret) = _implementation().delegatecall(
            abi.encodeWithSignature("withdrawByAdmin(bytes,bytes)", withdrawal, signature)
        );
        require(ok, string(ret));
    }

    /**
     * @notice The transfer function that can only be triggered by owner.
     * Event Transfer will be emitted afer execution.
     * @param transferral The serialized transferral data.
     */
    function transferByAdmin(bytes calldata transferral, bytes calldata signature) external onlyAdmin {
        (bool ok, bytes memory ret) = _implementation().delegatecall(
            abi.encodeWithSignature("transferByAdmin(bytes,bytes)", transferral, signature)
        );
        require(ok, string(ret));
    }

    /**
     * @notice The settle function for orders. First order is taker order and the followings
     * are maker orders.
     * @param orders The serialized orders.
     */
    function settle(bytes calldata orders, bytes calldata signature) external onlyAdmin {
        (bool ok, bytes memory ret) = _implementation().delegatecall(
            abi.encodeWithSignature("settle(bytes,bytes)", orders, signature)
        );
        require(ok, string(ret));
    }

    /**
     * @notice The migrate function that can only be triggered by admin.
     * @param migration The serialized migration data
     */
    function migrateByAdmin(bytes calldata migration, bytes calldata signature) external onlyAdmin {
        (bool ok, bytes memory ret) = _implementation().delegatecall(
            abi.encodeWithSignature("migrateByAdmin(bytes,bytes)", migration, signature)
        );
        require(ok, string(ret));
    }

    /**
     * @notice Announce lock of the sender
     */
    function lock() external {
        (bool ok,) = _implementation().delegatecall(abi.encodeWithSignature("lock()"));
        require(ok);
    }

    /**
     * @notice Unlock the sender
     */
    function unlock() external {
        (bool ok,) = _implementation().delegatecall(abi.encodeWithSignature("unlock()"));
        require(ok);
    }

    /**
     * @notice Change the processing time of locking the user address
     */
    function changeProcessTime(uint256 time) external onlyOwner {
        (bool ok,) = _implementation().delegatecall(
            abi.encodeWithSignature("changeProcessTime(uint256)", time)
        );
        require(ok);
    }

    /**
     * @notice Get hash from the transferral parameters.
     */
    function getTransferralHash(
        address from,
        uint8 config,
        uint32 nonce,
        address[] calldata tos,
        uint16[] calldata tokenIDs,
        uint256[] calldata amounts,
        uint256[] calldata fees
    ) external view returns (bytes32 hash) {
        (bool ok, bytes memory ret) = _implementation().staticcall(
            abi.encodeWithSignature(
                "getTransferralHash(address,uint8,uint32,address[],uint16[],uint256[],uint256[])",
                from, config, nonce, tos, tokenIDs, amounts, fees
            )
        );
        require(ok);
        hash = abi.decode(ret, (bytes32));
    }
}
