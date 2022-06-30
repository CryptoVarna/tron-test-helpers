const { BN, createContract } = require("./setup");
const assertFailure = require("../src/assertFailure");
const { AssertionError } = require("chai");
const expectEvent = require("../src/expectEvent");
const { waitEvents } = require("../src/transaction");

const EventEmitter = artifacts.require("EventEmitter");
const IndirectEventEmitter = artifacts.require("IndirectEventEmitter");

contract("expectEvent", function ([deployer]) {
    const errorRegex = /expected event argument .* to have value .* but got .*/;

    before(async function () {
        this.constructionValues = {
            uint: 42,
            boolean: "true",
            string: "CryptoVarna",
            stringsArray: ["hello", "world!"],
        };

        this.emitter = await createContract(
            EventEmitter,
            this.constructionValues.uint,
            this.constructionValues.boolean,
            this.constructionValues.string,
            this.constructionValues.stringsArray);
        this.secondEmitter = await createContract(IndirectEventEmitter);
    });

    describe("default", function () {
        describe("with single argument", function () {
            context("short uint value", function () {
                before(async function () {
                    this.value = 42;
                    const txId = await this.emitter.emitShortUint(this.value).send();
                    this.events = await waitEvents(txId, this.emitter);
                });

                it("accepts emitted events with correct BN", async function () {
                    expectEvent(this.events, "ShortUint", { value: new BN(this.value) });
                });

                it("throws if an emitted event with correct JavaScript number is requested", function () {
                    expect(() => expectEvent(this.events, "ShortUint", { value: this.value })).to.throw();
                });

                it("throws if an emitted event with correct BN and incorrect name is requested", function () {
                    expect(() => expectEvent(this.events, "ShortUint", { number: new BN(this.value) })).to.throw();
                });

                it("throws if an unemitted event is requested", function () {
                    expect(() => expectEvent(this.events, "UnemittedEvent", { value: this.value })).to.throw();
                });

                it("throws if an incorrect value is passed", function () {
                    expect(() => expectEvent(this.events, "ShortUint", { value: new BN(23) })).to.throw(
                        AssertionError,
                        "expected event argument 'value' to have value 23 but got 42"
                    );
                });
            });

            context("short int value", function () {
                before(async function () {
                    this.value = -42;
                    const txId = await this.emitter.emitShortInt(this.value).send();
                    this.events = await waitEvents(txId, this.emitter);
                });

                it("accepts emitted events with correct BN", function () {
                    expectEvent(this.events, "ShortInt", { value: new BN(this.value) });
                });

                it("throws if an emitted event with correct JavaScript number is requested", function () {
                    expect(() => expectEvent(this.events, "ShortInt", { value: this.value })).to.throw();
                });

                it("throws if an unemitted event is requested", function () {
                    expect(() => expectEvent(this.events, "UnemittedEvent", { value: this.value })).to.throw();
                });

                it("throws if an incorrect value is passed", function () {
                    expect(() => expectEvent(this.events, "ShortInt", { value: -23 })).to.throw();
                });
            });

            context("long uint value", function () {
                before(async function () {
                    this.bigNumValue = new BN("123456789012345678901234567890");
                    const txId = await this.emitter.emitLongUint(this.bigNumValue.toFixed()).send();
                    this.events = await waitEvents(txId, this.emitter);
                });

                it("accepts emitted events with correct BN", async function () {
                    expectEvent(this.events, "LongUint", { value: this.bigNumValue });
                });

                it("throws if an unemitted event is requested", function () {
                    expect(() => expectEvent(this.events, "UnemittedEvent", { value: this.bigNumValue })).to.throw();
                });

                it("throws if an incorrect value is passed", function () {
                    expect(() => expectEvent(this.events, "LongUint", { value: 2300 })).to.throw();
                });
            });

            context("long int value", function () {
                before(async function () {
                    this.bigNumValue = new BN("-123456789012345678901234567890");
                    const txId = await this.emitter.emitLongInt(this.bigNumValue.toFixed()).send();
                    this.events = await waitEvents(txId, this.emitter);
                });

                it("accepts emitted events with correct BN", function () {
                    expectEvent(this.events, "LongInt", { value: this.bigNumValue });
                });

                it("throws if an unemitted event is requested", function () {
                    expect(() => expectEvent(this.events, "UnemittedEvent", { value: this.bigNumValue })).to.throw();
                });

                it("throws if an incorrect value is passed", function () {
                    expect(() => expectEvent(this.events, "LongInt", { value: -2300 })).to.throw();
                });
            });

            context("address value", function () {
                before(async function () {
                    this.value = "0x190a151866682d3d461e363e5585d416e1228a38";
                    const txId = await this.emitter.emitAddress(this.value).send();
                    this.events = await waitEvents(txId, this.emitter);
                });

                it("accepts emitted events with correct address", function () {
                    expectEvent(this.events, "Address", { value: this.value });
                });

                it("throws if an unemitted event is requested", function () {
                    expect(() => expectEvent(this.events, "UnemittedEvent", { value: this.value })).to.throw();
                });

                it("throws if an incorrect value is passed", function () {
                    expect(() =>
                        expectEvent(this.events, "Address", { value: "0x21d04e022e0b52b5d5bcf90b7f1aabf406be002d" })
                    ).to.throw();
                });
            });

            context("boolean value", function () {
                before(async function () {
                    this.value = "true";
                    const txId = await this.emitter.emitBoolean(this.value).send();
                    this.events = await waitEvents(txId, this.emitter);
                });

                it("accepts emitted events with correct address", function () {
                    expectEvent(this.events, "Boolean", { value: this.value });
                });

                it("throws if an unemitted event is requested", function () {
                    expect(() => expectEvent(this.events, "UnemittedEvent", { value: this.value })).to.throw();
                });

                it("throws if an incorrect value is passed", function () {
                    expect(() => expectEvent(this.events, "Boolean", { value: "false" })).to.throw();
                });
            });

            context("string value", function () {
                before(async function () {
                    this.value = "CryptoVarna";
                    const txId = await this.emitter.emitString(this.value).send();
                    this.events = await waitEvents(txId, this.emitter);
                });

                it("accepts emitted events with correct string", function () {
                    expectEvent(this.events, "String", { value: this.value });
                });

                it("throws if an unemitted event is requested", function () {
                    expect(() => expectEvent(this.events, "UnemittedEvent", { value: this.value })).to.throw();
                });

                it("throws if an incorrect value is passed", function () {
                    expect(() => expectEvent(this.events, "String", { value: "CryptoSofia" })).to.throw();
                });
            });

            context("bytes value", function () {
                context("with non-null value", function () {
                    before(async function () {
                        this.value = "12345678";
                        this.hexValue = "0x" + this.value;
                        const txId = await this.emitter.emitBytes(this.hexValue).send();
                        this.events = await waitEvents(txId, this.emitter);
                    });

                    it("accepts emitted events with correct bytes", function () {
                        expectEvent(this.events, "Bytes", { value: this.value });
                    });

                    it("throws if an unemitted event is requested", function () {
                        expect(() => expectEvent(this.events, "UnemittedEvent", { value: this.value })).to.throw();
                    });

                    it("throws if an incorrect value is passed", function () {
                        expect(() => expectEvent(this.events, "Bytes", { value: "0x123456" })).to.throw();
                    });
                });

                context("with null value", function () {
                    before(async function () {
                        this.value = "";
                        this.hexValue = "0x" + this.value;
                        const txId = await this.emitter.emitBytes(this.hexValue).send();
                        this.events = await waitEvents(txId, this.emitter);
                    });

                    it("throws emitted events with null bytes", async function () {
                        expect(() => expectEvent(this.events, "Bytes", { value: null }))
                            .to.throw("Event argument 'value' not found");
                    });

                    it("throws if an unemitted event is requested", function () {
                        expect(() => expectEvent(this.events, "UnemittedEvent", { value: null })).to.throw();
                    });

                    it("throws if an incorrect value is passed", function () {
                        expect(() => expectEvent(this.events, "Bytes", { value: "0x123456" })).to.throw();
                    });
                });
            });
        });

        describe("with multiple arguments", function () {
            before(async function () {
                this.uintValue = new BN("123456789012345678901234567890");
                this.booleanValue = "true";
                this.stringValue = "CryptoVarna";
                const txId = await this.emitter.emitLongUintBooleanString(
                    this.uintValue.toFixed(),
                    this.booleanValue,
                    this.stringValue
                ).send();
                this.events = await waitEvents(txId, this.emitter);
            });

            it("accepts correct values", function () {
                expectEvent(this.events, "LongUintBooleanString", {
                    uintValue: this.uintValue,
                    booleanValue: this.booleanValue,
                    stringValue: this.stringValue,
                });
            });

            it("throws with correct values assigned to wrong arguments", function () {
                expect(() =>
                    expectEvent(this.events, "LongUintBooleanString", {
                        uintValue: this.booleanValue,
                        booleanValue: this.uintValue,
                        stringValue: this.stringValue,
                    })
                ).to.throw();
            });

            it("throws when any of the values is incorrect", function () {
                expect(() =>
                    expectEvent(this.events, "LongUintBooleanString", {
                        uintValue: 23,
                        booleanValue: this.booleanValue,
                        stringValue: this.stringValue,
                    })
                ).to.throw();

                expect(() =>
                    expectEvent(this.events, "LongUintBooleanString", {
                        uintValue: this.uintValue,
                        booleanValue: "false",
                        stringValue: this.stringValue,
                    })
                ).to.throw();

                expect(() =>
                    expectEvent(this.events, "LongUintBooleanString", {
                        uintValue: this.uintValue,
                        booleanValue: this.booleanValue,
                        stringValue: "CryptoSofia",
                    })
                ).to.throw();
            });
        });

        describe("with multiple events", function () {
            before(async function () {
                this.uintValue = 42;
                this.booleanValue = "true";
                const txId = await this.emitter.emitLongUintAndBoolean(
                    this.uintValue.toFixed(),
                    this.booleanValue)
                    .send();
                this.events = await waitEvents(txId, this.emitter);
            });

            it("accepts all emitted events with correct values", function () {
                expectEvent(this.events, "LongUint", { value: new BN(this.uintValue) });
                expectEvent(this.events, "Boolean", { value: this.booleanValue });
            });

            it("throws if an unemitted event is requested", function () {
                expect(() => expectEvent(this.events, "UnemittedEvent", { value: this.uintValue })).to.throw();
            });

            it("throws if incorrect values are passed", function () {
                expect(() => expectEvent(this.events, "LongUint", { value: 23 })).to.throw();
                expect(() => expectEvent(this.events, "Boolean", { value: "false" })).to.throw();
            });
        });

        describe("with multiple events of the same type", function () {
            before(async function () {
                this.firstUintValue = 42;
                this.secondUintValue = 24;
                const txId = await this.emitter.emitTwoLongUint(this.firstUintValue, this.secondUintValue).send();
                this.events = await waitEvents(txId, this.emitter);
            });

            it("accepts all emitted events of the same type", function () {
                expectEvent(this.events, "LongUint", { value: new BN(this.firstUintValue) });
                expectEvent(this.events, "LongUint", { value: new BN(this.secondUintValue) });
            });

            it("throws if an unemitted event is requested", function () {
                expect(() => expectEvent(this.events, "UnemittedEvent", { value: this.uintValue })).to.throw();
            });

            it("throws if incorrect values are passed", function () {
                expect(() => expectEvent(this.events, "LongUint", { value: new BN(41) })).to.throw();
                expect(() => expectEvent(this.events, "LongUint", { value: 24 })).to.throw();
            });
        });

        describe("with events emitted by an indirectly called contract", function () {
            before(async function () {
                this.value = "CryptoVarna";
                const txId = await this.emitter.emitStringAndEmitIndirectly(
                    this.value,
                    this.secondEmitter.address)
                    .send();
                this.events = await waitEvents(txId, this.emitter);
            });

            it("accepts events emitted by the directly called contract", function () {
                expectEvent(this.events, "String", { value: this.value });
            });

            it("throws when passing events emitted by the indirectly called contract", function () {
                expect(() => expectEvent(this.events, "IndirectString", { value: this.value })).to.throw();
            });
        });

        describe("with events containing indexed parameters", function () {
            before(async function () {
                this.indexedValue = new BN(42);
                this.normalValue = new BN(2014);
                const txId = await this.emitter.emitIndexedUint(
                    this.indexedValue.toFixed(),
                    this.normalValue.toFixed())
                    .send();
                this.events = await waitEvents(txId, this.emitter);
            });

            it("accepts events emitted by the directly called contract", function () {
                expectEvent(this.events, "IndexedUint", {
                    indexedValue: this.indexedValue,
                    normalValue: this.normalValue,
                });
            });
        });

        describe("with events containing conflicting indexed parameters", function () {
            before(async function () {
                this.indexedValue1 = new BN(42);
                this.normalValue1 = new BN(2014);
                this.indexedValue2 = new BN(2016);
                this.indexedValue3 = new BN(2009);
                const txId = await this.emitter.emitIndexedConflictingUint(
                    this.indexedValue1.toFixed(),
                    this.normalValue1.toFixed(),
                    this.indexedValue2.toFixed(),
                    this.indexedValue3.toFixed(),
                    this.secondEmitter.address
                ).send();
                this.events = await waitEvents(txId, this.emitter);
            });

            it("accepts events emitted by the directly called contract", function () {
                expectEvent(this.events, "IndexedConflictingUint", {
                    indexedValue1: this.indexedValue1,
                    normalValue1: this.normalValue1,
                });
            });
        });
    });

    describe("inTransaction", function () {
        describe("when emitting from called contract and indirect calls", function () {
            context("string value", function () {
                before(async function () {
                    this.value = "CryptoVarna";
                    this.txId = await this.emitter.emitStringAndEmitIndirectly(
                        this.value,
                        this.secondEmitter.address
                    ).send();
                });

                context("with directly called contract", function () {
                    it("accepts emitted events with correct string and emitter object", async function () {
                        await expectEvent.inTransaction(this.txId, this.emitter, "String", { value: this.value });
                    });

                    it("throws if an unemitted event is requested", async function () {
                        await assertFailure(
                            expectEvent.inTransaction(this.txId, this.emitter, "UnemittedEvent", {
                                value: this.value,
                            })
                        );
                    });

                    it("throws if an incorrect string is passed", async function () {
                        const { message } = await assertFailure(
                            expectEvent.inTransaction(this.txId, this.emitter, "String", { value: "CryptoSofia" })
                        );
                        expect(message).to.match(errorRegex);
                    });

                    it("throws if an event emitted from other contract is passed", async function () {
                        await assertFailure(
                            expectEvent.inTransaction(this.txId, this.emitter, "IndirectString", {
                                value: this.value,
                            })
                        );
                    });

                    it("throws if an incorrect emitter class is passed", async function () {
                        await assertFailure(
                            expectEvent.inTransaction(this.txId, this.secondEmitter, "String", {
                                value: this.value,
                            })
                        );
                    });

                    it("throws if an incorrect emitter object is passed", async function () {
                        const incorrectEmitter = await createContract(EventEmitter, 0, "false", "", []);
                        await assertFailure(
                            expectEvent.inTransaction(this.txId, incorrectEmitter, "String", { value: this.value }));
                    });
                });

                context("with indirectly called contract", function () {
                    it("accepts events emitted from other contracts and emitter object", async function () {
                        await expectEvent.inTransaction(this.txId, this.secondEmitter, "IndirectString", {
                            value: this.value,
                        });
                    });

                    it("accepts events emitted from other contracts and emitter class", async function () {
                        await expectEvent.inTransaction(this.txId, this.secondEmitter, "IndirectString", {
                            value: this.value,
                        });
                    });

                    it("throws if an unemitted event is requested", async function () {
                        await assertFailure(
                            expectEvent.inTransaction(this.txId, this.secondEmitter, "UnemittedEvent", {
                                value: this.value,
                            })
                        );
                    });

                    it("throws if an incorrect string is passed", async function () {
                        await assertFailure(
                            expectEvent.inTransaction(this.txId, this.secondEmitter, "IndirectString", {
                                value: "CryptoSofia",
                            })
                        );
                    });

                    it("throws if an event emitted from other contract is passed", async function () {
                        await assertFailure(
                            expectEvent.inTransaction(this.txId, this.secondEmitter, "String", {
                                value: this.value,
                            })
                        );
                    });

                    it("throws if an incorrect emitter class is passed", async function () {
                        await assertFailure(
                            expectEvent.inTransaction(this.txId, this.emitter, "IndirectString", {
                                value: this.value,
                            })
                        );
                    });

                    it("throws if an incorrect emitter object is passed", async function () {
                        const incorrectEmitter = await createContract(IndirectEventEmitter);
                        await assertFailure(
                            expectEvent.inTransaction(this.txId, incorrectEmitter, "IndirectString", {
                                value: this.value,
                            })
                        );
                    });
                });
            });
        });

        describe("with indexed event parameters", function () {
            before(async function () {
                this.indexedValue = new BN(42);
                this.normalValue = new BN(2014);
                this.indexedValue2 = new BN(2016);
                this.normalValue2 = new BN(2020);
                this.txId = await this.emitter.emitIndexedUintAndEmitIndirectly(
                    this.indexedValue.toFixed(),
                    this.normalValue.toFixed(),
                    this.indexedValue2.toFixed(),
                    this.normalValue2.toFixed(),
                    this.secondEmitter.address
                ).send();
            });

            context("with directly called contract", function () {
                it("accepts emitted events with correct indexed parameter and emitter object", async function () {
                    await expectEvent.inTransaction(this.txId, this.emitter, "IndexedUint", {
                        indexedValue: this.indexedValue,
                        normalValue: this.normalValue,
                    });
                });
            });

            context("with indirectly called contract", function () {
                it("accepts events emitted from other contracts with emitter object", async function () {
                    await expectEvent.inTransaction(this.txId, this.secondEmitter, "IndexedUint", {
                        indexedValue: this.indexedValue2,
                        normalValue: this.normalValue2,
                    });
                });
            });
        });

        describe("with conflicting indexed event parameters", function () {
            before(async function () {
                this.indexedValue1 = new BN(42);
                this.normalValue1 = new BN(2014);
                this.indexedValue2 = new BN(2016);
                this.indexedValue3 = new BN(2009);
                this.txId = await this.emitter.emitIndexedConflictingUint(
                    this.indexedValue1.toFixed(),
                    this.normalValue1.toFixed(),
                    this.indexedValue2.toFixed(),
                    this.indexedValue3.toFixed(),
                    this.secondEmitter.address
                ).send();
            });

            context("with directly called contract", function () {
                it("accepts emitted events with correct indexed parameter", async function () {
                    await expectEvent.inTransaction(this.txId, this.emitter, "IndexedConflictingUint", {
                        indexedValue1: this.indexedValue1,
                        normalValue1: this.normalValue1,
                    });
                });

                it("throws if the event value emitted from other contract is passed", async function () {
                    await assertFailure(
                        expectEvent.inTransaction(this.txId, this.emitter, "IndexedConflictingUint", {
                            indexedValue1: this.indexedValue2,
                            normalValue1: this.indexedValue3,
                        })
                    );
                });

                it("throws if the event emitted from other contract is passed", async function () {
                    await assertFailure(
                        expectEvent.inTransaction(this.txId, this.emitter, "IndexedConflictingUint", {
                            normalValue: this.normalValue,
                            indexedValue2: this.indexedValue2,
                        })
                    );
                });

                it("throws if the wrong event is requested", async function () {
                    await assertFailure(
                        expectEvent.inTransaction(this.txId, this.secondEmitter, "IndexedConflictingUint", {
                            indexedValue2: this.indexedValue1,
                            indexedValue3: this.normalValue1,
                        })
                    );
                });
            });

            context("with indirectly called contract", function () {
                it("accepts events emitted from other contracts", async function () {
                    await expectEvent.inTransaction(this.txId, this.secondEmitter, "IndexedConflictingUint", {
                        indexedValue2: this.indexedValue2,
                        indexedValue3: this.indexedValue3,
                    });
                });

                it("throws if the event value from other contract is passed", async function () {
                    await assertFailure(
                        expectEvent.inTransaction(this.txId, this.secondEmitter, "IndexedConflictingUint", {
                            indexedValue2: this.indexedValue1,
                            indexedValue3: this.normalValue1,
                        })
                    );
                });
            });

            it("throws if the event from other contract is passed", async function () {
                await assertFailure(
                    expectEvent.inTransaction(this.txId, this.secondEmitter, "IndexedConflictingUint", {
                        indexedValue1: this.indexedValue1,
                        normalValue1: this.normalValue1,
                    })
                );
            });

            it("throws if the wrong event is requested", async function () {
                await assertFailure(
                    expectEvent.inTransaction(this.txId, this.secondEmitter, "IndexedConflictingUint", {
                        indexedValue1: this.indexedValue2,
                        normalValue1: this.indexedValue3,
                    })
                );
            });
        });

        describe("with non-existing event names", function () {
            it("throws", async function () {
                const txId = await this.emitter.emitBoolean("true").send();
                await assertFailure(expectEvent.inTransaction(txId, this.emitter, "Nonexistant"));
            });
        });
    });

    describe("not", function () {
        describe("notEmitted", function () {
            before(async function () {
                const txId = await this.emitter.emitBoolean("true").send();
                this.events = await waitEvents(txId, this.emitter);
            });

            it("accepts not-emitted events", function () {
                expectEvent.notEmitted(this.events, "UnemittedEvent");
            });

            it("throws if an emitted event is requested", function () {
                expect(() => expectEvent.notEmitted(this.events, "Boolean")).to.throw();
            });
        });

        describe("inTransaction", function () {

            context("with arguments", function () {
                before(async function () {
                    this.value = 42;
                    this.txId = await this.emitter.emitShortUint(this.value).send();
                });

                it("accepts not emitted events", async function () {
                    await expectEvent.notEmitted.inTransaction(this.txId, this.emitter, "WillNeverBeEmitted");
                });

                it("throws when event is emitted", async function () {
                    await assertFailure(expectEvent.notEmitted.inTransaction(this.txId, this.emitter, "ShortUint"));
                });
            });

            context("with events emitted by an indirectly called contract", function () {
                before(async function () {
                    this.value = "CryptoVarna";
                    this.txId = await this.emitter.emitStringAndEmitIndirectly(
                        this.value,
                        this.secondEmitter.address
                    ).send();
                });

                it("accepts not emitted events", async function () {
                    await expectEvent.notEmitted.inTransaction(this.txId, this.emitter, "WillNeverBeEmitted");
                });

                it("throws when event is emitted", async function () {
                    await assertFailure(
                        expectEvent.notEmitted.inTransaction(this.txId, this.secondEmitter, "IndirectString")
                    );
                });
            });
        });
    });

    describe("waitEvents", function () {
        describe("with no arguments", function () {
            it("no events are captured if there are no arguments", async function () {
                const txId = await this.emitter.emitArgumentless().send();
                const assertion = await assertFailure(waitEvents(txId));
                expect(assertion.message).to.include("The expected event didn't happen");
            });
        });
        describe("with arguments", function () {
            it("events are captured if there are arguments", async function () {
                const txId = await this.emitter.emitBoolean("true").send();
                const events = await waitEvents(txId, this.emitter);
                expectEvent(events, "Boolean", { value: "true" });
            });
        });
    });
});
