pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/AddressUtils.sol';
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract Proxy is Ownable {
    address internal _implementation;

    event Upgraded(address indexed impl);

    constructor(address impl) public {
        _implementation = impl;
    }

    function upgrade(address impl) external onlyOwner {
        require(AddressUtils.isContract(impl), "Implementation address should be a contract address");
        _implementation = impl;

        emit Upgraded(impl);
    }
}
