pragma solidity ^0.4.24;

import "../Administrable.sol";

contract OwnableAdministrableMock is Administrable {
    address private _owner;

    constructor() public {
        _owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }
    function transferAdmin(address newAdmin) external onlyOwner {
        _transferAdmin(newAdmin);
    }
}
