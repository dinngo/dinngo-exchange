const { constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const utils = require('web3-utils');

function getHash(userID, tokenID, amount, config, fee, nonce) {
    const userID_h = utils.padLeft(utils.toHex(userID), 8);
    const tokenID_h = utils.padLeft(utils.toHex(tokenID), 4);
    const amount_h = utils.padLeft(utils.toHex(amount), 64);
    const config_h = utils.padLeft(utils.toHex(config), 2);
    const fee_h = utils.padLeft(utils.toHex(fee), 64);
    const nonce_h = utils.padLeft(utils.toHex(nonce), 8);

    return utils.keccak256(
        fee_h +
        nonce_h.slice(2) +
        config_h.slice(2) +
        amount_h.slice(2) +
        tokenID_h.slice(2) +
        userID_h.slice(2)
    );
}

function getHex(userID, tokenID, amount, config, fee, nonce) {
    const userID_h = utils.padLeft(utils.toHex(userID), 8);
    const tokenID_h = utils.padLeft(utils.toHex(tokenID), 4);
    const amount_h = utils.padLeft(utils.toHex(amount), 64);
    const config_h = utils.padLeft(utils.toHex(config), 2);
    const fee_h = utils.padLeft(utils.toHex(fee), 64);
    const nonce_h = utils.padLeft(utils.toHex(nonce), 8);

    return (
        fee_h +
        nonce_h.slice(2) +
        config_h.slice(2) +
        amount_h.slice(2) +
        tokenID_h.slice(2) +
        userID_h.slice(2)
    );
}

/*
contract('SerializableWithdrawal', function ([_, user1, user2]) {
    const user1ID = 11;
    const token1 = 0;
    const amount1 = ether('1');
    const config1 = 1;
    const fee1 = ether('0.001');
    const nonce1 = 1;

    const user2ID = 12;
    const token2 = 11;
    const amount2 = ether('2');
    const config2 = 0;
    const fee2 = ether('1');
    const nonce2 = 2;

    const user3ID = 12;
    const token3 = 11;
    const amount3 = ether('2');
    const config3 = 1;
    const fee3 = ether('1');
    const nonce3 = 3;

    describe('single withdrawal', async function () {
        it('hex1', async function () {
            let hash = getHash(
                user1ID,
                token1,
                amount1,
                config1,
                fee1,
                nonce1
            );
            let sgn = await web3.eth.sign(hash, user1);
            let ser_hex = getHex(
                user1ID,
                token1,
                amount1,
                config1,
                fee1,
                nonce1,
            );
            console.log(hash);
            console.log(ser_hex);
            console.log(sgn);
        });

        it('hex2', async function () {
            let hash = getHash(
                user2ID,
                token2,
                amount2,
                config2,
                fee2,
                nonce2
            );
            let sgn = await web3.eth.sign(hash, user2);
            let ser_hex = getHex(
                user2ID,
                token2,
                amount2,
                config2,
                fee2,
                nonce2,
            );
            console.log(hash);
            console.log(ser_hex);
            console.log(sgn);
        });

        it('hex3', async function () {
            let hash = getHash(
                user3ID,
                token3,
                amount3,
                config3,
                fee3,
                nonce3
            );
            let sgn = await web3.eth.sign(hash, user2);
            let ser_hex = getHex(
                user3ID,
                token3,
                amount3,
                config3,
                fee3,
                nonce3,
            );
            console.log(hash);
            console.log(ser_hex);
            console.log(sgn);
        });
    });
});
*/
