pragma solidity ^0.5.0;

/**
 * @title ErrorHandler
 * @author Ben Huang
 * @notice Handle the return status by a byte. 0x00 is success. Others will
 * be transferred into string and appended on the reverting message.
 * @dev This is for temporary usage. Should be suspended when ethereum support
 * native exception handling for general calls.
 */
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
