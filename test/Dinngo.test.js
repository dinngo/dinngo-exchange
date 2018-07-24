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

contract('Dinngo', function ([_, user, owner, tokenWallet, tokenContract, user2]) {
    describe('deposit', function () {
        beforeEach(async function () {
            this.Dinngo = await DinngoMock.new(tokenWallet, tokenContract, { from: owner });
        });

        describe('ether', function () {
            it('when normal with new user', async function () {
                const value = ether(10);
                const { logs } = await this.Dinngo.deposit({ value: value, from: user });
                const eventDeposit = await inLogs(logs, 'Deposit');
                let balance = await this.Dinngo.getBalance.call(0, user);
                eventDeposit.args.token.should.eq(ZERO_ADDRESS);
                eventDeposit.args.user.should.eq(user);
                eventDeposit.args.amount.should.be.bignumber.eq(value);
                eventDeposit.args.balance.should.be.bignumber.eq(balance);
                const eventAddUser = await inLogs(logs, 'AddUser');
                eventAddUser.args.userID.should.be.bignumber.eq(1);
                eventAddUser.args.user.should.eq(user);
            });

            it('when normal with old user', async function () {
                const value = ether(10);
                await this.Dinngo.addUserMock(user);
                let userAddress1 = await this.Dinngo.getUserAddress.call(1);
                const { logs } = await this.Dinngo.deposit({ value: value, from: user });
                const eventDeposit = await inLogs(logs, 'Deposit');
                let balance = await this.Dinngo.getBalance.call(0, user);
                let userAddress2 = await this.Dinngo.getUserAddress.call(2);
                eventDeposit.args.token.should.eq(ZERO_ADDRESS);
                eventDeposit.args.user.should.eq(user);
                eventDeposit.args.amount.should.be.bignumber.eq(value);
                eventDeposit.args.balance.should.be.bignumber.eq(balance);
                userAddress1.should.eq(user);
                userAddress2.should.eq(ZERO_ADDRESS);
            });

            it('when value with amount 0', async function () {
                const value = ether(0);
                await expectThrow(this.Dinngo.deposit({ value: value, from: user }));
            });
        });

        describe('token', function () {
            beforeEach(async function () {
                this.Token = await SimpleToken.new({ from: user });
            });

            it('when normal with new user', async function () {
                const value = ether(10);
                await this.Token.approve(this.Dinngo.address, value, { from: user });
                const { logs } = await this.Dinngo.depositToken(this.Token.address, value, { from: user });
                const eventDeposit = await inLogs(logs, 'Deposit');
                let balance = await this.Dinngo.getBalance.call(this.Token.address, user);
                eventDeposit.args.token.should.eq(this.Token.address);
                eventDeposit.args.user.should.eq(user);
                eventDeposit.args.amount.should.be.bignumber.eq(value);
                eventDeposit.args.balance.should.be.bignumber.eq(balance);
                balance.should.be.bignumber.eq(value);
                const eventAddUser = await inLogs(logs, 'AddUser');
                eventAddUser.args.userID.should.be.bignumber.eq(1);
                eventAddUser.args.user.should.eq(user);
            });

            it('when normal with old user', async function () {
                const value = ether(10);
                await this.Dinngo.addUserMock(user);
                let userAddress1 = await this.Dinngo.getUserAddress.call(1);
                await this.Token.approve(this.Dinngo.address, value, { from: user });
                const { logs } = await this.Dinngo.depositToken(this.Token.address, value, { from: user });
                const event = await inLogs(logs, 'Deposit');
                let balance = await this.Dinngo.getBalance.call(this.Token.address, user);
                let userAddress2 = await this.Dinngo.getUserAddress.call(2);
                event.args.token.should.eq(this.Token.address);
                event.args.user.should.eq(user);
                event.args.amount.should.be.bignumber.eq(value);
                event.args.balance.should.be.bignumber.eq(balance);
                balance.should.be.bignumber.eq(value);
                userAddress1.should.eq(user);
                userAddress2.should.eq(ZERO_ADDRESS);
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

    describe('withdraw', function () {
        beforeEach(async function () {
            this.Dinngo = await DinngoMock.new(tokenWallet, tokenContract, { from: owner });
        });
        const depositValue = ether(10);
        const exceed = ether(11);
        describe('ether', function () {
            beforeEach(async function () {
                await this.Dinngo.deposit({ value: depositValue, from: user });
            });

            it('when normal', async function () {
                const value = ether(1);
                const { logs } = await this.Dinngo.withdraw(value, { from: user });
                const event = await inLogs(logs, 'Withdraw');
                let balance = await this.Dinngo.getBalance.call(0, user);
                event.args.token.should.eq(ZERO_ADDRESS);
                event.args.user.should.eq(user);
                event.args.amount.should.be.bignumber.eq(value);
                event.args.balance.should.be.bignumber.eq(balance);
            });

            it('when value with amount 0', async function () {
                const value = ether(0);
                await expectThrow(this.Dinngo.withdraw(value, { from: user }));
            });

            it('when user balance is not sufficient', async function () {
                const value = ether(11);
                await expectThrow(this.Dinngo.withdraw(value, { from: user }));
            });
        });

        describe('token', function () {
            beforeEach(async function () {
                this.Token = await SimpleToken.new({ from: user });
                await this.Token.approve(this.Dinngo.address, depositValue, { from: user });
                await this.Dinngo.depositToken(this.Token.address, depositValue, { from: user });
            });

            it('when normal', async function () {
                const value = ether(1);
                const { logs } = await this.Dinngo.withdrawToken(this.Token.address, value, { from: user });
                const event = await inLogs(logs, 'Withdraw');
                let balance = await this.Dinngo.getBalance.call(this.Token.address, user);
                event.args.token.should.eq(this.Token.address);
                event.args.user.should.eq(user);
                event.args.amount.should.be.bignumber.eq(value);
                event.args.balance.should.be.bignumber.eq(balance);
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
        });
    });

    describe('user', function () {
        beforeEach(async function () {
            this.Dinngo = await DinngoMock.new(tokenWallet, tokenContract, { from: owner });
        });

        describe('add user', function () {
            it('when normal', async function () {
                const { logs } = await this.Dinngo.addUserMock(user);
                const event = await inLogs(logs, 'AddUser');
                event.args.userID.should.be.bignumber.eq(1);
                event.args.user.should.eq(user);
                let rank = await this.Dinngo.getUserRank.call(user);
                //rank.should.be.bignumber.eq(1);
            });

            it('when existed', async function () {
                await this.Dinngo.addUserMock(user);
                let userAddress1 = await this.Dinngo.getUserAddress.call(1);
                await this.Dinngo.addUserMock(user);
                let userAddress2 = await this.Dinngo.getUserAddress.call(2);
                userAddress1.should.eq(user);
                userAddress2.should.eq(ZERO_ADDRESS);
                await this.Dinngo.addUserMock(user2);
                userAddress2 = await this.Dinngo.getUserAddress.call(2);
                userAddress2.should.eq(user2);
            });
        });

        describe('update rank', function () {
            it('when normal', async function () {
                await this.Dinngo.addUserMock(user);
                let rank1 = await this.Dinngo.getUserRank.call(user);
                rank1.should.be.bignumber.eq(1);
                await this.Dinngo.updateUserRank(user, 2, { from: owner });
                let rank2 = await this.Dinngo.getUserRank.call(user);
                rank2.should.be.bignumber.eq(2);
            });

            it('when user not exist', async function () {
                await expectThrow(this.Dinngo.updateUserRank(user, 2, { from: owner }));
            });

            it('when assigning same rank', async function () {
                await this.Dinngo.addUserMock(user);
                let rank1 = await this.Dinngo.getUserRank.call(user);
                rank1.should.be.bignumber.eq(1);
                await expectThrow(this.Dinngo.updateUserRank(user, 1, { from: owner }));
            });
        });
    });
});
