const { constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const utils = require('web3-utils');

const DummyTarget = artifacts.require('DummyTarget');

function getHash1(target, userID, tokenID, config, fee) {
    const target_h = utils.padLeft(utils.toHex(target), 40);
    const userID_h = utils.padLeft(utils.toHex(userID), 8);
    const tokenID_h = utils.padLeft(utils.toHex(tokenID), 4);
    const config_h = utils.padLeft(utils.toHex(config), 2);
    const fee_h = utils.padLeft(utils.toHex(fee), 64);

    return utils.keccak256(
        fee_h +
        config_h.slice(2) +
        tokenID_h.slice(2) +
        userID_h.slice(2) +
        target_h.slice(2)
    );
}

function getHash3(target, userID, tokenID1, tokenID2, tokenID3, config, fee) {
    const target_h = utils.padLeft(utils.toHex(target), 40);
    const userID_h = utils.padLeft(utils.toHex(userID), 8);
    const tokenID1_h = utils.padLeft(utils.toHex(tokenID1), 4);
    const tokenID2_h = utils.padLeft(utils.toHex(tokenID2), 4);
    const tokenID3_h = utils.padLeft(utils.toHex(tokenID3), 4);
    const config_h = utils.padLeft(utils.toHex(config), 2);
    const fee_h = utils.padLeft(utils.toHex(fee), 64);

    return utils.keccak256(
        fee_h +
        config_h.slice(2) +
        tokenID3_h.slice(2) +
        tokenID2_h.slice(2) +
        tokenID1_h.slice(2) +
        userID_h.slice(2) +
        target_h.slice(2)
    );
}

function getHex1(target, userID, tokenID, config, fee, r, s, v) {
    const target_h = utils.padLeft(utils.toHex(target), 40);
    const userID_h = utils.padLeft(utils.toHex(userID), 8);
    const tokenID_h = utils.padLeft(utils.toHex(tokenID), 4);
    const config_h = utils.padLeft(utils.toHex(config), 2);
    const fee_h = utils.padLeft(utils.toHex(fee), 64);

    return (
        s +
        r.slice(2) +
        v.slice(2) +
        fee_h.slice(2) +
        config_h.slice(2) +
        tokenID_h.slice(2) +
        userID_h.slice(2) +
        target_h.slice(2)
    );
}

function getHex3(target, userID, tokenID1, tokenID2, tokenID3, config, fee, r, s, v) {
    const target_h = utils.padLeft(utils.toHex(target), 40);
    const userID_h = utils.padLeft(utils.toHex(userID), 8);
    const tokenID1_h = utils.padLeft(utils.toHex(tokenID1), 4);
    const tokenID2_h = utils.padLeft(utils.toHex(tokenID2), 4);
    const tokenID3_h = utils.padLeft(utils.toHex(tokenID3), 4);
    const config_h = utils.padLeft(utils.toHex(config), 2);
    const fee_h = utils.padLeft(utils.toHex(fee), 64);

    return (
        s +
        r.slice(2) +
        v.slice(2) +
        fee_h.slice(2) +
        config_h.slice(2) +
        tokenID3_h.slice(2) +
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
    const config1 = 1;
    const fee1 = ether('0');

    const user2ID = 12;
    const token1 = 0;
    const token2 = 11;
    const token3 = 23;
    const config2 = 0;
    const fee2 = ether('0.001');

    describe('single migration', async function () {
        it('hex1', async function () {
            let hash = getHash1(
                this.Target.address,
                user1ID,
                token,
                config1,
                fee1,
            );
            let sgn = await web3.eth.sign(hash, user1);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = getHex1(
                this.Target.address,
                user1ID,
                token,
                config1,
                fee1,
                r,
                s,
                v
            );
            console.log(hash);
            console.log(r);
            console.log(s);
            console.log(v);
            console.log(ser_hex);
            console.log(this.Target.address);
        });

        it('hex2', async function () {
            let hash = getHash3(
                this.Target.address,
                user2ID,
                token1,
                token2,
                token3,
                config2,
                fee2,
            );
            let sgn = await web3.eth.sign(hash, user2);
            let r = sgn.slice(0,66);
            let s = '0x' + sgn.slice(66,130);
            let v = '0x' + sgn.slice(130,132);
            let ser_hex = getHex3(
                this.Target.address,
                user2ID,
                token1,
                token2,
                token3,
                config2,
                fee2,
                r,
                s,
                v
            );
            console.log(hash);
            console.log(r);
            console.log(s);
            console.log(v);
            console.log(ser_hex);
            console.log(this.Target.address);
        });
    });
});
*/
