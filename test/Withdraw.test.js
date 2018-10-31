import ether from 'openzeppelin-solidity/test/helpers/ether';
import { increaseTimeTo, duration } from 'openzeppelin-solidity/test/helpers/increaseTime';
import latestTime from 'openzeppelin-solidity/test/helpers/latestTime';
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

contract('Withdraw', function ([_, user, owner, tokenWallet, tokenContract]) {
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
    });
    describe('token', function () {
        beforeEach(async function () {
            this.Token = await SimpleToken.new({ from: user });
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
    });
});

contract('WithdrawAdmin', function ([_, owner, someone, tokenWallet, tokenContract]) {
    const user = "0x627306090abab3a6e1400e9345bc60c78a8bef57";
    beforeEach(async function() {
        this.Dinngo = await DinngoMock.new(tokenWallet, tokenContract, { from: owner });
        await this.Dinngo.setUser(11, user, 1);
    });
    describe('ether', function () {
        /*
        userID: 11
        userAddress: 0x627306090abab3a6e1400e9345bc60c78a8bef57
        token: 0
        amount: 2 ether
        config: 1
        fee: 0.005 ether
        nonce: 4
        r: 0xcbab9d2e50d30a98f207c50f3d7e5b8dd80c4d9aa4f9e7a6bff89813b7f31303
        s: 0x794b55b74debf180f7b0428238032dee64b2622d6a4c1d04faa4a3b4c6d6e584
        v: 0x01
        */
        const withdrawal1 = "0x794b55b74debf180f7b0428238032dee64b2622d6a4c1d04faa4a3b4c6d6e584cbab9d2e50d30a98f207c50f3d7e5b8dd80c4d9aa4f9e7a6bff89813b7f31303010000000000000000000000000000000000000000000000000011c37937e0800000000004010000000000000000000000000000000000000000000000001bc16d674ec8000000000000000b";
        it('when normal', async function () {
            await this.Dinngo.deposit({ from: user, value: ether(5) });
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner });
            const event = await inLogs(logs, 'Withdraw');
            event.args.token.should.eq(ZERO_ADDRESS);
            event.args.user.should.eq(user);
            event.args.amount.should.be.bignumber.eq(ether(2));
            event.args.balance.should.be.bignumber.eq(ether(5-2-0.005));
        });

        it('when sent by non-owner', async function () {
            await this.Dinngo.deposit({ value: ether(5), from: user });
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal1, { from: someone }));
        });

        it('when user balance is not sufficient', async function () {
            await this.Dinngo.deposit({ value: ether(1), from: user });
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner }));
        });

        it('when fee is paid in ETH', async function () {
            await this.Dinngo.deposit({ from: user, value: ether(5) });
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner });
            const event = await inLogs(logs, 'Withdraw');
            let balance = await this.Dinngo.balances.call(ZERO_ADDRESS, user);
            event.args.token.should.eq(ZERO_ADDRESS);
            event.args.user.should.eq(user);
            event.args.amount.should.be.bignumber.eq(ether(2));
            event.args.balance.should.be.bignumber.eq(ether(5-2-0.005));
        });

        it('when fee is insufficient', async function () {
            await this.Dinngo.deposit({ value: ether(2), from: user });
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner }));
        });
    });

    describe('token', function () {
        /*
        userID: 11
        userAddress: 0x627306090abab3a6e1400e9345bc60c78a8bef57
        token: 11
        amount: 3 ether
        config: 0
        fee: 0.01 ether
        nonce: 4
        r: 0xff082cf088f83143f4c81253d8e1f0a4b67be4c0036fcc96fce640b8a6bfbfad
        s: 0x11327a5d4c094374f596d51b2edfd3461acb31e0c2e3395eb94d51912116e2b7
        v: 0x01
        */
        const withdrawal1 = "0x11327a5d4c094374f596d51b2edfd3461acb31e0c2e3395eb94d51912116e2b7ff082cf088f83143f4c81253d8e1f0a4b67be4c0036fcc96fce640b8a6bfbfad01000000000000000000000000000000000000000000000000002386f26fc10000000000030000000000000000000000000000000000000000000000000029a2241af62c0000000b0000000b";
        beforeEach(async function () {
            this.Token = await SimpleToken.new({ from: user });
            await this.Dinngo.setToken(11, this.Token.address, 1)
        });

        it('when normal', async function () {
            let amount = ether(5);
            await this.Token.approve(this.Dinngo.address, amount, { from: user });
            await this.Dinngo.depositToken(this.Token.address, amount, { from: user });
            await this.Dinngo.setUserBalance(user, tokenContract, amount);
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner });
            const event = await inLogs(logs, 'Withdraw');
            event.args.token.should.eq(this.Token.address);
            event.args.user.should.eq(user);
            event.args.amount.should.be.bignumber.eq(ether(3));
            event.args.balance.should.be.bignumber.eq(ether(5-3));
        });

        it('when sent by non-owner', async function () {
            let amount = ether(5);
            await this.Token.approve(this.Dinngo.address, amount, { from: user });
            await this.Dinngo.depositToken(this.Token.address, amount, { from: user });
            await this.Dinngo.setUserBalance(user, tokenContract, amount);
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal1, { from: someone }));
        });

        it('when value with amount 0', async function () {
            // TODO
        });

        it('when user balance is not sufficient', async function () {
            let amount = ether(1);
            await this.Token.approve(this.Dinngo.address, amount, { from: user });
            await this.Dinngo.depositToken(this.Token.address, amount, { from: user });
            await this.Dinngo.setUserBalance(user, tokenContract, amount);
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner }));
        });

        it('when fee is paid in DGO', async function () {
            let amount = ether(5);
            await this.Token.approve(this.Dinngo.address, amount, { from: user });
            await this.Dinngo.depositToken(this.Token.address, amount, { from: user });
            await this.Dinngo.setUserBalance(user, tokenContract, amount);
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner });
            const event = await inLogs(logs, 'Withdraw');
            event.args.token.should.eq(this.Token.address);
            event.args.user.should.eq(user);
            event.args.amount.should.be.bignumber.eq(ether(3));
            event.args.balance.should.be.bignumber.eq(ether(5-3));
            let balance = await this.Dinngo.balances.call(tokenContract, user);
            balance.should.be.bignumber.eq(ether(5-0.01*0.5));
        });

        it('when fee is insufficient', async function () {
            let amount = ether(5);
            await this.Token.approve(this.Dinngo.address, amount, { from: user });
            await this.Dinngo.depositToken(this.Token.address, amount, { from: user });
            await this.Dinngo.setUserBalance(user, tokenContract, ether(0.001));
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner }));
        });
    });
});
