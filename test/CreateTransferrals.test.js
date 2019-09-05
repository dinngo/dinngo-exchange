const { constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const utils = require('web3-utils');

const Order = artifacts.require('DummyOrder');

function getHash(hex) {
    return utils.keccak256(hex);
}

function getSender(from, config, nonce) {
    const from_h = utils.padLeft(utils.toHex(from), 40);
    const config_h = utils.padLeft(utils.toHex(config), 2);
    const nonce_h = utils.padLeft(utils.toHex(nonce), 8);

    return (
        nonce_h +
        config_h.slice(2) +
        from_h.slice(2)
    );
}

function getReceiver(to, tokenID, amount, fee) {
    const to_h = utils.padLeft(utils.toHex(to), 40);
    const tokenID_h = utils.padLeft(utils.toHex(tokenID), 4);
    const amount_h = utils.padLeft(utils.toHex(amount), 64);
    const fee_h = utils.padLeft(utils.toHex(fee), 64);

    return (
        fee_h +
        amount_h.slice(2) +
        tokenID_h.slice(2) +
        to_h.slice(2)
    );
}

/*
contract('SerializableTransferral', function ([_, user1, user2, user3, user4, admin, deployer]) {
    const config1 = 1;
    const nonce1 = 1;
    const config2 = 1;
    const nonce2 = 2;

    const tokenID1 = 0;
    const amount1 = ether('0.1');
    const fee1 = ether('0.01');

    const tokenID2 = 11;
    const amount2 = ether('0.2');
    const fee2 = ether('0.02');

    describe('Single transferral', function () {
        it('hex1', async function () {
            let senderHex = getSender(
                user1,
                config1,
                nonce1
            );
            let receiver1Hex = getReceiver(
                user2,
                tokenID1,
                amount1,
                fee1
            );
            let transferralHex = (receiver1Hex + senderHex.slice(2));
            let hash = getHash(transferralHex);
            let sgn = await web3.eth.sign(hash, user1);
            let ser_hex = receiver1Hex + senderHex.slice(2);
            console.log(hash);
            console.log(sgn);
            console.log(ser_hex);
        });
    });

    describe('Single transferral from contract', function () {
        it('hex1', async function () {
            this.order = await Order.new({ from: deployer });
            let senderHex = getSender(
                this.order.address,
                config1,
                nonce1
            );
            let receiver1Hex = getReceiver(
                user2,
                tokenID1,
                amount1,
                fee1
            );
            let transferralHex = (receiver1Hex + senderHex.slice(2));
            let hash = getHash(transferralHex);
            let ser_hex = receiver1Hex + senderHex.slice(2);
            console.log(hash);
            console.log(ser_hex);
        });
    });

    describe('Multiple transferral', function () {
        it('hex1', async function () {
            let senderHex = getSender(
                user1,
                config2,
                nonce2
            );
            let receiver1Hex = getReceiver(
                user2,
                tokenID1,
                amount1,
                fee1
            );
            let receiver2Hex = getReceiver(
                user3,
                tokenID2,
                amount2,
                fee2
            );
            let transferralHex = (receiver2Hex + receiver1Hex.slice(2) + senderHex.slice(2));
            let hash = getHash(transferralHex);
            let sgn = await web3.eth.sign(hash, user1);
            let ser_hex = transferralHex;
            console.log(hash);
            console.log(sgn);
            console.log(ser_hex);
        });
    });
});
*/
