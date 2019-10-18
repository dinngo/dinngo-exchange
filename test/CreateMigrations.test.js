const { constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const utils = require('web3-utils');

const DummyTarget = artifacts.require('DummyTarget');

function getHash1(target, userID, tokenID) {
    const target_h = utils.padLeft(utils.toHex(target), 40);
    const userID_h = utils.padLeft(utils.toHex(userID), 8);
    const tokenID_h = utils.padLeft(utils.toHex(tokenID), 4);

    return utils.keccak256(
        tokenID_h +
        userID_h.slice(2) +
        target_h.slice(2)
    );
}

function getHash3(target, userID, tokenID1, tokenID2, tokenID3) {
    const target_h = utils.padLeft(utils.toHex(target), 40);
    const userID_h = utils.padLeft(utils.toHex(userID), 8);
    const tokenID1_h = utils.padLeft(utils.toHex(tokenID1), 4);
    const tokenID2_h = utils.padLeft(utils.toHex(tokenID2), 4);
    const tokenID3_h = utils.padLeft(utils.toHex(tokenID3), 4);

    return utils.keccak256(
        tokenID3_h +
        tokenID2_h.slice(2) +
        tokenID1_h.slice(2) +
        userID_h.slice(2) +
        target_h.slice(2)
    );
}

function getHex1(target, userID, tokenID) {
    const target_h = utils.padLeft(utils.toHex(target), 40);
    const userID_h = utils.padLeft(utils.toHex(userID), 8);
    const tokenID_h = utils.padLeft(utils.toHex(tokenID), 4);

    return (
        tokenID_h +
        userID_h.slice(2) +
        target_h.slice(2)
    );
}

function getHex3(target, userID, tokenID1, tokenID2, tokenID3) {
    const target_h = utils.padLeft(utils.toHex(target), 40);
    const userID_h = utils.padLeft(utils.toHex(userID), 8);
    const tokenID1_h = utils.padLeft(utils.toHex(tokenID1), 4);
    const tokenID2_h = utils.padLeft(utils.toHex(tokenID2), 4);
    const tokenID3_h = utils.padLeft(utils.toHex(tokenID3), 4);

    return (
        tokenID3_h +
        tokenID2_h.slice(2) +
        tokenID1_h.slice(2) +
        userID_h.slice(2) +
        target_h.slice(2)
    );
}

/*
contract('SerializableMigration', function ([_, user1, user2, deployer]) {
    before(async function () {
        this.Target = await DummyTarget.new({ from: deployer });
    });

    const user1ID = 11;
    const token = 0;

    const user2ID = 12;
    const token1 = 0;
    const token2 = 11;
    const token3 = 23;
    const tokenBad = 66;
    const config2 = 0;

    describe('single migration', async function () {
        it('hex1', async function () {
            let hash = getHash1(
                this.Target.address,
                user1ID,
                token,
            );
            let sgn = await web3.eth.sign(hash, user1);
            let ser_hex = getHex1(
                this.Target.address,
                user1ID,
                token
            );
            console.log(hash);
            console.log(ser_hex);
            console.log(sgn);
            console.log(this.Target.address);
        });

        it('hex2', async function () {
            let hash = getHash3(
                this.Target.address,
                user2ID,
                token1,
                token2,
                token3,
            );
            let sgn = await web3.eth.sign(hash, user2);
            let ser_hex = getHex3(
                this.Target.address,
                user2ID,
                token1,
                token2,
                token3,
            );
            console.log(hash);
            console.log(ser_hex);
            console.log(sgn);
            console.log(this.Target.address);
        });

        it('hex3', async function () {
            let hash = getHash1(
                this.Target.address,
                user2ID,
                token2,
            );
            let sgn = await web3.eth.sign(hash, user2);
            let ser_hex = getHex1(
                this.Target.address,
                user2ID,
                token2
            );
            console.log(hash);
            console.log(ser_hex);
            console.log(sgn);
            console.log(this.Target.address);
        });

        it('hex4', async function () {
            let hash = getHash1(
                this.Target.address,
                user2ID,
                tokenBad,
            );
            let sgn = await web3.eth.sign(hash, user2);
            let ser_hex = getHex1(
                this.Target.address,
                user2ID,
                tokenBad
            );
            console.log(hash);
            console.log(ser_hex);
            console.log(sgn);
            console.log(this.Target.address);
        });
    });
});
*/
