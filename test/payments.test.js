const { BN, createContract } = require("./setup");
const trx = require("../src/trx");
const { expect } = require("chai");
const Payments = artifacts.require("Payments");

contract("payments", function (accounts) {

    describe("can send value to constructor", function () {

        it("send trx", async function () {
            const amount = trx(1);
            const payments = await createContract(Payments, { callValue: amount });
            const balance = BN.fromHex(await payments.getBalance().call());
            expect(balance).to.be.bignumber.equal(amount);
        });
    });
});
