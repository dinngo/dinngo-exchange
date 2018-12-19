import { reverting } from 'openzeppelin-solidity/test/helpers/shouldFail';
import { inLogs } from 'openzeppelin-solidity/test/helpers/expectEvent';

const BigNumber = web3.BigNumber;
const Proxy = artifacts.require('ProxyMock');
const DummyImplementation = artifacts.require('DummyImplementation');
const DummyImplementationV2 = artifacts.require('DummyImplementationV2');

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

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
            const implementation = await this.proxy.implementation.call();
            implementation.should.eq(this.implementation.address);
        });

        describe('upgrade' , function () {
            beforeEach(async function () {
                this.implementationV2 = await DummyImplementationV2.new();
            });

            it('by owner', async function () {
                const { logs } = await this.proxy.upgrade(this.implementationV2.address, { from: owner });
                const event = await inLogs(logs, 'Upgraded');
                event.args.implementation.should.eq(this.implementationV2.address);
                const implementationV2 = await this.proxy.implementation.call();
                implementationV2.should.be.equal(this.implementationV2.address);
            });

            it('by non-owner', async function () {
                await reverting(this.proxy.upgrade(this.implementationV2.address));
                const implementationV2 = await this.proxy.implementation.call();
                implementationV2.should.be.equal(this.implementation.address);
            });
        });
    });
});
