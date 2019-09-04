const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const SerializableTransferralMock = artifacts.require('SerializableTransferralMock');

contract('SerializableTransferral', function ([_, user1, user2, user3]) {
    beforeEach(async function () {
        this.SerializableTransferral = await SerializableTransferralMock.new();
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

    const sig = '0x5ffa1c000d6adade324b3157fc27a4378cf221ca527fd7ef0b3470685fc9b0893e5d95c042b3f156fdb013a0f85d73cb69eeaadbc2aafa4969f06604bd47e7d800';
    const hash = '0x517334ed7a48e221f7eebb9ec10b9eefc20d31240e84034f22f0d8676375e9b2';
    const serializedHex = '0x000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000016345785d8a00000000c5fdf4076b8f3a5357c5e395ab970b5b54098fef0000000101f17f52151ebef6c7334fad080c5704d77216b732';

    describe('deserialize', function () {
        it('get from address', async function () {
            const transferralData = await this.SerializableTransferral.getTransferralFromMock.call(serializedHex);
            expect(transferralData).to.eq(user1);
        });

        it('is fee main', async function () {
            const transferralData = await this.SerializableTransferral.isTransferralFeeMainMock.call(serializedHex);
            expect(transferralData).to.eq(true);
        });

        it('get nonce', async function () {
            const transferralData = await this.SerializableTransferral.getTransferralNonceMock.call(serializedHex);
            expect(transferralData).to.be.bignumber.eq(nonce1);
        });

        it('get transferral count', async function () {
            const transferralData = await this.SerializableTransferral.getTransferralCountMock.call(serializedHex);
            expect(transferralData).to.be.bignumber.eq(new BN('1'));
        });

        it('get to address 0', async function () {
            const transferralData = await this.SerializableTransferral.getTransferralToMock.call(serializedHex, 0);
            expect(transferralData).to.eq(user2);
        });

        it('get token ID 0', async function () {
            const transferralData = await this.SerializableTransferral.getTransferralTokenIDMock.call(serializedHex, 0);
            expect(transferralData).to.be.bignumber.eq(tokenID1);
        });

        it('get amount 0', async function () {
            const transferralData = await this.SerializableTransferral.getTransferralAmountMock.call(serializedHex, 0);
            expect(transferralData).to.be.bignumber.eq(amount1);
        });

        it('get fee 0', async function () {
            const transferralData = await this.SerializableTransferral.getTransferralFeeMock.call(serializedHex, 0);
            expect(transferralData).to.be.bignumber.eq(fee1);
        });

        it('get hash', async function () {
            const transferralData = await this.SerializableTransferral.getTransferralHashMock.call(serializedHex);
            expect(transferralData).to.eq(hash);
        });
    });
});
