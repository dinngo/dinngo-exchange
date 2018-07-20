import ether from 'openzeppelin-solidity/test/helpers/ether';
import expectThrow from 'openzeppelin-solidity/test/helpers/expectThrow';
import { inLogs } from 'openzeppelin-solidity/test/helpers/expectEvent';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const DinngoMock = artifacts.require('DinngoMock');
const SimpleToken = artifacts.require('SimpleToken');

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('Dinngo', function ([_, user, tokenWallet, tokenContract]) {
    describe('deposit', function() {
        beforeEach(async function() {
            this.Dinngo = await DinngoMock.new(tokenWallet, tokenContract);
        });

        describe('ether', function() {
            it('when normal', async function () {
                const value = ether(10);
                const { logs } = await this.Dinngo.deposit({ value: value, from: user });
                const event = await inLogs(logs, 'Deposit');
                let balance = await this.Dinngo.getBalance.call(0, user);
                event.args.token.should.eq(ZERO_ADDRESS);
                event.args.user.should.eq(user);
                event.args.amount.should.be.bignumber.eq(value);
                event.args.balance.should.be.bignumber.eq(balance);
            });

            it('when value with amount 0', async function () {
                const value = ether(0);
                await expectThrow(this.Dinngo.deposit({ value: value, from: user }));
            });
        });

        describe('token', function() {
            beforeEach(async function() {
                this.Token = await SimpleToken.new({ from: user });
            });

            it('when normal', async function () {
                const value = ether(10);
                await this.Token.approve(this.Dinngo.address, value, { from: user });
                const { logs } = await this.Dinngo.depositToken(this.Token.address, value, { from: user });
                const event = await inLogs(logs, 'Deposit');
                let balance = await this.Dinngo.getBalance.call(this.Token.address, user);
                event.args.token.should.eq(this.Token.address);
                event.args.user.should.eq(user);
                event.args.amount.should.be.bignumber.eq(value);
                event.args.balance.should.be.bignumber.eq(balance);
                assert.equal(value - balance, ether(0));
            });

            it('when token with address 0', async function () {
                const value = ether(10);
                await expectThrow(this.Dinngo.depositToken(ZERO_ADDRESS, value, {from: user}));
            });

            it('when token with amount 0', async function () {
                const value = ether(0);
                await expectThrow(this.Dinngo.depositToken(this.Token.address, value, { from: user}));
            });
        });
    });

    describe('withdraw', function() {
        const depositValue = ether(10);
        const exceed = ether(11);
        describe('ether', function() {
            beforeEach(async function() {
                this.Dinngo = await DinngoMock.new(tokenWallet, tokenContract);
                await this.Dinngo.deposit({ value: depositValue, from: user });
            });

            it('when normal', async function() {
                const value = ether(1);
                const { logs } = await this.Dinngo.withdraw(value, { from: user });
                const event = await inLogs(logs, 'Withdraw');
                let balance = await this.Dinngo.getBalance.call(0, user);
                event.args.token.should.eq(ZERO_ADDRESS);
                event.args.user.should.eq(user);
                event.args.amount.should.be.bignumber.eq(value);
                event.args.balance.should.be.bignumber.eq(balance);
            });

            it('when value with amount 0', async function() {
                const value = ether(0);
                await expectThrow(this.Dinngo.withdraw(value, { from: user }));
            });

            it('when user balance is not sufficient', async function() {
                const value = ether(11);
                await expectThrow(this.Dinngo.withdraw(value, { from: user }));
            });
        });

        describe('token', function() {
            beforeEach(async function() {
                this.Dinngo = await DinngoMock.new(tokenWallet, tokenContract);
                this.Token = await SimpleToken.new({ from: user });
                await this.Token.approve(this.Dinngo.address, depositValue, { from: user });
                await this.Dinngo.depositToken(this.Token.address, depositValue, { from: user });
            });

            it('when normal', async function() {
                const value = ether(1);
                const { logs } = await this.Dinngo.withdrawToken(this.Token.address, value, { from: user });
                const event = await inLogs(logs, 'Withdraw');
                let balance = await this.Dinngo.getBalance.call(this.Token.address, user);
                event.args.token.should.eq(this.Token.address);
                event.args.user.should.eq(user);
                event.args.amount.should.be.bignumber.eq(value);
                event.args.balance.should.be.bignumber.eq(balance);
            });

            it('when token with address 0', async function() {
                const value = ether(1);
                await expectThrow(this.Dinngo.withdrawToken(ZERO_ADDRESS, value, { from: user }));
            });

            it('when token with amount 0', async function() {
                const value = ether(0);
                await expectThrow(this.Dinngo.withdrawToken(this.Token.address, value, { from: user }));
            });

            it('when user balance is not sufficient', async function() {
                const value = ether(11);
                await expectThrow(this.Dinngo.withdrawToken(this.Token.address, value, { from: user }));
            });
        });
    });
});
