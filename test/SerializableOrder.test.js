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
    const token1 = 0;
    const token2 = 11;
    const amount1 = ether(23);
    const amount2 = ether(43);
    const config = 1;
    const amount3 = 2000;
    const nonce = 17;
    const r = "0xb3b5ac4d8911c21371e6206d8ef790be1861aa819c6b802a2ebd849e9e214a86";
    const s = "0x0a6dc56354ded2afa70070011218247d8ee31ae796925025d45dd7f15e5ffdc2";
    const v = "0x01"
    const hash = "0x30fb1686eefe31b098fb1e2e418ceeffe3b3a5effbf5a50cd1483e420244a6c7";
    const ser_hex_0 = "0x0a6dc56354ded2afa70070011218247d8ee31ae796925025d45dd7f15e5ffdc2b3b5ac4d8911c21371e6206d8ef790be1861aa819c6b802a2ebd849e9e214a860100000000000000000000000000000000000000000000000000000000000007d0000000110100000000000000000000000000000000000000000000000254beb02d1dcc0000000b0000000000000000000000000000000000000000000000013f306a2409fc000000000000000b";
    const ser_hex_1 = "0x75f47c89a6031ea52f092f0ae79f44489ad462a1513d24ffa10f5efde1b797ba46b4a6fb4f1efc688f6b461825dd686fa19f8cbb014ab8e33e88a220c23eb5e80000000000000000000000000000000000000000000000000000000000000003e80000000a020000000000000000000000000000000000000000000000012a5f58168ee60000000b0000000000000000000000000000000000000000000000009f98351204fe000000000000000c";
    const ser_hex_2 = "0x0a6dc56354ded2afa70070011218247d8ee31ae796925025d45dd7f15e5ffdc2b3b5ac4d8911c21371e6206d8ef790be1861aa819c6b802a2ebd849e9e214a860100000000000000000000000000000000000000000000000000000000000007d0000000110100000000000000000000000000000000000000000000000254beb02d1dcc0000000b0000000000000000000000000000000000000000000000013f306a2409fc000000000000000b75f47c89a6031ea52f092f0ae79f44489ad462a1513d24ffa10f5efde1b797ba46b4a6fb4f1efc688f6b461825dd686fa19f8cbb014ab8e33e88a220c23eb5e80000000000000000000000000000000000000000000000000000000000000003e80000000a020000000000000000000000000000000000000000000000012a5f58168ee60000000b0000000000000000000000000000000000000000000000009f98351204fe000000000000000c";

    describe('serialize', function() {
        it('normal order', async function() {
            let ser_data = await this.SerializableOrder.serializeOrder.call(
                userID,
                token1,
                amount1,
                token2,
                amount2,
                config,
                amount3,
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
            order_data[1].should.be.bignumber.eq(token1);
            order_data[2].should.be.bignumber.eq(amount1);
            order_data[3].should.be.bignumber.eq(token2);
            order_data[4].should.be.bignumber.eq(amount2);
            order_data[5].should.be.bignumber.eq(config);
            order_data[6].should.be.bignumber.eq(amount3);
            order_data[7].should.be.bignumber.eq(nonce);
            order_data[8].should.eq(r);
            order_data[9].should.eq(s);
            order_data[10].should.be.bignumber.eq(v);
        });

        it('get user ID', async function() {
            let order_data = await this.SerializableOrder.getUserID.call(ser_hex_0);
            order_data.should.be.bignumber.eq(userID);
        });

        it('get main token ID', async function() {
            let order_data = await this.SerializableOrder.getTokenMain.call(ser_hex_0);
            order_data.should.be.bignumber.eq(token1);
        });

        it('get main amount', async function() {
            let order_data = await this.SerializableOrder.getAmountMain.call(ser_hex_0);
            order_data.should.be.bignumber.eq(amount1);
        });

        it('get sub token ID', async function() {
            let order_data = await this.SerializableOrder.getTokenSub.call(ser_hex_0);
            order_data.should.be.bignumber.eq(token2);
        });

        it('get sub amount', async function() {
            let order_data = await this.SerializableOrder.getAmountSub.call(ser_hex_0);
            order_data.should.be.bignumber.eq(amount2);
        });

        it('get config', async function() {
            let order_data = await this.SerializableOrder.getConfig.call(ser_hex_0);
            order_data.should.be.bignumber.eq(config);
        });

        it('is buy order', async function() {
            let order_data = await this.SerializableOrder.isBuy.call(ser_hex_0);
            order_data.should.eq(true);
        });

        it('is main fee', async function() {
            let order_data = await this.SerializableOrder.isMain.call(ser_hex_0);
            order_data.should.eq(false);
        });

        it('get fee price', async function() {
            let order_data = await this.SerializableOrder.getFeePrice.call(ser_hex_0);
            order_data.should.be.bignumber.eq(amount3);
        });

        it('get nonce', async function() {
            let order_data = await this.SerializableOrder.getNonce.call(ser_hex_0);
            order_data.should.be.bignumber.eq(nonce);
        });

        it('get r', async function() {
            let order_data = await this.SerializableOrder.getR.call(ser_hex_0);
            order_data.should.eq(r);
        });

        it('get s', async function() {
            let order_data = await this.SerializableOrder.getS.call(ser_hex_0);
            order_data.should.eq(s);
        });

        it('get v', async function() {
            let order_data = await this.SerializableOrder.getV.call(ser_hex_0);
            order_data.should.be.bignumber.eq(v);
        });

        it('get hash', async function() {
            let order_data = await this.SerializableOrder.getHash.call(ser_hex_0);
            order_data.should.eq(hash);
        });

        it('get order', async function() {
            let order_data = await this.SerializableOrder.getOrder.call(ser_hex_2, 0);
            order_data.should.eq(ser_hex_0);
            order_data = await this.SerializableOrder.getOrder.call(ser_hex_2, 1);
            order_data.should.eq(ser_hex_1);
        });

    });
});
