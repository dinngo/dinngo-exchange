import ether from 'openzeppelin-solidity/test/helpers/ether';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const SerializableOrderMock = artifacts.require('SerializableOrderMock');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('SerializableOrder', function([_, user]) {
    beforeEach(async function() {
        this.SerializableOrder = await SerializableOrderMock.new();
    });
    const userID = 11;
    const userAddress = user;
    const tokenIDTarget = 0;
    const tokenIDTrade = 11;
    const amountTarget = ether(1);
    const amountTrade = ether(100);
    const config = 3;
    const tradeFee = ether(1);
    const gasFee = ether(0.001);
    const nonce = 1;
    const r = "0xe210212a1d3790c95bb3e56bfac578ab59479aef335ae48885ec48295fd510f8";
    const s = "0x24f3a54a1b754191b87333031b45fabfd20139056c391386597a7b3598856dd1";
    const v = "0x00";
    const hash = "0xae69a2185ebf1d3685a0a00cb9c7b46cdfe21531593102afbfaf6e50b81b8599";
    const ser_hex_0 = "0x24f3a54a1b754191b87333031b45fabfd20139056c391386597a7b3598856dd1e210212a1d3790c95bb3e56bfac578ab59479aef335ae48885ec48295fd510f80000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b";
    const ser_hex_1 = "0x5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c";
    const ser_hex_2 = "0x24f3a54a1b754191b87333031b45fabfd20139056c391386597a7b3598856dd1e210212a1d3790c95bb3e56bfac578ab59479aef335ae48885ec48295fd510f80000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c";

    describe('deserialize', function() {
        it('get user ID', async function() {
            let order_data = await this.SerializableOrder.getOrderUserIDMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(userID);
        });

        it('get target token ID', async function() {
            let order_data = await this.SerializableOrder.getOrderTokenIDTargetMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(tokenIDTarget);
        });

        it('get target amount', async function() {
            let order_data = await this.SerializableOrder.getOrderAmountTargetMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(amountTarget);
        });

        it('get trade token ID', async function() {
            let order_data = await this.SerializableOrder.getOrderTokenIDTradeMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(tokenIDTrade);
        });

        it('get trade amount', async function() {
            let order_data = await this.SerializableOrder.getOrderAmountTradeMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(amountTrade);
        });

        it('is buy order', async function() {
            let order_data = await this.SerializableOrder.isOrderBuyMock.call(ser_hex_0);
            order_data.should.eq(true);
        });

        it('is main fee', async function() {
            let order_data = await this.SerializableOrder.isOrderFeeMainMock.call(ser_hex_0);
            order_data.should.eq(true);
        });

        it('get trade fee', async function() {
            let order_data = await this.SerializableOrder.getOrderTradeFeeMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(tradeFee);
        });

        it('get gas fee', async function() {
            let order_data = await this.SerializableOrder.getOrderGasFeeMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(gasFee);
        });

        it('get nonce', async function() {
            let order_data = await this.SerializableOrder.getOrderNonceMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(nonce);
        });

        it('get r', async function() {
            let order_data = await this.SerializableOrder.getOrderRMock.call(ser_hex_0);
            order_data.should.eq(r);
        });

        it('get s', async function() {
            let order_data = await this.SerializableOrder.getOrderSMock.call(ser_hex_0);
            order_data.should.eq(s);
        });

        it('get v', async function() {
            let order_data = await this.SerializableOrder.getOrderVMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(v);
        });

        it('get hash', async function() {
            let order_data = await this.SerializableOrder.getOrderHashMock.call(ser_hex_0);
            order_data.should.eq(hash);
        });

        it('get order', async function() {
            let order_data = await this.SerializableOrder.getOrderMock.call(ser_hex_2, 0);
            order_data.should.eq(ser_hex_0);
            order_data = await this.SerializableOrder.getOrderMock.call(ser_hex_2, 1);
            order_data.should.eq(ser_hex_1);
        });

    });
});
