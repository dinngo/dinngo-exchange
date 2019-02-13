const { constants, ether, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { inLogs } = expectEvent;
const { reverting } = shouldFail;
const { ZERO_ADDRESS } = constants;

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const SimpleToken = artifacts.require('SimpleToken');

contract('User', function ([_, user, owner, admin, tokenWallet, tokenContract, user2, someone]) {
    beforeEach(async function () {
        this.DinngoImpl = await Dinngo.new();
        this.Dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.DinngoImpl.address, { from: owner });
        await this.Dinngo.transferAdmin(admin, { from: owner });
    });

    const id = '11';
    const id2 = '12';

    describe('add user', function () {
        describe('when new', function () {
            it('normal', async function () {
                const { logs } = await this.Dinngo.addUser(id, user, { from: admin });
                const event = await inLogs(logs, 'AddUser');
                event.args.userID.should.be.bignumber.eq(id);
                event.args.user.should.eq(user);
                let rank = await this.Dinngo.userRanks.call(user);
                rank.should.be.bignumber.eq('1');
            });

            it('called by owner', async function () {
                await reverting(this.Dinngo.addUser(id, user, { from: owner }));
            });
        });

        describe('when existed', function () {
            it('normal', async function () {
                await this.Dinngo.addUser(id, user, { from: admin });
                let userAddress1 = await this.Dinngo.userID_Address.call(id);
                await reverting(this.Dinngo.addUser(id2, user, { from: admin }));
                let userAddress2 = await this.Dinngo.userID_Address.call(id2);
                userAddress1.should.eq(user);
                userAddress2.should.eq(ZERO_ADDRESS);
                await this.Dinngo.addUser(id2, user2, { from: admin });
                userAddress2 = await this.Dinngo.userID_Address.call(id2);
                userAddress2.should.eq(user2);
            });

            it('removed with same address', async function () {
                await this.Dinngo.setUser(id, user, '1');
                await this.Dinngo.removeUser(user, { from: admin });
                const { logs } = await this.Dinngo.addUser(id, user, { from: admin });
                const event = await inLogs(logs, 'AddUser');
                event.args.userID.should.be.bignumber.eq(id);
                event.args.user.should.eq(user);
                let rank = await this.Dinngo.userRanks.call(user);
                rank.should.be.bignumber.eq('1');
            });

            it('removed with different address', async function () {
                await this.Dinngo.setUser(id, user, '1');
                await this.Dinngo.removeUser(user, { from: admin });
                await reverting(this.Dinngo.addUser(id, someone, { from: admin }));
                let rank = await this.Dinngo.userRanks.call(user);
                rank.should.be.bignumber.eq('0');
            });
        });
    });

    describe('update rank', function () {
        it('when normal', async function () {
            await this.Dinngo.addUser(id, user, { from: admin });
            let rank1 = await this.Dinngo.userRanks.call(user);
            rank1.should.be.bignumber.eq('1');
            await this.Dinngo.updateUserRank(user, '2', { from: admin });
            /*
            let rank2 = await this.Dinngo.userRanks.call(user);
            rank2.should.be.bignumber.eq('2');
            */
        });

        it('when user not exist', async function () {
            await reverting(this.Dinngo.updateUserRank(user, '2', { from: admin }));
        });

        it('when assigning same rank', async function () {
            await this.Dinngo.addUser(id, user, { from: admin });
            let rank1 = await this.Dinngo.userRanks.call(user);
            rank1.should.be.bignumber.eq('1');
            await reverting(this.Dinngo.updateUserRank(user, '1', { from: admin }));
        });

        it('called by owner', async function () {
            await this.Dinngo.addUser(id, user, { from: admin });
            let rank1 = await this.Dinngo.userRanks.call(user);
            rank1.should.be.bignumber.eq('1');
            await reverting(this.Dinngo.updateUserRank(user, '2', { from: owner }));
        });
    });

    describe('remove user', function () {
        it('when normal', async function () {
            await this.Dinngo.setUser(id, user, 1);
            await this.Dinngo.removeUser(user, { from: admin });
            let rank = await this.Dinngo.userRanks.call(user);
            let userCall = await this.Dinngo.userID_Address.call(id);
            rank.should.be.bignumber.eq('0');
            userCall.should.eq(user);
        });

        it('when call by non admin', async function () {
            await this.Dinngo.setUser(id, user, '1');
            await reverting(this.Dinngo.removeUser(user, { from: someone }));
        });

        it('when removing non-existed user', async function () {
            await reverting(this.Dinngo.removeUser(user, { from: admin }));
        });

        it('when call by owner', async function () {
            await this.Dinngo.setUser(id, user, '1');
            await reverting(this.Dinngo.removeUser(user, { from: owner }));
        });
    });
});
