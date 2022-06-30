const wait = require("./wait");

const BN = tronWeb.BigNumber;

function toMinorTokenUnit(value, precision = 6, tokenId = 0) {
    if (precision === 0) {
        return new BN(value.toString());
    } else {
        return new BN(value.toString()).times(new BigNumber(10 ** precision));
    }
}

function fromMinorTokenUnit(value, precision = 6, tokenId = 0) {
    if (precision === 0) {
        return new BN(value.toString());
    } else {
        return new BN(value.toString()).idiv(new BN(10 ** precision));
    }
}

async function getTokenBalance(tokenId, address) {
    let tries = 0;
    while (tries++ < 20) {
        const accountInfo = await tronWeb.trx.getAccount(address);
        if ("assetV2" in accountInfo) {
            const item = accountInfo.assetV2.find((p) => p.key === tokenId);
            return item.value;
        }
        tries++;
        await wait(1);
    }

    // If balance not found
    return 0;
}

class Tracker {
    constructor(acc, precision, tokenId) {
        this.account = acc;
        this.precision = precision;
        this.tokenId = tokenId;
        this.prev = new BN(0);
    }
    async delta(precision = this.precision) {
        const current = await balanceCurrent(this.account, 0, this.tokenId);
        const delta = current.minus(this.prev);
        this.prev = current;
        return new BN(fromMinorTokenUnit(delta, precision));
    }
    async get(precision = this.precision) {
        this.prev = await balanceCurrent(this.account, 0, this.tokenId);
        return new BN(fromMinorTokenUnit(this.prev, precision));
    }
}

async function balanceTracker(owner, precision = 0 /* sun */, tokenId = 0 /* TRX */) {
    const tracker = new Tracker(owner, precision, tokenId);
    await tracker.get();
    return tracker;
}

async function balanceCurrent(account, precision = 0 /* sun */, tokenId = 0 /* TRX */) {
    if (tokenId === 0) {
        return fromMinorTokenUnit(await tronWeb.trx.getBalance(account), precision);
    } else {
        return fromMinorTokenUnit(await getTokenBalance(tokenId, account), precision);
    }
}

module.exports = {
    current: balanceCurrent,
    tracker: balanceTracker,
    toMinor: toMinorTokenUnit,
    fromMinor: fromMinorTokenUnit,
    TRX_UNIT: 6,
};
