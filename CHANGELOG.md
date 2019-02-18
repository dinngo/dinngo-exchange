# Change Log
All notable changes to this project will be documented in this file.

## [unreleased]
### Added
- Add a new role admin. Admin is initially owner. Can only be assigned by owner.
- Upgrade solidity to 0.5.x

### Fixed
- Fix the error price calculation when verifying the settlement.

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
