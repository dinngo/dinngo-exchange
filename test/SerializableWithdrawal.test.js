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
    const token1 = 0;
    const token2 = 11;
    const amount1 = ether(23);
    const amount2 = ether(43);
    const config = 1;
    const fee1 = ether(0.1);
    const nonce = 17;
    const r = "0x2ff29230014283c7b30f7edaa75cb8b4f397fbc6fd438acdfabed16330f9fb6d";
    const s = "0x5216167f7eb4f43cdfa1a094b1525ff00ec19d8fd33fef5383cb553f56f8c61c";
    const v = "0x01"
    const hash1 = "0x3bd2ae27858cf841bfd91fc08edf7e2e786e82f7ea955d76bd7cb5d281eddb0d";
    const ser_hex = "0x5216167f7eb4f43cdfa1a094b1525ff00ec19d8fd33fef5383cb553f56f8c61c2ff29230014283c7b30f7edaa75cb8b4f397fbc6fd438acdfabed16330f9fb6d01000000000000000000000000000000000000000000000000016345785d8a000000000011010000000000000000000000000000000000000000000000013f306a2409fc000000000000000b";


    describe('serialize', function() {
        it('normal withdrawal', async function() {
            let ser_data = await this.SerializableWithdrawal.serializeWithdrawal.call(
                userID,
                token1,
                amount1,
                config,
                fee1,
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
            withdrawal_data[1].should.be.bignumber.eq(token1);
            withdrawal_data[2].should.be.bignumber.eq(amount1);
            withdrawal_data[3].should.be.bignumber.eq(config);
            withdrawal_data[4].should.be.bignumber.eq(fee1);
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
            withdrawal_data.should.be.bignumber.eq(token1);
        });

        it('get amount', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.getWithdrawalAmountMock.call(ser_hex);
            withdrawal_data.should.be.bignumber.eq(amount1);
        });

        it('is fee ETH', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.isWithdrawalETHMock.call(ser_hex);
            withdrawal_data.should.eq(true);
        });

        it('get fee amount', async function() {
            let withdrawal_data = await this.SerializableWithdrawal.getWithdrawalFeeMock.call(ser_hex);
            withdrawal_data.should.be.bignumber.eq(fee1);
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
            withdrawal_data.should.eq(hash1);
        });

    });
});
