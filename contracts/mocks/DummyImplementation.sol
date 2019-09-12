pragma solidity ^0.5.0;

contract Impl {
    function version() public pure returns (string memory);
}

contract DummyImplementation {
    uint256 public value;
    string public text;
    uint256[] public values;

    uint256 constant public version = 1;

    function initializeNonPayable() public {
        value = 10;
    }

    function initializePayable() payable public {
        value = 100;
    }

    function initializeNonPayable(uint256 _value) public {
        value = _value;
    }

    function initializePayable(uint256 _value) public {
        value = _value;
    }

    function initialize(uint256 _value, string memory _text, uint256[] memory _values) public {
        value = _value;
        text = _text;
        values = _values;
    }

    function get() public pure returns (bool) {
        return true;
    }

    function reverts() public pure {
        require(false);
    }
}

contract DummyImplementationV2 is DummyImplementation {
    uint256 constant public version = 2;

    function migrate(uint256 newVal) payable public {
        value = newVal;
    }

}
