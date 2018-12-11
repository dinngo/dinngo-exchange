import { ether } from 'openzeppelin-solidity/test/helpers/ether';
import { reverting } from 'openzeppelin-solidity/test/helpers/shouldFail';
import { inLogs } from 'openzeppelin-solidity/test/helpers/expectEvent';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const DinngoMock = artifacts.require('DinngoMock');
const SimpleToken = artifacts.require('SimpleToken');

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('Token', function ([_, user, owner, tokenWallet, tokenContract, token2]) {
    beforeEach(async function () {
        this.Dinngo = await DinngoMock.new(tokenWallet, tokenContract, { from: owner });
        this.Token = await SimpleToken.new({ from: user });
    });

    const id = 2;
    const id2 = 3;

    describe('add token', function () {
        describe('when new', function () {
            it('normal', async function () {
                const { logs } = await this.Dinngo.addToken(id, this.Token.address, { from: owner });
                const event = await inLogs(logs, 'AddToken');
                event.args.tokenID.should.be.bignumber.eq(2);
                event.args.token.should.eq(this.Token.address);
                let rank = await this.Dinngo.tokenRanks.call(this.Token.address);
                rank.should.be.bignumber.eq(1);
            });

            it('removed with same address', async function() {
                await this.Dinngo.setToken(id, this.Token.address, 1);
                await this.Dinngo.removeToken(this.Token.address, { from: owner });
                const { logs } = await this.Dinngo.addToken(id, this.Token.address, { from: owner });
                const event = await inLogs(logs, 'AddToken');
                event.args.tokenID.should.be.bignumber.eq(id);
                event.args.token.should.eq(this.Token.address);
                let rank = await this.Dinngo.tokenRanks.call(this.Token.address);
                rank.should.be.bignumber.eq(1);
            });

            it('removed with different address', async function() {
                await this.Dinngo.setToken(id, this.Token.address, 1);
                await this.Dinngo.removeToken(this.Token.address, { from: owner });
                await reverting(this.Dinngo.addToken(id, token2, { from: owner }));
                let rank = await this.Dinngo.tokenRanks.call(this.Token.address);
                rank.should.be.bignumber.eq(0);
            });
        });

        describe('when existed', function() {
            it('normal', async function () {
                await this.Dinngo.addToken(id, this.Token.address, { from: owner });
                let tokenAddress1 = await this.Dinngo.tokenID_Address.call(2);
                await reverting(this.Dinngo.addToken(id2, this.Token.address, { from: owner }));
                await this.Dinngo.addToken(id2, token2, { from: owner });
                let tokenAddress2 = await this.Dinngo.tokenID_Address.call(3);
                tokenAddress2.should.eq(token2);
            });
        });
    });

    describe('update rank', function () {
        it('when normal', async function () {
            await this.Dinngo.addToken(id, this.Token.address, { from: owner });
            let rank1 = await this.Dinngo.tokenRanks.call(this.Token.address);
            rank1.should.be.bignumber.eq(1);
            await this.Dinngo.updateTokenRank(this.Token.address, 2, { from: owner });
            let rank2 = await this.Dinngo.tokenRanks.call(this.Token.address);
            rank2.should.be.bignumber.eq(2);
        });

        it('when token not exist', async function () {
            await reverting(this.Dinngo.updateTokenRank(this.Token.address, 2, { from: owner }));
        });

        it('when assigning same rank', async function () {
            await this.Dinngo.addToken(2, this.Token.address, { from: owner });
            let rank1 = await this.Dinngo.tokenRanks.call(this.Token.address);
            rank1.should.be.bignumber.eq(1);
            await reverting(this.Dinngo.updateTokenRank(this.Token.address, 1, { from: owner }));
        });
    });
});
