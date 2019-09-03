const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

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
    const sig = '0x7c951ccb051dc002650c64d267dcabfcea1a552119c900bce8d59651b4d9f51b723ee62931c50b28134e8dfa9360ba3628a3a958b3529f355eff7541e0699f1e00';
    const hash = '0xdab6521870251314f0ee238e25d5d159f5ea8e774220860db80eb4f03c0c0abb';
    const serializedHex = '0x00000000000000000000000000000000000000000000000000038d7ea4c6800000000001010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b';

    describe('deserialize', function () {
        it('get user ID', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalUserIDMock.call(serializedHex);
            expect(withdrawalData).to.be.bignumber.eq(userId);
        });

        it('get token ID', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalTokenIDMock.call(serializedHex);
            expect(withdrawalData).to.be.bignumber.eq(tokenId);
        });

        it('get amount', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalAmountMock.call(serializedHex);
            expect(withdrawalData).to.be.bignumber.eq(amount);
        });

        it('is fee ETH', async function () {
            const withdrawalData = await this.SerializableWithdrawal.isWithdrawalFeeETHMock.call(serializedHex);
            expect(withdrawalData).to.eq(true);
        });

        it('get fee amount', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalFeeMock.call(serializedHex);
            expect(withdrawalData).to.be.bignumber.eq(fee);
        });

        it('get nonce', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalNonceMock.call(serializedHex);
            expect(withdrawalData).to.be.bignumber.eq(nonce);
        });

        it('get hash', async function () {
            const withdrawalData = await this.SerializableWithdrawal.getWithdrawalHashMock.call(serializedHex);
            expect(withdrawalData).to.eq(hash);
        });
    });
});
