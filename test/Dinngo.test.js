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

contract('Dinngo', function ([_, user]) {
    beforeEach(async function() {
        this.Dinngo = await DinngoMock.new();
        this.Token = await SimpleToken.new({ from: user });
    });

    it ('deposit ether', async function () {
        const value = ether(10);
        const { logs } = await this.Dinngo.deposit({ value: value, from: user });
        const event = await inLogs(logs, 'Deposit');
        let balance = await this.Dinngo.getBalance.call(0, user);
        event.args.token.should.eq(ZERO_ADDRESS);
        event.args.user.should.eq(user);
        event.args.amount.should.be.bignumber.eq(value);
        event.args.balance.should.be.bignumber.eq(balance);
        assert.equal(value - balance, ether(0));
    });

    it ('deposit token', async function () {
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

    it ('deposit ether with 0', async function () {
        const value = ether(0);
        await expectThrow(this.Dinngo.deposit({ value: value, from: user }));
    });

    it ('deposit token with address 0', async function () {
        const value = ether(10);
        await expectThrow(this.Dinngo.depositToken(0x0, value, {from: user}));
    });

    it ('deposit token with amount 0', async function () {
        const value = ether(0);
        await expectThrow(this.Dinngo.depositToken(this.Token.address, value, { from: user}));
    });
});
