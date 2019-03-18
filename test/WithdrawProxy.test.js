const { BN, constants, ether, expectEvent, shouldFail, time } = require('openzeppelin-test-helpers');
const { duration, increase } = time;
const { inLogs } = expectEvent;
const { reverting } = shouldFail;
const { ZERO_ADDRESS } = constants;

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const SimpleToken = artifacts.require('SimpleToken');
const BadToken = artifacts.require('BadToken');

contract('Withdraw', function ([_, user, owner, tokenWallet, tokenContract]) {
    beforeEach(async function () {
        this.dinngoImpl = await Dinngo.new();
        this.dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.dinngoImpl.address, { from: owner });
    });

    const depositValue = ether('10');
    const exceed = ether('11');
    const userId = new BN('1');
    const rank = new BN('1');

    describe('ether', function () {
        beforeEach(async function () {
            await this.dinngo.setUser(userId, user, rank);
            await this.dinngo.deposit({ value: depositValue, from: user });
        });

        it('when normal', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            const { logs } = await this.dinngo.withdraw(amount, { from: user });
            const balance = await this.dinngo.balances.call(ZERO_ADDRESS, user);
            inLogs(logs, 'Withdraw', { token: ZERO_ADDRESS, user: user, amount: amount, balance: balance });
        });

        it('when user not locked', async function () {
            const amount = ether('1');
            await reverting(this.dinngo.withdraw(amount, { from: user }));
        });

        it('when user not yet locked', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(89));
            await reverting(this.dinngo.withdraw(amount, { from: user }));
        });

        it('when value with amount 0', async function () {
            const amount = ether('0');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            await reverting(this.dinngo.withdraw(amount, { from: user }));
        });

        it('when user balance is not sufficient', async function () {
            const amount = ether('11');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            await reverting(this.dinngo.withdraw(amount, { from: user }));
        });

        it('when user is removed', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            await this.dinngo.removeUser(user, { from: owner });
            await reverting(this.dinngo.withdraw(amount, { from: user }));
        });

        it('when locking process time changed', async function () {
            const amount = ether('1');
            await this.dinngo.changeProcessTime(duration.days(80), { from: owner });
            await this.dinngo.lock({ from: user });
            await increase(duration.days(81));
            const { logs } = await this.dinngo.withdraw(amount, { from: user });
            const balance = await this.dinngo.balances.call(ZERO_ADDRESS, user);
            inLogs(logs, 'Withdraw', { token: ZERO_ADDRESS, user: user, amount: amount, balance: balance });
        });
    });

    describe('token', function () {
        beforeEach(async function () {
            this.token = await SimpleToken.new({ from: user });
            await this.dinngo.setUser(userId, user, rank);
            await this.token.approve(this.dinngo.address, depositValue, { from: user });
            await this.dinngo.depositToken(this.token.address, depositValue, { from: user });
        });

        it('when normal', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            const { logs } = await this.dinngo.withdrawToken(this.token.address, amount, { from: user });
            const balance = await this.dinngo.balances.call(this.token.address, user);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user, amount: amount, balance: balance });
        });

        it('when user not locked', async function () {
            const amount = ether('1');
            await reverting(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user not yet locked', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(89));
            await reverting(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when token with address 0', async function () {
            const amount = ether('1');
            await reverting(this.dinngo.withdrawToken(ZERO_ADDRESS, amount, { from: user }));
        });

        it('when token with amount 0', async function () {
            const amount = ether('0');
            await reverting(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user balance is not sufficient', async function () {
            const amount = ether('11');
            await reverting(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user is removed', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            await this.dinngo.removeUser(user, { from: owner });
            await reverting(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when locking process time changed', async function () {
            const amount = ether('1');
            await this.dinngo.changeProcessTime(duration.days(80), { from: owner });
            await this.dinngo.lock({ from: user });
            await increase(duration.days(81));
            const { logs } = await this.dinngo.withdrawToken(this.token.address, amount, { from: user });
            const balance = await this.dinngo.balances.call(this.token.address, user);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user, amount: amount, balance: balance });
        });
    });

    describe('bad token', function () {
        beforeEach(async function () {
            this.token = await BadToken.new({ from: user });
            await this.dinngo.setUser(userId, user, rank);
            await this.token.approve(this.dinngo.address, depositValue, { from: user });
            await this.dinngo.depositToken(this.token.address, depositValue, { from: user });
        });

        it('when normal', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            const { logs } = await this.dinngo.withdrawToken(this.token.address, amount, { from: user });
            const balance = await this.dinngo.balances.call(this.token.address, user);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user, amount: amount, balance: balance });
        });

        it('when user not locked', async function () {
            const amount = ether('1');
            await reverting(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user not yet locked', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(89));
            await reverting(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when token with address 0', async function () {
            const amount = ether('1');
            await reverting(this.dinngo.withdrawToken(ZERO_ADDRESS, amount, { from: user }));
        });

        it('when token with amount 0', async function () {
            const amount = ether('0');
            await reverting(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user balance is not sufficient', async function () {
            const amount = ether('11');
            await reverting(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user is removed', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            await this.dinngo.removeUser(user, { from: owner });
            await reverting(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when locking process time changed', async function () {
            const amount = ether('1');
            await this.dinngo.changeProcessTime(duration.days(80), { from: owner });
            await this.dinngo.lock({ from: user });
            await increase(duration.days(81));
            const { logs } = await this.dinngo.withdrawToken(this.token.address, amount, { from: user });
            const balance = await this.dinngo.balances.call(this.token.address, user);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user, amount: amount, balance: balance });
        });
    });
});

contract('WithdrawAdmin', function ([_, user1, user2, owner, admin, tokenWallet, tokenContract]) {
    beforeEach(async function () {
        this.dinngoImpl = await Dinngo.new(tokenWallet, tokenContract, { from: owner });
        this.dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.dinngoImpl.address, { from: owner });
        await this.dinngo.activateAdmin(admin, { from: owner });
        await this.dinngo.deactivateAdmin(owner, { from: owner });
        await this.dinngo.setUserBalance(tokenWallet, ZERO_ADDRESS, ether('1'));
        await this.dinngo.setUserBalance(tokenWallet, tokenContract, ether('1'));
    });

    const userId1 = new BN('11');
    const userId2 = new BN('12');
    const rank = new BN('1');
    const tokenId1 = new BN('0');
    const tokenId2 = new BN('11');
    const amount1 = ether('1');
    const amount2 = ether('2');
    const fee1 = ether('0.001');
    const fee2 = ether('1');
    const nonce1 = new BN('1');
    const nonce2 = new BN('2');
    const withdrawal1 = '0x723ee62931c50b28134e8dfa9360ba3628a3a958b3529f355eff7541e0699f1e7c951ccb051dc002650c64d267dcabfcea1a552119c900bce8d59651b4d9f51b0000000000000000000000000000000000000000000000000000038d7ea4c6800000000001010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b';
    const withdrawal2 = '0x1a38f8dc02826cf210f7586c003a826432f3f5f9de0d90290a56fba81cbc6ec37d8e7629e2da8f3e4e077c4972e1906035d7fde9d4eef94b25fdc546d29079b3010000000000000000000000000000000000000000000000000de0b6b3a764000000000002000000000000000000000000000000000000000000000000001bc16d674ec80000000b0000000c';
    let balance = ether('0');

    beforeEach(async function() {
        await this.dinngo.setUser(userId1, user1, rank);
        await this.dinngo.setUser(userId2, user2, rank);
        balance = ether('3')
    });

    describe('ether', function () {
        it('when normal', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal1, { from: admin });
            balance = balance.sub(amount1).sub(fee1);
            inLogs(logs, 'Withdraw', { token: ZERO_ADDRESS, user: user1, amount: amount1, balance: balance });
        });

        it('when normal count gas', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            const receipt = await this.dinngo.withdrawByAdmin(withdrawal1, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('when sent by owner', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            await reverting(this.dinngo.withdrawByAdmin(withdrawal1, { from: owner }));
        });

        it('when sent by non-admin', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            await reverting(this.dinngo.withdrawByAdmin(withdrawal1));
        });

        it('when user balance is not sufficient', async function () {
            await this.dinngo.deposit({ from: user1, value: amount1.sub(ether('0.1')) });
            await reverting(this.dinngo.withdrawByAdmin(withdrawal1, { from: admin }));
        });

        it('when user is removed', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            await this.dinngo.removeUser(user1, { from: admin });
            await reverting(this.dinngo.withdrawByAdmin(withdrawal1, { from: admin }));
        });

        it('when fee is paid in ETH', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal1, { from: admin });
            balance = balance.sub(amount1).sub(fee1);
            inLogs(logs, 'Withdraw', { token: ZERO_ADDRESS, user: user1, amount: amount1, balance: balance });
        });

        it('when fee is insufficient', async function () {
            await this.dinngo.deposit({ from: user1, value: ether('1') });
            await reverting(this.dinngo.withdrawByAdmin(withdrawal1, { from: admin }));
        });
    });

    describe('token', function () {
        beforeEach(async function () {
            this.token = await SimpleToken.new({ from: user2 });
            await this.dinngo.setToken(tokenId2, this.token.address, rank);
        });

        it('when normal', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, balance);
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal2, { from: admin });
            balance = balance.sub(amount2);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user2, amount: amount2, balance: balance });
        });

        it('when normal count gas', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, balance);
            const receipt = await this.dinngo.withdrawByAdmin(withdrawal2, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('when sent by non-owner', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, balance);
            await reverting(this.dinngo.withdrawByAdmin(withdrawal2));
        });

        it('when user balance is not sufficient', async function () {
            const amount = amount2.sub(ether('0.1'));
            await this.token.approve(this.dinngo.address, amount, { from: user2 });
            await this.dinngo.depositToken(this.token.address, amount, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, balance);
            await reverting(this.dinngo.withdrawByAdmin(withdrawal2, { from: admin }));
        });

        it('when user is removed', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, balance);
            await this.dinngo.removeUser(user2, { from: admin });
            await reverting(this.dinngo.withdrawByAdmin(withdrawal2, { from: admin }));
        });

        it('when fee is paid in DGO', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, balance);
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal2, { from: admin });
            balance = balance.sub(amount2);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user2, amount: amount2, balance: balance });
            (await this.dinngo.balances.call(tokenContract, user2)).should.be.bignumber.eq(ether('3').sub(fee2));
        });

        it('when fee is insufficient', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, ether('0.0001'));
            await reverting(this.dinngo.withdrawByAdmin(withdrawal2, { from: admin }));
        });
    });

    describe('bad token', function () {
        beforeEach(async function () {
            this.token = await BadToken.new({ from: user2 });
            await this.dinngo.setToken(tokenId2, this.token.address, rank);
        });

        it('when normal', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, balance);
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal2, { from: admin });
            balance = balance.sub(amount2);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user2, amount: amount2, balance: balance });
        });

        it('when normal count gas', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, balance);
            const receipt = await this.dinngo.withdrawByAdmin(withdrawal2, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('when sent by non-owner', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, balance);
            await reverting(this.dinngo.withdrawByAdmin(withdrawal2));
        });

        it('when user balance is not sufficient', async function () {
            const amount = amount2.sub(ether('0.1'));
            await this.token.approve(this.dinngo.address, amount, { from: user2 });
            await this.dinngo.depositToken(this.token.address, amount, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, balance);
            await reverting(this.dinngo.withdrawByAdmin(withdrawal2, { from: admin }));
        });

        it('when user is removed', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, balance);
            await this.dinngo.removeUser(user2, { from: admin });
            await reverting(this.dinngo.withdrawByAdmin(withdrawal2, { from: admin }));
        });

        it('when fee is paid in DGO', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, balance);
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal2, { from: admin });
            balance = balance.sub(amount2);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user2, amount: amount2, balance: balance });
            (await this.dinngo.balances.call(tokenContract, user2)).should.be.bignumber.eq(ether('3').sub(fee2));
        });

        it('when fee is insufficient', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, tokenContract, ether('0.0001'));
            await reverting(this.dinngo.withdrawByAdmin(withdrawal2, { from: admin }));
        });
    });
});
