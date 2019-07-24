const { BN, constants, ether, expectEvent, shouldFail, time } = require('openzeppelin-test-helpers');
const { duration, increase } = time;
const { inLogs } = expectEvent;
const { reverting } = shouldFail;
const { ZERO_ADDRESS } = constants;

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const SimpleToken = artifacts.require('SimpleToken');
const BadToken = artifacts.require('BadToken');

contract('ExtractFee', function ([_, user, owner, tokenWallet, tokenContract]) {
    beforeEach(async function () {
        this.dinngoImpl = await Dinngo.new();
        this.dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.dinngoImpl.address, { from: owner });
    });

    const depositValue = ether('1');
    const exceed = ether('1.1');
    const userId = new BN('1');
    const rank = new BN('1');

    describe('ether', function () {
        beforeEach(async function () {
            await this.dinngo.setUser(userId, user, rank);
            await this.dinngo.deposit({ value: depositValue, from: user });
            await this.dinngo.setUserBalance(ZERO_ADDRESS, ZERO_ADDRESS, depositValue);
        });

        it('when normal', async function () {
            const amount = depositValue;
            const { logs } = await this.dinngo.extractFee(amount, { from: tokenWallet });
            const balance = await this.dinngo.getFeeWallet.call(ZERO_ADDRESS);
            balance.should.be.bignumber.eq(ether('0'));
        });

        it('when value with amount 0', async function () {
            const amount = ether('0');
            await reverting(this.dinngo.extractFee(amount, { from: tokenWallet }));
        });

        it('when wallet balance is not sufficient', async function () {
            const amount = exceed;
            await reverting(this.dinngo.extractFee(amount, { from: tokenWallet }));
        });
    });

    describe('token', function () {
        beforeEach(async function () {
            this.token = await SimpleToken.new({ from: user });
            await this.dinngo.setToken('11', this.token.address, '1');
            await this.dinngo.setUser(userId, user, rank);
            await this.token.approve(this.dinngo.address, depositValue, { from: user });
            await this.dinngo.depositToken(this.token.address, depositValue, { from: user });
            await this.dinngo.setUserBalance(ZERO_ADDRESS, this.token.address, depositValue);
        });

        it('when normal', async function () {
            const amount = depositValue;
            const { logs } = await this.dinngo.extractTokenFee(this.token.address, amount, { from: tokenWallet });
            const balance = await this.dinngo.getFeeWallet.call(this.token.address);
            balance.should.be.bignumber.eq(ether('0'));
        });

        it('when token with address 0', async function () {
            const amount = depositValue;
            await reverting(this.dinngo.extractTokenFee(ZERO_ADDRESS, amount, { from: tokenWallet }));
        });

        it('when token with amount 0', async function () {
            const amount = ether('0');
            await reverting(this.dinngo.extractTokenFee(this.token.address, amount, { from: tokenWallet }));
        });

        it('when user balance is not sufficient', async function () {
            const amount = exceed;
            await reverting(this.dinngo.extractTokenFee(this.token.address, amount, { from: tokenWallet }));
        });
    });

    describe('bad token', function () {
        beforeEach(async function () {
            this.token = await BadToken.new({ from: user });
            await this.dinngo.setToken('11', this.token.address, '1');
            await this.dinngo.setUser(userId, user, rank);
            await this.token.approve(this.dinngo.address, depositValue, { from: user });
            await this.dinngo.depositToken(this.token.address, depositValue, { from: user });
            await this.dinngo.setUserBalance(ZERO_ADDRESS, this.token.address, depositValue);
        });

        it('when normal', async function () {
            const amount = depositValue;
            const { logs } = await this.dinngo.extractTokenFee(this.token.address, amount, { from: tokenWallet });
            const balance = await this.dinngo.getFeeWallet.call(this.token.address);
            balance.should.be.bignumber.eq(ether('0'));
        });

        it('when token with address 0', async function () {
            const amount = depositValue;
            await reverting(this.dinngo.extractTokenFee(ZERO_ADDRESS, amount, { from: tokenWallet }));
        });

        it('when token with amount 0', async function () {
            const amount = ether('0');
            await reverting(this.dinngo.extractTokenFee(this.token.address, amount, { from: tokenWallet }));
        });

        it('when user balance is not sufficient', async function () {
            const amount = exceed;
            await reverting(this.dinngo.extractTokenFee(this.token.address, amount, { from: tokenWallet }));
        });
    });
});
