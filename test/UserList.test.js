import { ether } from 'openzeppelin-solidity/test/helpers/ether';
import { reverting } from 'openzeppelin-solidity/test/helpers/shouldFail';
import { inLogs } from 'openzeppelin-solidity/test/helpers/expectEvent';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const SimpleToken = artifacts.require('SimpleToken');

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('User', function ([_, user, owner, tokenWallet, tokenContract, user2, someone]) {
    beforeEach(async function () {
        this.DinngoImpl = await Dinngo.new();
        this.Dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.DinngoImpl.address, { from: owner });
    });

    const id = 11;
    const id2 = 12;

    describe('add user', function () {
        describe('when new', function () {
            it('normal', async function () {
                const { logs } = await this.Dinngo.addUser(id, user, { from: owner });
                const event = await inLogs(logs, 'AddUser');
                event.args.userID.should.be.bignumber.eq(id);
                event.args.user.should.eq(user);
                let rank = await this.Dinngo.userRanks.call(user);
                rank.should.be.bignumber.eq(1);
            });
        });

        describe('when existed', function() {
            it('normal', async function () {
                await this.Dinngo.addUser(id, user, { from: owner });
                let userAddress1 = await this.Dinngo.userID_Address.call(id);
                await reverting(this.Dinngo.addUser(id2, user, { from: owner }));
                let userAddress2 = await this.Dinngo.userID_Address.call(id2);
                userAddress1.should.eq(user);
                userAddress2.should.eq(ZERO_ADDRESS);
                await this.Dinngo.addUser(id2, user2, { from: owner });
                userAddress2 = await this.Dinngo.userID_Address.call(id2);
                userAddress2.should.eq(user2);
            });

            it('removed with same address', async function() {
                await this.Dinngo.setUser(id, user, 1);
                await this.Dinngo.removeUser(user, { from: owner });
                const { logs } = await this.Dinngo.addUser(id, user, { from: owner });
                const event = await inLogs(logs, 'AddUser');
                event.args.userID.should.be.bignumber.eq(id);
                event.args.user.should.eq(user);
                let rank = await this.Dinngo.userRanks.call(user);
                rank.should.be.bignumber.eq(1);
            });

            it('removed with different address', async function() {
                await this.Dinngo.setUser(id, user, 1);
                await this.Dinngo.removeUser(user, { from: owner });
                await reverting(this.Dinngo.addUser(id, someone, { from: owner }));
                let rank = await this.Dinngo.userRanks.call(user);
                rank.should.be.bignumber.eq(0);
            });
        });
    });

    describe('update rank', function () {
        it('when normal', async function () {
            await this.Dinngo.addUser(id, user, { from: owner });
            let rank1 = await this.Dinngo.userRanks.call(user);
            rank1.should.be.bignumber.eq(1);
            await this.Dinngo.updateUserRank(user, 2, { from: owner });
            let rank2 = await this.Dinngo.userRanks.call(user);
            rank2.should.be.bignumber.eq(2);
        });

        it('when user not exist', async function () {
            await reverting(this.Dinngo.updateUserRank(user, 2, { from: owner }));
        });

        it('when assigning same rank', async function () {
            await this.Dinngo.addUser(id, user, { from: owner });
            let rank1 = await this.Dinngo.userRanks.call(user);
            rank1.should.be.bignumber.eq(1);
            await reverting(this.Dinngo.updateUserRank(user, 1, { from: owner }));
        });
    });

    describe('remove user', function () {
        it('when normal', async function() {
            await this.Dinngo.setUser(id, user, 1);
            await this.Dinngo.removeUser(user, { from: owner });
            let rank = await this.Dinngo.userRanks.call(user);
            let userCall = await this.Dinngo.userID_Address.call(id);
            rank.should.be.bignumber.eq(0);
            userCall.should.eq(user);
        });

        it('when call by non owner', async function() {
            await this.Dinngo.setUser(id, user, 1);
            await reverting(this.Dinngo.removeUser(user, { from: someone }));
        });

        it('when removing non-existed user', async function() {
            await reverting(this.Dinngo.removeUser(user, { from: owner }));
        });
    });
});
