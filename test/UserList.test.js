const { BN, constants, ether, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { inLogs } = expectEvent;
const { reverting } = shouldFail;
const { ZERO_ADDRESS } = constants;

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');

contract('User', function ([_, user, owner, admin, tokenWallet, tokenContract, user2, someone]) {
    beforeEach(async function () {
        this.dinngoImpl = await Dinngo.new();
        this.dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.dinngoImpl.address, { from: owner });
        await this.dinngo.transferAdmin(admin, { from: owner });
    });

    const userId1 = new BN('11');
    const userId2 = new BN('12');
    const rank1 = new BN('1');
    const rank2 = new BN('2');

    describe('add user', function () {
        describe('when new', function () {
            it('normal', async function () {
                const { logs } = await this.dinngo.addUser(userId1, user, { from: admin });
                inLogs(logs, 'AddUser', { userID: userId1, user: user });
                (await this.dinngo.userRanks.call(user)).should.be.bignumber.eq(rank1);
            });

            it('called by owner', async function () {
                await reverting(this.dinngo.addUser(userId1, user, { from: owner }));
            });
        });

        describe('when existed', function () {
            it('normal', async function () {
                await this.dinngo.addUser(userId1, user, { from: admin });
                (await this.dinngo.userID_Address.call(userId1)).should.eq(user);
                await reverting(this.dinngo.addUser(userId2, user, { from: admin }));
                (await this.dinngo.userID_Address.call(userId2)).should.eq(ZERO_ADDRESS);
                await this.dinngo.addUser(userId2, user2, { from: admin });
                (await this.dinngo.userID_Address.call(userId2)).should.eq(user2);
            });

            it('removed with same address', async function () {
                await this.dinngo.setUser(userId1, user, rank1);
                await this.dinngo.removeUser(user, { from: admin });
                const { logs } = await this.dinngo.addUser(userId1, user, { from: admin });
                inLogs(logs, 'AddUser', { userID: userId1, user: user });
                (await this.dinngo.userRanks.call(user)).should.be.bignumber.eq(rank1);
            });

            it('removed with different address', async function () {
                await this.dinngo.setUser(userId1, user, rank1);
                await this.dinngo.removeUser(user, { from: admin });
                await reverting(this.dinngo.addUser(userId1, someone, { from: admin }));
                (await this.dinngo.userRanks.call(user)).should.be.bignumber.eq(new BN('0'));
            });
        });
    });

    describe('update rank', function () {
        it('when normal', async function () {
            await this.dinngo.addUser(userId1, user, { from: admin });
            (await this.dinngo.userRanks.call(user)).should.be.bignumber.eq(rank1);
            await this.dinngo.updateUserRank(user, rank2, { from: admin });
            (await this.dinngo.userRanks.call(user)).should.be.bignumber.eq(rank2);
        });

        it('when user not exist', async function () {
            await reverting(this.dinngo.updateUserRank(user, rank2, { from: admin }));
        });

        it('when assigning same rank', async function () {
            await this.dinngo.addUser(userId1, user, { from: admin });
            (await this.dinngo.userRanks.call(user)).should.be.bignumber.eq(rank1);
            await reverting(this.dinngo.updateUserRank(user, rank1, { from: admin }));
        });

        it('called by owner', async function () {
            await this.dinngo.addUser(userId1, user, { from: admin });
            (await this.dinngo.userRanks.call(user)).should.be.bignumber.eq(rank1);
            await reverting(this.dinngo.updateUserRank(user, rank2, { from: owner }));
        });
    });

    describe('remove user', function () {
        it('when normal', async function () {
            await this.dinngo.setUser(userId1, user, rank1);
            await this.dinngo.removeUser(user, { from: admin });
            (await this.dinngo.userRanks.call(user)).should.be.bignumber.eq(new BN('0'));
            (await this.dinngo.userID_Address.call(userId1)).should.eq(user);
        });

        it('when call by non admin', async function () {
            await this.dinngo.setUser(userId1, user, rank1);
            await reverting(this.dinngo.removeUser(user, { from: someone }));
        });

        it('when removing non-existed user', async function () {
            await reverting(this.dinngo.removeUser(user, { from: admin }));
        });

        it('when call by owner', async function () {
            await this.dinngo.setUser(userId1, user, rank1);
            await reverting(this.dinngo.removeUser(user, { from: owner }));
        });
    });
});
