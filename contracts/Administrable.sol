pragma solidity ^0.5.0;

/**
 * @title Administrable
 * @dev The administrator structure
 */
/**
 * @title Administrable
 * @dev A Ownable-base contract without the renounce function.
 */
contract Administrable {
    address private _admin;

    event AdminTransferred(
        address indexed previousAdmin,
        address indexed newAdmin
    );

    /**
     * @dev The Administrable constructor sets the original `admin` of the contract to the sender
     * account.
     */
    constructor() internal {
        _admin = msg.sender;
        emit AdminTransferred(address(0), _admin);
    }

    /**
     * @return The address of the admin.
     */
    function admin() public view returns(address) {
        return _admin;
    }

    /**
     * @dev Throws if called by non-admin.
     */
    modifier onlyAdmin() {
        require(isAdmin());
        _;
    }

    /**
     * @return true of `msg.sender` is the admin of the contract.
     */
    function isAdmin() public view returns(bool) {
        return (msg.sender == _admin);
    }

    /**
     * @dev Allows the current admin to transfer to another account.
     * @param newAdmin The address to be transferred to.
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        _transferAdmin(newAdmin);
    }

    /**
     * @dev Transfers the admin to a new admin.
     * @param newAdmin The address to be transferred to.
     */
    function _transferAdmin(address newAdmin) internal {
        require(newAdmin != address(0));
        emit AdminTransferred(_admin, newAdmin);
        _admin = newAdmin;
    }
}
