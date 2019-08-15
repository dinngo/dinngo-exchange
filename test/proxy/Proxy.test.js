const { expectEvent, expectRevert } = require('openzeppelin-test-helpers');
const { inLogs } = expectEvent;

const { expect } = require('chai');

const Proxy = artifacts.require('ProxyMock');
const DummyImplementation = artifacts.require('DummyImplementation');
const DummyImplementationV2 = artifacts.require('DummyImplementationV2');

contract('Proxy', function ([_, nonContractAddress, owner]) {
    it('cannot be initialized with a non-contract address', async function () {
        await expectRevert.unspecified(Proxy.new(nonContractAddress, { from: owner }))
    });

    describe('initialized normally', function () {
        beforeEach(async function () {
            this.implementation = await DummyImplementation.new();
            this.proxy = await Proxy.new(this.implementation.address, { from: owner });
        });

        it('get implementation address', async function () {
            expect(await this.proxy.implementation.call()).to.eq(this.implementation.address);
        });

        describe('upgrade' , function () {
            beforeEach(async function () {
                this.implementationV2 = await DummyImplementationV2.new();
            });

            it('by owner', async function () {
                const { logs } = await this.proxy.upgrade(this.implementationV2.address, { from: owner });
                inLogs(logs, 'Upgraded', { implementation: this.implementationV2.address });
                expect(await this.proxy.implementation.call()).to.be.equal(this.implementationV2.address);
            });

            it('by non-owner', async function () {
                await expectRevert.unspecified(this.proxy.upgrade(this.implementationV2.address));
                expect(await this.proxy.implementation.call()).to.be.equal(this.implementation.address);
            });
        });
    });
});
