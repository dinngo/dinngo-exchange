pragma solidity ^0.4.24;

import "../Dinngo.sol";

contract DinngoMock is Dinngo {
    constructor(address _dinngoWallet, address _dinngoToken)
        Dinngo(_dinngoWallet, _dinngoToken)
        public
    {
    }

    function addUserMock(address user) external {
        userCount++;
        userID_Address[userCount] = user;
        userRank[user] = 1;
    }
}
