const { expectEvent, shouldFail, time } = require('openzeppelin-test-helpers');
const { duration, increase } = time;
const { inLogs } = expectEvent;
const { reverting } = shouldFail;

const Proxy = artifacts.require('TimelockUpgradableProxyMock');
const DummyImplementation = artifacts.require('DummyImplementation');
const DummyImplementationV2 = artifacts.require('DummyImplementationV2');

contract('TimelockUpgradableProxy', function ([_, nonContractAddress, owner]) {
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

        it('upgrade without registration', async function () {
            this.implementationV2 = await DummyImplementationV2.new();
            await reverting(this.proxy.upgrade(this.implementationV2.address, { from: owner }));
        });

        describe('register' , function () {
            beforeEach(async function () {
                this.implementationV2 = await DummyImplementationV2.new();
                this.implementationV3 = await DummyImplementationV2.new();
            });

            it('with a non-contract address', async function () {
                await reverting(this.proxy.register(nonContractAddress, { from: owner }));
            });

            it('by owner', async function () {
                const { logs } = await this.proxy.register(this.implementationV2.address, { from: owner });
                const time = await this.proxy.time.call();
                inLogs(logs, 'UpgradeAnnounced', { implementation: this.implementationV2.address, time: time });
                (await this.proxy.registration.call()).should.eq(this.implementationV2.address);
            });

            it('by non-owner', async function () {
                await reverting(this.proxy.register(this.implementationV2.address));
            });

            describe('with a new implementation', function () {
                beforeEach(async function () {
                    await this.proxy.register(this.implementationV2.address, { from: owner });
                });

                it('upgrade without waiting', async function () {
                    await reverting(this.proxy.upgrade(this.implementationV2.address, { from: owner }));
                });

                it('upgrade with a different address', async function () {
                    await increase(duration.days(14));
                    await reverting(this.proxy.upgrade(this.implementationV3.address, { from: owner }));
                });

                it('upgrade announced address without waiting', async function () {
                    await reverting(this.proxy.upgradeAnnounced({ from: owner }));
                });

                describe('upgrade ready', function () {
                    beforeEach(async function () {
                        await increase(duration.days(14));
                    });

                    it('upgrade by owner', async function () {
                        const { logs } = await this.proxy.upgrade(this.implementationV2.address, { from: owner });
                        inLogs(logs, 'Upgraded', { implementation: this.implementationV2.address });
                        (await this.proxy.registration.call()).should.eq(this.implementationV2.address);
                    });

                    it('upgrade by non-owner', async function () {
                        await reverting(this.proxy.upgrade(this.implementationV2.address));
                    });

                    it('upgrade announced by owner', async function () {
                        const { logs } = await this.proxy.upgradeAnnounced({ from: owner });
                        inLogs(logs, 'Upgraded', { implementation: this.implementationV2.address });
                        (await this.proxy.registration.call()).should.eq(this.implementationV2.address);
                    });

                    it('upgrade announced by non-owner', async function () {
                        await reverting(this.proxy.upgradeAnnounced());
                    });
                });
            });
        });
    });
});
