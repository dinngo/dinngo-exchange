const { constants, ether, expectEvent, shouldFail, time } = require('openzeppelin-test-helpers');
const { duration, increase } = time;
const { inLogs } = expectEvent;
const { reverting } = shouldFail;
const { ZERO_ADDRESS } = constants;

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const SimpleToken = artifacts.require('SimpleToken');

contract('Withdraw', function ([_, user, owner, tokenWallet, tokenContract]) {
    beforeEach(async function () {
        this.DinngoImpl = await Dinngo.new();
        this.Dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.DinngoImpl.address, { from: owner });
    });
    const depositValue = ether('10');
    const exceed = ether('11');
    describe('ether', function () {
        beforeEach(async function () {
            await this.Dinngo.setUser('1', user, '1');
            await this.Dinngo.deposit({ value: depositValue, from: user });
        });

        it('when normal', async function () {
            const value = ether('1');
            await this.Dinngo.lock({ from: user });
            await increase(duration.days('90.1'));
            const { logs } = await this.Dinngo.withdraw(value, { from: user });
            const event = await inLogs(logs, 'Withdraw');
            let balance = await this.Dinngo.balances.call(ZERO_ADDRESS, user);
            event.args.token.should.eq(ZERO_ADDRESS);
            event.args.user.should.eq(user);
            event.args.amount.should.be.bignumber.eq(value);
            event.args.balance.should.be.bignumber.eq(balance);
        });

        it('when user not locked', async function () {
            const value = ether('1');
            await reverting(this.Dinngo.withdraw(value, { from: user }));
        });

        it('when user not yet locked', async function () {
            const value = ether('1');
            await this.Dinngo.lock({ from: user });
            await increase(duration.days('89'));
            await reverting(this.Dinngo.withdraw(value, { from: user }));
        });

        it('when value with amount 0', async function () {
            const value = ether('0');
            await this.Dinngo.lock({ from: user });
            await increase(duration.days('90.1'));
            await reverting(this.Dinngo.withdraw(value, { from: user }));
        });

        it('when user balance is not sufficient', async function () {
            const value = ether('11');
            await this.Dinngo.lock({ from: user });
            await increase(duration.days('90.1'));
            await reverting(this.Dinngo.withdraw(value, { from: user }));
        });

        it('when user is removed', async function () {
            const value = ether('1');
            await this.Dinngo.lock({ from: user });
            await increase(duration.days('90.1'));
            await this.Dinngo.removeUser(user, { from: owner });
            await reverting(this.Dinngo.withdraw(value, { from: user }));
        });

        it('when locking process time changed', async function () {
            const value = ether('1');
            await this.Dinngo.changeProcessTime(duration.days('80'), { from: owner });
            await this.Dinngo.lock({ from: user });
            await increase(duration.days('80.1'));
            const { logs } = await this.Dinngo.withdraw(value, { from: user });
            const event = await inLogs(logs, 'Withdraw');
            let balance = await this.Dinngo.balances.call(ZERO_ADDRESS, user);
            event.args.token.should.eq(ZERO_ADDRESS);
            event.args.user.should.eq(user);
            event.args.amount.should.be.bignumber.eq(value);
            event.args.balance.should.be.bignumber.eq(balance);
        });
    });
    describe('token', function () {
        beforeEach(async function () {
            this.Token = await SimpleToken.new({ from: user });
            await this.Dinngo.setUser('1', user, '1');
            await this.Token.approve(this.Dinngo.address, depositValue, { from: user });
            await this.Dinngo.depositToken(this.Token.address, depositValue, { from: user });
        });

        it('when normal', async function () {
            const value = ether('1');
            await this.Dinngo.lock({ from: user });
            await increase(duration.days('90.1'));
            const { logs } = await this.Dinngo.withdrawToken(this.Token.address, value, { from: user });
            const event = await inLogs(logs, 'Withdraw');
            let balance = await this.Dinngo.balances.call(this.Token.address, user);
            event.args.token.should.eq(this.Token.address);
            event.args.user.should.eq(user);
            event.args.amount.should.be.bignumber.eq(value);
            event.args.balance.should.be.bignumber.eq(balance);
        });

        it('when user not locked', async function () {
            const value = ether('1');
            await reverting(this.Dinngo.withdrawToken(this.Token.address, value, { from: user }));
        });

        it('when user not yet locked', async function () {
            const value = ether('1');
            await this.Dinngo.lock({ from: user });
            await increase(duration.days('89'));
            await reverting(this.Dinngo.withdrawToken(this.Token.address, value, { from: user }));
        });

        it('when token with address 0', async function () {
            const value = ether('1');
            await reverting(this.Dinngo.withdrawToken(ZERO_ADDRESS, value, { from: user }));
        });

        it('when token with amount 0', async function () {
            const value = ether('0');
            await reverting(this.Dinngo.withdrawToken(this.Token.address, value, { from: user }));
        });

        it('when user balance is not sufficient', async function () {
            const value = ether('11');
            await reverting(this.Dinngo.withdrawToken(this.Token.address, value, { from: user }));
        });

        it('when user is removed', async function () {
            const value = ether('1');
            await this.Dinngo.lock({ from: user });
            await increase(duration.days(90.1));
            await this.Dinngo.removeUser(user, { from: owner });
            await reverting(this.Dinngo.withdrawToken(this.Token.address, value, { from: user }));
        });

        it('when locking process time changed', async function () {
            const value = ether('1');
            await this.Dinngo.changeProcessTime(duration.days('80'), { from: owner });
            await this.Dinngo.lock({ from: user });
            await increase(duration.days('80.1'));
            const { logs } = await this.Dinngo.withdrawToken(this.Token.address, value, { from: user });
            const event = await inLogs(logs, 'Withdraw');
            let balance = await this.Dinngo.balances.call(this.Token.address, user);
            event.args.token.should.eq(this.Token.address);
            event.args.user.should.eq(user);
            event.args.amount.should.be.bignumber.eq(value);
            event.args.balance.should.be.bignumber.eq(balance);
        });
    });
});

contract('WithdrawAdmin', function ([_, user1, user2, owner, admin, tokenWallet, tokenContract]) {
    beforeEach(async function () {
        this.DinngoImpl = await Dinngo.new(tokenWallet, tokenContract, { from: owner });
        this.Dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.DinngoImpl.address, { from: owner });
        await this.Dinngo.transferAdmin(admin, { from: owner });
        await this.Dinngo.setUser('11', user1, '1');
        await this.Dinngo.setUser('12', user2, '1');
    });
    const BALANCE = ether('3')

    const user1ID = '11';
    const token1 = '0';
    const amount1 = ether('1');
    const fee1 = ether('0.001');
    const nonce1 = '1';
    const withdrawal1 = "0x723ee62931c50b28134e8dfa9360ba3628a3a958b3529f355eff7541e0699f1e7c951ccb051dc002650c64d267dcabfcea1a552119c900bce8d59651b4d9f51b0000000000000000000000000000000000000000000000000000038d7ea4c6800000000001010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b";

    const user2ID = '12';
    const token2 = '11';
    const amount2 = ether('2');
    const fee2 = ether('1');
    const nonce2 = '2';
    const withdrawal2 = "0x1a38f8dc02826cf210f7586c003a826432f3f5f9de0d90290a56fba81cbc6ec37d8e7629e2da8f3e4e077c4972e1906035d7fde9d4eef94b25fdc546d29079b3010000000000000000000000000000000000000000000000000de0b6b3a764000000000002000000000000000000000000000000000000000000000000001bc16d674ec80000000b0000000c";

    describe('ether', function () {
        it('when normal', async function () {
            await this.Dinngo.deposit({ from: user1, value: BALANCE });
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal1, { from: admin });
            const event = await inLogs(logs, 'Withdraw');
            event.args.token.should.eq(ZERO_ADDRESS);
            event.args.user.should.eq(user1);
            event.args.amount.should.be.bignumber.eq(amount1);
            event.args.balance.should.be.bignumber.eq(BALANCE.sub(amount1).sub(fee1));
        });

        it('when normal count gas', async function () {
            await this.Dinngo.deposit({ from: user1, value: BALANCE });
            const receipt = await this.Dinngo.withdrawByAdmin(withdrawal1, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('when sent by owner', async function () {
            await this.Dinngo.deposit({ from: user1, value: BALANCE });
            await reverting(this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner }));
        });

        it('when sent by non-admin', async function () {
            await this.Dinngo.deposit({ from: user1, value: BALANCE });
            await reverting(this.Dinngo.withdrawByAdmin(withdrawal1));
        });

        it('when user balance is not sufficient', async function () {
            await this.Dinngo.deposit({ from: user1, value: amount1.sub(ether('0.1')) });
            await reverting(this.Dinngo.withdrawByAdmin(withdrawal1, { from: admin }));
        });

        it('when user is removed', async function () {
            await this.Dinngo.deposit({ from: user1, value: BALANCE });
            await this.Dinngo.removeUser(user1, { from: admin });
            await reverting(this.Dinngo.withdrawByAdmin(withdrawal1, { from: admin }));
        });

        it('when fee is paid in ETH', async function () {
            await this.Dinngo.deposit({ from: user1, value: BALANCE });
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal1, { from: admin });
            const event = await inLogs(logs, 'Withdraw');
            event.args.token.should.eq(ZERO_ADDRESS);
            event.args.user.should.eq(user1);
            event.args.amount.should.be.bignumber.eq(amount1);
            event.args.balance.should.be.bignumber.eq(BALANCE.sub(amount1).sub(fee1));
        });

        it('when fee is insufficient', async function () {
            await this.Dinngo.deposit({ from: user1, value: ether('1') });
            await reverting(this.Dinngo.withdrawByAdmin(withdrawal1, { from: admin }));
        });
    });

    describe('token', function () {
        beforeEach(async function () {
            this.Token = await SimpleToken.new({ from: user2 });
            await this.Dinngo.setToken('11', this.Token.address, '1');
        });

        it('when normal', async function () {
            await this.Token.approve(this.Dinngo.address, BALANCE, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, BALANCE, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, BALANCE);
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal2, { from: admin });
            const event = await inLogs(logs, 'Withdraw');
            event.args.token.should.eq(this.Token.address);
            event.args.user.should.eq(user2);
            event.args.amount.should.be.bignumber.eq(amount2);
            event.args.balance.should.be.bignumber.eq(BALANCE.sub(amount2));
        });

        it('when normal count gas', async function () {
            await this.Token.approve(this.Dinngo.address, BALANCE, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, BALANCE, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, BALANCE);
            const receipt = await this.Dinngo.withdrawByAdmin(withdrawal2, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('when sent by non-owner', async function () {
            await this.Token.approve(this.Dinngo.address, BALANCE, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, BALANCE, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, BALANCE);
            await reverting(this.Dinngo.withdrawByAdmin(withdrawal2));
        });

        it('when user balance is not sufficient', async function () {
            let amount = amount2.sub(ether('0.1'));
            await this.Token.approve(this.Dinngo.address, amount, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, amount, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, BALANCE);
            await reverting(this.Dinngo.withdrawByAdmin(withdrawal2, { from: admin }));
        });

        it('when user is removed', async function () {
            await this.Token.approve(this.Dinngo.address, BALANCE, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, BALANCE, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, BALANCE);
            await this.Dinngo.removeUser(user2, { from: admin });
            await reverting(this.Dinngo.withdrawByAdmin(withdrawal2, { from: admin }));
        });

        it('when fee is paid in DGO', async function () {
            await this.Token.approve(this.Dinngo.address, BALANCE, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, BALANCE, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, BALANCE);
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal2, { from: admin });
            const event = await inLogs(logs, 'Withdraw');
            event.args.token.should.eq(this.Token.address);
            event.args.user.should.eq(user2);
            event.args.amount.should.be.bignumber.eq(amount2);
            event.args.balance.should.be.bignumber.eq(BALANCE.sub(amount2));
            let balance = await this.Dinngo.balances.call(tokenContract, user2);
            balance.should.be.bignumber.eq(BALANCE.sub(fee2));
        });

        it('when fee is insufficient', async function () {
            await this.Token.approve(this.Dinngo.address, BALANCE, { from: user2 });
            await this.Dinngo.depositToken(this.Token.address, BALANCE, { from: user2 });
            await this.Dinngo.setUserBalance(user2, tokenContract, ether('0.0001'));
            await reverting(this.Dinngo.withdrawByAdmin(withdrawal2, { from: admin }));
        });
    });
});
