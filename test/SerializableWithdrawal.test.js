const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const SerializableWithdrawalMock = artifacts.require('SerializableWithdrawalMock');

contract('SerializableWithdrawal', function ([_, user1]) {
    beforeEach(async function () {
        this.SerializableWithdrawal = await SerializableWithdrawalMock.new();
    });
    const userId = new BN('11');
    const tokenId = new BN('0');
    const amount = ether('1');
    const config = new BN('1');
    const fee = ether('0.001');
    const nonce = new BN('1');
    const r = '0x7c951ccb051dc002650c64d267dcabfcea1a552119c900bce8d59651b4d9f51b';
    const s = '0x723ee62931c50b28134e8dfa9360ba3628a3a958b3529f355eff7541e0699f1e';
    const v = new BN('0');
    const hash = '0xdab6521870251314f0ee238e25d5d159f5ea8e774220860db80eb4f03c0c0abb';
    const serializedHex = '0x723ee62931c50b28134e8dfa9360ba3628a3a958b3529f355eff7541e0699f1e7c951ccb051dc002650c64d267dcabfcea1a552119c900bce8d59651b4d9f51b0000000000000000000000000000000000000000000000000000038d7ea4c6800000000001010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b';

    describe('deserialize', function () {
        it('get user ID', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalUserIDMock.call(serializedHex);
            withdrawalData.should.be.bignumber.eq(userId);
        });

        it('get token ID', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalTokenIDMock.call(serializedHex);
            withdrawalData.should.be.bignumber.eq(tokenId);
        });

        it('get amount', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalAmountMock.call(serializedHex);
            withdrawalData.should.be.bignumber.eq(amount);
        });

        it('is fee ETH', async function () {
            const withdrawalData = await this.SerializableWithdrawal.isWithdrawalFeeETHMock.call(serializedHex);
            withdrawalData.should.eq(true);
        });

        it('get fee amount', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalFeeMock.call(serializedHex);
            withdrawalData.should.be.bignumber.eq(fee);
        });

        it('get nonce', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalNonceMock.call(serializedHex);
            withdrawalData.should.be.bignumber.eq(nonce);
        });

        it('get r', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalRMock.call(serializedHex);
            withdrawalData.should.eq(r);
        });

        it('get s', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalSMock.call(serializedHex);
            withdrawalData.should.eq(s);
        });

        it('get v', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalVMock.call(serializedHex);
            withdrawalData.should.be.bignumber.eq(v);
        });

        it('get hash', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalHashMock.call(serializedHex);
            withdrawalData.should.eq(hash);
        });
    });
});
