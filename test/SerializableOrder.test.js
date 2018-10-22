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
    const userAddress = "0x627306090abab3a6e1400e9345bc60c78a8bef57";
    const mainToken = 0;
    const subToken = 11;
    const mainAmount = ether(3);
    const subAmount = ether(100);
    const config = 1;
    const feePrice = 10;
    const nonce = 1;
    const r = "0xdbc2b281c271363b56d54f448ceb6ed8dd4df17534cde8d31b5fe9bb4be00ffd";
    const s = "0x53a433772f03b5eec7d04a51454cf7bde16e0cd1c39595b96f6a22919e4d524f";
    const v = "0x00";
    const hash = "0xa1179f9c81f330f47cbde5e73ff87a87c1195bc5a056dad4df90b3ff3844ca71";
    const ser_hex_0 = "0x53a433772f03b5eec7d04a51454cf7bde16e0cd1c39595b96f6a22919e4d524fdbc2b281c271363b56d54f448ceb6ed8dd4df17534cde8d31b5fe9bb4be00ffd00000000000000000000000000000000000000000000000000000000000000000a00000001010000000000000000000000000000000000000000000000056bc75e2d63100000000b00000000000000000000000000000000000000000000000029a2241af62c000000000000000b";
    const ser_hex_1 = "0x1eac339001c458855fc4a6b41212bf3f590507f8eb1cf251d3c0445b9a94dff888a8db71e4b326496be169cb18c95df1d5456a2a8718713a4a0a57a5a159ebe20100000000000000000000000000000000000000000000000000000000000027100000000202000000000000000000000000000000000000000000000004563918244f400000000b00000000000000000000000000000000000000000000000014d1120d7b16000000000000000c";
    const ser_hex_2 = "0x53a433772f03b5eec7d04a51454cf7bde16e0cd1c39595b96f6a22919e4d524fdbc2b281c271363b56d54f448ceb6ed8dd4df17534cde8d31b5fe9bb4be00ffd00000000000000000000000000000000000000000000000000000000000000000a00000001010000000000000000000000000000000000000000000000056bc75e2d63100000000b00000000000000000000000000000000000000000000000029a2241af62c000000000000000b1eac339001c458855fc4a6b41212bf3f590507f8eb1cf251d3c0445b9a94dff888a8db71e4b326496be169cb18c95df1d5456a2a8718713a4a0a57a5a159ebe20100000000000000000000000000000000000000000000000000000000000027100000000202000000000000000000000000000000000000000000000004563918244f400000000b00000000000000000000000000000000000000000000000014d1120d7b16000000000000000c";

    describe('serialize', function() {
        it('normal order', async function() {
            let ser_data = await this.SerializableOrder.serializeOrder.call(
                userID,
                mainToken,
                mainAmount,
                subToken,
                subAmount,
                config,
                feePrice,
                nonce,
                r,
                s,
                v
            );
            ser_data.should.eq(ser_hex_0);
        });
    });

    describe('deserialize', function() {
        it('normal hex', async function() {
            let order_data = await this.SerializableOrder.deserializeOrder.call(ser_hex_0);
            order_data[0].should.be.bignumber.eq(userID);
            order_data[1].should.be.bignumber.eq(mainToken);
            order_data[2].should.be.bignumber.eq(mainAmount);
            order_data[3].should.be.bignumber.eq(subToken);
            order_data[4].should.be.bignumber.eq(subAmount);
            order_data[5].should.be.bignumber.eq(config);
            order_data[6].should.be.bignumber.eq(feePrice);
            order_data[7].should.be.bignumber.eq(nonce);
            order_data[8].should.eq(r);
            order_data[9].should.eq(s);
            order_data[10].should.be.bignumber.eq(v);
        });

        it('get user ID', async function() {
            let order_data = await this.SerializableOrder.getUserIDMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(userID);
        });

        it('get main token ID', async function() {
            let order_data = await this.SerializableOrder.getTokenMainMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(mainToken);
        });

        it('get main amount', async function() {
            let order_data = await this.SerializableOrder.getAmountMainMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(mainAmount);
        });

        it('get sub token ID', async function() {
            let order_data = await this.SerializableOrder.getTokenSubMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(subToken);
        });

        it('get sub amount', async function() {
            let order_data = await this.SerializableOrder.getAmountSubMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(subAmount);
        });

        it('is buy order', async function() {
            let order_data = await this.SerializableOrder.isBuyMock.call(ser_hex_0);
            order_data.should.eq(true);
        });

        it('is main fee', async function() {
            let order_data = await this.SerializableOrder.isMainMock.call(ser_hex_0);
            order_data.should.eq(false);
        });

        it('get fee price', async function() {
            let order_data = await this.SerializableOrder.getFeePriceMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(feePrice);
        });

        it('get nonce', async function() {
            let order_data = await this.SerializableOrder.getNonceMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(nonce);
        });

        it('get r', async function() {
            let order_data = await this.SerializableOrder.getRMock.call(ser_hex_0);
            order_data.should.eq(r);
        });

        it('get s', async function() {
            let order_data = await this.SerializableOrder.getSMock.call(ser_hex_0);
            order_data.should.eq(s);
        });

        it('get v', async function() {
            let order_data = await this.SerializableOrder.getVMock.call(ser_hex_0);
            order_data.should.be.bignumber.eq(v);
        });

        it('get hash', async function() {
            let order_data = await this.SerializableOrder.getHashMock.call(ser_hex_0);
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
