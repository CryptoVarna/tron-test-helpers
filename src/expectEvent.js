const BN = tronWeb.BigNumber;
const { waitEvents } = require("./transaction");
const { expect } = require("chai");

function expectEvent(events, eventName, eventArgs = {}) {
    return inLogs(events, eventName, eventArgs);
}

function notExpectEvent(events, eventName) {
    notInLogs(events, eventName);
}

function inLogs(logs, eventName, eventArgs = {}) {
    const events = logs.filter((e) => e.name === eventName);
    expect(events.length > 0).to.equal(true, `No '${eventName}' events found`);

    const exception = [];
    const event = events.find(function (e) {
        for (const [k, v] of Object.entries(eventArgs)) {
            try {
                contains(e.result, k, v);
            } catch (error) {
                exception.push(error);
                return false;
            }
        }
        return true;
    });

    if (event === undefined) {
        throw exception[0];
    }

    return event;
}

function notInLogs(logs, eventName) {
    // eslint-disable-next-line no-unused-expressions
    expect(
        logs.find((e) => e.name === eventName),
        `Event ${eventName} was found`
    ).to.be.undefined;
}

async function inTransaction(txId, emitter, eventName, eventArgs = {}) {
    const events = await waitEvents(txId, emitter);
    return inLogs(events, eventName, eventArgs);
}

async function notInTransaction(txId, emitter, eventName) {
    let events;
    try {
        events = await waitEvents(txId, emitter);
    } catch (error) {
        return;
    }
    notInLogs(events, eventName);
}

function contains(args, key, value) {
    expect(key in args).to.equal(true, `Event argument '${key}' not found`);

    if (value === null) {
        expect(args[key]).to.equal(null, `expected event argument '${key}' to be null but got ${args[key]}`);
    } else if (isBN(args[key]) || isBN(value)) {
        const actual = isBN(args[key]) ? args[key].toString() : args[key];
        const expected = isBN(value) ? value.toString() : value;
        expect(args[key],
            `expected event argument '${key}' to have value ${expected} but got ${actual}`)
            .to.be.bignumber.equal(value);
    } else if (typeof value == "function") {
        value(args[key]);
    } else {
        expect(args[key],
            `expected event argument '${key}' to have value ${value} but got ${args[key]}`)
            .to.be.deep.equal(value);
    }
}

function isBN(object) {
    return BN.isBigNumber(object) || object instanceof BN;
}

expectEvent.inLogs = inLogs;
expectEvent.notInLogs = notInLogs;
expectEvent.inTransaction = inTransaction;
expectEvent.notEmitted = notExpectEvent;
expectEvent.notEmitted.inTransaction = notInTransaction;

expectEvent.not = {};

module.exports = expectEvent;
