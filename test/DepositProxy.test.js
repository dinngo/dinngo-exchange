const { BN, constants, ether, expectEvent, expectRevert } = require('openzeppelin-test-helpers');
const { inLogs } = expectEvent;
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const SimpleToken = artifacts.require('SimpleToken');
const BadToken = artifacts.require('BadToken');

contract('Deposit', function ([_, user, owner, tokenWallet, tokenContract]) {
    beforeEach(async function () {
        this.dinngoImpl = await Dinngo.new(tokenWallet, tokenContract, { from: owner });
        this.dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.dinngoImpl.address, { from: owner });
    });

    describe('ether', function () {
        it('when normal', async function () {
            const id = new BN('1');
            const rank = new BN('1');
            const amount = ether('1');
            await this.dinngo.setUser(id, user, rank);
            const { logs } = await this.dinngo.deposit({ value: amount, from: user });
            const balance = await this.dinngo.balances.call(ZERO_ADDRESS, user);
            inLogs(logs, 'Deposit', { token: ZERO_ADDRESS, user: user, amount: amount, balance: balance });
        });

        it('when user invalid', async function () {
            const amount = ether('1');
            const { logs } = await this.dinngo.deposit({ value: amount, from: user });
            const balance = await this.dinngo.balances.call(ZERO_ADDRESS, user);
            inLogs(logs, 'Deposit', { token: ZERO_ADDRESS, user: user, amount: amount, balance: balance });
        });

        it('when value with amount 0', async function () {
            const id = new BN('1');
            const rank = new BN('1');
            const amount = ether('0');
            await this.dinngo.setUser(id, user, rank);
            await expectRevert.unspecified(this.dinngo.deposit({ value: amount, from: user }));
        });

    });

    describe('token', function () {
        beforeEach(async function () {
            this.token = await SimpleToken.new({ from: user });
            await this.dinngo.setToken('11', this.token.address, '1');
        });

        it('when normal with new user', async function () {
            const id = new BN('1');
            const rank = new BN('1');
            const amount = ether('1');
            await this.dinngo.setUser(id, user, rank);
            await this.token.approve(this.dinngo.address, amount, { from: user });
            const { logs } = await this.dinngo.depositToken(this.token.address, amount, { from: user });
            const balance = await this.dinngo.balances.call(this.token.address, user);
            inLogs(logs, 'Deposit', { token: this.token.address, user: user, amount: amount, balance: balance });
            expect(balance).to.be.bignumber.eq(amount);
        });

        it('when user invalid', async function () {
            const amount = ether('1');
            await this.token.approve(this.dinngo.address, amount, { from: user });
            const { logs } = await this.dinngo.depositToken(this.token.address, amount, { from: user });
            const balance = await this.dinngo.balances.call(this.token.address, user);
            inLogs(logs, 'Deposit', { token: this.token.address, user: user, amount: amount, balance: balance });
            expect(balance).to.be.bignumber.eq(amount);
        });

        it('when token with address 0', async function () {
            const id = new BN('1');
            const rank = new BN('1');
            const amount = ether('1');
            await this.dinngo.setUser(id, user, rank);
            await expectRevert.unspecified(this.dinngo.depositToken(ZERO_ADDRESS, amount, { from: user }));
        });

        it('when token with amount 0', async function () {
            const id = new BN('1');
            const rank = new BN('1');
            const amount = ether('0');
            await this.dinngo.setUser(id, user, rank);
            await this.token.approve(this.dinngo.address, amount, { from: user });
            await expectRevert.unspecified(this.dinngo.depositToken(this.token.address, amount, { from: user }));
        });
    });

    describe('bad token', function () {
        beforeEach(async function () {
            this.token = await BadToken.new({ from: user });
            await this.dinngo.setToken('11', this.token.address, '1');
        });

        it('when normal with new user', async function () {
            const id = new BN('1');
            const rank = new BN('1');
            const amount = ether('1');
            await this.dinngo.setUser(id, user, rank);
            await this.token.approve(this.dinngo.address, amount, { from: user });
            const { logs } = await this.dinngo.depositToken(this.token.address, amount, { from: user });
            const balance = await this.dinngo.balances.call(this.token.address, user);
            inLogs(logs, 'Deposit', { token: this.token.address, user: user, amount: amount, balance: balance });
            expect(balance).to.be.bignumber.eq(amount);
        });

        it('when user invalid', async function () {
            const amount = ether('1');
            await this.token.approve(this.dinngo.address, amount, { from: user });
            const { logs } = await this.dinngo.depositToken(this.token.address, amount, { from: user });
            const balance = await this.dinngo.balances.call(this.token.address, user);
            inLogs(logs, 'Deposit', { token: this.token.address, user: user, amount: amount, balance: balance });
            expect(balance).to.be.bignumber.eq(amount);
        });

        it('when token with address 0', async function () {
            const id = new BN('1');
            const rank = new BN('1');
            const amount = ether('1');
            await this.dinngo.setUser(id, user, rank);
            await expectRevert.unspecified(this.dinngo.depositToken(ZERO_ADDRESS, amount, { from: user }));
        });

        it('when token with amount 0', async function () {
            const id = new BN('1');
            const rank = new BN('1');
            const amount = ether('0');
            await this.dinngo.setUser(id, user, rank);
            await this.token.approve(this.dinngo.address, amount, { from: user });
            await expectRevert.unspecified(this.dinngo.depositToken(this.token.address, amount, { from: user }));
        });
    });
});
