const { expect } = require("chai");
const { waitUnconfirmedTransaction } = require("./transaction");
const { decodeRevertMessage } = require("./txDecoder");

async function checkRevert(promise, expectedMessage, expectedError) {
    const txId = await promise;
    const receipt = await waitUnconfirmedTransaction(txId);
    if (receipt.receipt.result !== "SUCCESS") {
        const revert = await decodeRevertMessage(txId);
        expect(revert.txStatus).to.equal(expectedError, "Expected an exception but none was received");
        if (expectedMessage) {
            if (expectedMessage !== "*") {
                expect(revert.revertMessage).to.equal(expectedMessage, "Wrong kind of exception received");
            }
        } else if (revert.revertMessage) {
            throw new Error("Unexpected revert message");
        }
        return;
    }
    throw new Error("Expected an exception but none was received");
}

const expectOutOfEnergy = async function (promise) {
    try {
        await promise;
    } catch (e) {
        expect(e.error).to.equal("CONTRACT_EXE_ERROR");
        expect(e.message).to.include("insufficient balance");
        return;
    }
    throw new Error("Expected an exception but none was received");
};

const expectRevert = async function (promise, expectedMessage, expectedError = "REVERT") {
    promise.catch(() => { }); // Avoids uncaught promise rejections in case an input validation causes us to return early

    if (expectedMessage === undefined) {
        throw Error(
            "No revert reason specified: call expectRevert with the reason string, or use expectRevert.unspecified \
if your 'require' statement doesn't have one."
        );
    }

    await checkRevert(promise, expectedMessage, expectedError);
};

expectRevert.assertion = (promise) => expectRevert(promise, "*", "ASSERT");
expectRevert.outOfEnergy = (promise) => expectOutOfEnergy(promise);
expectRevert.unspecified = (promise) => expectRevert(promise, "*", "REVERT");

module.exports = expectRevert;
