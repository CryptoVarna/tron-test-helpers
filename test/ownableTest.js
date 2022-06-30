const { createContract, account } = require("./setup");
const expectEvent = require("../src/expectEvent");
const expectRevert = require("../src/expectRevert");
const { ZERO_ADDRESS, ZERO_ADDRESS_ETH } = require("../src/constants");
const { expect } = require("chai");
const OwnableTest = artifacts.require("OwnableTest");

contract("consants", function ([owner]) {
    beforeEach(async function () {
        this.ownable = await createContract(OwnableTest);
    });

    describe("ZERO_ADDRESS", function () {
        it("has the correct owner", async function () {
            expect(await this.ownable.owner().call()).to.equal(account.toHexAddress(owner));
        });

        it("is able to renounce ownership", async function () {
            const txId = await this.ownable.test().send();
            expect(await this.ownable.owner().call()).to.equal(ZERO_ADDRESS);
            await expectEvent.inTransaction(txId, this.ownable, "OwnershipTransferred",
                {
                    previousOwner: account.toHexAddress(owner, true),
                    newOwner: ZERO_ADDRESS_ETH,
                });
        });

        it("is not able to call onlyOwner method again", async function () {
            await this.ownable.test().send();
            await expectRevert(this.ownable.test().send(), "Ownable: caller is not the owner");
        });
    });
});
