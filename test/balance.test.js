require("./setup");
const { TRX_UNIT } = require("../src/balance");
const balance = require("../src/balance");
const send = require("../src/send");
const trx = require("../src/trx");
const { expect } = require("chai");
const createToken = require("../src/createToken");
const account = require("../src/account");

contract("balance", function ([sender, receiver]) {
    describe("trx", function () {
        describe("current", function () {
            it("returns the current balance of an account as a BigNumber in sun", async function () {
                const expected = await tronWeb.trx.getBalance(sender);
                expect(await balance.current(sender)).to.be.bignumber.equal(expected);
            });

            it("returns the current balance of an account as a BigNumber in a specified unit", async function () {
                expect(await balance.current(sender, TRX_UNIT)).to.be.bignumber.equal(
                    balance.fromMinor(await tronWeb.trx.getBalance(sender), balance.TRX_UNIT)
                );
            });
        });

        describe("balance tracker", function () {
            describe("default unit (sun)", function () {
                it("returns current balance ", async function () {
                    const tracker = await balance.tracker(receiver);
                    expect(await tracker.get()).to.be.bignumber.equal(
                        await tronWeb.trx.getBalance(receiver)
                    );
                });

                it("get() adds a new checkpoint ", async function () {
                    const tracker = await balance.tracker(sender);
                    await send.trx(receiver, trx("1"));
                    await tracker.get();
                    expect(await tracker.delta()).to.be.bignumber.equal("0");
                });

                it("returns correct deltas after get() checkpoint", async function () {
                    const tracker = await balance.tracker(receiver);
                    await send.trx(receiver, trx("1"));
                    await tracker.get();
                    await send.trx(receiver, trx("1"));
                    expect(await tracker.delta()).to.be.bignumber.equal(trx("1"));
                });

                it("returns balance increments", async function () {
                    const tracker = await balance.tracker(receiver);
                    await send.trx(receiver, trx("1"));
                    expect(await tracker.delta()).to.be.bignumber.equal(trx("1"));
                });

                it("returns balance decrements", async function () {
                    const tracker = await balance.tracker(sender);
                    await send.trx(receiver, trx("1"));
                    expect(await tracker.delta()).to.be.bignumber.equal(trx("-1"));
                });

                it("returns consecutive deltas", async function () {
                    const tracker = await balance.tracker(sender);
                    await send.trx(receiver, trx("1"));
                    await tracker.delta();
                    expect(await tracker.delta()).to.be.bignumber.equal("0");
                });
            });

            describe("user-provided unit", function () {
                const unit = 4;

                beforeEach(async function () {
                    this.tracker = await balance.tracker(sender, unit);
                });

                it("returns current balance in tracker-specified unit", async function () {
                    expect(await this.tracker.get()).to.be.bignumber.equal(
                        balance.fromMinor(await tronWeb.trx.getBalance(sender), unit)
                    );
                });

                it("returns deltas in tracker-specified unit", async function () {
                    await send.trx(receiver, trx("1"));
                    expect(await this.tracker.delta()).to.be.bignumber.equal(balance.fromMinor(trx("-1"), unit));
                });

                describe("overrides", function () {
                    const override = 2;

                    it("returns current balance in overridden unit", async function () {
                        expect(await this.tracker.get(override)).to.be.bignumber.equal(
                            balance.fromMinor(await tronWeb.trx.getBalance(sender), override)
                        );
                    });

                    it("returns deltas in overridden unit", async function () {
                        await send.trx(receiver, trx("1"));
                        expect(await this.tracker.delta(override)).to.be.bignumber.equal(
                            balance.fromMinor(trx("-1"), override)
                        );
                    });
                });
            });
        });
    });

    describe("tokens", function () {
        before(async function () {
            account.setDefault(sender);
            this.tokenName = "test";
            this.tokenSupply = 10e5;
            this.abbreviation = "tt";
            this.newToken = (await tronWeb.trx.getTokensIssuedByAddress(sender))[this.tokenName] === undefined;
            this.tokenId = await createToken(sender, this.tokenName, this.tokenSupply, this.abbreviation);
        });

        describe("current", function () {
            it("returns the current token balance of an account as a BigNumber in tokens", async function () {
                if (!this.newToken) this.skip();
                expect(await balance.current(sender, 0, this.tokenId)).to.be.bignumber.equal(this.tokenSupply);
            });

            it("returns the current balance of an account as a BigNumber in a specified unit", async function () {
                const senderAccount = await tronWeb.trx.getAccount(sender);
                const senderTokenIndex = (senderAccount).assetV2.findIndex((p) => p.key === this.tokenId);
                expect(await balance.current(sender, TRX_UNIT, this.tokenId)).to.be.bignumber.equal(
                    balance.fromMinor(senderAccount.assetV2[senderTokenIndex].value, balance.TRX_UNIT)
                );
            });
        });

        describe("balance tracker", function () {
            describe("default unit (token)", function () {

                beforeEach(function () {
                    account.setDefault(sender);
                });

                it("returns current balance ", async function () {
                    const tracker = await balance.tracker(sender, 0, this.tokenId);
                    const senderAccount = await tronWeb.trx.getAccount(sender);
                    const senderTokenIndex = (senderAccount).assetV2.findIndex((p) => p.key === this.tokenId);
                    expect(await tracker.get()).to.be.bignumber.equal(
                        senderAccount.assetV2[senderTokenIndex].value);
                });

                it("get() adds a new checkpoint ", async function () {
                    const tracker = await balance.tracker(sender, 0, this.tokenId);
                    await send.token(receiver, 1, this.tokenId);
                    await tracker.get();
                    expect(await tracker.delta()).to.be.bignumber.equal("0");
                });

                it("returns correct deltas after get() checkpoint", async function () {
                    const tracker = await balance.tracker(receiver, 0, this.tokenId);
                    await send.token(receiver, 1, this.tokenId);
                    await tracker.get();
                    await send.token(receiver, 1, this.tokenId);
                    expect(await tracker.delta()).to.be.bignumber.equal("1");
                });

                it("returns balance increments", async function () {
                    const tracker = await balance.tracker(receiver, 0, this.tokenId);
                    await send.token(receiver, 1, this.tokenId);
                    expect(await tracker.delta()).to.be.bignumber.equal("1");
                });

                it("returns balance decrements", async function () {
                    const tracker = await balance.tracker(sender, 0, this.tokenId);
                    await send.token(receiver, 1, this.tokenId);
                    expect(await tracker.delta()).to.be.bignumber.equal("-1");
                });

                it("returns consecutive deltas", async function () {
                    const tracker = await balance.tracker(sender, 0, this.tokenId);
                    await send.token(receiver, 1, this.tokenId);
                    await tracker.delta();
                    expect(await tracker.delta()).to.be.bignumber.equal("0");
                });
            });

            describe("user-provided unit", function () {
                const unit = 4;

                beforeEach(async function () {
                    this.tracker = await balance.tracker(sender, unit, this.tokenId);
                });

                it("returns current balance in tracker-specified unit", async function () {
                    const senderAccount = await tronWeb.trx.getAccount(sender);
                    const senderTokenIndex = (senderAccount).assetV2.findIndex((p) => p.key === this.tokenId);

                    expect(await this.tracker.get(unit, true)).to.be.bignumber.equal(
                        balance.fromMinor(senderAccount.assetV2[senderTokenIndex].value, unit)
                    );
                });

                it("returns deltas in tracker-specified unit", async function () {
                    await send.token(receiver, 1, this.tokenId);
                    expect(await this.tracker.delta(unit)).to.be.bignumber.equal(balance.fromMinor(-1, unit));
                });

                describe("overrides", function () {
                    const override = 2;

                    it("returns current balance in overridden unit", async function () {
                        const senderAccount = await tronWeb.trx.getAccount(sender);
                        const senderTokenIndex = (senderAccount).assetV2.findIndex((p) => p.key === this.tokenId);

                        expect(await this.tracker.get(override)).to.be.bignumber.equal(
                            balance.fromMinor(senderAccount.assetV2[senderTokenIndex].value, override)
                        );
                    });

                    it("returns deltas in overridden unit", async function () {
                        await send.token(receiver, 1, this.tokenId);
                        expect(await this.tracker.delta(override)).to.be.bignumber.equal(
                            balance.fromMinor(-1, override, this.tokenId)
                        );
                    });
                });
            });
        });
    });

});
