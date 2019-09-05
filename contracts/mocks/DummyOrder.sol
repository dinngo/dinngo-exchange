pragma solidity ^0.5.0;

import "../sign/ISign.sol";

contract DummyOrder is ISign {
    mapping (bytes32 => bool) public signed;

    function sign(bytes32 hash) public {
        signed[hash] = true;
    }
}
