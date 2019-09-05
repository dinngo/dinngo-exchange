const { BN, constants, ether, expectEvent, expectRevert } = require('openzeppelin-test-helpers');
const { inLogs } = expectEvent;
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');

contract('Transfer', function ([_, user1, user2, user3, owner, admin, dinngoWallet, DGO, token]) {
    const rank = new BN('1');
    const balance = ether('1000');

    const config1 = new BN('1');
    const nonce1 = new BN('1');
    const config2 = new BN('1');
    const nonce2 = new BN('2');

    const tokenID1 = new BN('0');
    const amount1 = ether('0.1');
    const fee1 = ether('0.01');

    const tokenID2 = new BN('11');
    const amount2 = ether('0.2');
    const fee2 = ether('0.02');

    beforeEach(async function () {
        this.dinngoImpl = await Dinngo.new();
        this.dinngo = await DinngoProxyMock.new(dinngoWallet, DGO, this.dinngoImpl.address, { from: owner });
        await this.dinngo.activateAdmin(admin, { from: owner });
        await this.dinngo.deactivateAdmin(owner, { from: owner });
        await this.dinngo.setToken(tokenID1, ZERO_ADDRESS, rank);
        await this.dinngo.setToken(tokenID2, token, rank);
        await this.dinngo.setUserBalance(user1, token, balance);
        await this.dinngo.setUserBalance(user1, ZERO_ADDRESS, balance);
        await this.dinngo.setUserBalance(user1, DGO, balance);
        await this.dinngo.setUserBalance(user2, token, balance);
        await this.dinngo.setUserBalance(user2, ZERO_ADDRESS, balance);
        await this.dinngo.setUserBalance(user2, DGO, balance);
        await this.dinngo.setUserBalance(user3, token, balance);
        await this.dinngo.setUserBalance(user3, ZERO_ADDRESS, balance);
        await this.dinngo.setUserBalance(user3, DGO, balance);
        await this.dinngo.setUserBalance(ZERO_ADDRESS, token, balance);
        await this.dinngo.setUserBalance(ZERO_ADDRESS, ZERO_ADDRESS, balance);
        await this.dinngo.setUserBalance(ZERO_ADDRESS, DGO, balance);
    });

    const hash1 = '0x517334ed7a48e221f7eebb9ec10b9eefc20d31240e84034f22f0d8676375e9b2';
    const hex1 = '0x000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000016345785d8a00000000c5fdf4076b8f3a5357c5e395ab970b5b54098fef0000000101f17f52151ebef6c7334fad080c5704d77216b732';
    const sig1 = '0x5ffa1c000d6adade324b3157fc27a4378cf221ca527fd7ef0b3470685fc9b0893e5d95c042b3f156fdb013a0f85d73cb69eeaadbc2aafa4969f06604bd47e7d800';
    const hash2 = '0xea500b2a34512f2fcfad496100d6b62e0a57295e9f1ab72e63dfe2def74e183a';
    const hex2 = '0x00000000000000000000000000000000000000000000000000470de4df82000000000000000000000000000000000000000000000000000002c68af0bb140000000b821aea9a577a9b44299b9c15c88cf3087f3b5544000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000016345785d8a00000000c5fdf4076b8f3a5357c5e395ab970b5b54098fef0000000201f17f52151ebef6c7334fad080c5704d77216b732';
    const sig2 = '0x839d7296718110e296f0c4d710373fc43057cf46278f031b66b5bcc374570e1a7f1bbf8ab15baabe7b7fe8a97d87fde58b4083fc7cb7a55be16fb5f57816d37600';

    describe('transfer to single receiver', function () {
        it('single gas', async function () {
            const receipt = await this.dinngo.transferByAdmin(hex1, sig1, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('normal', async function () {
            const balanceFeeOld = await this.dinngo.balances.call(ZERO_ADDRESS, ZERO_ADDRESS);
            const balanceUser1Old = await this.dinngo.balances.call(ZERO_ADDRESS, user1);
            const balanceUser2Old = await this.dinngo.balances.call(ZERO_ADDRESS, user2);
            const { logs } = await this.dinngo.transferByAdmin(hex1, sig1, { from: admin });
            inLogs(logs, 'Transfer',
                {
                    from: user1,
                    to: user2,
                    token: ZERO_ADDRESS,
                    amount: amount1,
                    feeToken: ZERO_ADDRESS,
                    feeAmount: fee1
                }
            );
            expect(await this.dinngo.balances.call(ZERO_ADDRESS, user1)).to.be.bignumber.eq(
                balanceUser1Old.sub(amount1).sub(fee1)
            );
            expect(await this.dinngo.balances.call(ZERO_ADDRESS, user2)).to.be.bignumber.eq(
                balanceUser2Old.add(amount1)
            );
            expect(await this.dinngo.balances.call(ZERO_ADDRESS, ZERO_ADDRESS)).to.be.bignumber.eq(
                balanceFeeOld.add(fee1)
            );
        });

        it('wrong signature', async function () {
            await expectRevert.unspecified(this.dinngo.transferByAdmin(hex1, sig2, { from: admin }));
        });

        it('sent by non-admin', async function () {
            await expectRevert.unspecified(this.dinngo.transferByAdmin(hex1, sig1));
        });

        it('insufficient funds', async function () {
            await this.dinngo.setUserBalance(user1, ZERO_ADDRESS, amount1);
            await expectRevert.unspecified(this.dinngo.transferByAdmin(hex1, sig1, { from: admin }));
        });
    });

    describe('transfer to multiple receivers', function () {
        it('double gas', async function () {
            const receipt = await this.dinngo.transferByAdmin(hex2, sig2, { from: admin });
            console.log(receipt.receipt.gasUsed);
        });

        it('normal', async function () {
            const balanceETHFeeOld = await this.dinngo.balances.call(ZERO_ADDRESS, ZERO_ADDRESS);
            const balanceTokenFeeOld = await this.dinngo.balances.call(token, ZERO_ADDRESS);
            const balanceETHUser1Old = await this.dinngo.balances.call(ZERO_ADDRESS, user1);
            const balanceTokenUser1Old = await this.dinngo.balances.call(token, user1);
            const balanceETHUser2Old = await this.dinngo.balances.call(ZERO_ADDRESS, user2);
            const balanceTokenUser3Old = await this.dinngo.balances.call(ZERO_ADDRESS, user3);
            const { logs } = await this.dinngo.transferByAdmin(hex2, sig2, { from: admin });
            inLogs(logs, 'Transfer',
                {
                    from: user1,
                    to: user2,
                    token: ZERO_ADDRESS,
                    amount: amount1,
                    feeToken: ZERO_ADDRESS,
                    feeAmount: fee1
                }
            );
            inLogs(logs, 'Transfer',
                {
                    from: user1,
                    to: user3,
                    token: token,
                    amount: amount2,
                    feeToken: token,
                    feeAmount: fee2
                }
            );
            expect(await this.dinngo.balances.call(ZERO_ADDRESS, user1)).to.be.bignumber.eq(
                balanceETHUser1Old.sub(amount1).sub(fee1)
            );
            expect(await this.dinngo.balances.call(ZERO_ADDRESS, user2)).to.be.bignumber.eq(
                balanceETHUser2Old.add(amount1)
            );
            expect(await this.dinngo.balances.call(ZERO_ADDRESS, ZERO_ADDRESS)).to.be.bignumber.eq(
                balanceETHFeeOld.add(fee1)
            );
            expect(await this.dinngo.balances.call(token, user1)).to.be.bignumber.eq(
                balanceTokenUser1Old.sub(amount2).sub(fee2)
            );
            expect(await this.dinngo.balances.call(token, user3)).to.be.bignumber.eq(
                balanceTokenUser3Old.add(amount2)
            );
            expect(await this.dinngo.balances.call(token, ZERO_ADDRESS)).to.be.bignumber.eq(
                balanceTokenFeeOld.add(fee2)
            );
        });
    });
});
