const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

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
    const r1 = '0x87a72fa86c8490370b4498d9afe1d75e876174ccf8018a14fd9da87756fb8c8a';
    const s1 = '0x15ddf6a61e62aaa16e0be4328850414f188ae687755cad262cd971de571439b8';
    const v1 = new BN('1');
    const hash1 = '0x851d72e5354ecf9003f86ef3d77d9d3d9fa9b68b0f7409c2fe1f7d7f0e7b1304';
    const serializedHex1 = '0x15ddf6a61e62aaa16e0be4328850414f188ae687755cad262cd971de571439b887a72fa86c8490370b4498d9afe1d75e876174ccf8018a14fd9da87756fb8c8a0100000000000b471c92f915ae766c4964eedc300e5b8ff41e443c';
    const r2 = '0xd3cf89a5a2de798c0d5dd21beddb67d16663ca0de2e59233f6fbc99484013322';
    const s2 = '0x75ec1c777383273eb634c579f4235161d721658fc7bc209f88ff392090622e34';
    const v2 = new BN('1');
    const hash2 = '0x800ffe67cc8975798a88410ffc1513674d09df4f5a4e6c2c0d9049355352c47c';
    const serializedHex2 = '0x75ec1c777383273eb634c579f4235161d721658fc7bc209f88ff392090622e34d3cf89a5a2de798c0d5dd21beddb67d16663ca0de2e59233f6fbc99484013322010017000b00000000000c471c92f915ae766c4964eedc300e5b8ff41e443c';

    describe('deserialize single', function () {
        it('get target', async function () {
            const migrationData = await this.SerializableMigration.getMigrationTargetMock.call(serializedHex1);
            expect(migrationData).to.eq(target);
        });

        it('get user ID', async function () {
            const migrationData = await this.SerializableMigration.getMigrationUserIDMock.call(serializedHex1);
            expect(migrationData).to.be.bignumber.eq(user1Id);
        });

        it('get token ID', async function () {
            const migrationData = await this.SerializableMigration.getMigrationTokenIDMock.call(serializedHex1, 0);
            expect(migrationData).to.be.bignumber.eq(tokenId);
        });

        it('get r', async function () {
            const migrationData = await this.SerializableMigration.getMigrationRMock.call(serializedHex1);
            expect(migrationData).to.eq(r1);
        });

        it('get s', async function () {
            const migrationData = await this.SerializableMigration.getMigrationSMock.call(serializedHex1);
            expect(migrationData).to.eq(s1);
        });

        it('get v', async function () {
            const migrationData = await this.SerializableMigration.getMigrationVMock.call(serializedHex1);
            expect(migrationData).to.be.bignumber.eq(v1);
        });

        it('get hash', async function () {
            const migrationData = await this.SerializableMigration.getMigrationHashMock.call(serializedHex1);
            expect(migrationData).to.eq(hash1);
        });
    });

    describe('deserialize multiple', function () {
        it('get target', async function () {
            const migrationData = await this.SerializableMigration.getMigrationTargetMock.call(serializedHex2);
            expect(migrationData).to.eq(target);
        });

        it('get user ID', async function () {
            const migrationData = await this.SerializableMigration.getMigrationUserIDMock.call(serializedHex2);
            expect(migrationData).to.be.bignumber.eq(user2Id);
        });

        it('get token ID', async function () {
            const migrationData1 = await this.SerializableMigration.getMigrationTokenIDMock.call(serializedHex2, 0);
            expect(migrationData1).to.be.bignumber.eq(tokenId1);
            const migrationData2 = await this.SerializableMigration.getMigrationTokenIDMock.call(serializedHex2, 1);
            expect(migrationData2).to.be.bignumber.eq(tokenId2);
            const migrationData3 = await this.SerializableMigration.getMigrationTokenIDMock.call(serializedHex2, 2);
            expect(migrationData3).to.be.bignumber.eq(tokenId3);
        });

        it('get r', async function () {
            const migrationData = await this.SerializableMigration.getMigrationRMock.call(serializedHex2);
            expect(migrationData).to.eq(r2);
        });

        it('get s', async function () {
            const migrationData = await this.SerializableMigration.getMigrationSMock.call(serializedHex2);
            expect(migrationData).to.eq(s2);
        });

        it('get v', async function () {
            const migrationData = await this.SerializableMigration.getMigrationVMock.call(serializedHex2);
            expect(migrationData).to.be.bignumber.eq(v2);
        });

        it('get hash', async function () {
            const migrationData = await this.SerializableMigration.getMigrationHashMock.call(serializedHex2);
            expect(migrationData).to.eq(hash2);
        });
    });
});
