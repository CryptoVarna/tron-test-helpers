const { BN, assertFailure, createContract, account } = require("./setup");
const send = require("../src/send");
const trx = require("../src/trx");
const { expect } = require("chai");

const Acknowledger = artifacts.require("Acknowledger");

contract("send", function ([owner, sender, receiver]) {

    before(async function () {
        account.setDefault(sender);
    });

    after(async function () {
        account.setDefault(owner);
    });

    describe("trx", function () {
        it("sends trx", async function () {
            const value = trx("1");

            const initialSenderBalance = new BN(await tronWeb.trx.getBalance(sender));
            const initialReceiverBalance = new BN(await tronWeb.trx.getBalance(receiver));

            await send.trx(receiver, value.toString());

            const finalSenderBalance = new BN(await tronWeb.trx.getBalance(sender));
            const finalReceiverBalance = new BN(await tronWeb.trx.getBalance(receiver));

            expect(finalSenderBalance.minus(initialSenderBalance)).to.be.bignumber.equal(value.negated());
            expect(finalReceiverBalance.minus(initialReceiverBalance)).to.be.bignumber.equal(value);
        });

        it("throws if the sender balance is insufficient", async function () {
            const value = new BN(await tronWeb.trx.getBalance(sender)).plus(new BN(1));

            await assertFailure(send.trx(receiver, value));
        });

        it("calls fallback function", async function () {
            const contractAddress = (await createContract(Acknowledger)).address;
            const amount = tronWeb.toSun(1);
            const initialReceiverBalance = new BN(await tronWeb.trx.getBalance(contractAddress));
            await send.trx(contractAddress, amount);
            const finalReceiverBalance = new BN(await tronWeb.trx.getBalance(contractAddress));
            expect(finalReceiverBalance.minus(initialReceiverBalance)).to.be.bignumber.equal(amount);
        });
    });
});
