const { constants, ether, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const SimpleToken = artifacts.require('SimpleToken');

contract('Deposit', function ([_, user, owner, tokenWallet, tokenContract]) {
    beforeEach(async function () {
        this.DinngoImpl = await Dinngo.new(tokenWallet, tokenContract, { from: owner });
        this.Dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.DinngoImpl.address, { from: owner });
    });

    describe('ether', function () {
        it('when normal', async function () {
            await this.Dinngo.setUser(1, user, 1);
            const value = ether('1');
            const { logs } = await this.Dinngo.deposit({ value: value, from: user });
            const eventDeposit = await expectEvent.inLogs(logs, 'Deposit');
            let balance = await this.Dinngo.balances.call(ZERO_ADDRESS, user);
            eventDeposit.args.token.should.eq(ZERO_ADDRESS);
            eventDeposit.args.user.should.eq(user);
            eventDeposit.args.amount.should.be.bignumber.eq(value);
            eventDeposit.args.balance.should.be.bignumber.eq(balance);
        });

        it('when user invalid', async function () {
            const value = ether('1');
            const { logs } = await this.Dinngo.deposit({ value: value, from: user });
            const eventDeposit = await expectEvent.inLogs(logs, 'Deposit');
            let balance = await this.Dinngo.balances.call(ZERO_ADDRESS, user);
            eventDeposit.args.token.should.eq(ZERO_ADDRESS);
            eventDeposit.args.user.should.eq(user);
            eventDeposit.args.amount.should.be.bignumber.eq(value);
            eventDeposit.args.balance.should.be.bignumber.eq(balance);
        });

        it('when value with amount 0', async function () {
            const value = ether('0');
            await this.Dinngo.setUser(1, user, 1);
            await shouldFail.reverting(this.Dinngo.deposit({ value: value, from: user }));
        });

    });

    describe('token', function () {
        beforeEach(async function () {
            this.Token = await SimpleToken.new({ from: user });
        });

        it('when normal with new user', async function () {
            await this.Dinngo.setUser(1, user, 1);
            const value = ether('1');
            await this.Token.approve(this.Dinngo.address, value, { from: user });
            const { logs } = await this.Dinngo.depositToken(this.Token.address, value, { from: user });
            const eventDeposit = await expectEvent.inLogs(logs, 'Deposit');
            let balance = await this.Dinngo.balances.call(this.Token.address, user);
            eventDeposit.args.token.should.eq(this.Token.address);
            eventDeposit.args.user.should.eq(user);
            eventDeposit.args.amount.should.be.bignumber.eq(value);
            eventDeposit.args.balance.should.be.bignumber.eq(balance);
            balance.should.be.bignumber.eq(value);
        });

        it('when user invalid', async function () {
            const value = ether('1');
            await this.Token.approve(this.Dinngo.address, value, { from: user });
            const { logs } = await this.Dinngo.depositToken(this.Token.address, value, { from: user });
            const eventDeposit = await expectEvent.inLogs(logs, 'Deposit');
            let balance = await this.Dinngo.balances.call(this.Token.address, user);
            eventDeposit.args.token.should.eq(this.Token.address);
            eventDeposit.args.user.should.eq(user);
            eventDeposit.args.amount.should.be.bignumber.eq(value);
            eventDeposit.args.balance.should.be.bignumber.eq(balance);
            balance.should.be.bignumber.eq(value);
        });

        it('when token with address 0', async function () {
            const value = ether('1');
            await this.Dinngo.setUser(1, user, 1);
            await shouldFail.reverting(this.Dinngo.depositToken(ZERO_ADDRESS, value, { from: user }));
        });

        it('when token with amount 0', async function () {
            const value = ether('0');
            await this.Dinngo.setUser(1, user, 1);
            await this.Token.approve(this.Dinngo.address, value, { from: user });
            await shouldFail.reverting(this.Dinngo.depositToken(this.Token.address, value, { from: user }));
        });
    });
});
