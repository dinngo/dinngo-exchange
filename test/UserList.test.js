import ether from 'openzeppelin-solidity/test/helpers/ether';
import expectThrow from 'openzeppelin-solidity/test/helpers/expectThrow';
import { inLogs } from 'openzeppelin-solidity/test/helpers/expectEvent';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const DinngoMock = artifacts.require('DinngoMock');
const SimpleToken = artifacts.require('SimpleToken');

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('User', function ([_, user, owner, tokenWallet, tokenContract, user2]) {
    beforeEach(async function () {
        this.Dinngo = await DinngoMock.new(tokenWallet, tokenContract, { from: owner });
    });

    const id = 11;
    const id2 = 12;

    describe('add user', function () {
        it('when normal', async function () {
            const { logs } = await this.Dinngo.addUser(id, user, { from: owner });
            const event = await inLogs(logs, 'AddUser');
            event.args.userID.should.be.bignumber.eq(id);
            event.args.user.should.eq(user);
            let rank = await this.Dinngo.userRanks.call(user);
            rank.should.be.bignumber.eq(1);
        });

        it('when existed', async function () {
            await this.Dinngo.addUser(id, user, { from: owner });
            let userAddress1 = await this.Dinngo.userID_Address.call(id);
            await expectThrow(this.Dinngo.addUser(id2, user, { from: owner }));
            let userAddress2 = await this.Dinngo.userID_Address.call(id2);
            userAddress1.should.eq(user);
            userAddress2.should.eq(ZERO_ADDRESS);
            await this.Dinngo.addUser(id2, user2, { from: owner });
            userAddress2 = await this.Dinngo.userID_Address.call(id2);
            userAddress2.should.eq(user2);
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
            await expectThrow(this.Dinngo.updateUserRank(user, 2, { from: owner }));
        });

        it('when assigning same rank', async function () {
            await this.Dinngo.addUser(id, user, { from: owner });
            let rank1 = await this.Dinngo.userRanks.call(user);
            rank1.should.be.bignumber.eq(1);
            await expectThrow(this.Dinngo.updateUserRank(user, 1, { from: owner }));
        });
    });
});
