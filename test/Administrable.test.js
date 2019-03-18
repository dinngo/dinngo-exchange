const { constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { inLogs } = expectEvent;
const { reverting } = shouldFail;
const { ZERO_ADDRESS } = constants;

const AdministrableMock = artifacts.require('AdministrableMock');
const OwnableAdministrableMock = artifacts.require('OwnableAdministrableMock');

contract('Administrable', function ([_, admin, newAdmin, someone]) {
    beforeEach(async function () {
        this.administrable = await AdministrableMock.new({ from: admin });
    });

    describe('as an administrable', function () {
        it('should have an admin', async function () {
            (await this.administrable.isAdmin({ from: admin })).should.eq(true);
        });

        it('activate an admin', async function () {
            (await this.administrable.isAdmin({ from: newAdmin })).should.eq(false);
            const { logs } = await this.administrable.activateAdmin(newAdmin, { from: admin });
            inLogs(logs, 'Activated', { admin: newAdmin });
            (await this.administrable.isAdmin({ from: newAdmin })).should.eq(true);
            (await this.administrable.isAdmin({ from: admin })).should.eq(true);
        });

        it('deactivate an admin', async function () {
            await this.administrable.activateAdmin(newAdmin, { from: admin });
            const { logs } = await this.administrable.deactivateAdmin(admin, { from: newAdmin });
            inLogs(logs, 'Deactivated', { admin: admin });
            (await this.administrable.isAdmin({ from: admin })).should.eq(false);
        });

        it('should prevent non-admins from activating', async function () {
            await reverting(this.administrable.activateAdmin(newAdmin));
        });

        it('should prevent repeated activating', async function () {
            await reverting(this.administrable.activateAdmin(admin, { from: admin }));
        });

        it('should prevent too many admins being activated', async function () {
            await this.administrable.activateAdmin(newAdmin, { from: admin });
            await reverting(this.administrable.activateAdmin(someone, { from: admin }));
            await this.administrable.setAdminLimit('3', { from: admin });
            this.administrable.activateAdmin(someone, { from: admin });
        });

        it('should prevent setting admin amount limit by non-admin', async function () {
            await reverting(this.administrable.setAdminLimit('3'));
        });

        it('should prevent deactivating non-admin', async function () {
            await reverting(this.administrable.deactivateAdmin(someone, { from: admin }));
        });

        it('should prevent deactivating admin causing no admin', async function () {
            await reverting(this.administrable.deactivateAdmin(admin, { from: admin }));
        });

        it('should guard admin against stuck state', async function () {
            await reverting(this.administrable.activateAdmin(ZERO_ADDRESS, { from: admin }));
        });
    });
});

contract('Ownable Adminstrable', function ([_, owner, admin, newAdmin, someone]) {
    beforeEach(async function () {
        this.administrable = await OwnableAdministrableMock.new({ from: owner });
    });

    it('admin should initially be owner', async function () {
        (await this.administrable.isAdmin({ from: owner })).should.eq(true);
    });

    describe('as an ownable administrable', function () {
        beforeEach(async function () {
            await this.administrable.activateAdmin(admin, { from: owner });
            await this.administrable.deactivateAdmin(owner, { from: owner });
        });

        it('activate an admin', async function () {
            (await this.administrable.isAdmin({ from: newAdmin })).should.eq(false);
            const { logs } = await this.administrable.activateAdmin(newAdmin, { from: owner });
            inLogs(logs, 'Activated', { admin: newAdmin });
            (await this.administrable.isAdmin({ from: newAdmin })).should.eq(true);
            (await this.administrable.isAdmin({ from: admin })).should.eq(true);
        });

        it('deactivate an admin', async function () {
            await this.administrable.activateAdmin(newAdmin, { from: owner });
            const { logs } = await this.administrable.deactivateAdmin(admin, { from: owner });
            inLogs(logs, 'Deactivated', { admin: admin });
            (await this.administrable.isAdmin({ from: admin })).should.eq(false);
        });

        it('force-deactivate an admin', async function () {
            const { logs } = await this.administrable.forceDeactivateAdmin(admin, { from: owner });
            inLogs(logs, 'Deactivated', { admin: admin });
            (await this.administrable.isAdmin({ from: admin })).should.eq(false);
        });

        it('should prevent non-owner from activating', async function () {
            await reverting(this.administrable.activateAdmin(newAdmin));
        });

        it('should prevent non-owner from deactivating', async function () {
            await this.administrable.activateAdmin(newAdmin, { from: owner });
            await reverting(this.administrable.deactivateAdmin(newAdmin));
        });

        it('should prevent non-owner from force-deactivating', async function () {
            await reverting(this.administrable.forceDeactivateAdmin(admin));
        });

        it('should prevent repeated activating', async function () {
            await reverting(this.administrable.activateAdmin(admin, { from: owner }));
        });

        it('should prevent too many admins being activated', async function () {
            await this.administrable.activateAdmin(newAdmin, { from: owner });
            await reverting(this.administrable.activateAdmin(someone, { from: owner }));
            await this.administrable.setAdminLimit('3', { from: owner });
            await this.administrable.activateAdmin(someone, { from: owner });
        });

        it('should prevent setting admin amount limit by non-owner', async function () {
            await reverting(this.administrable.setAdminLimit('3'));
        });

        it('should prevent deactivating non-admin', async function () {
            await reverting(this.administrable.deactivateAdmin(someone, { from: owner }));
        });

        it('should prevent deactivating admin causing no admin', async function () {
            await reverting(this.administrable.deactivateAdmin(admin, { from: owner }));
        });

        it('should guard admin against stuck state', async function () {
            await reverting(this.administrable.activateAdmin(ZERO_ADDRESS, { from: owner }));
        });
    });
});

