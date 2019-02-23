pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/**
 * @title GeneralERC20
 * @dev Wrappers around ERC20 operations that throw on failure.
 * Handles the problem that some token contracts do not follow the ERC20 standard
 * (described in ERC1449).
 */
library GeneralERC20 {
    function generalTransfer(
        IERC20 token,
        address to,
        uint256 value
    ) internal {
        (bool ok, bytes memory ret) = address(token).call(abi.encodeWithSignature(
            "transfer(address,uint256)",
            to,
            value
        ));
        require(ok);
        if (ret.length > 0)
            require(abi.decode(ret, (bool)));
    }

    function generalTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value
    ) internal {
        (bool ok, bytes memory ret) = address(token).call(abi.encodeWithSignature(
            "transferFrom(address,address,uint256)",
            from,
            to,
            value
        ));
        require(ok);
        if (ret.length > 0)
            require(abi.decode(ret, (bool)));
    }
}
