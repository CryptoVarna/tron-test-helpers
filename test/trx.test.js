const { BN } = require("./setup");
const trx = require("../src/trx");

describe("trx", function () {
    it("returns a BN", function () {
        expect(trx("1")).to.be.bignumber.equal(new BN("1000000"));
    });

    it("works with negative amounts", function () {
        expect(trx("-1")).to.be.bignumber.equal(new BN("-1000000"));
    });
});
