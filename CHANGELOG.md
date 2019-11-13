# Change Log
All notable changes to this project will be documented in this file.

## [unreleased]
## Changed
- Implement the status code
- Handle the error caused by non-return transfers of token contract.

## [2.1.2] - 2019-10-24
### Fixed
- Fix potential reentrancy vulnerability.

### Removed
- Redundant fallback function.

## [2.1.1] - 2019-10-21
### Changed
- Fix solc version to 0.5.12.

### Fixed
- Incompatible token handling.

## [2.1.0] - 2019-10-15
### Added
- Nonce verification on transferral and withdrawal data.
- Implement the migrateTo function for handling migration.
- Upgrade solidity to 0.5.12.

### Changed
- Change the withdraw fee from ETH to the withdraw token.
- Combine the userRanks and tokenRanks to ranks.
- Combine removeUser and removeToken in implementation contract. (Does not change the function call through proxy)
- Combine updateUserRank and updateTokenRank in implementation contract. (Does not change the function call through proxy)

## [2.0.1] - 2019-09-23
### Added
- Version information.
- Implement getTransferralHash in proxy.

### Changed
- Change the price checking to per maker order.
- Update error message handler.

## [2.0.0] - 2019-09-10
### Added
- Transferal hash calculator.
- Implement internal transfer.
- A new role `walletOwner` is created.
- `extractFee(uint256 amount)` is implemented to extract the collected fee(ether). Can only be executed by wallet owner.
- `extractTokenFee(address token, uint256 amount)` is implemented to extract the collected fee(token). Can only be executed by wallet owner.
- `getWalletBalance(address token)` is implemented to get the balance of fee wallet in specific token.
- `changeWalletOwner(address newOwner)` is implemented to change the wallet owner to new owner.
- Event emission is separate into three groups. Each group can be turn on/off individually.

### Changed
- Change the proxy structure from timelock to normal.
- Fee is now collected under the zero address.
- Upgrade openzeppelin to 2.3.0.
- Upgrade solidity to 0.5.11.
- Upgrade truffle to 5.0.31.
- Upgrade other packages.
- Change trade fee to handle fee.

## [1.1.0] - 2019-07-19
### Added
- Implement the migration function.

### Changed
- Change the naming from target/trade to base/quote.
- Change the fee token in trading from quote to the output token.
- Gas optimization.

### Deprecated
- Add the fee information in event Trade and Withdraw.

## [1.0.0] - 2019-04-09
### Changed
- Fix the storage alignment of implementation contract.

## [0.4.0] - 2019-03-22
### Added
- Implement interface of migration(just in case).

### Changed
- Apply safeERC20 instead of generalERC20.
- Update the administrable structure to achieve 0-downtime rotation.
- Fix solc version to 0.5.6.

### Deprecated
- Implement error handler.

### Security
- Fix deposit function to avoid reentrancy bugs.
- Fix an overflow bug in lock().
- Verify token contract before calling.

## [0.3.0] - 2019-02-25
### Added
- Add a new role admin. Admin is initially owner. Can only be assigned by owner.
- Upgrade solidity to 0.5.x.
- Update the npm scripts.

### Fixed
- Fix the error price calculation when verifying the settlement.
- Add generalERC20 handler to handle non-comliant token contract.

### Changed
- Remove the unnecessary assignments in implementation functions.
- Change the permission of user related functions from owner to admin.
- Change the permission of settle from owner to admin.
- Change the permission of withdrawByAdmin from owner to admin.
- Deposit does not require user to be added.
- Upgrading implementation requires contract registration.
- Trade-token is always the main token.
- Target-token is always the sub token.
- Unify the integer type to uint256.

### Security
- Fix withdraw related functions to avoid reentrancy bugs.

## [0.2.1] - 2018-12-11
### Added
- Added the solc version in truffle.js.
- Upgrade openzeppelin-solidity to 2.0.0.
- Continous Integration.
- Make locking process time modifiable.

### Fixed
- Fix test to support openzeppelin-solidity 2.0.0.
- Adding removed user/token under same id should succeed.
- Orderfills is not checked after the update.
- Revert when settle does not behave normally.

## [0.2.0] - 2018-11-28
### Added
- Implement proxy structure.

## [0.1.1] - 2018-11-29
### Fixed
- Fix the bug caused by importing openzeppelin test helper.

## [0.1.0] - 2018-11-28
### Added
- Complete functional exchange.
