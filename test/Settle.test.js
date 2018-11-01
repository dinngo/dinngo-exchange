import ether from 'openzeppelin-solidity/test/helpers/ether';
import expectThrow from 'openzeppelin-solidity/test/helpers/expectThrow';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const DinngoMock = artifacts.require('DinngoMock');

const should = require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .use(require('chai-as-promised'))
    .should();

contract('Settle', function([user1, user2, user3, user4, user5, owner, user, dinngoWallet, DGO, token]) {
    // const user1 = "0x627306090abab3a6e1400e9345bc60c78a8bef57";
    // const user2 = "0xf17f52151ebef6c7334fad080c5704d77216b732";
    beforeEach(async function() {
        this.Dinngo = await DinngoMock.new(dinngoWallet, DGO, { from: owner });
        await this.Dinngo.setUser(11, user1, 1);
        await this.Dinngo.setUser(12, user2, 1);
        await this.Dinngo.setUser(13, user3, 1);
        await this.Dinngo.setUser(14, user4, 1);
        await this.Dinngo.setUser(15, user5, 1);
        await this.Dinngo.setToken(11, token, 1);
        await this.Dinngo.setUserBalance(user1, token, ether(1000));
        await this.Dinngo.setUserBalance(user1, ZERO_ADDRESS, ether(1000));
        await this.Dinngo.setUserBalance(user1, DGO, ether(1000));
        await this.Dinngo.setUserBalance(user2, token, ether(1500));
        await this.Dinngo.setUserBalance(user2, ZERO_ADDRESS, ether(1500));
        await this.Dinngo.setUserBalance(user2, DGO, ether(1500));
        await this.Dinngo.setUserBalance(user3, token, ether(1500));
        await this.Dinngo.setUserBalance(user3, ZERO_ADDRESS, ether(1500));
        await this.Dinngo.setUserBalance(user3, DGO, ether(1500));
        await this.Dinngo.setUserBalance(user4, token, ether(1500));
        await this.Dinngo.setUserBalance(user4, ZERO_ADDRESS, ether(1500));
        await this.Dinngo.setUserBalance(user4, DGO, ether(1500));
        await this.Dinngo.setUserBalance(user5, token, ether(1500));
        await this.Dinngo.setUserBalance(user5, ZERO_ADDRESS, ether(1500));
        await this.Dinngo.setUserBalance(user5, DGO, ether(1500));
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
        const orders2 = "0x511bf7595ba3861d17d2652a9edc21e90bc6fee1441f881955aea227ca9e9c2be5045101bf4b8a55e96ae65222c66f771bb592b973f832a5c3cb00733dd62dd300000000000000000000000000000000000000000000000000000000000000000a00000001000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b46ea96b724518092d39522996507057d40deee818f02ad73a8c6d5fb3e183ef0f47a3e12bdc708571ff74d64ba93ff316a2bc96e6a86756e1206aff79838307601000000000000000000000000000000000000000000000000000000000000000a00000002010000000000000000000000000000000000000000000000008ac7230489e80000000b000000000000000000000000000000000000000000000000016345785d8a000000000000000c";
        const orders3 = "0x511bf7595ba3861d17d2652a9edc21e90bc6fee1441f881955aea227ca9e9c2be5045101bf4b8a55e96ae65222c66f771bb592b973f832a5c3cb00733dd62dd300000000000000000000000000000000000000000000000000000000000000000a00000001000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b46ea96b724518092d39522996507057d40deee818f02ad73a8c6d5fb3e183ef0f47a3e12bdc708571ff74d64ba93ff316a2bc96e6a86756e1206aff79838307601000000000000000000000000000000000000000000000000000000000000000a00000002010000000000000000000000000000000000000000000000008ac7230489e80000000b000000000000000000000000000000000000000000000000016345785d8a000000000000000c77d6b405666890fccc7f57db99ac9109801b6b833af3fc8902b0cbe17c3d33c10cd0c88b71759c6d83761ff477d216ac406f537a6abc95cffcc14ad7646f3acd0000000000000000000000000000000000000000000000000000000000000027100000000303000000000000000000000000000000000000000000000001158e460913d00000000b00000000000000000000000000000000000000000000000002c68af0bb14000000000000000d";
        const orders4 = "0x511bf7595ba3861d17d2652a9edc21e90bc6fee1441f881955aea227ca9e9c2be5045101bf4b8a55e96ae65222c66f771bb592b973f832a5c3cb00733dd62dd300000000000000000000000000000000000000000000000000000000000000000a00000001000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b46ea96b724518092d39522996507057d40deee818f02ad73a8c6d5fb3e183ef0f47a3e12bdc708571ff74d64ba93ff316a2bc96e6a86756e1206aff79838307601000000000000000000000000000000000000000000000000000000000000000a00000002010000000000000000000000000000000000000000000000008ac7230489e80000000b000000000000000000000000000000000000000000000000016345785d8a000000000000000c77d6b405666890fccc7f57db99ac9109801b6b833af3fc8902b0cbe17c3d33c10cd0c88b71759c6d83761ff477d216ac406f537a6abc95cffcc14ad7646f3acd0000000000000000000000000000000000000000000000000000000000000027100000000303000000000000000000000000000000000000000000000001158e460913d00000000b00000000000000000000000000000000000000000000000002c68af0bb14000000000000000d3efbd055f26a5ef24213002dc5a6442a8dc71cf0ca1ad64cb0485fe1b8848604a16f6c17998b0ef87b648c437857819cff9d76d9506f0a5b1d545db6a3f4bccb0000000000000000000000000000000000000000000000000000000000000027100000000403000000000000000000000000000000000000000000000001a055690d9db80000000b0000000000000000000000000000000000000000000000000429d069189e000000000000000e";
        const orders5 = "0x511bf7595ba3861d17d2652a9edc21e90bc6fee1441f881955aea227ca9e9c2be5045101bf4b8a55e96ae65222c66f771bb592b973f832a5c3cb00733dd62dd300000000000000000000000000000000000000000000000000000000000000000a00000001000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b46ea96b724518092d39522996507057d40deee818f02ad73a8c6d5fb3e183ef0f47a3e12bdc708571ff74d64ba93ff316a2bc96e6a86756e1206aff79838307601000000000000000000000000000000000000000000000000000000000000000a00000002010000000000000000000000000000000000000000000000008ac7230489e80000000b000000000000000000000000000000000000000000000000016345785d8a000000000000000c77d6b405666890fccc7f57db99ac9109801b6b833af3fc8902b0cbe17c3d33c10cd0c88b71759c6d83761ff477d216ac406f537a6abc95cffcc14ad7646f3acd0000000000000000000000000000000000000000000000000000000000000027100000000303000000000000000000000000000000000000000000000001158e460913d00000000b00000000000000000000000000000000000000000000000002c68af0bb14000000000000000d3efbd055f26a5ef24213002dc5a6442a8dc71cf0ca1ad64cb0485fe1b8848604a16f6c17998b0ef87b648c437857819cff9d76d9506f0a5b1d545db6a3f4bccb0000000000000000000000000000000000000000000000000000000000000027100000000403000000000000000000000000000000000000000000000001a055690d9db80000000b0000000000000000000000000000000000000000000000000429d069189e000000000000000e740afe0ef5979a05ad1cd25b51f300e5a1f3f4fe69e64dda3bd1881313cc0d67ae47f2ae16ffcb220390d886de62ed06d6aa2ab4a7df13df448fb25ad8118cc101000000000000000000000000000000000000000000000000000000000000271000000005030000000000000000000000000000000000000000000000008ac7230489e80000000b000000000000000000000000000000000000000000000000016345785d8a000000000000000f";
        const mainToken = ZERO_ADDRESS;
        const subToken = token;
        const mainAmount1 = ether(3);
        const subAmount1 = ether(100);
        const mainAmount2 = ether(1.5);
        const subAmount2 = ether(80);
        /*
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
        */

        it('Normal2', async function() {
            const receipt = await this.Dinngo.settle(orders2, { from: owner });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal3', async function() {
            const receipt = await this.Dinngo.settle(orders3, { from: owner });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal4', async function() {
            const receipt = await this.Dinngo.settle(orders4, { from: owner });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal5', async function() {
            const receipt = await this.Dinngo.settle(orders5, { from: owner });
            console.log(receipt.receipt.gasUsed);
        });

        it('Not owner', async function() {
            await expectThrow(this.Dinngo.settle(orders, { from: user }));
        });
    });
});
