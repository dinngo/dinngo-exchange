import ether from 'openzeppelin-solidity/test/helpers/ether';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const DinngoMock = artifacts.require('DinngoMock');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('Pay fee', function([_, owner, tokenWallet, token]) {
    const user = "0x627306090abab3a6e1400e9345bc60c78a8bef57";
    beforeEach(async function() {
        this.Dinngo = await DinngoMock.new(tokenWallet, token, { from: owner });
        await this.Dinngo.setUser(10, user, 1);
        await this.Dinngo.setUserBalance(user, token, ether(1000));
        await this.Dinngo.setUserBalance(user, ZERO_ADDRESS, ether(1000));
    });

    describe('taker order', async function() {
        it('paid by main token', async function() {
            await this.Dinngo.payFeeMock(true, ZERO_ADDRESS, user, 10000, ether(10));
            let userBalance = await this.Dinngo.balance.call(ZERO_ADDRESS, user);
            let walletBalance = await this.Dinngo.balance.call(ZERO_ADDRESS, tokenWallet);
            userBalance.should.be.bignumber.eq(ether(999.98));
            walletBalance.should.be.bignumber.eq(ether(0.02));
        });

        it('paid by DGO token', async function() {
            await this.Dinngo.payFeeMock(true, token, user, 10000, ether(10));
            let userBalance = await this.Dinngo.balance.call(token, user);
            let walletBalance = await this.Dinngo.balance.call(token, tokenWallet);
            userBalance.should.be.bignumber.eq(ether(999.99));
            walletBalance.should.be.bignumber.eq(ether(0.01));
        });
    });

    describe('maker order', async function() {
        it('paid by main token', async function() {
            await this.Dinngo.payFeeMock(false, ZERO_ADDRESS, user, 10000, ether(10));
            let userBalance = await this.Dinngo.balance.call(ZERO_ADDRESS, user);
            let walletBalance = await this.Dinngo.balance.call(ZERO_ADDRESS, tokenWallet);
            userBalance.should.be.bignumber.eq(ether(999.99));
            walletBalance.should.be.bignumber.eq(ether(0.01));
        });

        it('paid by DGO token', async function() {
            await this.Dinngo.payFeeMock(false, token, user, 10000, ether(10));
            let userBalance = await this.Dinngo.balance.call(token, user);
            let walletBalance = await this.Dinngo.balance.call(token, tokenWallet);
            userBalance.should.be.bignumber.eq(ether(999.995));
            walletBalance.should.be.bignumber.eq(ether(0.005));
        });
    });
});
