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
    const userID = 323;
    const userAddress = 0x627306090abab3a6e1400e9345bc60c78a8bef57;
    const token1 = 123;
    const token2 = 321;
    const amount1 = ether(23);
    const amount2 = ether(43);
    const amount3 = 2000;
    const fee = 1;
    const nonce = 17;
    const r = "0xbc0d6e379e0dabce205aa6c599ac8b9fcb04c39007f7b988d013e535c4496120";
    const s = "0x0ad5694d7af2dab7bc9283fa9944af162f6fa880dad299b780958a99581a7120";
    const v = "0x01";
    const ser_hex = "0x0ad5694d7af2dab7bc9283fa9944af162f6fa880dad299b780958a99581a7120bc0d6e379e0dabce205aa6c599ac8b9fcb04c39007f7b988d013e535c44961200100000000000000000000000000000000000000000000000000000000000007d0000000110100000000000000000000000000000000000000000000000254beb02d1dcc000001410000000000000000000000000000000000000000000000013f306a2409fc0000007b00000143";

    describe('serialize', function() {
        it('normal order', async function() {
            let ser_data = await this.SerializableOrder.serializeOrder.call(
                userID,
                token1,
                amount1,
                token2,
                amount2,
                fee,
                amount3,
                nonce,
                r,
                s,
                v
            );
            ser_data.should.eq(ser_hex);
        });
    });

    describe('deserialize', function() {
        it('normal hex', async function() {
            let order_data = await this.SerializableOrder.deserializeOrder.call(ser_hex);
            order_data[0].should.be.bignumber.eq(userID);
            order_data[1].should.be.bignumber.eq(token1);
            order_data[2].should.be.bignumber.eq(amount1);
            order_data[3].should.be.bignumber.eq(token2);
            order_data[4].should.be.bignumber.eq(amount2);
            order_data[5].should.be.bignumber.eq(fee);
            order_data[6].should.be.bignumber.eq(amount3);
            order_data[7].should.be.bignumber.eq(nonce);
            order_data[8].should.eq(r);
            order_data[9].should.eq(s);
            order_data[10].should.be.bignumber.eq(v);
        });
    });
});
