const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const DummyTarget = artifacts.require('DummyTarget');
const SerializableMigrationMock = artifacts.require('SerializableMigrationMock');

contract('SerializableMigration', function ([_, deployer, user1, user2]) {
    before(async function () {
        this.Target = await DummyTarget.new({ from: deployer });
    });
    beforeEach(async function () {
        this.SerializableMigration = await SerializableMigrationMock.new();
    });
    const user1Id = new BN('11');
    const user2Id = new BN('12');
    const tokenId = new BN('0');
    const tokenId1 = new BN('0');
    const tokenId2 = new BN('11');
    const tokenId3 = new BN('23');
    const config1 = new BN('1');
    const config2 = new BN('0');
    const fee1 = ether('0');
    const fee2 = ether('0.001');
    const r1 = '0x0e14227adc9b546aeba463db6390e20202caa4bdd9fdb630ba9d1d33374a6b35';
    const s1 = '0x109602a489a8cd40b4603bc018eb42968256d972f2822d13d53ebd50186410e9';
    const v1 = new BN('0');
    const hash1 = '0x342a7db12b1cc1fe449cbc71c50f6e1c973607f7f8529a4c39377b8486e270c2';
    const serializedHex1 = '0x109602a489a8cd40b4603bc018eb42968256d972f2822d13d53ebd50186410e90e14227adc9b546aeba463db6390e20202caa4bdd9fdb630ba9d1d33374a6b350000000000000000000000000000000000000000000000000000000000000000000100000000000bb9a219631aed55ebc3d998f17c3840b7ec39c0cc';
    const r2 = '0x7bc5a1bcc00dfd5b93b539b1a6ac2a79d15de461f9407998346ecb963b0e60e4';
    const s2 = '0x650431c890b805c47996819e04e5d0a206b287ad4d37ece64dbe69a0c3a8fd7c';
    const v2 = new BN('0');
    const hash2 = '0x546ff5928871c8517d4cb1e00f91976d7013f71806bdc2153b35aba6edb08359';
    const serializedHex2 = '0x650431c890b805c47996819e04e5d0a206b287ad4d37ece64dbe69a0c3a8fd7c7bc5a1bcc00dfd5b93b539b1a6ac2a79d15de461f9407998346ecb963b0e60e40000000000000000000000000000000000000000000000000000038d7ea4c68000000017000b00000000000cb9a219631aed55ebc3d998f17c3840b7ec39c0cc';

    describe('deserialize single', function () {
        it('get target', async function () {
            const migrationData = await this.SerializableMigration.getMigrationTargetMock.call(serializedHex1);
            migrationData.should.eq(this.Target.address);
        });

        it('get user ID', async function () {
            const migrationData = await this.SerializableMigration.getMigrationUserIDMock.call(serializedHex1);
            migrationData.should.be.bignumber.eq(user1Id);
        });

        it('get token ID', async function () {
            const migrationData = await this.SerializableMigration.getMigrationTokenIDMock.call(serializedHex1, 0);
            migrationData.should.be.bignumber.eq(tokenId);
        });

        it('is fee ETH', async function () {
            const migrationData = await this.SerializableMigration.isMigrationFeeETHMock.call(serializedHex1);
            migrationData.should.eq(true);
        });

        it('get fee amount', async function () {
            const migrationData = await this.SerializableMigration.getMigrationFeeMock.call(serializedHex1);
            migrationData.should.be.bignumber.eq(fee1);
        });

        it('get r', async function () {
            const migrationData = await this.SerializableMigration.getMigrationRMock.call(serializedHex1);
            migrationData.should.eq(r1);
        });

        it('get s', async function () {
            const migrationData = await this.SerializableMigration.getMigrationSMock.call(serializedHex1);
            migrationData.should.eq(s1);
        });

        it('get v', async function () {
            const migrationData = await this.SerializableMigration.getMigrationVMock.call(serializedHex1);
            migrationData.should.be.bignumber.eq(v1);
        });

        it('get hash', async function () {
            const migrationData = await this.SerializableMigration.getMigrationHashMock.call(serializedHex1);
            migrationData.should.eq(hash1);
        });
    });

    describe('deserialize multiple', function () {
        it('get target', async function () {
            const migrationData = await this.SerializableMigration.getMigrationTargetMock.call(serializedHex2);
            migrationData.should.eq(this.Target.address);
        });

        it('get user ID', async function () {
            const migrationData = await this.SerializableMigration.getMigrationUserIDMock.call(serializedHex2);
            migrationData.should.be.bignumber.eq(user2Id);
        });

        it('get token ID', async function () {
            const migrationData1 = await this.SerializableMigration.getMigrationTokenIDMock.call(serializedHex2, 0);
            migrationData1.should.be.bignumber.eq(tokenId1);
            const migrationData2 = await this.SerializableMigration.getMigrationTokenIDMock.call(serializedHex2, 1);
            migrationData2.should.be.bignumber.eq(tokenId2);
            const migrationData3 = await this.SerializableMigration.getMigrationTokenIDMock.call(serializedHex2, 2);
            migrationData3.should.be.bignumber.eq(tokenId3);
        });

        it('is fee ETH', async function () {
            const migrationData = await this.SerializableMigration.isMigrationFeeETHMock.call(serializedHex2);
            migrationData.should.eq(false);
        });

        it('get fee amount', async function () {
            const migrationData = await this.SerializableMigration.getMigrationFeeMock.call(serializedHex2);
            migrationData.should.be.bignumber.eq(fee2);
        });

        it('get r', async function () {
            const migrationData = await this.SerializableMigration.getMigrationRMock.call(serializedHex2);
            migrationData.should.eq(r2);
        });

        it('get s', async function () {
            const migrationData = await this.SerializableMigration.getMigrationSMock.call(serializedHex2);
            migrationData.should.eq(s2);
        });

        it('get v', async function () {
            const migrationData = await this.SerializableMigration.getMigrationVMock.call(serializedHex2);
            migrationData.should.be.bignumber.eq(v2);
        });

        it('get hash', async function () {
            const migrationData = await this.SerializableMigration.getMigrationHashMock.call(serializedHex2);
            migrationData.should.eq(hash2);
        });
    });
});
