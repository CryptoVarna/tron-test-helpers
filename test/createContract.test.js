require("./setup");
const { ZERO_ADDRESS } = require("../src/constants");
const createContract = require("../src/createContract");
const expectEvent = require("../src/expectEvent");

const Constants = artifacts.require("Constants");
const EventEmitter = artifacts.require("EventEmitter");

contract("contract", function ([owner]) {

    describe("new", function () {

        it("creates a new contract with no arguments", async function () {
            const constants = await createContract(Constants);
            expect(await constants.returnZeroAddress().call()).to.equal(ZERO_ADDRESS);
        });

        it("creates a new contract with arguments", async function () {
            const emitter = await createContract(
                EventEmitter,
                42,
                "true",
                "CryptoVarna",
                ["hello", "world!"]);
            const txId = await emitter.emitBoolean("true").send();
            expectEvent.inTransaction(txId, emitter, "Boolean", { value: "true" });
        });
    });
});
