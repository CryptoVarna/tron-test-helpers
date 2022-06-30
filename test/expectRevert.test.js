const { assertFailure, createContract } = require("./setup");
const expectRevert = require("../src/expectRevert");

const Reverter = artifacts.require("Reverter");

describe("expectRevert", function () {
    this.timeout(15000);

    beforeEach(async function () {
        this.reverter = await createContract(Reverter);
    });

    describe("expectRevert", function () {
        it("rejects if no revert occurs", async function () {
            const assertion = await assertFailure(expectRevert(this.reverter.dontRevert().send(), "*"));
            expect(assertion.message).to.equal("Expected an exception but none was received");
        });

        it("rejects a revert with no reason", async function () {
            const assertion = await assertFailure(expectRevert(this.reverter.revertFromRevert().send()));
            expect(assertion.message).to.equal(
                "No revert reason specified: call expectRevert with the reason string, " +
                "or use expectRevert.unspecified if your 'require' statement doesn't have one."
            );
        });

        it("rejects a revert with reason and none expected", async function () {
            const assertion = await assertFailure(expectRevert(this.reverter.revertFromRevertWithReason().send(), ""));
            expect(assertion.message).to.include("Unexpected revert message");
        });

        it("rejects a revert with incorrect expected reason", async function () {
            const assertion = await assertFailure(
                expectRevert(this.reverter.revertFromRevertWithReason().send(), "Wrong reason")
            );

            expect(assertion.message).to.include("Wrong kind of exception received");
            expect(assertion.actual).to.equal("Call to revert");
            expect(assertion.expected).to.equal("Wrong reason");
        });

        it("accepts a revert with correct expected reason", async function () {
            await expectRevert(this.reverter.revertFromRevertWithReason().send(), "Call to revert");
        });

        it("rejects a failed requirement", async function () {
            const assertion = await assertFailure(expectRevert(this.reverter.revertFromRequire().send()));
            expect(assertion.message).to.equal(
                "No revert reason specified: call expectRevert with the reason string, " +
                "or use expectRevert.unspecified if your 'require' statement doesn't have one."
            );
        });

        it("rejects a failed requirement with reason and none expected", async function () {
            const assertion = await assertFailure(expectRevert(this.reverter.revertFromRequireWithReason().send(), ""));
            expect(assertion.message).to.include("Unexpected revert message");
        });

        it("rejects a failed requirement with incorrect expected reason", async function () {
            const assertion = await assertFailure(expectRevert(
                this.reverter.revertFromRequireWithReason().send(), "Wrong reason"));
            expect(assertion.message).to.include("Wrong kind of exception received");
        });

        it("accepts a failed requirement with correct expected reason", async function () {
            await expectRevert(this.reverter.revertFromRequireWithReason().send(), "Failed requirement");
        });

        it("rejects a failed assertion", async function () {
            const assertion = await assertFailure(expectRevert(this.reverter.revertFromAssert().send()));
            expect(assertion.message).to.equal(
                "No revert reason specified: call expectRevert with the reason string, " +
                "or use expectRevert.unspecified if your 'require' statement doesn't have one."
            );
        });

        it("rejects an outOfGas", async function () {
            const assertion = await assertFailure(expectRevert(this.reverter.revertFromOutOfEnergy().send()));
            expect(assertion.message).to.equal(
                "No revert reason specified: call expectRevert with the reason string, " +
                "or use expectRevert.unspecified if your 'require' statement doesn't have one."
            );
        });
    });

    describe("unspecified", function () {
        it("rejects if no revert occurs", async function () {
            await assertFailure(expectRevert.unspecified(this.reverter.dontRevert().send()));
        });

        it("accepts a revert", async function () {
            await expectRevert.unspecified(this.reverter.revertFromRevert().send());
        });

        it("accepts a revert with reason", async function () {
            await expectRevert.unspecified(this.reverter.revertFromRevertWithReason().send());
        });

        it("accepts a failed requirement", async function () {
            await expectRevert.unspecified(this.reverter.revertFromRequire().send());
        });

        it("accepts a failed requirement with reason", async function () {
            await expectRevert.unspecified(this.reverter.revertFromRequireWithReason().send());
        });

        it("rejects a failed assertion", async function () {
            await assertFailure(expectRevert.unspecified(this.reverter.revertFromAssert().send()));
        });

        it("rejects an outOfGas", async function () {
            await assertFailure(expectRevert.unspecified(this.reverter.revertFromOutOfEnergy().send()));
        });
    });

    describe("assertion", function () {
        it("rejects if no revert occurs", async function () {
            await assertFailure(expectRevert.assertion(this.reverter.dontRevert().send()));
        });

        it("rejects a revert", async function () {
            await assertFailure(expectRevert.assertion(this.reverter.revertFromRevert().send()));
        });

        it("rejects a revert with reason", async function () {
            await assertFailure(expectRevert.assertion(this.reverter.revertFromRevertWithReason().send()));
        });

        it("rejects a failed requirement", async function () {
            await assertFailure(expectRevert.assertion(this.reverter.revertFromRequire().send()));
        });

        it("rejects a failed requirement with reason", async function () {
            await assertFailure(expectRevert.assertion(this.reverter.revertFromRequireWithReason().send()));
        });

        it("accepts a failed assertion", async function () {
            await expectRevert.assertion(this.reverter.revertFromAssert().send());
        });

        it("rejects an outOfGas", async function () {
            await assertFailure(expectRevert.assertion(this.reverter.revertFromOutOfEnergy().send()));
        });
    });

    describe("outOfGas", function () {
        it("rejects if no revert occurs", async function () {
            await assertFailure(expectRevert.outOfEnergy(this.reverter.dontRevert().send()));
        });

        it("rejects a revert", async function () {
            await assertFailure(expectRevert.outOfEnergy(this.reverter.revertFromRevert().send()));
        });

        it("rejects a revert with reason", async function () {
            await assertFailure(expectRevert.outOfEnergy(this.reverter.revertFromRevertWithReason().send()));
        });

        it("rejects a failed requirement", async function () {
            await assertFailure(expectRevert.outOfEnergy(this.reverter.revertFromRequire().send()));
        });

        it("rejects a failed requirement with reason", async function () {
            await assertFailure(expectRevert.outOfEnergy(this.reverter.revertFromRequireWithReason().send()));
        });

        it("rejects a failed assertion", async function () {
            await assertFailure(expectRevert.outOfEnergy(this.reverter.revertFromAssert().send()));
        });

        it("accepts an outOfEnergy", async function () {
            await expectRevert.outOfEnergy(this.reverter.revertFromOutOfEnergy().send());
        });
    });
});
