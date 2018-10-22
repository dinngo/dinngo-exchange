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
            const { logs } = await this.Dinngo.withdraw(value, { from: user });
            const event = await inLogs(logs, 'Withdraw');
            let balance = await this.Dinngo.balance.call(0, user);
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
            let balance = await this.Dinngo.balance.call(this.Token.address, user);
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

contract('WithdrawAdmin', function ([_, owner, someone, tokenWallet, tokenContract]) {
    beforeEach(async function() {
        this.Dinngo = await DinngoMock.new(tokenWallet, tokenContract, { from: owner });
        await this.Dinngo.setUser(11, "0x627306090abab3a6e1400e9345bc60c78a8bef57", 1);
        await this.Dinngo.sendTransaction({ from: web3.eth.coinbase, value: ether(90) });
    });

    describe('ether', function () {
        /*
        userID: 11
        userAddress: 0x627306090abab3a6e1400e9345bc60c78a8bef57
        token: 0;
        amount: 23 ether
        config: 1
        fee: 0.1 ether
        nonce: 17
        r: 0x2ff29230014283c7b30f7edaa75cb8b4f397fbc6fd438acdfabed16330f9fb6d
        s: 0x5216167f7eb4f43cdfa1a094b1525ff00ec19d8fd33fef5383cb553f56f8c61c
        v: 0x01
        */
        const withdrawal1 = "0x5216167f7eb4f43cdfa1a094b1525ff00ec19d8fd33fef5383cb553f56f8c61c2ff29230014283c7b30f7edaa75cb8b4f397fbc6fd438acdfabed16330f9fb6d01000000000000000000000000000000000000000000000000016345785d8a000000000011010000000000000000000000000000000000000000000000013f306a2409fc000000000000000b";
        it('when normal', async function () {
            console.log(await web3.eth.getBalance(this.Dinngo));
            /*
            await this.Dinngo.deposit({ value: ether(40), from: user });
            console.log(await this.Dinngo.balance.call(ZERO_ADDRESS, user));
            console.log(await web3.eth.getBalance(user));
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner });
            const event = await inLogs(logs, 'Withdraw');
            let balance = await this.Dinngo.balance.call(ZERO_ADDRESS, user);
            event.args.token.should.eq(ZERO_ADDRESS);
            event.args.user.should.eq(user);
            event.args.amount.should.be.bignumber.eq(ether(23));
            event.args.balance.should.be.bignumber.eq(ether(40-23-0.1));
            */
        });

        it('when sent by non-owner', async function () {
            /*
            await this.Dinngo.deposit({ value: ether(40), from: user });
            console.log(await this.Dinngo.balance.call(ZERO_ADDRESS, user));
            console.log(await web3.eth.getBalance(user));
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal1, { from: someone }));
            */
        });

        it('when user balance is not sufficient', async function () {
            /*
            await this.Dinngo.deposit({ value: ether(20), from: user });
            console.log(await this.Dinngo.balance.call(ZERO_ADDRESS, user));
            console.log(await web3.eth.getBalance(user));
            await expectThrow(this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner }));
            */
        });

        it('when fee is paid in ETH', async function () {
            /*
            await this.Dinngo.deposit({ value: ether(40), from: user });
            console.log(await this.Dinngo.balance.call(ZERO_ADDRESS, user));
            console.log(await web3.eth.getBalance(user));
            const { logs } = await this.Dinngo.withdrawByAdmin(withdrawal1, { from: owner });
            const event = await inLogs(logs, 'Withdraw');
            let balance = await this.Dinngo.balance.call(ZERO_ADDRESS, user);
            event.args.token.should.eq(ZERO_ADDRESS);
            event.args.user.should.eq(user);
            event.args.amount.should.be.bignumber.eq(ether(23));
            event.args.balance.should.be.bignumber.eq(ether(40-23-0.1));
            */
        });

        it('when fee is paid in DGO', async function () {
            
        });

        it('when fee is insufficient', async function () {
            
        });
    });

    describe('token', function () {
        beforeEach(async function () {
            //await this.Dinngo.deposit({ value: depositValue, from: user});
        });

        it('when normal', async function () {
        
        });

        it('when sent by non-owner', async function () {
            
        });

        it('when value with amount 0', async function () {
            
        });

        it('when user balance is not sufficient', async function () {
            
        });

        it('when fee is paid in ETH', async function () {
            
        });

        it('when fee is paid in DGO', async function () {
            
        });

        it('when fee is insufficient', async function () {
            
        });
    });
});
