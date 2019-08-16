const { BN, constants, ether, expectEvent, expectRevert } = require('openzeppelin-test-helpers');
const { inLogs } = expectEvent;
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const SimpleToken = artifacts.require('SimpleToken');

contract('Token', function ([_, user, owner, tokenWallet, tokenContract, token2]) {
    beforeEach(async function () {
        this.dinngoImpl = await Dinngo.new();
        this.dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.dinngoImpl.address, { from: owner });
        this.token = await SimpleToken.new({ from: user });
    });

    const tokenId1 = new BN('2');
    const tokenId2 = new BN('3');
    const rank1 = new BN('1');
    const rank2 = new BN('2');

    describe('add token', function () {
        describe('when new', function () {
            it('normal', async function () {
                const { logs } = await this.dinngo.addToken(tokenId1, this.token.address, { from: owner });
                inLogs(logs, 'AddToken', { tokenID: tokenId1, token: this.token.address });
                expect(await this.dinngo.tokenRanks.call(this.token.address)).to.be.bignumber.eq(rank1);
            });

            it('assigning (2**16 - 1) to id', async function () {
                await this.dinngo.addToken(new BN('65535'), this.token.address, { from: owner });
            });

            it('assigning id that is too large', async function () {
                await expectRevert.unspecified(this.dinngo.addToken(new BN('65536'), this.token.address, { from: owner }));
            });

            it('removed with same address', async function () {
                await this.dinngo.setToken(tokenId1, this.token.address, rank1);
                await this.dinngo.removeToken(this.token.address, { from: owner });
                const { logs } = await this.dinngo.addToken(tokenId1, this.token.address, { from: owner });
                inLogs(logs, 'AddToken', { tokenID: tokenId1, token: this.token.address });
                expect(await this.dinngo.tokenRanks.call(this.token.address)).to.be.bignumber.eq(rank1);
            });

            it('removed with different address', async function () {
                await this.dinngo.setToken(tokenId1, this.token.address, rank1);
                await this.dinngo.removeToken(this.token.address, { from: owner });
                await expectRevert.unspecified(this.dinngo.addToken(tokenId1, token2, { from: owner }));
                expect(await this.dinngo.tokenRanks.call(this.token.address)).to.be.bignumber.eq(new BN('0'));
            });
        });

        describe('when existed', function () {
            it('normal', async function () {
                await this.dinngo.addToken(tokenId1, this.token.address, { from: owner });
                const tokenAddress1 = await this.dinngo.tokenID_Address.call(tokenId1);
                await expectRevert.unspecified(this.dinngo.addToken(tokenId2, this.token.address, { from: owner }));
                await this.dinngo.addToken(tokenId2, token2, { from: owner });
                expect(await this.dinngo.tokenID_Address.call(tokenId2)).to.eq(token2);
            });
        });
    });

    describe('update rank', function () {
        it('when normal', async function () {
            await this.dinngo.addToken(tokenId1, this.token.address, { from: owner });
            expect(await this.dinngo.tokenRanks.call(this.token.address)).to.be.bignumber.eq(rank1);
            await this.dinngo.updateTokenRank(this.token.address, rank2, { from: owner });
            expect((await this.dinngo.tokenRanks.call(this.token.address))).to.be.bignumber.eq(rank2);
        });

        it('when token not exist', async function () {
            await expectRevert.unspecified(this.dinngo.updateTokenRank(this.token.address, rank2, { from: owner }));
        });

        it('when assigning same rank', async function () {
            await this.dinngo.addToken(tokenId1, this.token.address, { from: owner });
            expect(await this.dinngo.tokenRanks.call(this.token.address)).to.be.bignumber.eq(rank1);
            await expectRevert.unspecified(this.dinngo.updateTokenRank(this.token.address, rank1, { from: owner }));
        });
    });
});
