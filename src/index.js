const wait = require("./wait");
const freeze = require("./freeze");
const {
    waitConfirmedTransaction,
    waitUnconfirmedTransaction,
    getUsedResources,
    waitEvents } = require("./transaction");

const BN = tronWeb.BigNumber;
BN.fromHex = (bn) => new BN(bn.toString());

// Setup Chai to use BigNumber
require("./useChaiBigNumber")(BN);

// Load env
require("dotenv").config({ path: ".env.development" });

// Setup tests to freeze some TRX for energy and bandwidth first
before(async function () {
    this.timeout(15000);
    await freeze.forEnergyAndBandwidth(process.env.admin_address, 10, 10);
});

module.exports = {
    BN: BN,
    wait,
    waitConfirmedTransaction,
    waitUnconfirmedTransaction,
    getUsedResources,
    waitEvents,
    get bytes() {
        return require("./bytes");
    },
    get abi() {
        return require("./abi");
    },
    get assertFailure() {
        return require("./assertFailure");
    },
    get balance() {
        return require("./balance");
    },
    get account() {
        return require("./account");
    },
    get createContract() {
        return require("./createContract");
    },
    get createToken() {
        return require("./createToken");
    },
    get constants() {
        return require("./constants");
    },
    get trx() {
        return require("./trx");
    },
    get freeze() {
        return require("./freeze");
    },
    get expectEvent() {
        return require("./expectEvent");
    },
    get makeInterfaceId() {
        return require("./makeInterfaceId");
    },
    get send() {
        return require("./send");
    },
    get expectRevert() {
        return require("./expectRevert");
    },
    get useChaiBigNumber() {
        return require("./useChaiBigNumber");
    },
    get time() {
        return require("./time");
    },
    get txDecoder() {
        return require("./txDecoder");
    },
};
