const { constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { inLogs } = expectEvent;
const { reverting } = shouldFail;
const { ZERO_ADDRESS } = constants;

const AdministrableMock = artifacts.require('AdministrableMock');
const OwnableAdministrableMock = artifacts.require('OwnableAdministrableMock');

contract('Administrable', function ([_, admin, newAdmin]) {
    beforeEach(async function () {
        this.administrable = await AdministrableMock.new({ from: admin });
    });

    describe('as an administrable', function () {
        it('should have an admin', async function () {
            (await this.administrable.admin()).should.eq(admin);
        });

        it('changes admin after transfer', async function () {
            (await this.administrable.isAdmin({ from: newAdmin })).should.eq(false);
            const { logs } = await this.administrable.transferAdmin(newAdmin, { from: admin });
            inLogs(logs, 'AdminTransferred', { previousAdmin: admin, newAdmin: newAdmin });
            (await this.administrable.admin()).should.eq(newAdmin);
            (await this.administrable.isAdmin({ from: newAdmin })).should.eq(true);
        });

        it('should prevent non-admins from transferring', async function () {
            await reverting(this.administrable.transferAdmin(newAdmin));
        });

        it('should guard admin against stuck state', async function () {
            await reverting(this.administrable.transferAdmin(ZERO_ADDRESS, { from: admin }));
        });
    });
});

contract('Ownable Adminstrable', function ([_, owner, admin, newAdmin]) {
    beforeEach(async function () {
        this.administrable = await OwnableAdministrableMock.new({ from: owner });
    });

    it('admin should initially be owner', async function () {
        (await this.administrable.admin()).should.eq(owner);
    });

    describe('as an ownable administrable', function () {
        beforeEach(async function () {
            await this.administrable.transferAdmin(admin, { from: owner });
        });

        it('changes admin after transfer', async function () {
            (await this.administrable.isAdmin({ from: newAdmin })).should.eq(false);
            const { logs } = await this.administrable.transferAdmin(newAdmin, { from: owner });
            inLogs(logs, 'AdminTransferred', { previousAdmin: admin, newAdmin: newAdmin });
            (await this.administrable.admin()).should.eq(newAdmin);
            (await this.administrable.isAdmin({ from: newAdmin })).should.eq(true);
        });

        it('should prevent admin from transferring', async function () {
            await this.administrable.transferAdmin(admin, { from: owner });
            await reverting(this.administrable.transferAdmin(admin), { from: admin });
        })

        it('should prevent non-admins from transferring', async function () {
            await this.administrable.transferAdmin(admin, { from: owner });
            await reverting(this.administrable.transferAdmin(newAdmin));
        });
    });
});

