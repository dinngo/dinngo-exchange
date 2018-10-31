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
        // main amount: 3 ether
        // sub token: 11
        // sub amount: 100 ether
        // config: 1
        // token price: 100
        // nonce: 1
        const order1 = "0x53a433772f03b5eec7d04a51454cf7bde16e0cd1c39595b96f6a22919e4d524fdbc2b281c271363b56d54f448ceb6ed8dd4df17534cde8d31b5fe9bb4be00ffd00000000000000000000000000000000000000000000000000000000000000000a00000001010000000000000000000000000000000000000000000000056bc75e2d63100000000b00000000000000000000000000000000000000000000000029a2241af62c000000000000000b";
        // user ID: 12
        // main token: 0
        // main amount: 1.5 ether
        // sub token: 11
        // sub amount: 80 ether
        // config: 2 (isBuy = false; isMain = true)
        // token price: 10000
        // nonce: 2
        const order2 = "0x1eac339001c458855fc4a6b41212bf3f590507f8eb1cf251d3c0445b9a94dff888a8db71e4b326496be169cb18c95df1d5456a2a8718713a4a0a57a5a159ebe20100000000000000000000000000000000000000000000000000000000000027100000000202000000000000000000000000000000000000000000000004563918244f400000000b00000000000000000000000000000000000000000000000014d1120d7b16000000000000000c";
        it('Taker sub greater than buying maker sub', async function() {
            const { logs } = await this.Dinngo.processMakerMock(order1, ether(130));
            const event = logs.find(e => e.event === "TestMaker");
            should.exist(event);
            event.args.fillAmountMain.should.be.bignumber.eq(ether(3));
            event.args.restAmountSub.should.be.bignumber.eq(ether(30));
        });
        it('Taker sub lesser than buying maker sub', async function() {
            const { logs } = await this.Dinngo.processMakerMock(order1, ether(80));
            const event = logs.find(e => e.event === "TestMaker");
            should.exist(event);
            event.args.fillAmountMain.should.be.bignumber.eq(ether(3).mul(ether(80)).div(ether(100)).toFixed(0));
            event.args.restAmountSub.should.be.bignumber.eq(ether(0));
        });
        it('Taker sub greater than selling maker sub', async function() {
            const { logs } = await this.Dinngo.processMakerMock(order2, ether(90));
            const event = logs.find(e => e.event === "TestMaker");
            should.exist(event);
            event.args.fillAmountMain.should.be.bignumber.eq(ether(1.5));
            event.args.restAmountSub.should.be.bignumber.eq(ether(10));
        });
        it('Taker sub lesser than selling maker sub', async function() {
            const { logs } = await this.Dinngo.processMakerMock(order2, ether(40));
            const event = logs.find(e => e.event === "TestMaker");
            should.exist(event);
            event.args.fillAmountMain.should.be.bignumber.eq(ether(1.5).mul(ether(40)).div(ether(80)).toFixed(0));
            event.args.restAmountSub.should.be.bignumber.eq(ether(0));
        });
    });

    describe('settle', function() {
        // order1
        // {11, 0, 3 ether, 11, 100 ether, 1, 10, 1}
        //  user ID: 11
        //  main token: 0
        //  main amount: 3 ether
        //  sub token: 11
        //  sub amount: 100 ether
        //  config: 1 (isBuy = true; isMain = false)
        //  token price: 10
        //  nonce: 1
        // order2
        // {12, 0, 1.5 ether, 11, 80 ether, 2, 10000, 2}
        //  user ID: 12
        //  main token: 0
        //  main amount: 1.5 ether
        //  sub token: 11
        //  sub amount: 80 ether
        //  config: 2 (isBuy = false; isMain = true)
        //  token price: 10000
        //  nonce: 2
        const orders = "0x53a433772f03b5eec7d04a51454cf7bde16e0cd1c39595b96f6a22919e4d524fdbc2b281c271363b56d54f448ceb6ed8dd4df17534cde8d31b5fe9bb4be00ffd00000000000000000000000000000000000000000000000000000000000000000a00000001010000000000000000000000000000000000000000000000056bc75e2d63100000000b00000000000000000000000000000000000000000000000029a2241af62c000000000000000b1eac339001c458855fc4a6b41212bf3f590507f8eb1cf251d3c0445b9a94dff888a8db71e4b326496be169cb18c95df1d5456a2a8718713a4a0a57a5a159ebe20100000000000000000000000000000000000000000000000000000000000027100000000202000000000000000000000000000000000000000000000004563918244f400000000b00000000000000000000000000000000000000000000000014d1120d7b16000000000000000c";
        const mainToken = ZERO_ADDRESS;
        const subToken = token;
        const mainAmount1 = ether(3);
        const subAmount1 = ether(100);
        const mainAmount2 = ether(1.5);
        const subAmount2 = ether(80);
        it('Normal', async function() {
            const { logs } = await this.Dinngo.settle(orders, { from: owner });
            const event = logs.filter(e => e.event === "Trade");
            should.exist(event);
            event[0].args.user.should.eq(user2);
            event[0].args.isBuy.should.eq(false);
            event[0].args.tokenMain.should.eq(mainToken);
            event[0].args.amountMain.should.be.bignumber.eq(mainAmount2);
            event[0].args.tokenSub.should.eq(subToken);
            event[0].args.amountSub.should.be.bignumber.eq(subAmount2);
            event[1].args.user.should.eq(user1);
            event[1].args.isBuy.should.eq(true);
            event[1].args.tokenMain.should.eq(mainToken);
            event[1].args.amountMain.should.be.bignumber.eq(mainAmount2);
            event[1].args.tokenSub.should.eq(subToken);
            event[1].args.amountSub.should.be.bignumber.eq(subAmount2);
            let user1Ether = await this.Dinngo.balances.call(ZERO_ADDRESS, user1);
            let user1DGO = await this.Dinngo.balances.call(DGO, user1);
            let user1Token = await this.Dinngo.balances.call(token, user1);
            let user2Ether = await this.Dinngo.balances.call(ZERO_ADDRESS, user2);
            let user2DGO = await this.Dinngo.balances.call(DGO, user2);
            let user2Token = await this.Dinngo.balances.call(token, user2);
            let walletEther = await this.Dinngo.balances.call(ZERO_ADDRESS, dinngoWallet);
            let walletDGO = await this.Dinngo.balances.call(DGO, dinngoWallet);
            let walletToken = await this.Dinngo.balances.call(token, dinngoWallet);
            user1Ether.should.be.bignumber.eq(ether(1000).minus(mainAmount2));
            user1DGO.should.be.bignumber.eq(ether(1000).minus(mainAmount2.mul(0.001 * 0.5 * 0.002)));
            user1Token.should.be.bignumber.eq(ether(1000).plus(subAmount2));
            user2Ether.should.be.bignumber.eq(ether(1500).plus(mainAmount2).minus(mainAmount2.mul(1 * 0.001)));
            user2DGO.should.be.bignumber.eq(ether(1500));
            user2Token.should.be.bignumber.eq(ether(1500).minus(subAmount2));
            walletEther.should.be.bignumber.eq(mainAmount2.mul(1 * 0.001));
            walletDGO.should.be.bignumber.eq(mainAmount2.mul(0.001 * 0.5 * 0.002));
            walletToken.should.be.bignumber.eq(ether(0));
            let amount1 = await this.Dinngo.orderFills.call("0xa1179f9c81f330f47cbde5e73ff87a87c1195bc5a056dad4df90b3ff3844ca71");
            let amount2 = await this.Dinngo.orderFills.call("0x41a07794e4f991056ec1316f7a5c3a63ed88a877e68a186921699ea23d365936");
            amount1.should.be.bignumber.eq(subAmount2);
            amount2.should.be.bignumber.eq(subAmount2);
        });

        it('Not owner', async function() {
            await expectThrow(this.Dinngo.settle(orders, { from: user }));
        });
    });
});
