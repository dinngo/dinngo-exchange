import ether from 'openzeppelin-solidity/test/helpers/ether';

const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const SerializableOrderMock = artifacts.require('SerializableOrderMock');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

const user1ID = 11;
const tokenTarget1 = 0;
const amountTarget1 = ether(1);
const tokenTrade1 = 11;
const amountTrade1 = ether(100);
const config1 = 1 + 2;
const tradeFee1 = ether(1);
const gasFee1 = ether(0.001);
const nonce1 = 1;

const orderSize = 206;
const order = new ArrayBuffer(orderSize);
const gasFee = new Uint32Array(order, 0, 8);
const tradeFee = new Uint32Array(order, 32, 8);
const nonce = new Uint32Array(order, 64, 1);
const config = new Uint8Array(order, 68, 1);
const amountTrade = new Uint32Array(order, 100, 8);
const tokenTrade = new Uint16Array(order, 132, 1);
const amountTarget = new Uint32Array(order, 134, 8);
const tokenTarget = new Uint16Array(order, 166, 1);
const userID = new Uint32Array(order, 168, 1);
userID[0] = user1ID;
tokenTarget[0] = tokenTarget1;
let temp = amountTarget1;
amountTarget.forEach((_, i) => {
    amountTarget[i] = temp & 0xFFFFFFFF;
    temp = temp >> 32;
});
tokenTrade[0] = tokenTrade1;
temp = amountTrade1;
amountTrade.forEach((_, i) => {
    amountTarget[i] = temp & 0xFFFFFFFF;
    temp = temp >> 32;
});
amountTrade[0] = amountTrade1;
config[0] = config1;
temp = tradeFee1;
tradeFee.forEach((_, i) => {
    tradeFee[i] = temp & 0xFFFFFFFF;
    temp = temp >> 32;
});
temp = gasFee1;
gasFee.forEach((_, i) => {
    gasFee[i] = temp & 0xFFFFFFFF;
    temp = temp >> 32;
});
nonce[0] = nonce1;

/*
contract('SerializableOrder', function([_, user1, user2, user3, user4, user5]) {
    before(async function() {
        this.SerializableOrder = await SerializableOrderMock.new();
    });
    const user1ID = 11;
    const tokenTarget1 = 0;
    const amountTarget1 = ether(1);
    const tokenTrade1 = 11;
    const amountTrade1 = ether(100);
    const config1 = 1 + 2;
    const tradeFee1 = ether(1);
    const gasFee1 = ether(0.001);
    const nonce1 = 1;

    const user2ID = 12;
    const tokenTarget2 = 11;
    const amountTarget2 = ether(10);
    const tokenTrade2 = 0;
    const amountTrade2 = ether(0.1);
    const config2 = 2;
    const tradeFee2 = ether(0.1);
    const gasFee2 = ether(0.001);
    const nonce2 = 2;

    const user3ID = 13;
    const tokenTarget3 = 11;
    const amountTarget3 = ether(20);
    const tokenTrade3 = 0;
    const amountTrade3 = ether(0.2);
    const config3 = 2;
    const tradeFee3 = ether(0.2);
    const gasFee3 = ether(0.001);
    const nonce3 = 3;

    const user4ID = 14;
    const tokenTarget4 = 11;
    const amountTarget4 = ether(30);
    const tokenTrade4 = 0;
    const amountTrade4 = ether(0.3);
    const config4 = 2;
    const tradeFee4 = ether(0.3);
    const gasFee4 = ether(0.001);
    const nonce4 = 4;

    const user5ID = 15;
    const tokenTarget5 = 11;
    const amountTarget5 = ether(10);
    const tokenTrade5 = 0;
    const amountTrade5 = ether(0.1);
    const config5 = 0;
    const tradeFee5 = ether(5);
    const gasFee5 = ether(1);
    const nonce5 = 5;

    describe('single order', async function() {
        it('hex1', async function () {
            let hash = await this.SerializableOrder.hashOrder.call(
                user1ID,
                tokenTarget1,
                amountTarget1,
                tokenTrade1,
                amountTrade1,
                config1,
                tradeFee1,
                gasFee1,
                nonce1
            );
            let sgn = await web3.eth.sign(user1, hash);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = await this.SerializableOrder.serializeOrder.call(
                user1ID,
                tokenTarget1,
                amountTarget1,
                tokenTrade1,
                amountTrade1,
                config1,
                tradeFee1,
                gasFee1,
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
            let hash = await this.SerializableOrder.hashOrder.call(
                user2ID,
                tokenTarget2,
                amountTarget2,
                tokenTrade2,
                amountTrade2,
                config2,
                tradeFee2,
                gasFee2,
                nonce2
            );
            let sgn = await web3.eth.sign(user2, hash);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = await this.SerializableOrder.serializeOrder.call(
                user2ID,
                tokenTarget2,
                amountTarget2,
                tokenTrade2,
                amountTrade2,
                config2,
                tradeFee2,
                gasFee2,
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

        it('hex3', async function () {
            let hash = await this.SerializableOrder.hashOrder.call(
                user3ID,
                tokenTarget3,
                amountTarget3,
                tokenTrade3,
                amountTrade3,
                config3,
                tradeFee3,
                gasFee3,
                nonce3
            );
            let sgn = await web3.eth.sign(user3, hash);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = await this.SerializableOrder.serializeOrder.call(
                user3ID,
                tokenTarget3,
                amountTarget3,
                tokenTrade3,
                amountTrade3,
                config3,
                tradeFee3,
                gasFee3,
                nonce3,
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

        it('hex4', async function () {
            let hash = await this.SerializableOrder.hashOrder.call(
                user4ID,
                tokenTarget4,
                amountTarget4,
                tokenTrade4,
                amountTrade4,
                config4,
                tradeFee4,
                gasFee4,
                nonce4
            );
            let sgn = await web3.eth.sign(user4, hash);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = await this.SerializableOrder.serializeOrder.call(
                user4ID,
                tokenTarget4,
                amountTarget4,
                tokenTrade4,
                amountTrade4,
                config4,
                tradeFee4,
                gasFee4,
                nonce4,
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

        it('hex5', async function () {
            let hash = await this.SerializableOrder.hashOrder.call(
                user5ID,
                tokenTarget5,
                amountTarget5,
                tokenTrade5,
                amountTrade5,
                config5,
                tradeFee5,
                gasFee5,
                nonce5
            );
            let sgn = await web3.eth.sign(user5, hash);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = await this.SerializableOrder.serializeOrder.call(
                user5ID,
                tokenTarget5,
                amountTarget5,
                tokenTrade5,
                amountTrade5,
                config5,
                tradeFee5,
                gasFee5,
                nonce5,
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

    describe('multiple orders', async function() {
        it('hex_1_2_3_4_5', async function() {
            let hash1 = await this.SerializableOrder.hashOrder.call(
                user1ID,
                tokenTarget1,
                amountTarget1,
                tokenTrade1,
                amountTrade1,
                config1,
                tradeFee1,
                gasFee1,
                nonce1
            );
            let hash2 = await this.SerializableOrder.hashOrder.call(
                user2ID,
                tokenTarget2,
                amountTarget2,
                tokenTrade2,
                amountTrade2,
                config2,
                tradeFee2,
                gasFee2,
                nonce2
            );
            let hash3 = await this.SerializableOrder.hashOrder.call(
                user3ID,
                tokenTarget3,
                amountTarget3,
                tokenTrade3,
                amountTrade3,
                config3,
                tradeFee3,
                gasFee3,
                nonce3
            );
            let hash4 = await this.SerializableOrder.hashOrder.call(
                user4ID,
                tokenTarget4,
                amountTarget4,
                tokenTrade4,
                amountTrade4,
                config4,
                tradeFee4,
                gasFee4,
                nonce4
            );
            let hash5 = await this.SerializableOrder.hashOrder.call(
                user5ID,
                tokenTarget5,
                amountTarget5,
                tokenTrade5,
                amountTrade5,
                config5,
                tradeFee5,
                gasFee5,
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
                tokenTarget1,
                amountTarget1,
                tokenTrade1,
                amountTrade1,
                config1,
                tradeFee1,
                gasFee1,
                nonce1,
                r1,
                s1,
                v1
            );
            let ser_hex2 = await this.SerializableOrder.serializeOrder.call(
                user2ID,
                tokenTarget2,
                amountTarget2,
                tokenTrade2,
                amountTrade2,
                config2,
                tradeFee2,
                gasFee2,
                nonce2,
                r2,
                s2,
                v2
            );
            let ser_hex3 = await this.SerializableOrder.serializeOrder.call(
                user3ID,
                tokenTarget3,
                amountTarget3,
                tokenTrade3,
                amountTrade3,
                config3,
                tradeFee3,
                gasFee3,
                nonce3,
                r3,
                s3,
                v3
            );
            let ser_hex4 = await this.SerializableOrder.serializeOrder.call(
                user4ID,
                tokenTarget4,
                amountTarget4,
                tokenTrade4,
                amountTrade4,
                config4,
                tradeFee4,
                gasFee4,
                nonce4,
                r4,
                s4,
                v4
            );
            let ser_hex5 = await this.SerializableOrder.serializeOrder.call(
                user5ID,
                tokenTarget5,
                amountTarget5,
                tokenTrade5,
                amountTrade5,
                config5,
                tradeFee5,
                gasFee5,
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
*/
