pragma solidity ^0.4.24;

import "../Dinngo.sol";

contract DinngoMock is Dinngo {
    constructor(address _dinngoWallet, address _dinngoToken)
        Dinngo(_dinngoWallet, _dinngoToken)
        public
    {
    }
}
