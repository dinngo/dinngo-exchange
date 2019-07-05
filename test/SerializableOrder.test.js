const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const SerializableOrderMock = artifacts.require('SerializableOrderMock');

contract('SerializableOrder', function ([_, user]) {
    beforeEach(async function () {
        this.serializableOrder = await SerializableOrderMock.new();
    });
    const userId = new BN('11');
    const tokenIdBase = new BN('0');
    const tokenIdQuote = new BN('11');
    const amountBase = ether('1');
    const amountQuote = ether('100');
    const config = new BN('3');
    const tradeFee = ether('1');
    const gasFee = ether('0.001');
    const nonce = new BN('1');
    const r = '0xe210212a1d3790c95bb3e56bfac578ab59479aef335ae48885ec48295fd510f8';
    const s = '0x24f3a54a1b754191b87333031b45fabfd20139056c391386597a7b3598856dd1';
    const v = new BN('0');
    const hash = '0xae69a2185ebf1d3685a0a00cb9c7b46cdfe21531593102afbfaf6e50b81b8599';
    const serializedHex1 = '0x24f3a54a1b754191b87333031b45fabfd20139056c391386597a7b3598856dd1e210212a1d3790c95bb3e56bfac578ab59479aef335ae48885ec48295fd510f80000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b';
    const serializedHex2 = '0x5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c';
    const serializedHexC = '0x24f3a54a1b754191b87333031b45fabfd20139056c391386597a7b3598856dd1e210212a1d3790c95bb3e56bfac578ab59479aef335ae48885ec48295fd510f80000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c';

    describe('deserialize', function () {
        it('get user ID', async function () {
            const orderData = await this.serializableOrder.getOrderUserIDMock.call(serializedHex1);
            orderData.should.be.bignumber.eq(userId);
        });

        it('get target token ID', async function () {
            const orderData = await this.serializableOrder.getOrderTokenIDBaseMock.call(serializedHex1);
            orderData.should.be.bignumber.eq(tokenIdBase);
        });

        it('get target amount', async function () {
            const orderData = await this.serializableOrder.getOrderAmountBaseMock.call(serializedHex1);
            orderData.should.be.bignumber.eq(amountBase);
        });

        it('get trade token ID', async function () {
            const orderData = await this.serializableOrder.getOrderTokenIDQuoteMock.call(serializedHex1);
            orderData.should.be.bignumber.eq(tokenIdQuote);
        });

        it('get trade amount', async function () {
            const orderData = await this.serializableOrder.getOrderAmountQuoteMock.call(serializedHex1);
            orderData.should.be.bignumber.eq(amountQuote);
        });

        it('is buy order', async function () {
            const orderData = await this.serializableOrder.isOrderBuyMock.call(serializedHex1);
            orderData.should.eq(true);
        });

        it('is main fee', async function () {
            const orderData = await this.serializableOrder.isOrderFeeMainMock.call(serializedHex1);
            orderData.should.eq(true);
        });

        it('get trade fee', async function () {
            const orderData = await this.serializableOrder.getOrderTradeFeeMock.call(serializedHex1);
            orderData.should.be.bignumber.eq(tradeFee);
        });

        it('get gas fee', async function () {
            const orderData = await this.serializableOrder.getOrderGasFeeMock.call(serializedHex1);
            orderData.should.be.bignumber.eq(gasFee);
        });

        it('get nonce', async function () {
            const orderData = await this.serializableOrder.getOrderNonceMock.call(serializedHex1);
            orderData.should.be.bignumber.eq(nonce);
        });

        it('get r', async function () {
            const orderData = await this.serializableOrder.getOrderRMock.call(serializedHex1);
            orderData.should.eq(r);
        });

        it('get s', async function () {
            const orderData = await this.serializableOrder.getOrderSMock.call(serializedHex1);
            orderData.should.eq(s);
        });

        it('get v', async function () {
            const orderData = await this.serializableOrder.getOrderVMock.call(serializedHex1);
            orderData.should.be.bignumber.eq(v);
        });

        it('get hash', async function () {
            const orderData = await this.serializableOrder.getOrderHashMock.call(serializedHex1);
            orderData.should.eq(hash);
        });

        it('get order', async function () {
            const orderData0 = await this.serializableOrder.getOrderMock.call(serializedHexC, 0);
            const orderData1 = await this.serializableOrder.getOrderMock.call(serializedHexC, 1);
            orderData0.should.eq(serializedHex1);
            orderData1.should.eq(serializedHex2);
        });
    });
});
