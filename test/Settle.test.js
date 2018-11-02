import ether from 'openzeppelin-solidity/test/helpers/ether';
import expectThrow from 'openzeppelin-solidity/test/helpers/expectThrow';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const DinngoMock = artifacts.require('DinngoMock');

const should = require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .use(require('chai-as-promised'))
    .should();

contract('Settle', function([_, user1, user2, user3, user4, user5, owner, dinngoWallet, DGO, token]) {
    const BALANCE = ether(1000);
    beforeEach(async function() {
        this.Dinngo = await DinngoMock.new(dinngoWallet, DGO, { from: owner });
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

    describe('process maker order', function() {
        // user ID: 11
        // target token: 0
        // target amount: 1 ether
        // trade token: 11
        // trade amount: 100 ether
        // config: 1+2+16 (isBuy = true; isFeeMain = true; Gas price = 4 Gwei)
        // fee: 1
        // nonce: 1
        const order1 = "0x3a4f94638a2b34d32342f1b87718bdcf70a74cd0f72664cfeb1d2c5a6d2c2fa5d6beee380d7e02f66ac13f16c42312efda89d16aee687cc709b4b14d26d3092a010000000000000000000000000000000000000000000000000de0b6b3a764000000000001130000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b";
        const tokenTarget1 = ZERO_ADDRESS;
        const tokenTrade1 = token;
        const amountTarget1 = ether(1);
        const amountTrade1 = ether(100);
        // user ID: 12
        // target token: 11
        // target amount: 10 ether
        // trade token: 0
        // trade amount: 0.1 ether
        // config: 2+16 (isBuy = false; isFeeMain = true; Gas price = 4 Gwei)
        // fee: 0.1
        // nonce: 2
        const order2 = "0x69e590ee6c71c98ab93af1bdb93abf514df14772d7481d313389577065d7351bbc43764e0a77ba94445ba51c3bc137050444e368898cede5d1d85b07cad7e86401000000000000000000000000000000000000000000000000016345785d8a00000000000212000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c";
        const tokenTarget2 = token;
        const tokenTrade2 = ZERO_ADDRESS;
        const amountTarget2 = ether(10);
        const amountTrade2 = ether(0.1);
        it('Taker target greater than buying maker trade', async function() {
            const restAmountTarget = ether(130);
            const { logs } = await this.Dinngo.processMakerMock(order1, restAmountTarget);
            const event = logs.find(e => e.event === "TestMaker");
            should.exist(event);
            event.args.fillAmountTrade.should.be.bignumber.eq(amountTarget1);
            event.args.restAmountTarget.should.be.bignumber.eq(restAmountTarget.minus(amountTrade1));
        });
        it('Taker target lesser than buying maker trade', async function() {
            const restAmountTarget = ether(80);
            const { logs } = await this.Dinngo.processMakerMock(order1, restAmountTarget);
            const event = logs.find(e => e.event === "TestMaker");
            should.exist(event);
            event.args.fillAmountTrade.should.be.bignumber.eq(amountTarget1.mul(restAmountTarget).div(amountTrade1).toFixed(0));
            event.args.restAmountTarget.should.be.bignumber.eq(ether(0));
        });
    });

    describe('settle', function() {
        const orders1_2 =
            "0x3a4f94638a2b34d32342f1b87718bdcf70a74cd0f72664cfeb1d2c5a6d2c2fa5d6beee380d7e02f66ac13f16c42312efda89d16aee687cc709b4b14d26d3092a010000000000000000000000000000000000000000000000000de0b6b3a764000000000001130000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b69e590ee6c71c98ab93af1bdb93abf514df14772d7481d313389577065d7351bbc43764e0a77ba94445ba51c3bc137050444e368898cede5d1d85b07cad7e86401000000000000000000000000000000000000000000000000016345785d8a00000000000212000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c";
        const orders1_2_3 =
            "0x3a4f94638a2b34d32342f1b87718bdcf70a74cd0f72664cfeb1d2c5a6d2c2fa5d6beee380d7e02f66ac13f16c42312efda89d16aee687cc709b4b14d26d3092a010000000000000000000000000000000000000000000000000de0b6b3a764000000000001130000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b69e590ee6c71c98ab93af1bdb93abf514df14772d7481d313389577065d7351bbc43764e0a77ba94445ba51c3bc137050444e368898cede5d1d85b07cad7e86401000000000000000000000000000000000000000000000000016345785d8a00000000000212000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c0a252dde3302f2fcffbd6d8fc9e628adb71c185c7ddc1715d4eb007cc09af9e18bc61dd3bee81c580395154592f1d35629264d039b18e68d00e07248766a712f0000000000000000000000000000000000000000000000000002c68af0bb140000000000031200000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000001158e460913d00000000b0000000d";
        const orders1_2_3_4 =
            "0x3a4f94638a2b34d32342f1b87718bdcf70a74cd0f72664cfeb1d2c5a6d2c2fa5d6beee380d7e02f66ac13f16c42312efda89d16aee687cc709b4b14d26d3092a010000000000000000000000000000000000000000000000000de0b6b3a764000000000001130000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b69e590ee6c71c98ab93af1bdb93abf514df14772d7481d313389577065d7351bbc43764e0a77ba94445ba51c3bc137050444e368898cede5d1d85b07cad7e86401000000000000000000000000000000000000000000000000016345785d8a00000000000212000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c0a252dde3302f2fcffbd6d8fc9e628adb71c185c7ddc1715d4eb007cc09af9e18bc61dd3bee81c580395154592f1d35629264d039b18e68d00e07248766a712f0000000000000000000000000000000000000000000000000002c68af0bb140000000000031200000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000001158e460913d00000000b0000000d39d4dc48302916870802e2690d21997fd39dd81935312d0300d35c67bbe88817deed7a8ea7e4c97af401ce2c9752136f0d1233e7979ddd8bfc06c82162444c70010000000000000000000000000000000000000000000000000429d069189e000000000004120000000000000000000000000000000000000000000000000429d069189e00000000000000000000000000000000000000000000000000000001a055690d9db80000000b0000000e";
        const orders1_2_3_4_5 =
            "0x3a4f94638a2b34d32342f1b87718bdcf70a74cd0f72664cfeb1d2c5a6d2c2fa5d6beee380d7e02f66ac13f16c42312efda89d16aee687cc709b4b14d26d3092a010000000000000000000000000000000000000000000000000de0b6b3a764000000000001130000000000000000000000000000000000000000000000056bc75e2d63100000000b0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000b69e590ee6c71c98ab93af1bdb93abf514df14772d7481d313389577065d7351bbc43764e0a77ba94445ba51c3bc137050444e368898cede5d1d85b07cad7e86401000000000000000000000000000000000000000000000000016345785d8a00000000000212000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000c0a252dde3302f2fcffbd6d8fc9e628adb71c185c7ddc1715d4eb007cc09af9e18bc61dd3bee81c580395154592f1d35629264d039b18e68d00e07248766a712f0000000000000000000000000000000000000000000000000002c68af0bb140000000000031200000000000000000000000000000000000000000000000002c68af0bb1400000000000000000000000000000000000000000000000000000001158e460913d00000000b0000000d39d4dc48302916870802e2690d21997fd39dd81935312d0300d35c67bbe88817deed7a8ea7e4c97af401ce2c9752136f0d1233e7979ddd8bfc06c82162444c70010000000000000000000000000000000000000000000000000429d069189e000000000004120000000000000000000000000000000000000000000000000429d069189e00000000000000000000000000000000000000000000000000000001a055690d9db80000000b0000000e0cf13a14dc5e2d7b83096f4876cd42c79dd4f56d4dd76fb0a64554fefb8907559fe8686dadc5d340f5239aa1d27bf1e1aa29121942089485ee02b4e864587e9e010000000000000000000000000000000000000000000000004563918244f400000000000510000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000008ac7230489e80000000b0000000f";

        const hash1 = "0xd377c15071703bb5019b417616c1ed313dc1fa6dce07b85701de979178e9c23a";
        const hash2 = "0xa64d16d243788f677a7dd1cbb16488ff3a701f5d686c4f76be4ddc114a65c629";
        const hash3 = "0x98529902fd62a2dc533f55ca1aa35d389fee2778e992542fdd368452cc958cd6";
        const hash4 = "0xace5ea317dff2a6780df6a3a04db42160681b0f30e5e50699331f6af101a2e88";
        const hash5 = "0xef47c061c166ca16b31a6c7902299fcac73e715f19bab1ad5207f9517b1a8a37";

        const tokenTarget1 = ZERO_ADDRESS;
        const tokenTarget2 = token;
        const tokenTrade1 = token;
        const tokenTrade2 = ZERO_ADDRESS;

        const amountTarget1 = ether(1);
        const amountTrade1 = ether(100);
        const amountFee1 = ether(1);
        const isBuy1 = true;

        const amountTarget2 = ether(10);
        const amountTrade2 = ether(0.1);
        const amountFee2 = ether(0.1);
        const isBuy2 = false;

        const amountTarget3 = ether(20);
        const amountTrade3 = ether(0.2);
        const amountFee3 = ether(0.2);
        const isBuy3 = false;

        const amountTarget4 = ether(30);
        const amountTrade4 = ether(0.3);
        const amountFee4 = ether(0.3);
        const isBuy4 = false;

        const amountTarget5 = ether(10);
        const amountTrade5 = ether(0.1);
        const amountFee5 = ether(5);
        const isBuy5 = false;

        const gasPrice = ether(0.000000004);
        const gasAmount = 85000;

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
            let gasFee = gasPrice.mul(gasAmount);
            user1Ether.should.be.bignumber.eq(
                BALANCE.minus(
                    amountTrade2
                ).minus(
                    amountFee1.mul(amountTrade2).div(amountTarget1)
                ).minus(
                    gasFee
                )
            );
            user1DGO.should.be.bignumber.eq(BALANCE);
            user1Token.should.be.bignumber.eq(BALANCE.plus(amountTarget2));
            user2Ether.should.be.bignumber.eq(
                BALANCE.plus(
                    amountTrade2
                ).minus(
                    amountFee2
                ).minus(
                    gasFee
                )
            );
            user2DGO.should.be.bignumber.eq(BALANCE);
            user2Token.should.be.bignumber.eq(BALANCE.minus(amountTarget2));
            walletEther.should.be.bignumber.eq(
                BALANCE.plus(
                amountFee1.mul(amountTrade2).div(amountTarget1)
                ).plus(
                    gasFee
                ).plus(
                    amountFee2
                ).plus(
                    gasFee
                )
            );
            walletDGO.should.be.bignumber.eq(BALANCE);
            walletToken.should.be.bignumber.eq(BALANCE);
            let amount1 = await this.Dinngo.orderFills.call(hash1);
            let amount2 = await this.Dinngo.orderFills.call(hash2);
            amount1.should.be.bignumber.eq(amountTrade2);
            amount2.should.be.bignumber.eq(amountTarget2);
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
            let gasFee = gasPrice.mul(gasAmount);
            let tradeFee = amountFee1.mul(
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
                    gasFee
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
                BALANCE.plus(amountTrade2).minus(amountFee2).minus(gasFee)
            );
            user2DGO.should.be.bignumber.eq(BALANCE);
            user2Token.should.be.bignumber.eq(BALANCE.minus(amountTarget2));
            user3Ether.should.be.bignumber.eq(
                BALANCE.plus(amountTrade3).minus(amountFee3).minus(gasFee)
            );
            user3DGO.should.be.bignumber.eq(BALANCE);
            user3Token.should.be.bignumber.eq(BALANCE.minus(amountTarget3));
            user4Ether.should.be.bignumber.eq(
                BALANCE.plus(amountTrade4).minus(amountFee4).minus(gasFee)
            );
            user4DGO.should.be.bignumber.eq(BALANCE);
            user4Token.should.be.bignumber.eq(BALANCE.minus(amountTarget4));
            user5Ether.should.be.bignumber.eq(
                BALANCE.plus(amountTrade5).minus(gasFee)
            );
            user5DGO.should.be.bignumber.eq(BALANCE.minus(amountFee5));
            user5Token.should.be.bignumber.eq(BALANCE.minus(amountTarget5));
            walletEther.should.be.bignumber.eq(
                BALANCE.plus(tradeFee).plus(gasFee
                ).plus(amountFee2).plus(gasFee
                ).plus(amountFee3).plus(gasFee
                ).plus(amountFee4).plus(gasFee
                ).plus(gasFee)
            );
            walletDGO.should.be.bignumber.eq(BALANCE.plus(amountFee5));
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
            await expectThrow(this.Dinngo.settle(orders, { from: owner }));
        });

        it('maker invalid', async function() {
            await this.Dinngo.removeUser(user1, { from: owner });
            await expectThrow(this.Dinngo.settle(orders, { from: owner }));
        });

        it('Not owner', async function() {
            await expectThrow(this.Dinngo.settle(orders1_2));
        });
    });
});
