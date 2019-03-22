pragma solidity 0.5.6;

import "./Proxy.sol";

/**
 * @title TimelockUpgradableProxy
 * @author Ben Huang
 * @dev The registration-required version of upgradable contract.
 */
contract TimelockUpgradableProxy is Proxy {
    // keccak256 hash of "dinngo.proxy.registration"
    bytes32 private constant REGISTRATION_SLOT =
        0x90215db359d12011b32ff0c897114c39e26956599904ee846adb0dd49f782e97;
    // keccak256 hash of "dinngo.proxy.time"
    bytes32 private constant TIME_SLOT =
        0xe89d1a29650bdc8a918bc762afb8ef07e10f6180e461c3fc305f9f142e5591e6;
    uint256 private constant UPGRADE_TIME = 14 days;

    event UpgradeAnnounced(address indexed implementation, uint256 time);

    constructor() internal {
        assert(REGISTRATION_SLOT == keccak256("dinngo.proxy.registration"));
        assert(TIME_SLOT == keccak256("dinngo.proxy.time"));
    }

    /**
     * @notice Register the implementation address as the candidate contract
     * to be upgraded. Emits the UpgradeAnnounced event.
     * @param implementation The implementation contract address to be registered.
     */
    function register(address implementation) external onlyOwner {
        _registerImplementation(implementation);
        emit UpgradeAnnounced(implementation, _time());
    }

    /**
     * @dev Overload the function in contract Proxy.
     * @notice Upgrade the implementation contract.
     * @param implementation The new implementation contract.
     */
    function upgrade(address implementation) external {
        require(implementation == _registration());
        upgradeAnnounced();
    }

    /**
     * @notice Upgrade the implementation contract to the announced address.
     * Emits the Upgraded event.
     */
    function upgradeAnnounced() public onlyOwner {
        require(now >= _time());
        _setImplementation(_registration());
        emit Upgraded(_registration());
    }

    /**
     * @dev Register the imeplemtation address to the registation slot. Record the
     * valid time by adding the UPGRADE_TIME to the registration time to the time slot.
     * @param implementation The implemetation address to be registered.
     */
    function _registerImplementation(address implementation) internal {
        require(implementation.isContract(),
            "Implementation address should be a contract address"
        );
        uint256 time = now + UPGRADE_TIME;

        bytes32 implSlot = REGISTRATION_SLOT;
        bytes32 timeSlot = TIME_SLOT;

        assembly {
            sstore(implSlot, implementation)
            sstore(timeSlot, time)
        }
    }

    /**
     * @dev Return the valid time of registered implementation address.
     */
    function _time() internal view returns (uint256 time) {
        bytes32 slot = TIME_SLOT;

        assembly {
            time := sload(slot)
        }
    }

    /**
     * @dev Return the registered implementation address.
     */
    function _registration() internal view returns (address implementation) {
        bytes32 slot = REGISTRATION_SLOT;

        assembly {
            implementation := sload(slot)
        }
    }
}
