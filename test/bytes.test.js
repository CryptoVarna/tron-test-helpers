const { BN, createContract, account } = require("./setup");
const bytes = require("../src/bytes");
const { waitEvents } = require("../src/transaction");
const { expect } = require("chai");
const expectEvent = require("../src/expectEvent");
const txDecoder = require("../src/txDecoder");
const BytesContract = artifacts.require("Bytes");

contract("bytes", function ([owner, sender, receiver]) {

    const VALUE = "ce384haaff";

    describe("with0x", function () {

        it("bytes should start with 0x if it isn't", async function () {
            expect(bytes.with0x(VALUE)).to.equal("0x" + VALUE);
        });

        it("bytes should start with 0x if it is already", async function () {
            expect(bytes.with0x(VALUE)).to.equal("0x" + VALUE);
        });
    });

    describe("without0x", function () {

        it("bytes should NOT start with 0x if it isn't", async function () {
            expect(bytes.without0x(VALUE)).to.equal(VALUE);
        });

        it("bytes should NOT start with 0x if it is already", async function () {
            expect(bytes.without0x("0x" + VALUE)).to.equal(VALUE);
        });
    });

    describe("bytes decoding", function () {

        beforeEach(async function () {
            this.bytesContract = await createContract(BytesContract);
        });

        it("emitEventWithAddresses", async function () {
            const expected = [owner, sender, receiver];
            const txId = await this.bytesContract.emitEventWithAddresses(expected).send();
            await expectEvent.inTransaction(txId, this.bytesContract, "EventWithBytes", {
                n: "3",
                data: (value) => {
                    const result = txDecoder
                        .decodeBytes(["address", "address", "address"], value)
                        .map((a) => account.toBase58Address(a));
                    expect(expected).to.be.deep.equal(result);
                },
            });
        });

        it("emitEventWithAddresses2", async function () {
            const expected = [owner, sender, receiver];
            const txId = await this.bytesContract.emitEventWithAddresses(expected).send();
            const events = (await waitEvents(txId, this.bytesContract, "EventWithBytes"));
            expect(events).to.has.length(1);
            const eventData = events.pop().result;
            expect(eventData.n).to.be.bignumber.equal(3);
            const addresses = txDecoder
                .decodeBytes(["address", "address", "address"], bytes.with0x(eventData.data))
                .map((a) => account.toBase58Address(a));
            expect(addresses).to.be.deep.equal(expected);
        });
    });
});
