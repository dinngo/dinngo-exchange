const { expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { inLogs } = expectEvent;
const { reverting } = shouldFail;

const Proxy = artifacts.require('ProxyMock');
const DummyImplementation = artifacts.require('DummyImplementation');
const DummyImplementationV2 = artifacts.require('DummyImplementationV2');

contract('Proxy', function ([_, nonContractAddress, owner]) {
    it('cannot be initialized with a non-contract address', async function () {
        await reverting(Proxy.new(nonContractAddress, { from: owner }))
    });

    describe('initialized normally', function () {
        beforeEach(async function () {
            this.implementation = await DummyImplementation.new();
            this.proxy = await Proxy.new(this.implementation.address, { from: owner });
        });

        it('get implementation address', async function () {
            (await this.proxy.implementation.call()).should.eq(this.implementation.address);
        });

        describe('upgrade' , function () {
            beforeEach(async function () {
                this.implementationV2 = await DummyImplementationV2.new();
            });

            it('by owner', async function () {
                const { logs } = await this.proxy.upgrade(this.implementationV2.address, { from: owner });
                inLogs(logs, 'Upgraded', { implementation: this.implementationV2.address });
                (await this.proxy.implementation.call()).should.be.equal(this.implementationV2.address);
            });

            it('by non-owner', async function () {
                await reverting(this.proxy.upgrade(this.implementationV2.address));
                (await this.proxy.implementation.call()).should.be.equal(this.implementation.address);
            });
        });
    });
});
