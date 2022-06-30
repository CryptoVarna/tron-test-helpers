const { BN } = require("./setup");
const account = require("../src/account");
const send = require("../src/send");
const trx = require("../src/trx");

contract("account", function ([owner, sender, receiver]) {

    after(function () {
        account.setDefault(owner);
    });

    describe("address", function () {

        const base58Address = "TMJja5M6vfEmTiNX28s3VmeZghSSt1HGsS";
        const hexAddress = "417c5ace08f3b32b0db899cbfe37e1ce7aca7d1857";
        const hexEthereumAddress = "0x7c5ace08f3b32b0db899cbfe37e1ce7aca7d1857";

        it("convert base58 to hex", async function () {
            expect(account.toHexAddress(base58Address)).to.equal(hexAddress);
        });

        it("convert base58 to hex ethereum style", async function () {
            expect(account.toHexAddress(base58Address, true)).to.equal(hexEthereumAddress);
        });

        it("convert hex to base58", async function () {
            expect(account.toBase58Address(hexAddress)).to.equal(base58Address);
        });
    });

    describe("getDefault", function () {
        it("gets the default account", async function () {
            const defaultAccount = account.getDefault();
            expect(defaultAccount.address).to.equal(owner);
            expect(defaultAccount.privateKey).to.equal(process.env[owner]);
        });
    });

    describe("setDefault", function () {
        it("sets the default account", async function () {
            account.setDefault(sender);
            const defaultAccount = account.getDefault();
            expect(defaultAccount.address).to.equal(sender);
            expect(defaultAccount.privateKey).to.equal(process.env[sender]);
        });

        it("sends trx from the correct account", async function () {
            const value = trx("1");

            const initialSenderBalance = new BN(await tronWeb.trx.getBalance(sender));
            const initialReceiverBalance = new BN(await tronWeb.trx.getBalance(receiver));

            account.setDefault(sender);
            await send.trx(receiver, value.toString());

            const finalSenderBalance = new BN(await tronWeb.trx.getBalance(sender));
            const finalReceiverBalance = new BN(await tronWeb.trx.getBalance(receiver));

            expect(finalSenderBalance.minus(initialSenderBalance)).to.be.bignumber.equal(value.negated());
            expect(finalReceiverBalance.minus(initialReceiverBalance)).to.be.bignumber.equal(value);
        });

    });
});
