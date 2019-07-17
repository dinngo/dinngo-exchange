const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const DummyTarget = artifacts.require('DummyTarget');
const SerializableMigrationMock = artifacts.require('SerializableMigrationMock');

contract('SerializableMigration', function ([_, user1, user2]) {
    beforeEach(async function () {
        this.SerializableMigration = await SerializableMigrationMock.new();
    });
    const target = '0x471C92F915ae766C4964eEdC300e5b8FF41e443c';
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
    const r1 = '0xb2a61dc1054407b11469e977690f1a9707ecab83a1e7ed166a6ac6caac236f30';
    const s1 = '0x07e3e2071788405915e2ec793847d7e5e3c81181d50e36d56a1eeba1e32f6fcd';
    const v1 = new BN('1');
    const hash1 = '0x1d7db85eea77bf8780540a92faad848ca75a76d6cbfc72d24c33f0f605cf89db';
    const serializedHex1 = '0x07e3e2071788405915e2ec793847d7e5e3c81181d50e36d56a1eeba1e32f6fcdb2a61dc1054407b11469e977690f1a9707ecab83a1e7ed166a6ac6caac236f300100000000000000000000000000000000000000000000000000000000000000000100000000000b471c92f915ae766c4964eedc300e5b8ff41e443c';
    const r2 = '0x73f3bcc24139c57ea8b9affa666ff0371c412e6e25aaf156fe784cd20c19b359';
    const s2 = '0x30e4e07a2020146450e4cdd71883d97e0f64f33f9fb5e4096fd2c8bcd01db339';
    const v2 = new BN('0');
    const hash2 = '0xc9bea99260c2398c640bbc208c393edc3e29e0accb1c06f0eb68cd25e9a5d45a';
    const serializedHex2 = '0x30e4e07a2020146450e4cdd71883d97e0f64f33f9fb5e4096fd2c8bcd01db33973f3bcc24139c57ea8b9affa666ff0371c412e6e25aaf156fe784cd20c19b3590000000000000000000000000000000000000000000000000000038d7ea4c68000000017000b00000000000c471c92f915ae766c4964eedc300e5b8ff41e443c';

    describe('deserialize single', function () {
        it('get target', async function () {
            const migrationData = await this.SerializableMigration.getMigrationTargetMock.call(serializedHex1);
            migrationData.should.eq(target);
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
            migrationData.should.eq(target);
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
