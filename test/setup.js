const wait = require("../src/wait");
const freeze = require("../src/freeze");
const account = require("../src/account");
const assertFailure = require("../src/assertFailure");
const createContract = require("../src/createContract");

const BN = tronWeb.BigNumber;
BN.fromHex = (bn) => new BN(bn.toString());

// Setup Chai to use BigNumber
require("../src/useChaiBigNumber")(BN);

// Load env
require("dotenv").config({ path: ".env.development" });

// Setup tests to freeze some TRX for energy and bandwidth first
before(async function () {
    this.timeout(15000);
    await freeze.forEnergyAndBandwidth(process.env.admin_address, 10, 10);
});

module.exports = {
    BN,
    wait,
    assertFailure,
    createContract,
    account,
};
