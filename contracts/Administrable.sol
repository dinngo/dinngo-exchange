pragma solidity ^0.4.24;

/**
 * @title Administrable
 * @dev The
 */
contract Administrable {
    address private _admin;

    constructor(address admin) internal {
        _admin = admin;
    }

    function admin() public view returns(address) {
        return _admin;
    }

    modifier onlyAdmin() {
        require(isAdmin());
        _;
    }

    function isAdmin() public view returns(bool) {
        return (msg.sender == _admin);
    }

    function _transferAdmin(address newAdmin) internal {
        require(newAdmin != _admin);
        require(newAdmin != address(0));
        _admin = newAdmin;
    }
}
