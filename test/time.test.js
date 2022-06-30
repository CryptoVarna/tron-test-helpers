const { BN } = require("./setup");
const { expect } = require("chai");
const time = require("../src/time");

contract("Time", ([owner, first, second]) => {
    const TOLERANCE_SECONDS = 3;

    describe("latestBlock", function () {
        it("returns a BN with the current block number", async function () {
            const currentBlock = await tronWeb.trx.getCurrentBlock();
            expect((await time.latestBlock()).toFixed()).to.be.equal(
                currentBlock.block_header.raw_data.number.toString());
        });

        it("returns a BN with the current block timestamp", async function () {
            const currentBlock = await tronWeb.trx.getCurrentBlock();
            expect((await time.latest()).toFixed()).to.be.equal(
                currentBlock.block_header.raw_data.timestamp.toString());
        });
    });

    describe("advanceBlock", function () {
        it("increases the block number by one", async function () {
            const startingBlock = await time.latestBlock();
            await time.advanceBlock();
            expect(await time.latestBlock()).to.be.bignumber.equal(
                (startingBlock.plus(1)));
        });
    });

    describe("advanceBlock multiple times", function () {
        it("increases the block number by several", async function () {
            const startingBlock = await time.latestBlock();
            const blocksToWait = 5;
            await time.advanceBlockTo(startingBlock.plus(blocksToWait));
            expect(await time.latestBlock()).to.be.bignumber.equal(
                (startingBlock.plus(blocksToWait)));
        });
    });

    describe("increase", function () {
        it("increases time by a duration", async function () {

            const end = ((await time.latest()).plus(15000));
            await time.increase(BN(15));

            const now = await time.latest();
            expect(now.minus(end)).to.be.bignumber.lessThan(TOLERANCE_SECONDS * 1001);
        });
    });

    describe("increaseTo", function () {
        it("increases time to a time in the future", async function () {
            const end = (await time.latest()).plus(10000);
            await time.increaseTo(end);

            const now = await time.latest();

            expect(now.minus(end)).to.be.bignumber.lessThan(TOLERANCE_SECONDS * 1001);
        });
    });

});
