import ether from 'openzeppelin-solidity/test/helpers/ether';
import expectThrow from 'openzeppelin-solidity/test/helpers/expectThrow';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const should = require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .use(require('chai-as-promised'))
    .should();

contract('Settle', function([_, user1, user2, user3, user4, user5, owner, dinngoWallet, DGO, token]) {
    const BALANCE = ether(1000);
    beforeEach(async function() {
        this.DinngoImpl = await Dinngo.new(dinngoWallet, DGO, { from: owner });
        this.Dinngo = await DinngoProxyMock.new(dinngoWallet, DGO, this.DinngoImpl.address, { from: owner });
        await this.Dinngo.setUser(11, user1, 1);
        await this.Dinngo.setUser(12, user2, 1);
        await this.Dinngo.setUser(13, user3, 1);
        await this.Dinngo.setUser(14, user4, 1);
        await this.Dinngo.setUser(15, user5, 1);
        await this.Dinngo.setToken(11, token, 1);
        await this.Dinngo.setUserBalance(user1, token, BALANCE);
        await this.Dinngo.setUserBalance(user1, ZERO_ADDRESS, BALANCE);
        await this.Dinngo.setUserBalance(user1, DGO, BALANCE);
        await this.Dinngo.setUserBalance(user2, token, BALANCE);
        await this.Dinngo.setUserBalance(user2, ZERO_ADDRESS, BALANCE);
        await this.Dinngo.setUserBalance(user2, DGO, BALANCE);
        await this.Dinngo.setUserBalance(user3, token, BALANCE);
        await this.Dinngo.setUserBalance(user3, ZERO_ADDRESS, BALANCE);
        await this.Dinngo.setUserBalance(user3, DGO, BALANCE);
        await this.Dinngo.setUserBalance(user4, token, BALANCE);
        await this.Dinngo.setUserBalance(user4, ZERO_ADDRESS, BALANCE);
        await this.Dinngo.setUserBalance(user4, DGO, BALANCE);
        await this.Dinngo.setUserBalance(user5, token, BALANCE);
        await this.Dinngo.setUserBalance(user5, ZERO_ADDRESS, BALANCE);
        await this.Dinngo.setUserBalance(user5, DGO, BALANCE);
        await this.Dinngo.setUserBalance(dinngoWallet, token, BALANCE);
        await this.Dinngo.setUserBalance(dinngoWallet, ZERO_ADDRESS, BALANCE);
        await this.Dinngo.setUserBalance(dinngoWallet, DGO, BALANCE);
    });

    describe('settle', function() {
        const orders1_2 =
            "0x24f3a54a1b754191b87333031b45fabfd20139056c391386597a7b3598856dd1e210212a1d3790c95bb3e56bfac578ab59479aef335ae48885ec48295fd510f80000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c";
        const orders1_2_3 =
            "0x24f3a54a1b754191b87333031b45fabfd20139056c391386597a7b3598856dd1e210212a1d3790c95bb3e56bfac578ab59479aef335ae48885ec48295fd510f80000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c30982be6e9b74114c7a3531ad4afecd6acfa4db032fd25bf92e6acc877d32c7afbf5098c58bccf32c97eab329784d5d3669c9a487366b4c95da921a6dc70d5ca0100000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000002c68af0bb140000000000030200000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000001158e460913d00000000b0000000d";
        const orders1_2_3_4 =
            "0x24f3a54a1b754191b87333031b45fabfd20139056c391386597a7b3598856dd1e210212a1d3790c95bb3e56bfac578ab59479aef335ae48885ec48295fd510f80000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c30982be6e9b74114c7a3531ad4afecd6acfa4db032fd25bf92e6acc877d32c7afbf5098c58bccf32c97eab329784d5d3669c9a487366b4c95da921a6dc70d5ca0100000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000002c68af0bb140000000000030200000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000001158e460913d00000000b0000000d279e5fef352791669c62e035c87dd06afe5b659f7e1b1753777d0b5db4d1dfefbd2a4416d26d13c8168131b1299a5cb1dd5258134517eb5af365e734aaf8667a0000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000429d069189e000000000004020000000000000000000000000000000000000000000000000429d069189e00000000000000000000000000000000000000000000000000000001a055690d9db80000000b0000000e";
        const orders1_2_3_4_5 =
            "0x24f3a54a1b754191b87333031b45fabfd20139056c391386597a7b3598856dd1e210212a1d3790c95bb3e56bfac578ab59479aef335ae48885ec48295fd510f80000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c30982be6e9b74114c7a3531ad4afecd6acfa4db032fd25bf92e6acc877d32c7afbf5098c58bccf32c97eab329784d5d3669c9a487366b4c95da921a6dc70d5ca0100000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000002c68af0bb140000000000030200000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000001158e460913d00000000b0000000d279e5fef352791669c62e035c87dd06afe5b659f7e1b1753777d0b5db4d1dfefbd2a4416d26d13c8168131b1299a5cb1dd5258134517eb5af365e734aaf8667a0000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000429d069189e000000000004020000000000000000000000000000000000000000000000000429d069189e00000000000000000000000000000000000000000000000000000001a055690d9db80000000b0000000e791539c4314f144582f5e76069240666a0f20ca00719df0c01d951bcec855a3f3e2e99c0dbb42415dd847f4cdaa8e56797437f203dc6e7269af85fa7b06a4f95000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000004563918244f400000000000500000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000f";

        const hash1 = "0xae69a2185ebf1d3685a0a00cb9c7b46cdfe21531593102afbfaf6e50b81b8599";
        const hash2 = "0x013b99b07bf66d7c6e7817bc34f162199c4534424719964586f9a9ce9078cf5d";
        const hash3 = "0xd799d12eb222a08208b511e405a73b92cf99d77a76f533d30e3118a605c495a2";
        const hash4 = "0x176b8bd141d683e05d7c22b77afcd7b0632a62b8be441623fb70fa0eec614344";
        const hash5 = "0x1c0bd84677b1bccf6c977928151b7158daab9d401d5fc4dacdada0572a5d1008";

        const tokenTarget1 = ZERO_ADDRESS;
        const tokenTarget2 = token;
        const tokenTrade1 = token;
        const tokenTrade2 = ZERO_ADDRESS;

        const amountTarget1 = ether(1);
        const amountTrade1 = ether(100);
        const tradeFee1 = ether(1);
        const gasFee1 = ether(0.001);
        const isBuy1 = true;
        const isFeeMain1 = true;

        const amountTarget2 = ether(10);
        const amountTrade2 = ether(0.1);
        const tradeFee2 = ether(0.1);
        const gasFee2 = ether(0.001);
        const isBuy2 = false;
        const isFeeMain2 = true;

        const amountTarget3 = ether(20);
        const amountTrade3 = ether(0.2);
        const tradeFee3 = ether(0.2);
        const gasFee3 = ether(0.001);
        const isBuy3 = false;
        const isFeeMain3 = true;

        const amountTarget4 = ether(30);
        const amountTrade4 = ether(0.3);
        const tradeFee4 = ether(0.3);
        const gasFee4 = ether(0.001);
        const isBuy4 = false;
        const isFeeMain4 = true;

        const amountTarget5 = ether(10);
        const amountTrade5 = ether(0.1);
        const tradeFee5 = ether(5);
        const gasFee5 = ether(1);
        const isBuy5 = false;
        const isFeeMain5 = false;

        it('Normal', async function() {
            const { logs } = await this.Dinngo.settle(orders1_2, { from: owner });
            const event = logs.filter(e => e.event === "Trade");
            should.exist(event);
            event[0].args.user.should.eq(user2);
            event[0].args.isBuy.should.eq(false);
            event[0].args.tokenTarget.should.eq(tokenTarget2);
            event[0].args.amountTarget.should.be.bignumber.eq(amountTarget2);
            event[0].args.tokenTrade.should.eq(tokenTrade2);
            event[0].args.amountTrade.should.be.bignumber.eq(amountTrade2);
            event[1].args.user.should.eq(user1);
            event[1].args.isBuy.should.eq(true);
            event[1].args.tokenTarget.should.eq(tokenTarget1);
            event[1].args.amountTarget.should.be.bignumber.eq(amountTrade2);
            event[1].args.tokenTrade.should.eq(tokenTrade1);
            event[1].args.amountTrade.should.be.bignumber.eq(amountTarget2);
            let user1Ether = await this.Dinngo.balances.call(ZERO_ADDRESS, user1);
            let user1DGO = await this.Dinngo.balances.call(DGO, user1);
            let user1Token = await this.Dinngo.balances.call(token, user1);
            let user2Ether = await this.Dinngo.balances.call(ZERO_ADDRESS, user2);
            let user2DGO = await this.Dinngo.balances.call(DGO, user2);
            let user2Token = await this.Dinngo.balances.call(token, user2);
            let walletEther = await this.Dinngo.balances.call(ZERO_ADDRESS, dinngoWallet);
            let walletDGO = await this.Dinngo.balances.call(DGO, dinngoWallet);
            let walletToken = await this.Dinngo.balances.call(token, dinngoWallet);
            user1Ether.should.be.bignumber.eq(
                BALANCE.minus(
                    amountTrade2
                ).minus(
                    tradeFee1.mul(amountTrade2).div(amountTarget1)
                ).minus(
                    gasFee1
                )
            );
            user1DGO.should.be.bignumber.eq(BALANCE);
            user1Token.should.be.bignumber.eq(BALANCE.plus(amountTarget2));
            user2Ether.should.be.bignumber.eq(
                BALANCE.plus(
                    amountTrade2
                ).minus(
                    tradeFee2
                ).minus(
                    gasFee2
                )
            );
            user2DGO.should.be.bignumber.eq(BALANCE);
            user2Token.should.be.bignumber.eq(BALANCE.minus(amountTarget2));
            walletEther.should.be.bignumber.eq(
                BALANCE.plus(
                tradeFee1.mul(amountTrade2).div(amountTarget1)
                ).plus(
                    gasFee1
                ).plus(
                    tradeFee2
                ).plus(
                    gasFee2
                )
            );
            walletDGO.should.be.bignumber.eq(BALANCE);
            walletToken.should.be.bignumber.eq(BALANCE);
            let amount1 = await this.Dinngo.orderFills.call(hash1);
            let amount2 = await this.Dinngo.orderFills.call(hash2);
            amount1.should.be.bignumber.eq(amountTrade2);
            amount2.should.be.bignumber.eq(amountTarget2);
        });
        it('Normal count gas 1-1', async function() {
            const receipt = await this.Dinngo.settle(orders1_2, { from: owner });
            console.log(receipt.receipt.gasUsed);
        });
        it('Normal count gas 1-2', async function() {
            const receipt = await this.Dinngo.settle(orders1_2_3, { from: owner });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal count gas 1-3', async function() {
            const receipt = await this.Dinngo.settle(orders1_2_3_4, { from: owner });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal count gas 1-4', async function() {
            const receipt = await this.Dinngo.settle(orders1_2_3_4_5, { from: owner });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal 1 taker 4 maker', async function() {
            const { logs } = await this.Dinngo.settle(orders1_2_3_4_5, { from: owner });
            const event = logs.filter(e => e.event === "Trade");
            should.exist(event);
            event[0].args.user.should.eq(user2);
            event[0].args.isBuy.should.eq(false);
            event[0].args.tokenTarget.should.eq(tokenTarget2);
            event[0].args.amountTarget.should.be.bignumber.eq(amountTarget2);
            event[0].args.tokenTrade.should.eq(tokenTrade2);
            event[0].args.amountTrade.should.be.bignumber.eq(amountTrade2);
            event[1].args.user.should.eq(user3);
            event[1].args.isBuy.should.eq(false);
            event[1].args.tokenTarget.should.eq(tokenTarget2);
            event[1].args.amountTarget.should.be.bignumber.eq(amountTarget3);
            event[1].args.tokenTrade.should.eq(tokenTrade2);
            event[1].args.amountTrade.should.be.bignumber.eq(amountTrade3);
            event[2].args.user.should.eq(user4);
            event[2].args.isBuy.should.eq(false);
            event[2].args.tokenTarget.should.eq(tokenTarget2);
            event[2].args.amountTarget.should.be.bignumber.eq(amountTarget4);
            event[2].args.tokenTrade.should.eq(tokenTrade2);
            event[2].args.amountTrade.should.be.bignumber.eq(amountTrade4);
            event[3].args.user.should.eq(user5);
            event[3].args.isBuy.should.eq(false);
            event[3].args.tokenTarget.should.eq(tokenTarget2);
            event[3].args.amountTarget.should.be.bignumber.eq(amountTarget5);
            event[3].args.tokenTrade.should.eq(tokenTrade2);
            event[3].args.amountTrade.should.be.bignumber.eq(amountTrade5);
            event[4].args.user.should.eq(user1);
            event[4].args.isBuy.should.eq(true);
            event[4].args.tokenTarget.should.eq(tokenTarget1);
            event[4].args.amountTarget.should.be.bignumber.eq(
                amountTrade2.plus(
                    amountTrade3
                ).plus(
                    amountTrade4
                ).plus(
                    amountTrade5
                )
            );
            event[4].args.tokenTrade.should.eq(tokenTrade1);
            event[4].args.amountTrade.should.be.bignumber.eq(
                amountTarget2.plus(
                    amountTarget3
                ).plus(
                    amountTarget4
                ).plus(
                    amountTarget5
                )
            );
            let user1Ether = await this.Dinngo.balances.call(ZERO_ADDRESS, user1);
            let user1DGO = await this.Dinngo.balances.call(DGO, user1);
            let user1Token = await this.Dinngo.balances.call(token, user1);
            let user2Ether = await this.Dinngo.balances.call(ZERO_ADDRESS, user2);
            let user2DGO = await this.Dinngo.balances.call(DGO, user2);
            let user2Token = await this.Dinngo.balances.call(token, user2);
            let user3Ether = await this.Dinngo.balances.call(ZERO_ADDRESS, user3);
            let user3DGO = await this.Dinngo.balances.call(DGO, user3);
            let user3Token = await this.Dinngo.balances.call(token, user3);
            let user4Ether = await this.Dinngo.balances.call(ZERO_ADDRESS, user4);
            let user4DGO = await this.Dinngo.balances.call(DGO, user4);
            let user4Token = await this.Dinngo.balances.call(token, user4);
            let user5Ether = await this.Dinngo.balances.call(ZERO_ADDRESS, user5);
            let user5DGO = await this.Dinngo.balances.call(DGO, user5);
            let user5Token = await this.Dinngo.balances.call(token, user5);
            let walletEther = await this.Dinngo.balances.call(ZERO_ADDRESS, dinngoWallet);
            let walletDGO = await this.Dinngo.balances.call(DGO, dinngoWallet);
            let walletToken = await this.Dinngo.balances.call(token, dinngoWallet);
            let tradeFee = tradeFee1.mul(
                amountTrade2.plus(amountTrade3).plus(amountTrade4).plus(amountTrade5)
            ).div(amountTarget1);
            user1Ether.should.be.bignumber.eq(
                BALANCE.minus(
                    amountTrade2
                ).minus(
                    amountTrade3
                ).minus(
                    amountTrade4
                ).minus(
                    amountTrade5
                ).minus(
                    tradeFee
                ).minus(
                    gasFee1
                )
            );
            user1DGO.should.be.bignumber.eq(BALANCE);
            user1Token.should.be.bignumber.eq(
                BALANCE.plus(
                    amountTarget2
                ).plus(
                    amountTarget3
                ).plus(
                    amountTarget4
                ).plus(
                    amountTarget5
                )
            );
            user2Ether.should.be.bignumber.eq(
                BALANCE.plus(amountTrade2).minus(tradeFee2).minus(gasFee2)
            );
            user2DGO.should.be.bignumber.eq(BALANCE);
            user2Token.should.be.bignumber.eq(BALANCE.minus(amountTarget2));
            user3Ether.should.be.bignumber.eq(
                BALANCE.plus(amountTrade3).minus(tradeFee3).minus(gasFee3)
            );
            user3DGO.should.be.bignumber.eq(BALANCE);
            user3Token.should.be.bignumber.eq(BALANCE.minus(amountTarget3));
            user4Ether.should.be.bignumber.eq(
                BALANCE.plus(amountTrade4).minus(tradeFee4).minus(gasFee4)
            );
            user4DGO.should.be.bignumber.eq(BALANCE);
            user4Token.should.be.bignumber.eq(BALANCE.minus(amountTarget4));
            user5Ether.should.be.bignumber.eq(BALANCE.plus(amountTrade5));
            user5DGO.should.be.bignumber.eq(BALANCE.minus(tradeFee5).minus(gasFee5));
            user5Token.should.be.bignumber.eq(BALANCE.minus(amountTarget5));
            walletEther.should.be.bignumber.eq(
                BALANCE.plus(tradeFee).plus(gasFee1
                ).plus(tradeFee2).plus(gasFee2
                ).plus(tradeFee3).plus(gasFee3
                ).plus(tradeFee4).plus(gasFee4)
            );
            walletDGO.should.be.bignumber.eq(BALANCE.plus(tradeFee5).plus(gasFee5));
            walletToken.should.be.bignumber.eq(BALANCE);
            let amount1 = await this.Dinngo.orderFills.call(hash1);
            let amount2 = await this.Dinngo.orderFills.call(hash2);
            let amount3 = await this.Dinngo.orderFills.call(hash3);
            let amount4 = await this.Dinngo.orderFills.call(hash4);
            let amount5 = await this.Dinngo.orderFills.call(hash5);
            amount1.should.be.bignumber.eq(
                amountTrade2.plus(amountTrade3).plus(amountTrade4).plus(amountTrade5)
            );
            amount2.should.be.bignumber.eq(amountTarget2);
            amount3.should.be.bignumber.eq(amountTarget3);
            amount4.should.be.bignumber.eq(amountTarget4);
            amount5.should.be.bignumber.eq(amountTarget5);
        });

        it('taker invalid', async function() {
            await this.Dinngo.removeUser(user2, { from: owner });
            await expectThrow(this.Dinngo.settle(orders1_2, { from: owner }));
        });

        it('maker invalid', async function() {
            await this.Dinngo.removeUser(user1, { from: owner });
            await expectThrow(this.Dinngo.settle(orders1_2, { from: owner }));
        });

        it('taker invalid', async function() {
            await this.Dinngo.removeUser(user2, { from: owner });
            await expectThrow(this.Dinngo.settle(orders1_2, { from: owner }));
        });

        it('maker invalid', async function() {
            await this.Dinngo.removeUser(user1, { from: owner });
            await expectThrow(this.Dinngo.settle(orders1_2, { from: owner }));
        });

        it('Not owner', async function() {
            await expectThrow(this.Dinngo.settle(orders1_2));
        });
    });
});
