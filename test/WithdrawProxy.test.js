const { BN, constants, ether, expectEvent, expectRevert, time } = require('openzeppelin-test-helpers');
const { duration, increase } = time;
const { inLogs } = expectEvent;
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const SimpleToken = artifacts.require('SimpleToken');
const BadToken = artifacts.require('BadToken');
const TetherToken = artifacts.require('TetherToken');

contract('Withdraw', function ([_, user, owner, tokenWallet, DGOToken]) {
    beforeEach(async function () {
        this.dinngoImpl = await Dinngo.new();
        this.dinngo = await DinngoProxyMock.new(tokenWallet, DGOToken, this.dinngoImpl.address, { from: owner });
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
            await expectRevert.unspecified(this.dinngo.withdraw(amount, { from: user }));
        });

        it('when user not yet locked', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(89));
            await expectRevert.unspecified(this.dinngo.withdraw(amount, { from: user }));
        });

        it('when value with amount 0', async function () {
            const amount = ether('0');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            await expectRevert.unspecified(this.dinngo.withdraw(amount, { from: user }));
        });

        it('when user balance is not sufficient', async function () {
            const amount = ether('11');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            await expectRevert.unspecified(this.dinngo.withdraw(amount, { from: user }));
        });

        it('when user is removed', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            await this.dinngo.removeUser(user, { from: owner });
            await expectRevert.unspecified(this.dinngo.withdraw(amount, { from: user }));
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
            await this.dinngo.setToken('11', this.token.address, '1');
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
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user not yet locked', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(89));
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when token with address 0', async function () {
            const amount = ether('1');
            await expectRevert.unspecified(this.dinngo.withdrawToken(ZERO_ADDRESS, amount, { from: user }));
        });

        it('when token with amount 0', async function () {
            const amount = ether('0');
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user balance is not sufficient', async function () {
            const amount = ether('11');
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user is removed', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            await this.dinngo.removeUser(user, { from: owner });
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
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
            await this.dinngo.setToken('11', this.token.address, '1');
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
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user not yet locked', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(89));
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when token with address 0', async function () {
            const amount = ether('1');
            await expectRevert.unspecified(this.dinngo.withdrawToken(ZERO_ADDRESS, amount, { from: user }));
        });

        it('when token with amount 0', async function () {
            const amount = ether('0');
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user balance is not sufficient', async function () {
            const amount = ether('11');
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user is removed', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            await this.dinngo.removeUser(user, { from: owner });
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
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

    describe('tether token', function () {
        beforeEach(async function () {
            this.token = await TetherToken.new(new BN('10000000000000000000000'), 'Tether CNHT', 'CNHT', new BN('6'), { from: user });
            await this.dinngo.setToken('10000', this.token.address, '1');
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
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user not yet locked', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(89));
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when token with address 0', async function () {
            const amount = ether('1');
            await expectRevert.unspecified(this.dinngo.withdrawToken(ZERO_ADDRESS, amount, { from: user }));
        });

        it('when token with amount 0', async function () {
            const amount = ether('0');
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user balance is not sufficient', async function () {
            const amount = ether('11');
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
        });

        it('when user is removed', async function () {
            const amount = ether('1');
            await this.dinngo.lock({ from: user });
            await increase(duration.days(91));
            await this.dinngo.removeUser(user, { from: owner });
            await expectRevert.unspecified(this.dinngo.withdrawToken(this.token.address, amount, { from: user }));
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

contract('WithdrawAdmin', function ([_, user1, user2, owner, admin, tokenWallet, DGOToken]) {
    beforeEach(async function () {
        this.dinngoImpl = await Dinngo.new(tokenWallet, DGOToken, { from: owner });
        this.dinngo = await DinngoProxyMock.new(tokenWallet, DGOToken, this.dinngoImpl.address, { from: owner });
        await this.dinngo.activateAdmin(admin, { from: owner });
        await this.dinngo.deactivateAdmin(owner, { from: owner });
        await this.dinngo.setUserBalance(tokenWallet, ZERO_ADDRESS, ether('1'));
        await this.dinngo.setUserBalance(tokenWallet, DGOToken, ether('1'));
    });

    const userId1 = new BN('11');
    const userId2 = new BN('12');
    const userId3 = new BN('12');
    const rank = new BN('1');
    const tokenId1 = new BN('0');
    const tokenId2 = new BN('11');
    const tokenId3 = new BN('11');
    const tokenId4 = new BN('10000');
    const amount1 = ether('1');
    const amount2 = ether('2');
    const amount3 = ether('2');
    const fee1 = ether('0.001');
    const fee2 = ether('1');
    const fee3 = ether('1');
    const nonce1 = new BN('2');
    const nonce2 = new BN('2');
    const nonce3 = new BN('3');
    const withdrawal1 = '0x00000000000000000000000000000000000000000000000000038d7ea4c6800000000001010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b';
    const withdrawal2 = '0x0000000000000000000000000000000000000000000000000de0b6b3a764000000000002000000000000000000000000000000000000000000000000001bc16d674ec80000000b0000000c';
    const withdrawal3 = '0x0000000000000000000000000000000000000000000000000de0b6b3a764000000000003010000000000000000000000000000000000000000000000001bc16d674ec80000000b0000000c';
    const withdrawal4 = '0x00000000000000000000000000000000000000000000000000038d7ea4c6800000000002010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b';
    const withdrawal5 = '0x0000000000000000000000000000000000000000000000000de0b6b3a764000000000004010000000000000000000000000000000000000000000000001bc16d674ec80000000b0000000c';
    const withdrawal6 = '0x0000000000000000000000000000000000000000000000000de0b6b3a764000000000002010000000000000000000000000000000000000000000000001bc16d674ec8000027100000000c';
    const sig1 = '0x7c951ccb051dc002650c64d267dcabfcea1a552119c900bce8d59651b4d9f51b723ee62931c50b28134e8dfa9360ba3628a3a958b3529f355eff7541e0699f1e00';
    const sig2 = '0x7d8e7629e2da8f3e4e077c4972e1906035d7fde9d4eef94b25fdc546d29079b31a38f8dc02826cf210f7586c003a826432f3f5f9de0d90290a56fba81cbc6ec301';
    const sig3 = '0x5a5769a519df2d9b7f0578727c60a90bb7b768df480470563b43e69bb36adef5530287441d143ff3011353f03a2f048850c652950d9aab4be7733975caae595c01';
    const sig4 = '0xaf22944995534818566ddc91ebc69a24850298855fad0d31420ab9c9dbdda4443e6a52a8010946b47473a14bfa6600a6372a8309fb26243b0f7f311fed53068a00';
    const sig5 = '0xf4d59e8e77ae7f5aec8e70840c1878c069bb9ce6248d43a2e6d3e23a0121e07c154a7a92ada4577717eceaf604e68e0e1210ad2b2b96b4e8a8d9acec7ecb9d1801';
    const sig6 = '0x1a4cb01b7e6ed5dc11020e2498672cdb8ec91e8a0941a69aafba4a67ec5f73bc335beaf0718298fe2e9999448a7323648518712fec9ca8cc4ec8b04cfccac08801';
    let balance = ether('0');

    beforeEach(async function() {
        await this.dinngo.setUser(userId1, user1, rank);
        await this.dinngo.setUser(userId2, user2, rank);
        balance = ether('7')
    });

    describe('ether', function () {
        it('when normal', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal1, sig1, { from: admin });
            balance = balance.sub(amount1).sub(fee1);
            inLogs(logs, 'Withdraw', { token: ZERO_ADDRESS, user: user1, amount: amount1, balance: balance, tokenFee: ZERO_ADDRESS, amountFee: fee1 });
        });

        it('when normal count gas', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            const receipt1 = await this.dinngo.withdrawByAdmin(withdrawal1, sig1, { from: admin });
            console.log(receipt1.receipt.gasUsed);
            const receipt2 = await this.dinngo.withdrawByAdmin(withdrawal4, sig4, { from: admin });
            console.log(receipt2.receipt.gasUsed);
        });

        it('when sending a repeated withdrawal', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            await this.dinngo.withdrawByAdmin(withdrawal1, sig1, { from: admin });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal1, sig1, { from: admin }),
                '400.5'
            );
        });

        it('when sent by owner', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal1, sig1, { from: owner }),
                '403.1'
            );
        });

        it('when sent by non-admin', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal1, sig1),
                '403.1'
            );
        });

        it('when user balance is not sufficient', async function () {
            await this.dinngo.deposit({ from: user1, value: amount1.sub(ether('0.1')) });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal1, sig1, { from: admin }),
                'subtraction overflow'
            );
        });

        it('when user is removed', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            await this.dinngo.removeUser(user1, { from: admin });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal1, sig1, { from: admin }),
                '400.4'
            );
        });

        it('when fee is paid in ETH', async function () {
            await this.dinngo.deposit({ from: user1, value: balance });
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal1, sig1, { from: admin });
            balance = balance.sub(amount1).sub(fee1);
            inLogs(logs, 'Withdraw', { token: ZERO_ADDRESS, user: user1, amount: amount1, balance: balance, tokenFee: ZERO_ADDRESS, amountFee: fee1 });
        });

        it('when fee is insufficient', async function () {
            await this.dinngo.deposit({ from: user1, value: ether('1') });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal1, sig1, { from: admin }),
                'subtraction overflow'
            );
        });
    });

    describe('token DGO fee', function () {
        beforeEach(async function () {
            this.token = await SimpleToken.new({ from: user2 });
            await this.dinngo.setToken(tokenId2, this.token.address, rank);
        });

        it('when normal', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, balance);
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin });
            balance = balance.sub(amount2);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user2, amount: amount2, balance: balance, tokenFee: DGOToken, amountFee: fee2 });
        });

        it('when normal count gas', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, balance);
            const receipt = await this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('when sending a repeated withdrawal', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, balance);
            await this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin }),
                '400.5'
            );
        });

        it('when sent by non-admin', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, balance);
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal2, sig2),
                '403.1'
            );
        });

        it('when user balance is not sufficient', async function () {
            const amount = amount2.sub(ether('0.1'));
            await this.token.approve(this.dinngo.address, amount, { from: user2 });
            await this.dinngo.depositToken(this.token.address, amount, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, balance);
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin }),
                'subtraction overflow'
            );
        });

        it('when user is removed', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, balance);
            await this.dinngo.removeUser(user2, { from: admin });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin }),
                '400.4'
            );
        });

        it('when fee is insufficient', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, ether('0.0001'));
            await expectRevert.unspecified(this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin }));
        });
    });

    describe('token main fee', function () {
        beforeEach(async function () {
            this.token = await SimpleToken.new({ from: user2 });
            await this.dinngo.setToken(tokenId3, this.token.address, rank);
        });

        it('when normal', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal3, sig3, { from: admin });
            balance = balance.sub(amount3).sub(fee3);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user2, amount: amount3, balance: balance, tokenFee: this.token.address, amountFee: fee3 });
        });

        it('when normal count gas', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            const receipt1 = await this.dinngo.withdrawByAdmin(withdrawal3, sig3, { from: admin });
            console.log(receipt1.receipt.gasUsed);
            const receipt2 = await this.dinngo.withdrawByAdmin(withdrawal5, sig5, { from: admin });
            console.log(receipt2.receipt.gasUsed);
        });

        it('when sent by non-owner', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal3, sig3),
                '403.1'
            );
        });

        it('when user balance is not sufficient', async function () {
            const amount = amount3.sub(ether('0.1'));
            await this.token.approve(this.dinngo.address, amount, { from: user2 });
            await this.dinngo.depositToken(this.token.address, amount, { from: user2 });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal3, sig3, { from: admin }),
                'subtraction overflow'
            );
        });

        it('when user is removed', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.removeUser(user2, { from: admin });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal3, sig3, { from: admin }),
                '400.4'
            );
        });

        it('when fee is insufficient', async function () {
            await this.token.approve(this.dinngo.address, amount3, { from: user2 });
            await this.dinngo.depositToken(this.token.address, amount3, { from: user2 });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal3, sig3, { from: admin }),
                'subtraction overflow'
            );
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
            await this.dinngo.setUserBalance(user2, DGOToken, balance);
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin });
            balance = balance.sub(amount2);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user2, amount: amount2, balance: balance, tokenFee: DGOToken, amountFee: fee2 });
        });

        it('when normal count gas', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, balance);
            const receipt = await this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('when sent by non-admin', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, balance);
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal2, sig2),
                '403.1'
            );
        });

        it('when user balance is not sufficient', async function () {
            const amount = amount2.sub(ether('0.1'));
            await this.token.approve(this.dinngo.address, amount, { from: user2 });
            await this.dinngo.depositToken(this.token.address, amount, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, balance);
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin }),
                'subtraction overflow'
            );
        });

        it('when user is removed', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, balance);
            await this.dinngo.removeUser(user2, { from: admin });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin }),
                '400.4'
            );
        });

        it('when fee is paid in DGO', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, ether('1'));
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin });
            balance = balance.sub(amount2);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user2, amount: amount2, balance: balance, tokenFee: DGOToken, amountFee: fee2 });
            expect(await this.dinngo.balances.call(DGOToken, user2)).to.be.bignumber.eq(ether('1').sub(fee2));
        });

        it('when fee is insufficient', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.setUserBalance(user2, DGOToken, ether('0.0001'));
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal2, sig2, { from: admin }),
                'subtraction overflow'
            );
        });
    });

    describe('tether token', function () {
        beforeEach(async function () {
            this.token = await TetherToken.new(new BN('10000000000000000000000'), 'Tether CNHT', 'CNHT', new BN('6'), { from: user2 });
            await this.dinngo.setToken(tokenId4, this.token.address, rank);
        });

        it('when normal', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            const { logs } = await this.dinngo.withdrawByAdmin(withdrawal6, sig6, { from: admin });
            balance = balance.sub(amount2).sub(fee2);
            inLogs(logs, 'Withdraw', { token: this.token.address, user: user2, amount: amount2, balance: balance, tokenFee: this.token.address, amountFee: fee2 });
        });

        it('when normal count gas', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            const receipt = await this.dinngo.withdrawByAdmin(withdrawal6, sig6, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('when sent by non-admin', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal6, sig6),
                '403.1'
            );
        });

        it('when user balance is not sufficient', async function () {
            const amount = amount2.sub(ether('0.1'));
            await this.token.approve(this.dinngo.address, amount, { from: user2 });
            await this.dinngo.depositToken(this.token.address, amount, { from: user2 });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal6, sig6, { from: admin }),
                'subtraction overflow'
            );
        });

        it('when user is removed', async function () {
            await this.token.approve(this.dinngo.address, balance, { from: user2 });
            await this.dinngo.depositToken(this.token.address, balance, { from: user2 });
            await this.dinngo.removeUser(user2, { from: admin });
            await expectRevert(
                this.dinngo.withdrawByAdmin(withdrawal6, sig6, { from: admin }),
                '400.4'
            );
        });
    });
});
