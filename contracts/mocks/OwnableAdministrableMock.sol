pragma solidity 0.5.6;

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

    function activateAdmin(address admin) external onlyOwner {
        _activateAdmin(admin);
    }

    function deactivateAdmin(address admin) external onlyOwner {
        _safeDeactivateAdmin(admin);
    }

    function forceDeactivateAdmin(address admin) external onlyOwner {
        _deactivateAdmin(admin);
    }

    function setAdminLimit(uint256 n) external onlyOwner {
        _setAdminLimit(n);
    }
}
