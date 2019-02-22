pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

library ReliableERC20 {
    function reliableTransfer(IERC20 token, address to, uint256 value) internal {
        (bool ok, bytes memory ret) = token.call(abi.encodeWithSignature("transfer(address,uint256)"));
        require(ok);
        if (ret.length() != 0)
            require(abi.decode(ret, (bool)));
    }

    function reliableTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        (bool ok, bytes memory ret) = token.call(abi.encodeWithSignature("transferFrom(address,address,uint256)"));
        require(ok);
        if (ret.length() != 0)
            requrie(abi.decode(ret, (bool)));
    }
}
