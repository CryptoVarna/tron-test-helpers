const { BN, createContract } = require("./setup");
const expectEvent = require("../src/expectEvent");
const { ZERO_ADDRESS, ZERO_ADDRESS_ETH, ZERO_BYTES32, MAX_UINT256 } = require("../src/constants");
const { expect } = require("chai");
const Constants = artifacts.require("Constants");

contract("consants", function () {
    beforeEach(async function () {
        this.constants = await createContract(Constants);
    });

    describe("ZERO_ADDRESS", function () {
        it("contracts interpret it as the zero address", async function () {
            expect(await this.constants.isZeroAddress(ZERO_ADDRESS).call()).to.equal(true);
        });

        it("contracts return it as the zero address", async function () {
            expect(await this.constants.returnZeroAddress().call()).to.equal(ZERO_ADDRESS);
        });

        it("contracts emits event with the zero address", async function () {
            const txId = await this.constants.emitEventWithZeroAddress().send();
            await expectEvent.inTransaction(txId, this.constants, "EmitZeroAddress", {
                zero: ZERO_ADDRESS_ETH,
            });
        });
    });

    describe("ZERO_BYTES32", function () {
        it("contracts interpret it as zero bytes32", async function () {
            expect(await this.constants.isZeroBytes32(ZERO_BYTES32).call()).to.equal(true);
        });

        it("contracts interpret it as an array of 32 bytes", async function () {
            expect(await this.constants.isBytesLength32(ZERO_BYTES32).call()).to.equal(true);
        });

        it("contracts return it as zero bytes32", async function () {
            expect(await this.constants.returnZeroBytes32().call()).to.equal(ZERO_BYTES32);
        });
    });

    describe("UINT256", function () {
        it("BigNumber is returned when calling a contract", async function () {
            expect(BN.fromHex(await this.constants.returnBigNumber().call()))
                .to.be.bignumber.equal(MAX_UINT256);
        });
    });
});
