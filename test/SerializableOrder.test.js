import ether from 'openzeppelin-solidity/test/helpers/ether';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const SerializableOrderMock = artifacts.require('SerializableOrderMock');
const DinngoMock = artifacts.require('DinngoMock');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('SerializableOrder', function([_, user]) {
    beforeEach(async function() {
        this.SerializableOrder = await SerializableOrderMock.new();
    });
    const userID = 1;
    const userAddress = "0x627306090abab3a6e1400e9345bc60c78a8bef57";
    const token1 = 123;
    const token2 = 321;
    const amount1 = ether(23);
    const amount2 = ether(43);
    const config = 1;
    const amount3 = 2000;
    const nonce = 17;
    const r = "0x4d7d48db3242b9029d8ae67f5c86fafffd8a2168fc5aa6071e55c504d55a678e";
    const s = "0x690cb3cbd35a82fa20d98c45ada097dc07f7235174ea6bf0efb12f9359cca96b";
    const v = "0x00"
    const hash = "0x9e88ff67c7885b471e842df3323bae08b8c7025137902e6649a828026c46f3da";
    const ser_hex_0 = "0x690cb3cbd35a82fa20d98c45ada097dc07f7235174ea6bf0efb12f9359cca96b4d7d48db3242b9029d8ae67f5c86fafffd8a2168fc5aa6071e55c504d55a678e0000000000000000000000000000000000000000000000000000000000000007d0000000110100000000000000000000000000000000000000000000000254beb02d1dcc000001410000000000000000000000000000000000000000000000013f306a2409fc0000007b00000001";
    const ser_hex_1 = "0x587611b537430c6e0b5598d2edbf84e8920322923cee2b7366c19e95700415dfca045276abe56c06da3c47f70c863d35500775ab124dc72464b255ec939f6a2b0100000000000000000000000000000000000000000000000000000000000003e80000000a020000000000000000000000000000000000000000000000009f98351204fe0000007b0000000000000000000000000000000000000000000000012a5f58168ee60000014100000002";
    const ser_hex_2 = "0x690cb3cbd35a82fa20d98c45ada097dc07f7235174ea6bf0efb12f9359cca96b4d7d48db3242b9029d8ae67f5c86fafffd8a2168fc5aa6071e55c504d55a678e0000000000000000000000000000000000000000000000000000000000000007d0000000110100000000000000000000000000000000000000000000000254beb02d1dcc000001410000000000000000000000000000000000000000000000013f306a2409fc0000007b00000001587611b537430c6e0b5598d2edbf84e8920322923cee2b7366c19e95700415dfca045276abe56c06da3c47f70c863d35500775ab124dc72464b255ec939f6a2b0100000000000000000000000000000000000000000000000000000000000003e80000000a020000000000000000000000000000000000000000000000009f98351204fe0000007b0000000000000000000000000000000000000000000000012a5f58168ee60000014100000002";

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

contract('Dinngo', function([_, user, owner, tokenWallet, tokenContract]) {
    beforeEach(async function() {
        this.Dinngo = await DinngoMock.new(tokenWallet, tokenContract, { from: owner });
    });
    const userID = 1;
    const userAddress = "0x627306090abab3a6e1400e9345bc60c78a8bef57";
    const token1 = 123;
    const token2 = 321;
    const amount1 = ether(23);
    const amount2 = ether(43);
    const config = 1;
    const amount3 = 2000;
    const nonce = 17;
    const r = "0x4d7d48db3242b9029d8ae67f5c86fafffd8a2168fc5aa6071e55c504d55a678e";
    const s = "0x690cb3cbd35a82fa20d98c45ada097dc07f7235174ea6bf0efb12f9359cca96b";
    const v = "0x00";
    const ser_hex_0 = "0x690cb3cbd35a82fa20d98c45ada097dc07f7235174ea6bf0efb12f9359cca96b4d7d48db3242b9029d8ae67f5c86fafffd8a2168fc5aa6071e55c504d55a678e0000000000000000000000000000000000000000000000000000000000000007d0000000110100000000000000000000000000000000000000000000000254beb02d1dcc000001410000000000000000000000000000000000000000000000013f306a2409fc0000007b00000001";

    describe('deserialize', function() {
        it('normal hex', async function() {
            await this.Dinngo.addUserMock(userAddress);
            let order_data = await this.Dinngo.deserializeOrder.call(ser_hex_0);
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
    });
});
