import ether from 'openzeppelin-solidity/test/helpers/ether';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const DinngoMock = artifacts.require('DinngoMock');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('Trade', function([_, owner, tokenWallet, token]) {
    const user1 = "0x627306090abab3a6e1400e9345bc60c78a8bef57";
    const user2 = "0xf17f52151ebef6c7334fad080c5704d77216b732";
    beforeEach(async function() {
        this.Dinngo = await DinngoMock.new(tokenWallet, token, { from: owner });
        await this.Dinngo.setUser(11, user1, 1);
        await this.Dinngo.setUser(12, user2, 1);
        await this.Dinngo.setUserBalance(user1, token, ether(1000));
        await this.Dinngo.setUserBalance(user1, ZERO_ADDRESS, ether(1000));
        await this.Dinngo.setUserBalance(user2, token, ether(1500));
        await this.Dinngo.setUserBalance(user2, ZERO_ADDRESS, ether(1500));
    });
    describe('buy order', function() {
        it('normal', async function() {
            await this.Dinngo.tradeMock(
                true,
                "0x627306090abab3a6e1400e9345bc60c78a8bef57",
                ZERO_ADDRESS,
                ether(23),
                token,
                ether(43),
                ether(21.5),
                { from: owner }
            );
            let tokenBalance = await this.Dinngo.balance(token, user1);
            let etherBalance = await this.Dinngo.balance(ZERO_ADDRESS, user1);
            tokenBalance.should.be.bignumber.eq(ether(1000+21.5));
            etherBalance.should.be.bignumber.eq(ether(1000-11.5));
        });
    });

    describe('sell order', function() {
        it('normal', async function() {
            await this.Dinngo.tradeMock(
                false,
                "0xf17f52151ebef6c7334fad080c5704d77216b732",
                ZERO_ADDRESS,
                ether(11.5),
                token,
                ether(21.5),
                ether(21.5),
                { from: owner }
            );
            let tokenBalance = await this.Dinngo.balance(token, user2);
            let etherBalance = await this.Dinngo.balance(ZERO_ADDRESS, user2);
            tokenBalance.should.be.bignumber.eq(ether(1500-21.5));
            etherBalance.should.be.bignumber.eq(ether(1500+11.5));
        });
    });
});
