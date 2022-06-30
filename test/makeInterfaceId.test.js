const { createContract } = require("./setup");
const makeInterfaceId = require("../src/makeInterfaceId");

const OwnableInterfaceId = artifacts.require("OwnableInterfaceId");

describe("makeInterfaceId", function () {
    describe("TRC165", function () {
        it("calculates the interface id from function signatures", async function () {
            const calculator = await createContract(OwnableInterfaceId);
            const ownableId = await calculator.getInterfaceId().call();

            expect(
                makeInterfaceId.TRC165(["owner()", "isOwner()", "renounceOwnership()", "transferOwnership(address)"])
            ).to.equal(ownableId);
        });
    });

    describe("TRC1820", function () {
        it("calculates the interface hash a from a contract name", async function () {
            expect(makeInterfaceId.TRC1820("TRC777Token")).to.equal(
                "0xc7877a06076538f1434ecca13506ed46710bfcb8d1c3706f4028da272063aac3"
            );
        });
    });
});
