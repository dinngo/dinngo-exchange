const { constants, ether, expectEvent, should, shouldFail } = require('openzeppelin-test-helpers');
const { reverting } = shouldFail;
const { inLogs } = expectEvent;
const { ZERO_ADDRESS } = constants;

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');

contract('Settle', function ([_, user1, user2, user3, user4, user5, owner, dinngoWallet, DGO, token]) {
    const admin = token;
    const BALANCE = ether('1000');
    beforeEach(async function () {
        this.DinngoImpl = await Dinngo.new();
        this.Dinngo = await DinngoProxyMock.new(dinngoWallet, DGO, this.DinngoImpl.address, { from: owner });
        await this.Dinngo.transferAdmin(admin, { from: owner });
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

    describe('settle for buying taker', function () {
        const orders1_2 =
            "0x206bc639aadd5c6c4487b4cc8f7675bd8e806989ffb018207bf1afe223f3f9e87ccac8cd5a8ba0ba07cdd360c2bf5ad09e09d785557d8f7214572ca099fd04450100000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000b5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c";
        const orders1_2_3 =
            "0x206bc639aadd5c6c4487b4cc8f7675bd8e806989ffb018207bf1afe223f3f9e87ccac8cd5a8ba0ba07cdd360c2bf5ad09e09d785557d8f7214572ca099fd04450100000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000b5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c30982be6e9b74114c7a3531ad4afecd6acfa4db032fd25bf92e6acc877d32c7afbf5098c58bccf32c97eab329784d5d3669c9a487366b4c95da921a6dc70d5ca0100000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000002c68af0bb140000000000030200000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000001158e460913d00000000b0000000d";
        const orders1_2_3_4 =
            "0x206bc639aadd5c6c4487b4cc8f7675bd8e806989ffb018207bf1afe223f3f9e87ccac8cd5a8ba0ba07cdd360c2bf5ad09e09d785557d8f7214572ca099fd04450100000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000b5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c30982be6e9b74114c7a3531ad4afecd6acfa4db032fd25bf92e6acc877d32c7afbf5098c58bccf32c97eab329784d5d3669c9a487366b4c95da921a6dc70d5ca0100000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000002c68af0bb140000000000030200000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000001158e460913d00000000b0000000d279e5fef352791669c62e035c87dd06afe5b659f7e1b1753777d0b5db4d1dfefbd2a4416d26d13c8168131b1299a5cb1dd5258134517eb5af365e734aaf8667a0000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000429d069189e000000000004020000000000000000000000000000000000000000000000000429d069189e00000000000000000000000000000000000000000000000000000001a055690d9db80000000b0000000e";
        const orders1_2_3_4_5 =
            "0x206bc639aadd5c6c4487b4cc8f7675bd8e806989ffb018207bf1afe223f3f9e87ccac8cd5a8ba0ba07cdd360c2bf5ad09e09d785557d8f7214572ca099fd04450100000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000de0b6b3a764000000000001030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000b5cf7ebade4232d752b01f797193d7d9ea60de04083ba43d9ae36fc0be5709f2b3620137ce74643e47f0c0225a43b433d48fc0e44dbeaf53f92bea446a1c003210100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a00000000000202000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c30982be6e9b74114c7a3531ad4afecd6acfa4db032fd25bf92e6acc877d32c7afbf5098c58bccf32c97eab329784d5d3669c9a487366b4c95da921a6dc70d5ca0100000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000002c68af0bb140000000000030200000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000001158e460913d00000000b0000000d279e5fef352791669c62e035c87dd06afe5b659f7e1b1753777d0b5db4d1dfefbd2a4416d26d13c8168131b1299a5cb1dd5258134517eb5af365e734aaf8667a0000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000429d069189e000000000004020000000000000000000000000000000000000000000000000429d069189e00000000000000000000000000000000000000000000000000000001a055690d9db80000000b0000000e791539c4314f144582f5e76069240666a0f20ca00719df0c01d951bcec855a3f3e2e99c0dbb42415dd847f4cdaa8e56797437f203dc6e7269af85fa7b06a4f95000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000004563918244f400000000000500000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000f";

        const hash1 = "0xf1a59881b0097adaa34d7570a1f79dd02c1aec89c62124dc76fcdd11f1fcdf64";
        const hash2 = "0x013b99b07bf66d7c6e7817bc34f162199c4534424719964586f9a9ce9078cf5d";
        const hash3 = "0xd799d12eb222a08208b511e405a73b92cf99d77a76f533d30e3118a605c495a2";
        const hash4 = "0x176b8bd141d683e05d7c22b77afcd7b0632a62b8be441623fb70fa0eec614344";
        const hash5 = "0x1c0bd84677b1bccf6c977928151b7158daab9d401d5fc4dacdada0572a5d1008";

        const tokenTarget = token;
        const tokenTrade = ZERO_ADDRESS;

        const amountTarget1 = ether('100');
        const amountTrade1 = ether('1');
        const tradeFee1 = ether('1');
        const gasFee1 = ether('0.001');
        const isBuy1 = true;
        const isFeeMain1 = true;

        const amountTarget2 = ether('10');
        const amountTrade2 = ether('0.1');
        const tradeFee2 = ether('0.1');
        const gasFee2 = ether('0.001');
        const isBuy2 = false;
        const isFeeMain2 = true;

        const amountTarget3 = ether('20');
        const amountTrade3 = ether('0.2');
        const tradeFee3 = ether('0.2');
        const gasFee3 = ether('0.001');
        const isBuy3 = false;
        const isFeeMain3 = true;

        const amountTarget4 = ether('30');
        const amountTrade4 = ether('0.3');
        const tradeFee4 = ether('0.3');
        const gasFee4 = ether('0.001');
        const isBuy4 = false;
        const isFeeMain4 = true;

        const amountTarget5 = ether('10');
        const amountTrade5 = ether('0.1');
        const tradeFee5 = ether('5');
        const gasFee5 = ether('1');
        const isBuy5 = false;
        const isFeeMain5 = false;

        it('Normal', async function () {
            const { logs } = await this.Dinngo.settle(orders1_2, { from: admin });
            const event = logs.filter(e => e.event === "Trade");
            should.exist(event);
            event[0].args.user.should.eq(user2);
            event[0].args.isBuy.should.eq(false);
            event[0].args.tokenTarget.should.eq(tokenTarget);
            event[0].args.amountTarget.should.be.bignumber.eq(amountTarget2);
            event[0].args.tokenTrade.should.eq(tokenTrade);
            event[0].args.amountTrade.should.be.bignumber.eq(amountTrade2);
            event[1].args.user.should.eq(user1);
            event[1].args.isBuy.should.eq(true);
            event[1].args.tokenTarget.should.eq(tokenTarget);
            event[1].args.amountTarget.should.be.bignumber.eq(amountTarget2);
            event[1].args.tokenTrade.should.eq(tokenTrade);
            event[1].args.amountTrade.should.be.bignumber.eq(amountTrade2);

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
                BALANCE.sub(
                    amountTrade2
                ).sub(
                    tradeFee1.mul(amountTarget2).div(amountTarget1)
                ).sub(
                    gasFee1
                )
            );
            user1DGO.should.be.bignumber.eq(BALANCE);
            user1Token.should.be.bignumber.eq(BALANCE.add(amountTarget2));
            user2Ether.should.be.bignumber.eq(
                BALANCE.add(
                    amountTrade2
                ).sub(
                    tradeFee2
                ).sub(
                    gasFee2
                )
            );
            user2DGO.should.be.bignumber.eq(BALANCE);
            user2Token.should.be.bignumber.eq(BALANCE.sub(amountTarget2));
            walletEther.should.be.bignumber.eq(
                BALANCE.add(
                tradeFee1.mul(amountTrade2).div(amountTrade1)
                ).add(
                    gasFee1
                ).add(
                    tradeFee2
                ).add(
                    gasFee2
                )
            );
            walletDGO.should.be.bignumber.eq(BALANCE);
            walletToken.should.be.bignumber.eq(BALANCE);
            let amount1 = await this.Dinngo.orderFills.call(hash1);
            let amount2 = await this.Dinngo.orderFills.call(hash2);
            amount1.should.be.bignumber.eq(amountTarget2);
            amount2.should.be.bignumber.eq(amountTarget2);
        });

        it('Normal count gas 1-1', async function () {
            const receipt = await this.Dinngo.settle(orders1_2, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal count gas 1-2', async function () {
            const receipt = await this.Dinngo.settle(orders1_2_3, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal count gas 1-3', async function () {
            const receipt = await this.Dinngo.settle(orders1_2_3_4, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal count gas 1-4', async function () {
            const receipt = await this.Dinngo.settle(orders1_2_3_4_5, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('Normal 1 taker 4 maker', async function () {
            const { logs } = await this.Dinngo.settle(orders1_2_3_4_5, { from: admin });
            const event = logs.filter(e => e.event === "Trade");
            should.exist(event);
            event[0].args.user.should.eq(user2);
            event[0].args.isBuy.should.eq(false);
            event[0].args.tokenTarget.should.eq(tokenTarget);
            event[0].args.amountTarget.should.be.bignumber.eq(amountTarget2);
            event[0].args.tokenTrade.should.eq(tokenTrade);
            event[0].args.amountTrade.should.be.bignumber.eq(amountTrade2);
            event[1].args.user.should.eq(user3);
            event[1].args.isBuy.should.eq(false);
            event[1].args.tokenTarget.should.eq(tokenTarget);
            event[1].args.amountTarget.should.be.bignumber.eq(amountTarget3);
            event[1].args.tokenTrade.should.eq(tokenTrade);
            event[1].args.amountTrade.should.be.bignumber.eq(amountTrade3);
            event[2].args.user.should.eq(user4);
            event[2].args.isBuy.should.eq(false);
            event[2].args.tokenTarget.should.eq(tokenTarget);
            event[2].args.amountTarget.should.be.bignumber.eq(amountTarget4);
            event[2].args.tokenTrade.should.eq(tokenTrade);
            event[2].args.amountTrade.should.be.bignumber.eq(amountTrade4);
            event[3].args.user.should.eq(user5);
            event[3].args.isBuy.should.eq(false);
            event[3].args.tokenTarget.should.eq(tokenTarget);
            event[3].args.amountTarget.should.be.bignumber.eq(amountTarget5);
            event[3].args.tokenTrade.should.eq(tokenTrade);
            event[3].args.amountTrade.should.be.bignumber.eq(amountTrade5);
            event[4].args.user.should.eq(user1);
            event[4].args.isBuy.should.eq(true);
            event[4].args.tokenTarget.should.eq(tokenTarget);
            event[4].args.amountTarget.should.be.bignumber.eq(
                amountTarget2.add(
                    amountTarget3
                ).add(
                    amountTarget4
                ).add(
                    amountTarget5
                )
            );
            event[4].args.tokenTrade.should.eq(tokenTrade);
            event[4].args.amountTrade.should.be.bignumber.eq(
                amountTrade2.add(
                    amountTrade3
                ).add(
                    amountTrade4
                ).add(
                    amountTrade5
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
                amountTarget2.add(amountTarget3).add(amountTarget4).add(amountTarget5)
            ).div(amountTarget1);
            user1Ether.should.be.bignumber.eq(
                BALANCE.sub(
                    amountTrade2
                ).sub(
                    amountTrade3
                ).sub(
                    amountTrade4
                ).sub(
                    amountTrade5
                ).sub(
                    tradeFee
                ).sub(
                    gasFee1
                )
            );
            user1DGO.should.be.bignumber.eq(BALANCE);
            user1Token.should.be.bignumber.eq(
                BALANCE.add(
                    amountTarget2
                ).add(
                    amountTarget3
                ).add(
                    amountTarget4
                ).add(
                    amountTarget5
                )
            );
            user2Ether.should.be.bignumber.eq(
                BALANCE.add(amountTrade2).sub(tradeFee2).sub(gasFee2)
            );
            user2DGO.should.be.bignumber.eq(BALANCE);
            user2Token.should.be.bignumber.eq(BALANCE.sub(amountTarget2));
            user3Ether.should.be.bignumber.eq(
                BALANCE.add(amountTrade3).sub(tradeFee3).sub(gasFee3)
            );
            user3DGO.should.be.bignumber.eq(BALANCE);
            user3Token.should.be.bignumber.eq(BALANCE.sub(amountTarget3));
            user4Ether.should.be.bignumber.eq(
                BALANCE.add(amountTrade4).sub(tradeFee4).sub(gasFee4)
            );
            user4DGO.should.be.bignumber.eq(BALANCE);
            user4Token.should.be.bignumber.eq(BALANCE.sub(amountTarget4));
            user5Ether.should.be.bignumber.eq(BALANCE.add(amountTrade5));
            user5DGO.should.be.bignumber.eq(BALANCE.sub(tradeFee5).sub(gasFee5));
            user5Token.should.be.bignumber.eq(BALANCE.sub(amountTarget5));
            walletEther.should.be.bignumber.eq(
                BALANCE.add(tradeFee).add(gasFee1
                ).add(tradeFee2).add(gasFee2
                ).add(tradeFee3).add(gasFee3
                ).add(tradeFee4).add(gasFee4)
            );
            walletDGO.should.be.bignumber.eq(BALANCE.add(tradeFee5).add(gasFee5));
            walletToken.should.be.bignumber.eq(BALANCE);
            let amount1 = await this.Dinngo.orderFills.call(hash1);
            let amount2 = await this.Dinngo.orderFills.call(hash2);
            let amount3 = await this.Dinngo.orderFills.call(hash3);
            let amount4 = await this.Dinngo.orderFills.call(hash4);
            let amount5 = await this.Dinngo.orderFills.call(hash5);
            amount1.should.be.bignumber.eq(
                amountTarget2.add(amountTarget3).add(amountTarget4).add(amountTarget5)
            );
            amount2.should.be.bignumber.eq(amountTarget2);
            amount3.should.be.bignumber.eq(amountTarget3);
            amount4.should.be.bignumber.eq(amountTarget4);
            amount5.should.be.bignumber.eq(amountTarget5);
        });

        it('taker invalid', async function () {
            await this.Dinngo.removeUser(user2, { from: admin });
            await reverting(this.Dinngo.settle(orders1_2, { from: admin }));
        });

        it('maker invalid', async function () {
            await this.Dinngo.removeUser(user1, { from: admin });
            await reverting(this.Dinngo.settle(orders1_2, { from: admin }));
        });

        it('taker order filled', async function () {
            await this.Dinngo.fillOrder(hash1, amountTarget1);
            await reverting(this.Dinngo.settle(orders1_2, { from: admin }));
        });

        it('maker order filled', async function () {
            await this.Dinngo.fillOrder(hash2, amountTarget2);
            await reverting(this.Dinngo.settle(orders1_2, { from: admin }));
        });

        it('from owner', async function () {
            await reverting(this.Dinngo.settle(orders1_2, { from: owner }));
        });

        it('Not admin', async function () {
            await reverting(this.Dinngo.settle(orders1_2));
        });
    });
    describe('settle for selling taker', function () {
        const orders1_2 =
            "0x00098a93b03c4bf2cf93dc2b61198e6e00a129b0278d014ebbdd9291b5274692fc89844ed1f83b0902aff9b0125e3220b8a946261f70411a46fe5459b4a026790100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a000000000001020000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000b235f78e053c94c8a153d1e7026c64bcbd576db99dd28d7e508a0fc0ac4f637cca439351ebc9e1c57b5cf66b31555f52b6b3e2b58dbfc92db8acc01ddd389ce2c0000000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a000000000002030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000004563918244f40000000b0000000c";
        const orders1_3 =
            "0x00098a93b03c4bf2cf93dc2b61198e6e00a129b0278d014ebbdd9291b5274692fc89844ed1f83b0902aff9b0125e3220b8a946261f70411a46fe5459b4a026790100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a000000000001020000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000b5a7ebe92f87c58f1591048bf930420c68e6407c1c26fac2136d1e09e2ff7e39059c41ee03b815fb3ea196a8371da7e4dd2f6269ff9bd9546bc8cc3a893a90cd90100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a000000000003030000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000004563918244f40000000b0000000d";
        const orders1_4 =
            "0x00098a93b03c4bf2cf93dc2b61198e6e00a129b0278d014ebbdd9291b5274692fc89844ed1f83b0902aff9b0125e3220b8a946261f70411a46fe5459b4a026790100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a000000000001020000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000b2f94c4bb8a178665e3ada930e40d72d1bd7a77f7d40bff400a70fce8d6cd679a6eb7d9a21940d1c05680fc0e056030770ce108079e7dd018e6af71f4eaaeef380000000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000016345785d8a000000000004030000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000e";

        const hash1 = "0x67597dacdada87d5452b5ec39ef636552985de0aa68ee61997f039fa404a5d1e";
        const hash2 = "0x47361905672590148c0e352b638cc3a9c95a81eca15cfc2dfe01dcc8dff1c936";
        const hash3 = "0x4f8bf6afba11fb10305d7c152cfd050bfed9adaec92f2ca3577a49e4eaa6f3a9";
        const hash4 = "0xa8ecf03101d10efd4a1454a853f47456d6d1f9cbb7b8cd6906f69b1ea088558b";

        const tokenTarget = token;
        const tokenTrade = ZERO_ADDRESS;

        const amountTarget1 = ether('10');
        const amountTrade1 = ether('2');
        const tradeFee1 = ether('0.1');
        const gasFee1 = ether('0.001');
        const isBuy1 = false;
        const isFeeMain1 = true;

        const amountTarget2 = ether('5');
        const amountTrade2 = ether('1');
        const tradeFee2 = ether('0.1');
        const gasFee2 = ether('0.001');
        const isBuy2 = true;
        const isFeeMain2 = true;

        const amountTarget3 = ether('5');
        const amountTrade3 = ether('1');
        const tradeFee3 = ether('0.1');
        const gasFee3 = ether('0.001');
        const isBuy3 = true;
        const isFeeMain3 = true;

        const amountTarget4 = ether('10');
        const amountTrade4 = ether('2');
        const tradeFee4 = ether('0.1');
        const gasFee4 = ether('0.001');
        const isBuy4 = true;
        const isFeeMain4 = true;

        it('Normal', async function () {
            const { logs } = await this.Dinngo.settle(orders1_2, { from: admin });
            const event = logs.filter(e => e.event === "Trade");
            should.exist(event);
            event[0].args.user.should.eq(user2);
            event[0].args.isBuy.should.eq(true);
            event[0].args.tokenTarget.should.eq(tokenTarget);
            event[0].args.amountTarget.should.be.bignumber.eq(amountTarget2);
            event[0].args.tokenTrade.should.eq(tokenTrade);
            event[0].args.amountTrade.should.be.bignumber.eq(amountTrade2);
            event[1].args.user.should.eq(user1);
            event[1].args.isBuy.should.eq(false);
            event[1].args.tokenTarget.should.eq(tokenTarget);
            event[1].args.amountTarget.should.be.bignumber.eq(amountTarget2);
            event[1].args.tokenTrade.should.eq(tokenTrade);
            event[1].args.amountTrade.should.be.bignumber.eq(amountTrade2);

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
                BALANCE.add(
                    amountTrade2
                ).sub(
                    tradeFee1.mul(amountTarget2).div(amountTarget1)
                ).sub(
                    gasFee1
                )
            );
            user1DGO.should.be.bignumber.eq(BALANCE);
            user1Token.should.be.bignumber.eq(BALANCE.sub(amountTarget2));
            user2Ether.should.be.bignumber.eq(
                BALANCE.sub(
                    amountTrade2
                ).sub(
                    tradeFee2
                ).sub(
                    gasFee2
                )
            );
            user2DGO.should.be.bignumber.eq(BALANCE);
            user2Token.should.be.bignumber.eq(BALANCE.add(amountTarget2));
            walletEther.should.be.bignumber.eq(
                BALANCE.add(
                tradeFee1.mul(amountTrade2).div(amountTrade1)
                ).add(
                    gasFee1
                ).add(
                    tradeFee2
                ).add(
                    gasFee2
                )
            );
            walletDGO.should.be.bignumber.eq(BALANCE);
            walletToken.should.be.bignumber.eq(BALANCE);
            let amount1 = await this.Dinngo.orderFills.call(hash1);
            let amount2 = await this.Dinngo.orderFills.call(hash2);
            amount1.should.be.bignumber.eq(amountTarget2);
            amount2.should.be.bignumber.eq(amountTarget2);
            await this.Dinngo.settle(orders1_3, { from: admin });
        });

        it('Normal 1-4', async function () {
            await this.Dinngo.settle(orders1_4, { from: admin });
        });
    });
});
