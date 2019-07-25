const { BN, constants, ether, expectEvent, shouldFail, time } = require('openzeppelin-test-helpers');
const { duration, increase } = time;
const { inLogs } = expectEvent;
const { reverting } = shouldFail;
const { ZERO_ADDRESS } = constants;

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const SimpleToken = artifacts.require('SimpleToken');
const BadToken = artifacts.require('BadToken');

contract('Event switch', function ([_, user1, user2, deployer, owner, admin, tokenWallet, tokenContract, token]) {
    beforeEach(async function () {
        this.dinngoImpl = await Dinngo.new(tokenWallet, tokenContract, { from: owner });
        this.dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.dinngoImpl.address, { from: owner });
        await this.dinngo.activateAdmin(admin, { from: owner });
        await this.dinngo.deactivateAdmin(owner, { from: owner });
    });

    const confOld = new BN('255');
    const confNew = new BN('0');
    const confUserOff = new BN('254');
    const confTokenOff = new BN('253');
    const confFundsOff = new BN('251');

    describe('set event', function () {
        it('normal', async function () {
            let conf = await this.dinngo.eventConf.call();
            conf.should.be.bignumber.eq(confOld);
            await this.dinngo.setEvent(confNew, { from: admin });
            conf = await this.dinngo.eventConf.call();
            conf.should.be.bignumber.eq(confNew);
        });

        it('set event config by non-admin', async function () {
            await reverting(this.dinngo.setEvent(confNew, { from: owner }));
        });

        it('set a same event config', async function () {
            await reverting(this.dinngo.setEvent(confOld, { from: admin }));
        });
    });

    describe('user', function () {
        describe('event on', function () {
            it('add user', async function () {
                const userId = new BN('11');
                const { logs } = await this.dinngo.addUser(userId, user1, { from: admin });
                inLogs(logs, 'AddUser');
            });

            it('lock', async function () {
                const userId = new BN('11');
                await this.dinngo.addUser(userId, user1, { from: admin });
                const { logs } = await this.dinngo.lock({ from: user1 });
                inLogs(logs, 'Lock');
            });

            it('unlock', async function () {
                const userId = new BN('11');
                await this.dinngo.addUser(userId, user1, { from: admin });
                await this.dinngo.lock({ from: user1 });
                const { logs } = await this.dinngo.unlock({ from: user1 });
                inLogs(logs, 'Unlock');
            });
        });

        describe('event off', function () {
            beforeEach(async function () {
                await this.dinngo.setEvent(confUserOff, { from: admin });
            });

            it('add user', async function () {
                const userId = new BN('11');
                const { logs } = await this.dinngo.addUser(userId, user1, { from: admin });
                logs.length.should.eq(0);
            });

            it('lock', async function () {
                const userId = new BN('11');
                await this.dinngo.addUser(userId, user1, { from: admin });
                const { logs } = await this.dinngo.lock({ from: user1 });
                logs.length.should.eq(0);
            });

            it('unlock', async function () {
                const userId = new BN('11');
                await this.dinngo.addUser(userId, user1, { from: admin });
                await this.dinngo.lock({ from: user1 });
                const { logs } = await this.dinngo.unlock({ from: user1 });
                logs.length.should.eq(0);
            });
        });
    });

    describe('token', function () {
        beforeEach(async function () {
            this.token = await SimpleToken.new({ from: user1 });
        });

        describe('event on', function () {
            it('add token', async function () {
                const tokenId = new BN('2');
                const { logs } = await this.dinngo.addToken(tokenId, this.token.address, { from: owner });
                inLogs(logs, 'AddToken');
            });
        });

        describe('event off', function () {
            beforeEach(async function () {
                await this.dinngo.setEvent(confTokenOff, { from: admin });
            });

            it('add token', async function () {
                const tokenId = new BN('2');
                const { logs } = await this.dinngo.addToken(tokenId, this.token.address, { from: owner });
                logs.length.should.eq(0);
            });
        });
    });

    describe('funds', function () {
        describe('event on', function () {
            describe('deposit', function () {
                const id = new BN('1');
                const rank = new BN('1');
                const amount = ether('1');

                it('ether', async function () {
                    await this.dinngo.setUser(id, user1, rank);
                    const { logs } = await this.dinngo.deposit({ value: amount, from: user1 });
                    inLogs(logs, 'Deposit');
                    await this.dinngo.lock({ from: user1 });
                    await increase(duration.days(91));
                    await this.dinngo.withdraw(amount, { from: user1 });
                });

                it('token', async function () {
                    this.token = await SimpleToken.new({ from: user1 });
                    await this.dinngo.setToken('11', this.token.address, '1');
                    await this.dinngo.setUser(id, user1, rank);
                    await this.token.approve(this.dinngo.address, amount, { from: user1 });
                    const { logs } = await this.dinngo.depositToken(this.token.address, amount, { from: user1 });
                    inLogs(logs, 'Deposit');
                });
            });

            describe('withdraw', async function () {
                const depositValue = ether('1');
                const userId = new BN('11');
                const rank = new BN('1');

                beforeEach(async function () {
                    await this.dinngo.setUser(userId, user1, rank);
                    this.token = await SimpleToken.new({ from: user1 });
                    await this.dinngo.setToken('11', this.token.address, '1');
                });

                it('ether', async function () {
                    await this.dinngo.deposit({ value: depositValue, from: user1 });
                    await this.dinngo.lock({ from: user1 });
                    await increase(duration.days(91));
                    const { logs } = await this.dinngo.withdraw(depositValue, { from: user1 });
                    inLogs(logs, 'Withdraw');
                });

                it('token', async function () {
                    await this.token.approve(this.dinngo.address, depositValue, { from: user1 });
                    await this.dinngo.depositToken(this.token.address, depositValue, { from: user1 });
                    await this.dinngo.lock({ from: user1 });
                    await increase(duration.days(91));
                    const { logs } = await this.dinngo.withdrawToken(this.token.address, depositValue, { from: user1 });
                    inLogs(logs, 'Withdraw');
                });

                it('by admin', async function () {
                    const balance = ether('3');
                    await this.dinngo.setUserBalance(tokenWallet, ZERO_ADDRESS, ether('1'));
                    const withdrawal1 = '0x723ee62931c50b28134e8dfa9360ba3628a3a958b3529f355eff7541e0699f1e7c951ccb051dc002650c64d267dcabfcea1a552119c900bce8d59651b4d9f51b0000000000000000000000000000000000000000000000000000038d7ea4c6800000000001010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b';
                    await this.dinngo.deposit({ from: user1, value: balance });
                    const { logs } = await this.dinngo.withdrawByAdmin(withdrawal1, { from: admin });
                    inLogs(logs, 'Withdraw');
                });
            });

            it('settle', async function () {
                const id1 = new BN('11');
                const id2 = new BN('12');
                const rank = new BN('1');
                const tokenId = new BN('11');
                const balance = ether('1000');
                await this.dinngo.setUser(id1, user1, rank);
                await this.dinngo.setUser(id2, user2, rank);
                await this.dinngo.setToken(tokenId, token, rank);
                await this.dinngo.setUserBalance(user1, token, balance);
                await this.dinngo.setUserBalance(user1, ZERO_ADDRESS, balance);
                await this.dinngo.setUserBalance(user2, token, balance);
                await this.dinngo.setUserBalance(user2, ZERO_ADDRESS, balance);
                const orders1_2 =
                    '0x206bc639aadd5c6c4487b4cc8f7675bd8e806989ffb018207bf1afe223f3f9e87ccac8cd5a8ba0ba07cdd360c2bf5ad09e09d785557d8f7214572ca099fd04450100000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000b5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c';
                const { logs } = await this.dinngo.settle(orders1_2, { from: admin });
                inLogs(logs, 'Trade');
            });
        });

        describe('event off', function () {
            beforeEach(async function () {
                await this.dinngo.setEvent(confFundsOff, { from: admin });
            });

            describe('deposit', function () {
                const id = new BN('1');
                const rank = new BN('1');
                const amount = ether('1');

                it('ether', async function () {
                    await this.dinngo.setUser(id, user1, rank);
                    const { logs } = await this.dinngo.deposit({ value: amount, from: user1 });
                    logs.length.should.eq(0);
                    await this.dinngo.lock({ from: user1 });
                    await increase(duration.days(91));
                    await this.dinngo.withdraw(amount, { from: user1 });
                });

                it('token', async function () {
                    this.token = await SimpleToken.new({ from: user1 });
                    await this.dinngo.setToken('11', this.token.address, '1');
                    await this.dinngo.setUser(id, user1, rank);
                    await this.token.approve(this.dinngo.address, amount, { from: user1 });
                    const { logs } = await this.dinngo.depositToken(this.token.address, amount, { from: user1 });
                    logs.length.should.eq(0);
                });
            });

            describe('withdraw', async function () {
                const depositValue = ether('1');
                const userId = new BN('11');
                const rank = new BN('1');

                beforeEach(async function () {
                    await this.dinngo.setUser(userId, user1, rank);
                    this.token = await SimpleToken.new({ from: user1 });
                    await this.dinngo.setToken('11', this.token.address, '1');
                });

                it('ether', async function () {
                    await this.dinngo.deposit({ value: depositValue, from: user1 });
                    await this.dinngo.lock({ from: user1 });
                    await increase(duration.days(91));
                    const { logs } = await this.dinngo.withdraw(depositValue, { from: user1 });
                    logs.length.should.eq(0);
                });

                it('token', async function () {
                    await this.token.approve(this.dinngo.address, depositValue, { from: user1 });
                    await this.dinngo.depositToken(this.token.address, depositValue, { from: user1 });
                    await this.dinngo.lock({ from: user1 });
                    await increase(duration.days(91));
                    const { logs } = await this.dinngo.withdrawToken(this.token.address, depositValue, { from: user1 });
                    logs.length.should.eq(0);
                });

                it('by admin', async function () {
                    const balance = ether('3');
                    await this.dinngo.setUserBalance(tokenWallet, ZERO_ADDRESS, ether('1'));
                    const withdrawal1 = '0x723ee62931c50b28134e8dfa9360ba3628a3a958b3529f355eff7541e0699f1e7c951ccb051dc002650c64d267dcabfcea1a552119c900bce8d59651b4d9f51b0000000000000000000000000000000000000000000000000000038d7ea4c6800000000001010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b';
                    await this.dinngo.deposit({ from: user1, value: balance });
                    const { logs } = await this.dinngo.withdrawByAdmin(withdrawal1, { from: admin });
                    logs.length.should.eq(0);
                });
            });

            it('settle', async function () {
                const id1 = new BN('11');
                const id2 = new BN('12');
                const rank = new BN('1');
                const tokenId = new BN('11');
                const balance = ether('1000');
                await this.dinngo.setUser(id1, user1, rank);
                await this.dinngo.setUser(id2, user2, rank);
                await this.dinngo.setToken(tokenId, token, rank);
                await this.dinngo.setUserBalance(user1, token, balance);
                await this.dinngo.setUserBalance(user1, ZERO_ADDRESS, balance);
                await this.dinngo.setUserBalance(user2, token, balance);
                await this.dinngo.setUserBalance(user2, ZERO_ADDRESS, balance);
                const orders1_2 =
                    '0x206bc639aadd5c6c4487b4cc8f7675bd8e806989ffb018207bf1afe223f3f9e87ccac8cd5a8ba0ba07cdd360c2bf5ad09e09d785557d8f7214572ca099fd04450100000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000b5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c';
                const { logs } = await this.dinngo.settle(orders1_2, { from: admin });
                logs.length.should.eq(0);
            });
        });
    });
});
