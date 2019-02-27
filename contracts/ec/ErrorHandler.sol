pragma solidity ^0.5.0;

library ErrorHandler {
    function errorHandler(bytes memory ret) internal pure {
        if (ret.length > 0) {
            byte ec = abi.decode(ret, (byte));
            if (ec != 0x00)
                revert(byteToHexString(ec));
        }
    }

    function byteToHexString(byte data) internal pure returns (string memory ret) {
        bytes memory ec = bytes("0x00");
        byte dataL = data & 0x0f;
        byte dataH = data >> 4;
        if (dataL < 0x0a)
            ec[3] = byte(uint8(ec[3]) + uint8(dataL));
        else
            ec[3] = byte(uint8(ec[3]) + uint8(dataL) + 0x27);
        if (dataH < 0x0a)
            ec[2] = byte(uint8(ec[2]) + uint8(dataH));
        else
            ec[2] = byte(uint8(ec[2]) + uint8(dataH) + 0x27);

        return string(ec);
    }
}
