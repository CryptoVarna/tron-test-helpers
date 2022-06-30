const BN = tronWeb.BigNumber;
const createContract = require("../src/createContract");
const { waitUnconfirmedTransaction } = require("./transaction");
const wait = require("./wait");
const TimeContract = artifacts.require("TimeContract");

// Accepts paramenter how many blocks should be awaited
// 1 block = 3000ms(3 sec)
async function advanceBlock() {

    if (this.timeContract == null) {
        this.timeContract = await createContract(TimeContract);
    }

    const txId = await this.timeContract.increment().send();
    await waitUnconfirmedTransaction(txId);
}

// Advance the block to the passed height
async function advanceBlockTo(target) {
    const currentHeight = await latestBlock();
    const length = parseInt(target.minus(currentHeight).toFixed());
    // eslint-disable-next-line no-unmodified-loop-condition
    for (i = 0; i < length; i++) {
        await advanceBlock();
    }
}

async function latest() {
    const block = await getCurrentBlock();
    return new BN(block.block_header.raw_data.timestamp);
}

async function increase(duration) {
    const startTime = await latest();
    await wait(duration.toNumber());
    await advanceBlock();
    let currentTime = await latest();
    while (currentTime.minus(startTime) < duration) {
        await advanceBlock();
        currentTime = await latest();
    }
}

async function increaseTo(date) {
    const currentTimeStamp = await latest();
    // convert big number to number;
    const seconds = date.minus(currentTimeStamp).idiv(1000);
    await increase(seconds);
}

// Returns the current mined block
async function getCurrentBlock() {
    const block = await tronWeb.trx.getCurrentBlock();
    return block;
}

async function latestBlock() {
    const block = await getCurrentBlock();
    return new BN(block.block_header.raw_data.number);
}

const duration = {
    seconds: function (val) { return new BN(val); },
    minutes: function (val) { return new BN(val).times(this.seconds("60")); },
    hours: function (val) { return new BN(val).times(this.minutes("60")); },
    days: function (val) { return new BN(val).times(this.hours("24")); },
    weeks: function (val) { return new BN(val).times(this.days("7")); },
    years: function (val) { return new BN(val).times(this.days("365")); },
};

module.exports = {
    advanceBlock,
    advanceBlockTo,
    increase,
    increaseTo,
    latest,
    latestBlock,
    duration,
};
