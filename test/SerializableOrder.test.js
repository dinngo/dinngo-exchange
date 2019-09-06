const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const SerializableOrderMock = artifacts.require('SerializableOrderMock');

contract('SerializableOrder', function ([_, user]) {
    beforeEach(async function () {
        this.serializableOrder = await SerializableOrderMock.new();
    });
    const userId = new BN('11');
    const tokenIdBase = new BN('11');
    const tokenIdQuote = new BN('0');
    const amountBase = ether('100');
    const amountQuote = ether('1');
    const config = new BN('3');
    const handleFee = ether('1');
    const gasFee = ether('0.001');
    const nonce = new BN('1');

    const hash = '0xf1a59881b0097adaa34d7570a1f79dd02c1aec89c62124dc76fcdd11f1fcdf64';
    const serializedHex1 = '0x00000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000b';
    const serializedHex2 = '0x00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c';
    const serializedHexC = '0x00000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000b00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c';

    describe('deserialize', function () {
        it('get user ID', async function () {
            const orderData = await this.serializableOrder.getOrderUserIDMock.call(serializedHex1);
            expect(orderData).to.be.bignumber.eq(userId);
        });

        it('get base token ID', async function () {
            const orderData = await this.serializableOrder.getOrderTokenIDBaseMock.call(serializedHex1);
            expect(orderData).to.be.bignumber.eq(tokenIdBase);
        });

        it('get base amount', async function () {
            const orderData = await this.serializableOrder.getOrderAmountBaseMock.call(serializedHex1);
            expect(orderData).to.be.bignumber.eq(amountBase);
        });

        it('get quote token ID', async function () {
            const orderData = await this.serializableOrder.getOrderTokenIDQuoteMock.call(serializedHex1);
            expect(orderData).to.be.bignumber.eq(tokenIdQuote);
        });

        it('get quote amount', async function () {
            const orderData = await this.serializableOrder.getOrderAmountQuoteMock.call(serializedHex1);
            expect(orderData).to.be.bignumber.eq(amountQuote);
        });

        it('is buy order', async function () {
            const orderData = await this.serializableOrder.isOrderBuyMock.call(serializedHex1);
            expect(orderData).to.eq(true);
        });

        it('is main fee', async function () {
            const orderData = await this.serializableOrder.isOrderFeeMainMock.call(serializedHex1);
            expect(orderData).to.eq(true);
        });

        it('get handle fee', async function () {
            const orderData = await this.serializableOrder.getOrderHandleFeeMock.call(serializedHex1);
            expect(orderData).to.be.bignumber.eq(handleFee);
        });

        it('get gas fee', async function () {
            const orderData = await this.serializableOrder.getOrderGasFeeMock.call(serializedHex1);
            expect(orderData).to.be.bignumber.eq(gasFee);
        });

        it('get nonce', async function () {
            const orderData = await this.serializableOrder.getOrderNonceMock.call(serializedHex1);
            expect(orderData).to.be.bignumber.eq(nonce);
        });

        it('get hash', async function () {
            const orderData = await this.serializableOrder.getOrderHashMock.call(serializedHex1);
            expect(orderData).to.eq(hash);
        });

        it('get order', async function () {
            const orderData0 = await this.serializableOrder.getOrderMock.call(serializedHexC, 0);
            const orderData1 = await this.serializableOrder.getOrderMock.call(serializedHexC, 1);
            expect(orderData0).to.eq(serializedHex1);
            expect(orderData1).to.eq(serializedHex2);
        });
    });
});
