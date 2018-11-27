import ether from 'openzeppelin-solidity/test/helpers/ether';
import { increaseTimeTo, duration } from 'openzeppelin-solidity/test/helpers/increaseTime';
import latestTime from 'openzeppelin-solidity/test/helpers/latestTime';
import expectThrow from 'openzeppelin-solidity/test/helpers/expectThrow';
import { inLogs } from 'openzeppelin-solidity/test/helpers/expectEvent';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const SimpleToken = artifacts.require('SimpleToken');

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('Withdraw', function ([_, user, owner, tokenWallet, tokenContract]) {
    beforeEach(async function () {
        this.DinngoImpl = await Dinngo.new(tokenWallet, tokenContract, { from: owner });
        this.Dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.DinngoImpl.address, { from: owner });
    });
    const depositValue = ether(10);
    const exceed = ether(11);
    describe('ether', function () {
        beforeEach(async function () {
            await this.Dinngo.setUser(1, user, 1);
            await this.Dinngo.deposit({ value: depositValue, from: user });
        });

        it('when normal', async function () {
            const value = ether(1);
            await this.Dinngo.lock({ from: user });
            await increaseTimeTo(latestTime() + duration.days(3.1));
            const { logs } = await this.Dinngo.withdraw(value, { from: user });
            const event = await inLogs(logs, 'Withdraw');
            let balance = await this.Dinngo.balances.call(0, user);
            event.args.token.should.eq(ZERO_ADDRESS);
            event.args.user.should.eq(user);
            event.args.amount.should.be.bignumber.eq(value);
            event.args.balance.should.be.bignumber.eq(balance);
        });

        it('when user not locked', async function() {
            const value = ether(1);
            await expectThrow(this.Dinngo.withdraw(value, { from: user }));
        });

        it('when user not yet locked', async function() {
            const value = ether(1);
            await this.Dinngo.lock({ from: user });
            await increaseTimeTo(latestTime() + duration.days(1));
            await expectThrow(this.Dinngo.withdraw(value, { from: user }));
        });

        it('when value with amount 0', async function () {
            const value = ether(0);
            await this.Dinngo.lock({ from: user });
            await increaseTimeTo(latestTime() + duration.days(3.1));
            await expectThrow(this.Dinngo.withdraw(value, { from: user }));
        });

        it('when user balance is not sufficient', async function () {
            const value = ether(11);
            await this.Dinngo.lock({ from: user });
            await increaseTimeTo(latestTime() + duration.days(3.1));
            await expectThrow(this.Dinngo.withdraw(value, { from: user }));
        });

        it('when user is removed', async function () {
            const value = ether(1);
            await this.Dinngo.lock({ from: user });
            await increaseTimeTo(latestTime() + duration.days(3.1));
            await this.Dinngo.removeUser(user, { from: owner });
            await expectThrow(this.Dinngo.withdraw(value, { from: user }));
        });
    });
    describe('token', function () {
        beforeEach(async function () {
            this.Token = await SimpleToken.new({ from: user });
            await this.Dinngo.setUser(1, user, 1);
            await this.Token.approve(this.Dinngo.address, depositValue, { from: user });
            await this.Dinngo.depositToken(this.Token.address, depositValue, { from: user });
        });

        it('when normal', async function () {
            const value = ether(1);
            await this.Dinngo.lock({ from: user });
            await increaseTimeTo(latestTime() + duration.days(3.1));
            const { logs } = await this.Dinngo.withdrawToken(this.Token.address, value, { from: user });
            const event = await inLogs(logs, 'Withdraw');
            let balance = await this.Dinngo.balances.call(this.Token.address, user);
            event.args.token.should.eq(this.Token.address);
            event.args.user.should.eq(user);
            event.args.amount.should.be.bignumber.eq(value);
            event.args.balance.should.be.bignumber.eq(balance);
        });

        it('when user not locked', async function() {
            const value = ether(1);
            await expectThrow(this.Dinngo.withdrawToken(this.Token.address, value, { from: user }));
        });

        it('when user not yet locked', async function() {
            const value = ether(1);
            await this.Dinngo.lock({ from: user });
            await increaseTimeTo(latestTime() + duration.days(1));
            await expectThrow(this.Dinngo.withdrawToken(this.Token.address, value, { from: user }));
        });

        it('when token with address 0', async function () {
            const value = ether(1);
            await expectThrow(this.Dinngo.withdrawToken(ZERO_ADDRESS, value, { from: user }));
        });

        it('when token with amount 0', async function () {
            const value = ether(0);
            await expectThrow(this.Dinngo.withdrawToken(this.Token.address, value, { from: user }));
        });

        it('when user balance is not sufficient', async function () {
            const value = ether(11);
            await expectThrow(this.Dinngo.withdrawToken(this.Token.address, value, { from: user }));
        });

        it('when user is removed', async function () {
            const value = ether(1);
            await this.Dinngo.lock({ from: user });
            await increaseTimeTo(latestTime() + duration.days(3.1));
            await this.Dinngo.removeUser(user, { from: owner });
            await expectThrow(this.Dinngo.withdrawToken(this.Token.address, value, { from: user }));
        });
    });
});

contract('WithdrawAdmin', function ([_, user1, user2, owner, tokenWallet, tokenContract]) {
    beforeEach(async function() {
        this.DinngoImpl = await Dinngo.new(tokenWallet, tokenContract, { from: owner });
        this.Dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.DinngoImpl.address, { from: owner });
        await this.Dinngo.setUser(11, user1, 1);
        await this.Dinngo.setUser(12, user2, 1);
    });
    const BALANCE = ether(3)

    const user1ID = 11;
    const token1 = 0;
    const amount1 = ether(1);
    const fee1 = ether(0.001);
    const nonce1 = 1;
    const withdrawal1 = "0x723ee62931c50b28134e8dfa9360ba3628a3a958b3529f355eff7541e0699f1e7c951ccb051dc002650c64d267dcabfcea1a552119c900bce8d59651b4d9f51b0000000000000000000000000000000000000000000000000000038d7ea4c6800000000001010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b";

    const user2ID = 12;
    const token2 = 11;
    const amount2 = ether(2);
    const fee2 = ether(1);
    const nonce2 = 2;
    const withdrawal2 = "0x1a38f8dc02826cf210f7586c003a826432f3f5f9de0d90290a56fba81cbc6ec37d8e7629e2da8f3e4e077c4972e1906035d7fde9d4eef94b25fdc546d29079b3010000000000000000000000000000000000000000000000000de0b6b3a764000000000002000000000000000000000000000000000000000000000000001bc16d674ec80000000b0000000c";

    describe('ether', function () {
        it('when normal', async function () {
            await this.Dinngo.deposit({ from: user1, value: BALANCE });
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner });
            const event = await inLogs(logs, 'Withdraw');
            event.args.token.should.eq(ZERO_ADDRESS);
            event.args.user.should.eq(user1);
            event.args.amount.should.be.bignumber.eq(amount1);
            event.args.balance.should.be.bignumber.eq(BALANCE.minus(amount1).minus(fee1));
        });

        it('when normal count gas', async function () {
            await this.Dinngo.deposit({ from: user1, value: BALANCE });
            const receipt = await this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner });
            console.log(receipt.receipt.gasUsed);
        });

        it('when sent by non-owner', async function () {
            await this.Dinngo.deposit({ from: user1, value: BALANCE });
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal1));
        });

        it('when user balance is not sufficient', async function () {
            await this.Dinngo.deposit({ from: user1, value: amount1.minus(ether(0.1)) });
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner }));
        });

        it('when user is removed', async function() {
            await this.Dinngo.deposit({ from: user1, value: BALANCE });
            await this.Dinngo.removeUser(user1, { from: owner });
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner }));
        });

        it('when fee is paid in ETH', async function () {
            await this.Dinngo.deposit({ from: user1, value: BALANCE });
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner });
            const event = await inLogs(logs, 'Withdraw');
            event.args.token.should.eq(ZERO_ADDRESS);
            event.args.user.should.eq(user1);
            event.args.amount.should.be.bignumber.eq(amount1);
            event.args.balance.should.be.bignumber.eq(BALANCE.minus(amount1).minus(fee1));
        });

        it('when fee is insufficient', async function () {
            await this.Dinngo.deposit({ from: user1, value: ether(1) });
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner }));
        });
    });

    describe('token', function () {
        beforeEach(async function () {
            this.Token = await SimpleToken.new({ from: user2 });
            await this.Dinngo.setToken(11, this.Token.address, 1)
        });

        it('when normal', async function () {
            await this.Token.approve(this.Dinngo.address, BALANCE, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, BALANCE, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, BALANCE);
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal2, { from: owner });
            const event = await inLogs(logs, 'Withdraw');
            event.args.token.should.eq(this.Token.address);
            event.args.user.should.eq(user2);
            event.args.amount.should.be.bignumber.eq(amount2);
            event.args.balance.should.be.bignumber.eq(BALANCE.minus(amount2));
        });

        it('when normal count gas', async function () {
            await this.Token.approve(this.Dinngo.address, BALANCE, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, BALANCE, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, BALANCE);
            const receipt = await this.Dinngo.withdrawByAdmin(withdrawal2, { from: owner });
            console.log(receipt.receipt.gasUsed);
        });

        it('when sent by non-owner', async function () {
            await this.Token.approve(this.Dinngo.address, BALANCE, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, BALANCE, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, BALANCE);
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal2));
        });

        it('when user balance is not sufficient', async function () {
            let amount = amount2.minus(ether(0.1));
            await this.Token.approve(this.Dinngo.address, amount, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, amount, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, BALANCE);
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal2, { from: owner }));
        });

        it('when user is removed', async function() {
            await this.Token.approve(this.Dinngo.address, BALANCE, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, BALANCE, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, BALANCE);
            await this.Dinngo.removeUser(user2, { from: owner });
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal2, { from: owner }));
        });

        it('when fee is paid in DGO', async function () {
            await this.Token.approve(this.Dinngo.address, BALANCE, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, BALANCE, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, BALANCE);
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal2, { from: owner });
            const event = await inLogs(logs, 'Withdraw');
            event.args.token.should.eq(this.Token.address);
            event.args.user.should.eq(user2);
            event.args.amount.should.be.bignumber.eq(amount2);
            event.args.balance.should.be.bignumber.eq(BALANCE.minus(amount2));
            let balance = await this.Dinngo.balances.call(tokenContract, user2);
            balance.should.be.bignumber.eq(BALANCE.minus(fee2));
        });

        it('when fee is insufficient', async function () {
            await this.Token.approve(this.Dinngo.address, BALANCE, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, BALANCE, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, ether(0.0001));
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal2, { from: owner }));
        });
    });
});
