const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const SerializableTransferalMock = artifacts.require('SerializableTransferalMock');

contract('SerializableTransferal', function ([_, user1, user2, user3]) {
    beforeEach(async function () {
        this.SerializableTransferal = await SerializableTransferalMock.new();
    });

    const config1 = new BN('1');
    const nonce1 = new BN('1');
    const config2 = new BN('1');
    const nonce2 = new BN('2');

    const tokenID1 = new BN('0');
    const amount1 = ether('0.1');
    const fee1 = ether('0.01');

    const tokenID2 = new BN('11');
    const amount2 = ether('0.2');
    const fee2 = ether('0.02');

    const hash1 = '0x517334ed7a48e221f7eebb9ec10b9eefc20d31240e84034f22f0d8676375e9b2';
    const serializedHex1 = '0x000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000016345785d8a00000000c5fdf4076b8f3a5357c5e395ab970b5b54098fef0000000101f17f52151ebef6c7334fad080c5704d77216b732';
    const hash2 = '0xea500b2a34512f2fcfad496100d6b62e0a57295e9f1ab72e63dfe2def74e183a';
    const serializedHex2 = '0x00000000000000000000000000000000000000000000000000470de4df82000000000000000000000000000000000000000000000000000002c68af0bb140000000b821aea9a577a9b44299b9c15c88cf3087f3b5544000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000016345785d8a00000000c5fdf4076b8f3a5357c5e395ab970b5b54098fef0000000201f17f52151ebef6c7334fad080c5704d77216b732';

    describe('deserialize single', function () {
        it('get from address', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalFromMock.call(serializedHex1);
            expect(transferalData).to.eq(user1);
        });

        it('is fee main', async function () {
            const transferalData = await this.SerializableTransferal.isTransferalFeeMainMock.call(serializedHex1);
            expect(transferalData).to.eq(true);
        });

        it('get nonce', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalNonceMock.call(serializedHex1);
            expect(transferalData).to.be.bignumber.eq(nonce1);
        });

        it('get transferal count', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalCountMock.call(serializedHex1);
            expect(transferalData).to.be.bignumber.eq(new BN('1'));
        });

        it('get to address 0', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalToMock.call(serializedHex1, 0);
            expect(transferalData).to.eq(user2);
        });

        it('get token ID 0', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalTokenIDMock.call(serializedHex1, 0);
            expect(transferalData).to.be.bignumber.eq(tokenID1);
        });

        it('get amount 0', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalAmountMock.call(serializedHex1, 0);
            expect(transferalData).to.be.bignumber.eq(amount1);
        });

        it('get fee 0', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalFeeMock.call(serializedHex1, 0);
            expect(transferalData).to.be.bignumber.eq(fee1);
        });

        it('get hash', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalHashMock.call(serializedHex1);
            expect(transferalData).to.eq(hash1);
        });
    });

    describe('deserialize multiple', function () {
        it('get from address', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalFromMock.call(serializedHex2);
            expect(transferalData).to.eq(user1);
        });

        it('is fee main', async function () {
            const transferalData = await this.SerializableTransferal.isTransferalFeeMainMock.call(serializedHex2);
            expect(transferalData).to.eq(true);
        });

        it('get nonce', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalNonceMock.call(serializedHex2);
            expect(transferalData).to.be.bignumber.eq(nonce2);
        });

        it('get transferal count', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalCountMock.call(serializedHex2);
            expect(transferalData).to.be.bignumber.eq(new BN('2'));
        });

        it('get to address 0', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalToMock.call(serializedHex2, 0);
            expect(transferalData).to.eq(user2);
        });

        it('get token ID 0', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalTokenIDMock.call(serializedHex2, 0);
            expect(transferalData).to.be.bignumber.eq(tokenID1);
        });

        it('get amount 0', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalAmountMock.call(serializedHex2, 0);
            expect(transferalData).to.be.bignumber.eq(amount1);
        });

        it('get fee 0', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalFeeMock.call(serializedHex2, 0);
            expect(transferalData).to.be.bignumber.eq(fee1);
        });

        it('get to address 1', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalToMock.call(serializedHex2, 1);
            expect(transferalData).to.eq(user3);
        });

        it('get token ID 1', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalTokenIDMock.call(serializedHex2, 1);
            expect(transferalData).to.be.bignumber.eq(tokenID2);
        });

        it('get amount 1', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalAmountMock.call(serializedHex2, 1);
            expect(transferalData).to.be.bignumber.eq(amount2);
        });

        it('get fee 1', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalFeeMock.call(serializedHex2, 1);
            expect(transferalData).to.be.bignumber.eq(fee2);
        });

        it('get hash', async function () {
            const transferalData = await this.SerializableTransferal.getTransferalHashMock.call(serializedHex2);
            expect(transferalData).to.eq(hash2);
        });
    });
});
