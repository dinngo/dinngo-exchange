import { ether } from 'openzeppelin-solidity/test/helpers/ether';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const SerializableWithdrawalMock = artifacts.require('SerializableWithdrawalMock');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('SerializableWithdrawal', function([_, user1]) {
    beforeEach(async function() {
        this.SerializableWithdrawal = await SerializableWithdrawalMock.new();
    });
    const userID = 11;
    const token = 0;
    const amount = ether(1);
    const config = 1;
    const fee = ether(0.001);
    const nonce = 1;
    const r = "0x7c951ccb051dc002650c64d267dcabfcea1a552119c900bce8d59651b4d9f51b";
    const s = "0x723ee62931c50b28134e8dfa9360ba3628a3a958b3529f355eff7541e0699f1e";
    const v = "0x00";
    const hash = "0xdab6521870251314f0ee238e25d5d159f5ea8e774220860db80eb4f03c0c0abb";
    const ser_hex = "0x723ee62931c50b28134e8dfa9360ba3628a3a958b3529f355eff7541e0699f1e7c951ccb051dc002650c64d267dcabfcea1a552119c900bce8d59651b4d9f51b0000000000000000000000000000000000000000000000000000038d7ea4c6800000000001010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b";

    describe('deserialize', function() {
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
            let withdrawal_data = await this.SerializableWithdrawal.isWithdrawalFeeETHMock.call(ser_hex);
            withdrawal_data.should.eq(true);
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
