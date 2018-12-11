pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Administrable
 * @dev The
 */
contract Administrable {
    address private _admin;

    event AdminTransferred(
        address indexed previousAdmin,
        address indexed newAdmin
    );

    constructor() internal {
        _admin = msg.sender;
        emit AdminTransferred(address(0), _admin);
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
        require(newAdmin != address(0));
        emit AdminTransferred(_admin, newAdmin);
        _admin = newAdmin;
    }
}
