const { constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const utils = require('web3-utils');

function getHash(userID, tokenIDBase, amountBase, tokenIDQuote, amountQuote, config, handleFee, gasFee, nonce) {
    const userID_h = utils.padLeft(utils.toHex(userID), 8);
    const tokenIDBase_h = utils.padLeft(utils.toHex(tokenIDBase), 4);
    const amountBase_h = utils.padLeft(utils.toHex(amountBase), 64);
    const tokenIDQuote_h = utils.padLeft(utils.toHex(tokenIDQuote), 4);
    const amountQuote_h = utils.padLeft(utils.toHex(amountQuote), 64);
    const config_h = utils.padLeft(utils.toHex(config), 2);
    const handleFee_h = utils.padLeft(utils.toHex(handleFee), 64);
    const gasFee_h = utils.padLeft(utils.toHex(gasFee), 64);
    const nonce_h = utils.padLeft(utils.toHex(nonce), 8);

    return utils.keccak256(
        gasFee_h +
        handleFee_h.slice(2) +
        nonce_h.slice(2) +
        config_h.slice(2) +
        amountQuote_h.slice(2) +
        tokenIDQuote_h.slice(2) +
        amountBase_h.slice(2) +
        tokenIDBase_h.slice(2) +
        userID_h.slice(2)
    );
}

function getHex(userID, tokenIDBase, amountBase, tokenIDQuote, amountQuote, config, handleFee, gasFee, nonce, r, s, v) {
    const userID_h = utils.padLeft(utils.toHex(userID), 8);
    const tokenIDBase_h = utils.padLeft(utils.toHex(tokenIDBase), 4);
    const amountBase_h = utils.padLeft(utils.toHex(amountBase), 64);
    const tokenIDQuote_h = utils.padLeft(utils.toHex(tokenIDQuote), 4);
    const amountQuote_h = utils.padLeft(utils.toHex(amountQuote), 64);
    const config_h = utils.padLeft(utils.toHex(config), 2);
    const handleFee_h = utils.padLeft(utils.toHex(handleFee), 64);
    const gasFee_h = utils.padLeft(utils.toHex(gasFee), 64);
    const nonce_h = utils.padLeft(utils.toHex(nonce), 8);

    return (
        s +
        r.slice(2) +
        v.slice(2) +
        gasFee_h.slice(2) +
        handleFee_h.slice(2) +
        nonce_h.slice(2) +
        config_h.slice(2) +
        amountQuote_h.slice(2) +
        tokenIDQuote_h.slice(2) +
        amountBase_h.slice(2) +
        tokenIDBase_h.slice(2) +
        userID_h.slice(2)
    );
}

contract('SerializableOrder', function ([_, user1, user2, user3, user4, user5]) {
    const user1ID = 11;
    const tokenIDBase1 = 11;
    const amountBase1 = ether('100');
    const tokenIDQuote1 = 0;
    const amountQuote1 = ether('1');
    const config1 = 1 + 2;
    const handleFee1 = ether('1');
    const gasFee1 = ether('0.001');
    const nonce1 = 1;

    const user2ID = 12;
    const tokenIDBase2 = 11;
    const amountBase2 = ether('10');
    const tokenIDQuote2 = 0;
    const amountQuote2 = ether('0.1');
    const config2 = 2;
    const handleFee2 = ether('0.1');
    const gasFee2 = ether('0.001');
    const nonce2 = 2;

    const user3ID = 13;
    const tokenIDBase3 = 11;
    const amountBase3 = ether('20');
    const tokenIDQuote3 = 0;
    const amountQuote3 = ether('0.2');
    const config3 = 2;
    const handleFee3 = ether('0.2');
    const gasFee3 = ether('0.001');
    const nonce3 = 3;

    const user4ID = 14;
    const tokenIDBase4 = 11;
    const amountBase4 = ether('30');
    const tokenIDQuote4 = 0;
    const amountQuote4 = ether('0.3');
    const config4 = 2;
    const handleFee4 = ether('0.3');
    const gasFee4 = ether('0.001');
    const nonce4 = 4;

    const user5ID = 15;
    const tokenIDBase5 = 11;
    const amountBase5 = ether('10');
    const tokenIDQuote5 = 0;
    const amountQuote5 = ether('0.1');
    const config5 = 0;
    const handleFee5 = ether('5');
    const gasFee5 = ether('1');
    const nonce5 = 5;

/*
    describe('single order', async function () {
        it('hex1', async function () {
            const hash = getHash(
                user1ID,
                tokenIDBase1,
                amountBase1,
                tokenIDQuote1,
                amountQuote1,
                config1,
                handleFee1,
                gasFee1,
                nonce1
            );
            let sgn = await web3.eth.sign(hash, user1);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = getHex(
                user1ID,
                tokenIDBase1,
                amountBase1,
                tokenIDQuote1,
                amountQuote1,
                config1,
                handleFee1,
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
            let hash = getHash(
                user2ID,
                tokenIDBase2,
                amountBase2,
                tokenIDQuote2,
                amountQuote2,
                config2,
                handleFee2,
                gasFee2,
                nonce2
            );
            let sgn = await web3.eth.sign(hash, user2);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = getHex(
                user2ID,
                tokenIDBase2,
                amountBase2,
                tokenIDQuote2,
                amountQuote2,
                config2,
                handleFee2,
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
            let hash = getHash(
                user3ID,
                tokenIDBase3,
                amountBase3,
                tokenIDQuote3,
                amountQuote3,
                config3,
                handleFee3,
                gasFee3,
                nonce3
            );
            let sgn = await web3.eth.sign(hash, user3);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = getHex(
                user3ID,
                tokenIDBase3,
                amountBase3,
                tokenIDQuote3,
                amountQuote3,
                config3,
                handleFee3,
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
            let hash = getHash(
                user4ID,
                tokenIDBase4,
                amountBase4,
                tokenIDQuote4,
                amountQuote4,
                config4,
                handleFee4,
                gasFee4,
                nonce4
            );
            let sgn = await web3.eth.sign(hash, user4);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = getHex(
                user4ID,
                tokenIDBase4,
                amountBase4,
                tokenIDQuote4,
                amountQuote4,
                config4,
                handleFee4,
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
            let hash = getHash(
                user5ID,
                tokenIDBase5,
                amountBase5,
                tokenIDQuote5,
                amountQuote5,
                config5,
                handleFee5,
                gasFee5,
                nonce5
            );
            let sgn = await web3.eth.sign(hash, user5);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = getHex(
                user5ID,
                tokenIDBase5,
                amountBase5,
                tokenIDQuote5,
                amountQuote5,
                config5,
                handleFee5,
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
    describe('multiple orders', async function () {
        it('hex_1_2_3_4_5', async function () {
            let hash1 = getHash(
                user1ID,
                tokenIDBase1,
                amountBase1,
                tokenIDQuote1,
                amountQuote1,
                config1,
                handleFee1,
                gasFee1,
                nonce1
            );
            let hash2 = getHash(
                user2ID,
                tokenIDBase2,
                amountBase2,
                tokenIDQuote2,
                amountQuote2,
                config2,
                handleFee2,
                gasFee2,
                nonce2
            );
            let hash3 = getHash(
                user3ID,
                tokenIDBase3,
                amountBase3,
                tokenIDQuote3,
                amountQuote3,
                config3,
                handleFee3,
                gasFee3,
                nonce3
            );
            let hash4 = getHash(
                user4ID,
                tokenIDBase4,
                amountBase4,
                tokenIDQuote4,
                amountQuote4,
                config4,
                handleFee4,
                gasFee4,
                nonce4
            );
            let hash5 = getHash(
                user5ID,
                tokenIDBase5,
                amountBase5,
                tokenIDQuote5,
                amountQuote5,
                config5,
                handleFee5,
                gasFee5,
                nonce5
            );
            let sgn1 = await web3.eth.sign(hash1, user1);
            let sgn2 = await web3.eth.sign(hash2, user2);
            let sgn3 = await web3.eth.sign(hash3, user3);
            let sgn4 = await web3.eth.sign(hash4, user4);
            let sgn5 = await web3.eth.sign(hash5, user5);
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
            let ser_hex1 = getHex(
                user1ID,
                tokenIDBase1,
                amountBase1,
                tokenIDQuote1,
                amountQuote1,
                config1,
                handleFee1,
                gasFee1,
                nonce1,
                r1,
                s1,
                v1
            );
            let ser_hex2 = getHex(
                user2ID,
                tokenIDBase2,
                amountBase2,
                tokenIDQuote2,
                amountQuote2,
                config2,
                handleFee2,
                gasFee2,
                nonce2,
                r2,
                s2,
                v2
            );
            let ser_hex3 = getHex(
                user3ID,
                tokenIDBase3,
                amountBase3,
                tokenIDQuote3,
                amountQuote3,
                config3,
                handleFee3,
                gasFee3,
                nonce3,
                r3,
                s3,
                v3
            );
            let ser_hex4 = getHex(
                user4ID,
                tokenIDBase4,
                amountBase4,
                tokenIDQuote4,
                amountQuote4,
                config4,
                handleFee4,
                gasFee4,
                nonce4,
                r4,
                s4,
                v4
            );
            let ser_hex5 = getHex(
                user5ID,
                tokenIDBase5,
                amountBase5,
                tokenIDQuote5,
                amountQuote5,
                config5,
                handleFee5,
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
*/
});
