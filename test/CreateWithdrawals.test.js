import ether from 'openzeppelin-solidity/test/helpers/ether';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const SerializableWithdrawalMock = artifacts.require('SerializableWithdrawalMock');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();
/*
contract('SerializableWithdrawal', function([_, user1, user2]) {
    before(async function() {
        this.SerializableWithdrawal = await SerializableWithdrawalMock.new();
    });
    const user1ID = 11;
    const token1 = 0;
    const amount1 = ether(1);
    const config1 = 1;
    const fee1 = ether(0.001);
    const nonce1 = 1;

    const user2ID = 12;
    const token2 = 11;
    const amount2 = ether(2);
    const config2 = 0;
    const fee2 = ether(1);
    const nonce2 = 2;

    describe('single order', async function() {
        it('hex1', async function () {
            let hash = await this.SerializableWithdrawal.hashWithdrawal.call(
                user1ID,
                token1,
                amount1,
                config1,
                fee1,
                nonce1
            );
            let sgn = await web3.eth.sign(user1, hash);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = await this.SerializableWithdrawal.serializeWithdrawal.call(
                user1ID,
                token1,
                amount1,
                config1,
                fee1,
                nonce1,
                r,
                s,
                v
            );
            console.log(hash);
            console.log(r);
            console.log(s);
            console.log(v);
            console.log(ser_hex);
        });

        it('hex2', async function () {
            let hash = await this.SerializableWithdrawal.hashWithdrawal.call(
                user2ID,
                token2,
                amount2,
                config2,
                fee2,
                nonce2
            );
            let sgn = await web3.eth.sign(user2, hash);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = await this.SerializableWithdrawal.serializeWithdrawal.call(
                user2ID,
                token2,
                amount2,
                config2,
                fee2,
                nonce2,
                r,
                s,
                v
            );
            console.log(hash);
            console.log(r);
            console.log(s);
            console.log(v);
            console.log(ser_hex);
        });
    });
});
*/
