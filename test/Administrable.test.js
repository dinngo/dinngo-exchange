import { reverting } from 'openzeppelin-solidity/test/helpers/shouldFail';
import { inLogs } from 'openzeppelin-solidity/test/helpers/expectEvent';

const AdministrableMock = artifacts.require('AdministrableMock');
const OwnableAdministrableMock = artifacts.require('OwnableAdministrableMock');

const should = require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Administrable', function ([_, admin, newAdmin]) {
    beforeEach(async function () {
        this.administrable = await AdministrableMock.new({ from: admin });
    });

    describe('as an administrable', function () {
        it('should have an admin', async function () {
            (await this.administrable.admin()).should.equal(admin);
        });

        it('changes admin after transfer', async function () {
            (await this.administrable.isAdmin({ from: newAdmin })).should.be.equal(false);
            const { logs } = await this.administrable.transferAdmin(newAdmin, { from: admin });
            inLogs(logs, 'AdminTransferred');

            (await this.administrable.admin()).should.equal(newAdmin);
            (await this.administrable.isAdmin({ from: newAdmin })).should.be.equal(true);
        });

        it('should prevent non-admins from transfering', async function () {
            await reverting(this.administrable.transferAdmin(newAdmin));
        });

        it('should guard admin against stuck state', async function () {
            await reverting(this.administrable.transferAdmin(null, { from: admin }));
        });
    });
});

contract('Ownable Adminstrable', function ([_, owner, admin, newAdmin]) {
    beforeEach(async function () {
        this.administrable = await OwnableAdministrableMock.new({ from: owner });
    });

    it('admin should initially be owner', async function () {
        (await this.administrable.admin()).should.equal(owner);
    });

    describe('as an ownable administrable', function () {
        beforeEach(async function () {
            await this.administrable.transferAdmin(admin, { from: owner });
        });

        it('changes admin after transfer', async function () {
            (await this.administrable.isAdmin({ from: newAdmin })).should.be.equal(false);
            const { logs } = await this.administrable.transferAdmin(newAdmin, { from: owner });
            inLogs(logs, 'AdminTransferred');

            (await this.administrable.admin()).should.equal(newAdmin);
            (await this.administrable.isAdmin({ from: newAdmin })).should.be.equal(true);
        });

        it('should prevent admin from transfering', async function () {
            await this.administrable.transferAdmin(admin, { from: owner });
            await reverting(this.administrable.transferAdmin(admin), { from: admin });
        })

        it('should prevent non-admins from transfering', async function () {
            await this.administrable.transferAdmin(admin, { from: owner });
            await reverting(this.administrable.transferAdmin(newAdmin));
        });
    });
});

