import ether from 'openzeppelin-solidity/test/helpers/ether';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const SerializableWithdrawalMock = artifacts.require('SerializableWithdrawalMock');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('SerializableWithdrawal', function([_, user]) {
    beforeEach(async function() {
        this.SerializableWithdrawal = await SerializableWithdrawalMock.new();
    });
    const userID = 11;
    const userAddress = "0x627306090abab3a6e1400e9345bc60c78a8bef57";
    const token = 11;
    const amount = ether(3);
    const config = 0;
    const fee = ether(0.01);
    const nonce = 3;
    const r = "0xff082cf088f83143f4c81253d8e1f0a4b67be4c0036fcc96fce640b8a6bfbfad";
    const s = "0x11327a5d4c094374f596d51b2edfd3461acb31e0c2e3395eb94d51912116e2b7";
    const v = "0x01";
    const hash = "0xc73b805a44ca67043d0eb99234ced3032c0ac658232bf3b8e60b5fd641f13f63";
    const ser_hex = "0x11327a5d4c094374f596d51b2edfd3461acb31e0c2e3395eb94d51912116e2b7ff082cf088f83143f4c81253d8e1f0a4b67be4c0036fcc96fce640b8a6bfbfad01000000000000000000000000000000000000000000000000002386f26fc10000000000030000000000000000000000000000000000000000000000000029a2241af62c0000000b0000000b";

    describe('serialize', function() {
        it('normal withdrawal', async function() {
            let ser_data = await this.SerializableWithdrawal.serializeWithdrawal.call(
                userID,
                token,
                amount,
                config,
                fee,
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
            let withdrawal_data = await this.SerializableWithdrawal.deserializeWithdrawal.call(ser_hex);
            withdrawal_data[0].should.be.bignumber.eq(userID);
            withdrawal_data[1].should.be.bignumber.eq(token);
            withdrawal_data[2].should.be.bignumber.eq(amount);
            withdrawal_data[3].should.be.bignumber.eq(config);
            withdrawal_data[4].should.be.bignumber.eq(fee);
            withdrawal_data[5].should.be.bignumber.eq(nonce);
            withdrawal_data[6].should.eq(r);
            withdrawal_data[7].should.eq(s);
            withdrawal_data[8].should.be.bignumber.eq(v);
        });

        it('get user ID', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.getWithdrawalUserIDMock.call(ser_hex);
            withdrawal_data.should.be.bignumber.eq(userID);
        });

        it('get token ID', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.getWithdrawalTokenIDMock.call(ser_hex);
            withdrawal_data.should.be.bignumber.eq(token);
        });

        it('get amount', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.getWithdrawalAmountMock.call(ser_hex);
            withdrawal_data.should.be.bignumber.eq(amount);
        });

        it('is fee ETH', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.isWithdrawalETHMock.call(ser_hex);
            withdrawal_data.should.eq(false);
        });

        it('get fee amount', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.getWithdrawalFeeMock.call(ser_hex);
            withdrawal_data.should.be.bignumber.eq(fee);
        });

        it('get nonce', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.getWithdrawalNonceMock.call(ser_hex);
            withdrawal_data.should.be.bignumber.eq(nonce);
        });

        it('get r', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.getWithdrawalRMock.call(ser_hex);
            withdrawal_data.should.eq(r);
        });

        it('get s', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.getWithdrawalSMock.call(ser_hex);
            withdrawal_data.should.eq(s);
        });

        it('get v', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.getWithdrawalVMock.call(ser_hex);
            withdrawal_data.should.be.bignumber.eq(v);
        });

        it('get hash', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.getWithdrawalHashMock.call(ser_hex);
            withdrawal_data.should.eq(hash);
        });

    });
});
