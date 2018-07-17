pragma solidity ^0.4.24;

contract Order {
    struct order {
        uint32 userID;
        uint16 tokenGetID;
        uint256 amountGet;
        uint16 tokenGiveID;
        uint256 amountGive;
        uint8 fee;
        uint256 DGOPrice;
        uint32 nonce;
        bytes32 r;
        bytes32 s;
        uint8 v;
    }
}
