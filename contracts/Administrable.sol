pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title Administrable
 * @dev The administrator structure
 */
/**
 * @title Administrable
 */
contract Administrable {
    using SafeMath for uint256;
    mapping (address => bool) private admins;
    uint256 private _nAdmin;
    uint256 private _nLimit;

    event Activated(address indexed admin);
    event Deactivated(address indexed admin);

    /**
     * @dev The Administrable constructor sets the original `admin` of the contract to the sender
     * account. The initial limit amount of admin is 2.
     */
    constructor() internal {
        _setAdminLimit(2);
        _activateAdmin(msg.sender);
    }

    function isAdmin() public view returns(bool) {
        return admins[msg.sender];
    }

    /**
     * @dev Throws if called by non-admin.
     */
    modifier onlyAdmin() {
        require(isAdmin(), "403.1");
        _;
    }

    function activateAdmin(address admin) external onlyAdmin {
        _activateAdmin(admin);
    }

    function deactivateAdmin(address admin) external onlyAdmin {
        _safeDeactivateAdmin(admin);
    }

    function setAdminLimit(uint256 n) external onlyAdmin {
        _setAdminLimit(n);
    }

    function _setAdminLimit(uint256 n) internal {
        require(_nLimit != n, "same limit");
        _nLimit = n;
    }

    /**
     * @notice The Amount of admin should be bounded by _nLimit.
     */
    function _activateAdmin(address admin) internal {
        require(admin != address(0), "invalid address");
        require(_nAdmin < _nLimit, "too many admins existed");
        require(!admins[admin], "already admin");
        admins[admin] = true;
        _nAdmin = _nAdmin.add(1);
        emit Activated(admin);
    }

    /**
     * @notice At least one admin should exists.
     */
    function _safeDeactivateAdmin(address admin) internal {
        require(_nAdmin > 1, "admin should > 1");
        _deactivateAdmin(admin);
    }

    function _deactivateAdmin(address admin) internal {
        require(admins[admin], "not admin");
        admins[admin] = false;
        _nAdmin = _nAdmin.sub(1);
        emit Deactivated(admin);
    }
}
