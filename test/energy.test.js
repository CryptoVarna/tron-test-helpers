const { createContract } = require("./setup");
const { getUsedResources } = require("../src/transaction");
const { expect } = require("chai");
const Energy = artifacts.require("Energy");

contract("Energy", function ([owner]) {

    describe("getUseResources()", function () {

        beforeEach(async function () {
            this.energy = await createContract(Energy);
        });

        it("test argumentless event", async function () {
            const txId = await this.energy.emitArgumentless().send();
            const result = await getUsedResources(txId, true);
            expect(result.energyUsageTotal).to.equal(938);
            expect(result.netUsage).to.equal(279);
        });

        it("test string event", async function () {
            const txId = await this.energy.emitString("CryptoVarna").send();
            const result = await getUsedResources(txId, true);
            expect(result.energyUsageTotal).to.equal(2850);
            expect(result.netUsage).to.equal(378);
        });

        it("test write to map", async function () {
            const txId = await this.energy.writeToMap({ addr: owner, value: "123" }).send();
            const result = await getUsedResources(txId, true);
            expect(result.energyUsageTotal).to.equal(215);
            expect(result.netUsage).to.equal(279);
        });

        it("test write to array", async function () {
            const txId = await this.energy.writeToArray({ addr: owner, value: "123" }).send();
            const result = await getUsedResources(txId, true);
            expect(result.energyUsageTotal).to.equal(215);
            expect(result.netUsage).to.equal(279);
        });
    });
});
