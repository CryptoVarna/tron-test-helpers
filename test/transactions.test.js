const { createContract } = require("./setup");
const { waitConfirmedTransaction, waitUnconfirmedTransaction } = require("../src/transaction");
const account = require("../src/account");
const Reverter = artifacts.require("Reverter");

contract("Reverter", ([owner, first, second]) => {

    describe("transactions", function () {

        const testAmount = tronWeb.toSun(1);

        beforeEach(async function () {
            account.setDefault(owner);
            this.reverter = await createContract(Reverter);
        });

        describe("confirmed", function () {
            it("waits for confirmed transaction from contract and returns a receipt", async function () {
                const txId = await this.reverter
                    .revertFromRevertWithReason()
                    .send();
                const receipt = await waitConfirmedTransaction(txId);
                expect(receipt.id).to.equal(txId);
            });

            it("waits for confirmed transaction and returns a receipt", async function () {
                const tx = await tronWeb.trx.sendTransaction(first, testAmount);
                // eslint-disable-next-line no-unused-expressions
                expect(tx.result).to.be.true;
                const receipt = await waitConfirmedTransaction(tx.transaction.txID);
                expect(receipt.id).to.equal(tx.transaction.txID);
            });
        });

        describe("unconfirmed", function () {
            it("waits for unconfirmed transaction from contract and returns a receipt", async function () {
                const txId = await this.reverter
                    .revertFromRevertWithReason()
                    .send();
                const receipt = await waitUnconfirmedTransaction(txId);
                expect(receipt.id).to.equal(txId);
            });

            it("waits for unconfirmed transaction and returns a receipt", async function () {
                const tx = await tronWeb.trx.sendTransaction(first, testAmount);
                // eslint-disable-next-line no-unused-expressions
                expect(tx.result).to.be.true;
                const receipt = await waitUnconfirmedTransaction(tx.transaction.txID);
                expect(receipt.id).to.equal(tx.transaction.txID);
            });
        });
    });
});
