import ether from 'openzeppelin-solidity/test/helpers/ether';
import expectThrow from 'openzeppelin-solidity/test/helpers/expectThrow';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const DinngoMock = artifacts.require('DinngoMock');

const should = require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .use(require('chai-as-promised'))
    .should();

contract('Settle', function([_, owner, user, dinngoWallet, DGO, token]) {
    const user1 = "0x627306090abab3a6e1400e9345bc60c78a8bef57";
    const user2 = "0xf17f52151ebef6c7334fad080c5704d77216b732";
    beforeEach(async function() {
        this.Dinngo = await DinngoMock.new(dinngoWallet, DGO, { from: owner });
        await this.Dinngo.setUser(11, user1, 1);
        await this.Dinngo.setUser(12, user2, 1);
        await this.Dinngo.setToken(11, token, 1);
        await this.Dinngo.setUserBalance(user1, token, ether(1000));
        await this.Dinngo.setUserBalance(user1, ZERO_ADDRESS, ether(1000));
        await this.Dinngo.setUserBalance(user1, DGO, ether(1000));
        await this.Dinngo.setUserBalance(user2, token, ether(1500));
        await this.Dinngo.setUserBalance(user2, ZERO_ADDRESS, ether(1500));
        await this.Dinngo.setUserBalance(user2, DGO, ether(1500));
    });

    describe('process maker order', function() {
        // user ID: 11
        // main token: 0
        // main amount: 23 ether
        // sub token: 11
        // sub amount: 43 ether
        // config: 1
        // token price: 2000
        // nonce: 17
        const order1 = "0x0a6dc56354ded2afa70070011218247d8ee31ae796925025d45dd7f15e5ffdc2b3b5ac4d8911c21371e6206d8ef790be1861aa819c6b802a2ebd849e9e214a860100000000000000000000000000000000000000000000000000000000000007d0000000110100000000000000000000000000000000000000000000000254beb02d1dcc0000000b0000000000000000000000000000000000000000000000013f306a2409fc000000000000000b";
        // user ID: 12
        // main token: 0
        // main amount: 11.5 ether
        // sub token: 11
        // sub amount: 21.5 ether
        // config: 2 (isBuy = false; isMain = true)
        // token price: 1000
        // nonce: 10
        const order2 = "0x75f47c89a6031ea52f092f0ae79f44489ad462a1513d24ffa10f5efde1b797ba46b4a6fb4f1efc688f6b461825dd686fa19f8cbb014ab8e33e88a220c23eb5e80000000000000000000000000000000000000000000000000000000000000003e80000000a020000000000000000000000000000000000000000000000012a5f58168ee60000000b0000000000000000000000000000000000000000000000009f98351204fe000000000000000c";
        it('Taker sub greater than buying maker sub', async function() {
            const { logs } = await this.Dinngo.processMakerMock(order1, ether(50));
            const event = logs.find(e => e.event === "TestMaker");
            should.exist(event);
            event.args.fillAmountMain.should.be.bignumber.eq(ether(23));
            event.args.restAmountSub.should.be.bignumber.eq(ether(7));
        });
        it('Taker sub lesser than buying maker sub', async function() {
            const { logs } = await this.Dinngo.processMakerMock(order1, ether(40));
            const event = logs.find(e => e.event === "TestMaker");
            should.exist(event);
            event.args.fillAmountMain.should.be.bignumber.eq(ether(23).mul(ether(40)).div(ether(43)).toFixed(0));
            event.args.restAmountSub.should.be.bignumber.eq(ether(0));
        });
        it('Taker sub greater than selling maker sub', async function() {
            const { logs } = await this.Dinngo.processMakerMock(order2, ether(30));
            const event = logs.find(e => e.event === "TestMaker");
            should.exist(event);
            event.args.fillAmountMain.should.be.bignumber.eq(ether(11.5));
            event.args.restAmountSub.should.be.bignumber.eq(ether(8.5));
        });
        it('Taker sub lesser than selling maker sub', async function() {
            const { logs } = await this.Dinngo.processMakerMock(order2, ether(20));
            const event = logs.find(e => e.event === "TestMaker");
            should.exist(event);
            event.args.fillAmountMain.should.be.bignumber.eq(ether(11.5).mul(ether(20)).div(ether(21.5)).toFixed(0));
            event.args.restAmountSub.should.be.bignumber.eq(ether(0));
        });
    });

    describe('settle', function() {
        // order1
        //  user ID: 11
        //  main token: 0
        //  main amount: 23 ether
        //  sub token: 11
        //  sub amount: 43 ether
        //  config: 1 (isBuy = true; isMain = false)
        //  token price: 2000
        //  nonce: 17
        // order2
        //  user ID: 12
        //  main token: 0
        //  main amount: 11.5 ether
        //  sub token: 11
        //  sub amount: 21.5 ether
        //  config: 2 (isBuy = false; isMain = true)
        //  token price: 1000
        //  nonce: 10
        const orders = "0x0a6dc56354ded2afa70070011218247d8ee31ae796925025d45dd7f15e5ffdc2b3b5ac4d8911c21371e6206d8ef790be1861aa819c6b802a2ebd849e9e214a860100000000000000000000000000000000000000000000000000000000000007d0000000110100000000000000000000000000000000000000000000000254beb02d1dcc0000000b0000000000000000000000000000000000000000000000013f306a2409fc000000000000000b75f47c89a6031ea52f092f0ae79f44489ad462a1513d24ffa10f5efde1b797ba46b4a6fb4f1efc688f6b461825dd686fa19f8cbb014ab8e33e88a220c23eb5e80000000000000000000000000000000000000000000000000000000000000003e80000000a020000000000000000000000000000000000000000000000012a5f58168ee60000000b0000000000000000000000000000000000000000000000009f98351204fe000000000000000c";
        it('Normal', async function() {
            const { logs } = await this.Dinngo.settle(orders, { from: owner });
            const event = logs.filter(e => e.event === "Trade");
            should.exist(event);
            event[0].args.user.should.eq(user2);
            event[0].args.isBuy.should.eq(false);
            event[0].args.tokenMain.should.eq(ZERO_ADDRESS);
            event[0].args.amountMain.should.be.bignumber.eq(ether(11.5));
            event[0].args.tokenSub.should.eq(token);
            event[0].args.amountSub.should.be.bignumber.eq(ether(21.5));
            event[1].args.user.should.eq(user1);
            event[1].args.isBuy.should.eq(true);
            event[1].args.tokenMain.should.eq(ZERO_ADDRESS);
            event[1].args.amountMain.should.be.bignumber.eq(ether(11.5));
            event[1].args.tokenSub.should.eq(token);
            event[1].args.amountSub.should.be.bignumber.eq(ether(21.5));
            let user1Ether = await this.Dinngo.balance.call(ZERO_ADDRESS, user1);
            let user1DGO = await this.Dinngo.balance.call(DGO, user1);
            let user1Token = await this.Dinngo.balance.call(token, user1);
            let user2Ether = await this.Dinngo.balance.call(ZERO_ADDRESS, user2);
            let user2DGO = await this.Dinngo.balance.call(DGO, user2);
            let user2Token = await this.Dinngo.balance.call(token, user2);
            let walletEther = await this.Dinngo.balance.call(ZERO_ADDRESS, dinngoWallet);
            let walletDGO = await this.Dinngo.balance.call(DGO, dinngoWallet);
            let walletToken = await this.Dinngo.balance.call(token, dinngoWallet);
            user1Ether.should.be.bignumber.eq(ether(1000-11.5));
            user1DGO.should.be.bignumber.eq(ether(1000-11.5*0.002*0.5*0.2));
            user1Token.should.be.bignumber.eq(ether(1000+21.5));
            user2Ether.should.be.bignumber.eq(ether(1500+11.5-11.5*0.001*0.1));
            user2DGO.should.be.bignumber.eq(ether(1500));
            user2Token.should.be.bignumber.eq(ether(1500-21.5));
            walletEther.should.be.bignumber.eq(ether(11.5*0.001*0.1));
            walletDGO.should.be.bignumber.eq(ether(11.5*0.002*0.5*0.2));
            walletToken.should.be.bignumber.eq(ether(0));
            let amount1 = await this.Dinngo.orderFill.call("0xc6df8e62380ee431b4049d1af5602368f567b53816a6780189fbcd1435b667d4");
            let amount2 = await this.Dinngo.orderFill.call("0x30fb1686eefe31b098fb1e2e418ceeffe3b3a5effbf5a50cd1483e420244a6c7");
            amount1.should.be.bignumber.eq(ether(21.5));
            amount2.should.be.bignumber.eq(ether(21.5));
        });
        it('Not owner', async function() {
            await expectThrow(this.Dinngo.settle(orders, { from: user }));
        });
    });
});
