const { BN, constants, ether, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const Dinngo = artifacts.require('Dinngo');
const DinngoProxyMock = artifacts.require('DinngoProxyMock');
const DummyTarget = artifacts.require('DummyTarget');
const SimpleToken = artifacts.require('SimpleToken');


contract('Migrate', function ([_, user1, user2, deployer, owner, tokenWallet, tokenContract]) {
    before(async function () {
        this.target = await DummyTarget.new({ from: deployer });
    });

    const userID1 = new BN('11');
    const userID2 = new BN('12');
    const rank = new BN('1');
    const tokenID0 = new BN('0');
    const tokenID1 = new BN('0');
    const tokenID2 = new BN('11');
    const tokenID3 = new BN('23');
    const depositValue = ether('10');
    const isFeeETH1 = true;
    const isFeeETH2 = false;
    const fee1 = new BN('0');
    const fee2 = new BN('0.001');
    const migration1 = '0x07e3e2071788405915e2ec793847d7e5e3c81181d50e36d56a1eeba1e32f6fcdb2a61dc1054407b11469e977690f1a9707ecab83a1e7ed166a6ac6caac236f300100000000000000000000000000000000000000000000000000000000000000000100000000000b471c92f915ae766c4964eedc300e5b8ff41e443c';
    const migration2 = '0x30e4e07a2020146450e4cdd71883d97e0f64f33f9fb5e4096fd2c8bcd01db33973f3bcc24139c57ea8b9affa666ff0371c412e6e25aaf156fe784cd20c19b3590000000000000000000000000000000000000000000000000000038d7ea4c68000000017000b00000000000c471c92f915ae766c4964eedc300e5b8ff41e443c';

    beforeEach(async function () {
        this.dinngoImpl = await Dinngo.new();
        this.dinngo = await DinngoProxyMock.new(tokenWallet, tokenContract, this.dinngoImpl.address, { from: owner });
        await this.dinngo.setUser(userID1, user1, rank);
        await this.dinngo.setUser(userID2, user2, rank);
        this.token1 = await SimpleToken.new({ from: user2 });
        this.token2 = await SimpleToken.new({ from: user2 });
        await this.dinngo.setToken(tokenID0, ZERO_ADDRESS, rank);
        await this.dinngo.setToken(tokenID2, this.token1.address, rank);
        await this.dinngo.setToken(tokenID3, this.token2.address, rank);
    });

    describe('single ether', function () {
        let etherDinngo;
        let etherTarget;
        let etherOld;
        let etherNew;

        beforeEach(async function () {
            await this.dinngo.deposit({ value: depositValue, from: user1 });
            etherDinngo = await this.dinngo.balances.call(ZERO_ADDRESS, user1);
            etherTarget = await this.target.balances.call(ZERO_ADDRESS, user1);
            etherOld = await web3.eth.getBalance(this.dinngo.address);
            etherNew = await web3.eth.getBalance(this.target.address);
        });

        it('when normal', async function () {
            etherDinngo.should.be.bignumber.eq(depositValue);
            etherTarget.should.be.bignumber.eq('0');
            etherOld.should.eq(depositValue.toString());
            etherNew.should.eq('0');
            await this.dinngo.migrateByAdmin(migration1, { from: owner });
            etherDinngo = await this.dinngo.balances.call(ZERO_ADDRESS, user1);
            etherTarget = await this.target.balances.call(ZERO_ADDRESS, user1);
            etherDinngo.should.be.bignumber.eq('0');
            etherTarget.should.be.bignumber.eq(depositValue);
            etherOld = await web3.eth.getBalance(this.dinngo.address);
            etherNew = await web3.eth.getBalance(this.target.address);
            etherOld.should.eq('0');
            etherNew.should.eq(depositValue.toString());
        });
    });

    describe('multiple tokens', function () {
        let etherDinngo;
        let etherTarget;
        let etherOld;
        let etherNew;
        let token1Dinngo;
        let token1Target;
        let token1Old;
        let token1New;
        let token2Dinngo;
        let token2Target;
        let token2Old;
        let token2New;

        beforeEach(async function () {
            await this.dinngo.deposit({ value: depositValue, from: user2 });
            await this.token1.approve(this.dinngo.address, depositValue, { from: user2 });
            await this.dinngo.depositToken(this.token1.address, depositValue, { from: user2 });
            await this.token2.approve(this.dinngo.address, depositValue, { from: user2 });
            await this.dinngo.depositToken(this.token2.address, depositValue, { from: user2 });
            etherDinngo = await this.dinngo.balances.call(ZERO_ADDRESS, user2);
            etherTarget = await this.target.balances.call(ZERO_ADDRESS, user2);
            etherOld = await web3.eth.getBalance(this.dinngo.address);
            etherNew = await web3.eth.getBalance(this.target.address);
            token1Dinngo = await this.dinngo.balances.call(this.token1.address, user2);
            token1Target = await this.target.balances.call(this.token1.address, user2);
            token1Old = await this.token1.balanceOf.call(this.dinngo.address);
            token1New = await this.token1.balanceOf.call(this.target.address);
            token2Dinngo = await this.dinngo.balances.call(this.token2.address, user2);
            token2Target = await this.target.balances.call(this.token2.address, user2);
            token2Old = await this.token2.balanceOf.call(this.dinngo.address);
            token2New = await this.token2.balanceOf.call(this.target.address);
        });

        it('when normal', async function () {
            etherDinngo.should.be.bignumber.eq(depositValue);
            etherTarget.should.be.bignumber.eq('0');
            etherOld.should.eq(depositValue.toString());
            etherNew.should.eq(depositValue.toString());
            token1Dinngo.should.be.bignumber.eq(depositValue);
            token1Target.should.be.bignumber.eq('0');
            token1Old.should.be.bignumber.eq(depositValue);
            token1New.should.be.bignumber.eq('0');
            token2Dinngo.should.be.bignumber.eq(depositValue);
            token2Target.should.be.bignumber.eq('0');
            token2Old.should.be.bignumber.eq(depositValue);
            token2New.should.be.bignumber.eq('0');

            await this.dinngo.setUserBalance(user2, tokenContract, depositValue);
            await this.dinngo.migrateByAdmin(migration2, { from: owner });

            etherDinngo = await this.dinngo.balances.call(ZERO_ADDRESS, user2);
            etherTarget = await this.target.balances.call(ZERO_ADDRESS, user2);
            token1Dinngo = await this.dinngo.balances.call(this.token1.address, user2);
            token1Target = await this.target.balances.call(this.token1.address, user2);
            token2Dinngo = await this.dinngo.balances.call(this.token2.address, user2);
            token2Target = await this.target.balances.call(this.token2.address, user2);
            etherDinngo.should.be.bignumber.eq('0');
            etherTarget.should.be.bignumber.eq(depositValue);
            token1Dinngo.should.be.bignumber.eq('0');
            token1Target.should.be.bignumber.eq(depositValue);
            token2Dinngo.should.be.bignumber.eq('0');
            token2Target.should.be.bignumber.eq(depositValue);

            etherOld = await web3.eth.getBalance(this.dinngo.address);
            etherNew = await web3.eth.getBalance(this.target.address);
            token1Old = await this.token1.balanceOf.call(this.dinngo.address);
            token1New = await this.token1.balanceOf.call(this.target.address);
            token2Old = await this.token2.balanceOf.call(this.dinngo.address);
            token2New = await this.token2.balanceOf.call(this.target.address);

            etherOld.should.eq('0');
            etherNew.should.eq((depositValue.add(depositValue)).toString());
            token1Old.should.be.bignumber.eq('0');
            token1New.should.be.bignumber.eq(depositValue);
            token2Old.should.be.bignumber.eq('0');
            token2New.should.be.bignumber.eq(depositValue);
        });
    });
});
