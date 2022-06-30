const BN = tronWeb.BigNumber;

function trx(n) {
    return new BN(tronWeb.toSun(n));
}

module.exports = trx;
