import ether from 'openzeppelin-solidity/test/helpers/ether';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const SerializableOrderMock = artifacts.require('SerializableOrderMock');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('SerializableOrder', function([user1, user2, user3, user4, user5]) {
    before(async function() {
        this.SerializableOrder = await SerializableOrderMock.new();
    });
    const userID = 11;
    const user1ID = 11;
    const user2ID = 12;
    const user3ID = 13;
    const user4ID = 14;
    const user5ID = 15;
    const mainToken = 0;
    const subToken = 11;
    const mainAmount = ether(3);
    const subAmount = ether(100);
    const mainAmount1 = ether(1);
    const subAmount1 = ether(100);
    const mainAmount2 = ether(0.1);
    const subAmount2 = ether(10);
    const mainAmount3 = ether(0.2);
    const subAmount3 = ether(20);
    const mainAmount4 = ether(0.3);
    const subAmount4 = ether(30);
    const mainAmount5 = ether(0.1);
    const subAmount5 = ether(10);
    const config = 1;
    const config1 = 0;
    const config2 = 1;
    const config3 = 3;
    const config4 = 3;
    const config5 = 3;
    const feePrice = 10;
    const feePrice1 = 10;
    const feePrice2 = 10;
    const feePrice3 = 10000;
    const feePrice4 = 10000;
    const feePrice5 = 10000;
    const nonce = 1;
    const nonce1 = 1;
    const nonce2 = 2;
    const nonce3 = 3;
    const nonce4 = 4;
    const nonce5 = 5;

    describe('single order', async function() {
        it('hex', async function () {
            let hash = await this.SerializableOrder.hashOrder.call(
                userID,
                mainToken,
                mainAmount,
                subToken,
                subAmount,
                config,
                feePrice,
                nonce
            );
            let sgn = await web3.eth.sign(user1, hash);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = await this.SerializableOrder.serializeOrder.call(
                userID,
                mainToken,
                mainAmount,
                subToken,
                subAmount,
                config,
                feePrice,
                nonce,
                r,
                s,
                v
            );
            console.log(ser_hex);
        });

        it('hex1', async function () {
            let hash = await this.SerializableOrder.hashOrder.call(
                user1ID,
                mainToken,
                mainAmount1,
                subToken,
                subAmount1,
                config1,
                feePrice1,
                nonce1
            );
            let sgn = await web3.eth.sign(user1, hash);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = await this.SerializableOrder.serializeOrder.call(
                user1ID,
                mainToken,
                mainAmount1,
                subToken,
                subAmount1,
                config1,
                feePrice1,
                nonce1,
                r,
                s,
                v
            );
            console.log(ser_hex);
        });

        it('hex2', async function () {
            let hash = await this.SerializableOrder.hashOrder.call(
                user2ID,
                mainToken,
                mainAmount2,
                subToken,
                subAmount2,
                config2,
                feePrice2,
                nonce2
            );
            let sgn = await web3.eth.sign(user2, hash);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = await this.SerializableOrder.serializeOrder.call(
                user2ID,
                mainToken,
                mainAmount2,
                subToken,
                subAmount2,
                config2,
                feePrice2,
                nonce2,
                r,
                s,
                v
            );
            console.log(ser_hex);
        });

        it('hex3', async function () {
            let hash = await this.SerializableOrder.hashOrder.call(
                user3ID,
                mainToken,
                mainAmount3,
                subToken,
                subAmount3,
                config3,
                feePrice3,
                nonce3
            );
            let sgn = await web3.eth.sign(user3, hash);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = await this.SerializableOrder.serializeOrder.call(
                user3ID,
                mainToken,
                mainAmount3,
                subToken,
                subAmount3,
                config3,
                feePrice3,
                nonce3,
                r,
                s,
                v
            );
            console.log(ser_hex);
        });

        it('hex4', async function () {
            let hash = await this.SerializableOrder.hashOrder.call(
                user4ID,
                mainToken,
                mainAmount4,
                subToken,
                subAmount4,
                config4,
                feePrice4,
                nonce4
            );
            let sgn = await web3.eth.sign(user4, hash);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = await this.SerializableOrder.serializeOrder.call(
                user4ID,
                mainToken,
                mainAmount4,
                subToken,
                subAmount4,
                config4,
                feePrice4,
                nonce4,
                r,
                s,
                v
            );
            console.log(ser_hex);
        });
    });

    describe('multiple orders', async function() {
        it('hex_1_2_3_4', async function() {
            let hash1 = await this.SerializableOrder.hashOrder.call(
                user1ID,
                mainToken,
                mainAmount1,
                subToken,
                subAmount1,
                config1,
                feePrice1,
                nonce1
            );
            let hash2 = await this.SerializableOrder.hashOrder.call(
                user2ID,
                mainToken,
                mainAmount2,
                subToken,
                subAmount2,
                config2,
                feePrice2,
                nonce2
            );
            let hash3 = await this.SerializableOrder.hashOrder.call(
                user3ID,
                mainToken,
                mainAmount3,
                subToken,
                subAmount3,
                config3,
                feePrice3,
                nonce3
            );
            let hash4 = await this.SerializableOrder.hashOrder.call(
                user4ID,
                mainToken,
                mainAmount4,
                subToken,
                subAmount4,
                config4,
                feePrice4,
                nonce4
            );
            let hash5 = await this.SerializableOrder.hashOrder.call(
                user5ID,
                mainToken,
                mainAmount5,
                subToken,
                subAmount5,
                config5,
                feePrice5,
                nonce5
            );
            let sgn1 = await web3.eth.sign(user1, hash1);
            let sgn2 = await web3.eth.sign(user2, hash2);
            let sgn3 = await web3.eth.sign(user3, hash3);
            let sgn4 = await web3.eth.sign(user4, hash4);
            let sgn5 = await web3.eth.sign(user5, hash5);
            let r1 = sgn1.slice(0,66);
            let r2 = sgn2.slice(0,66);
            let r3 = sgn3.slice(0,66);
            let r4 = sgn4.slice(0,66);
            let r5 = sgn5.slice(0,66);
            let s1 = '0x' + sgn1.slice(66,130);
            let s2 = '0x' + sgn2.slice(66,130);
            let s3 = '0x' + sgn3.slice(66,130);
            let s4 = '0x' + sgn4.slice(66,130);
            let s5 = '0x' + sgn5.slice(66,130);
            let v1 = '0x' + sgn1.slice(130,132);
            let v2 = '0x' + sgn2.slice(130,132);
            let v3 = '0x' + sgn3.slice(130,132);
            let v4 = '0x' + sgn4.slice(130,132);
            let v5 = '0x' + sgn5.slice(130,132);
            let ser_hex1 = await this.SerializableOrder.serializeOrder.call(
                user1ID,
                mainToken,
                mainAmount1,
                subToken,
                subAmount1,
                config1,
                feePrice1,
                nonce1,
                r1,
                s1,
                v1
            );
            let ser_hex2 = await this.SerializableOrder.serializeOrder.call(
                user2ID,
                mainToken,
                mainAmount2,
                subToken,
                subAmount2,
                config2,
                feePrice2,
                nonce2,
                r2,
                s2,
                v2
            );
            let ser_hex3 = await this.SerializableOrder.serializeOrder.call(
                user3ID,
                mainToken,
                mainAmount3,
                subToken,
                subAmount3,
                config3,
                feePrice3,
                nonce3,
                r3,
                s3,
                v3
            );
            let ser_hex4 = await this.SerializableOrder.serializeOrder.call(
                user4ID,
                mainToken,
                mainAmount4,
                subToken,
                subAmount4,
                config4,
                feePrice4,
                nonce4,
                r4,
                s4,
                v4
            );
            let ser_hex5 = await this.SerializableOrder.serializeOrder.call(
                user5ID,
                mainToken,
                mainAmount5,
                subToken,
                subAmount5,
                config5,
                feePrice5,
                nonce5,
                r5,
                s5,
                v5
            );
            console.log("1+2");
            console.log(ser_hex1 + ser_hex2.slice(2));
            console.log("1+2+3");
            console.log(ser_hex1 + ser_hex2.slice(2) + ser_hex3.slice(2));
            console.log("1+2+3+4");
            console.log(ser_hex1 + ser_hex2.slice(2) + ser_hex3.slice(2) + ser_hex4.slice(2));
            console.log("1+2+3+4+5");
            console.log(ser_hex1 + ser_hex2.slice(2) + ser_hex3.slice(2) + ser_hex4.slice(2) + ser_hex5.slice(2));
        });
    });
});
