const { createContract } = require("./setup");
const abi = require("../src/abi");
const { ZERO_BYTES32 } = require("../src/constants");
const { expect } = require("chai");
const AbiMock = artifacts.require("Abi");

contract("abi", function (accounts) {

    beforeEach(async function () {
        this.constants = await createContract(AbiMock);
    });

    describe("encode functions", function () {

        it("function isZeroBytes32(bytes32 value)", async function () {
            expect(abi.encodeFunctionCall(this.constants, "isZeroBytes32", ZERO_BYTES32))
                .to.equal("0x4c83d6610000000000000000000000000000000000000000000000000000000000000000");
        });

        it("function encodeFunction1(address a, uint256 b, string calldata c)", async function () {
            // eslint-disable-next-line max-len
            const encoded = "0xd2cea8c30000000000000000000000007c5ace08f3b32b0db899cbfe37e1ce7aca7d1857000000000000000000000000000000000000000000000000000000000000007b0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000b43727970746f5661726e61000000000000000000000000000000000000000000";
            expect(abi.encodeFunctionCall(
                this.constants,
                "encodeFunction1",
                "0x7c5ace08f3b32b0db899cbfe37e1ce7aca7d1857",
                "123",
                "CryptoVarna"))
                .to.equal(encoded);
        });

        it("function encodeFunction2()", async function () {
            expect(abi.encodeFunctionCall(this.constants, "encodeFunction2"))
                .to.equal("0xf46604e0");
        });
    });
});
