const { waitConfirmedTransaction } = require("./transaction");

async function trx(to, value, confirmation = true) {
    const tx = await tronWeb.trx.sendTransaction(to, value);
    if (!tx.result) {
        throw new Error("Transaction failed");
    }
    return confirmation === true ? waitConfirmedTransaction(tx.transaction.txID) : tx;
}

async function token(to, value, tokenId, confirmation = true) {
    const tx = await tronWeb.trx.sendToken(to, value, tokenId);
    if (!tx.result) {
        throw new Error("Transaction failed");
    }
    return confirmation === true ? waitConfirmedTransaction(tx.transaction.txID) : tx;
}

module.exports = {
    trx,
    token,
};
