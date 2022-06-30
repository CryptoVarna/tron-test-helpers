const { waitUnconfirmedTransaction } = require("./transaction");
const account = require("./account");
const colors = require("ansi-colors");

async function freezeBalance(trx, resource, pk) {
    const amount = tronWeb.toSun(trx);
    const tx = await tronWeb.transactionBuilder.freezeBalance(amount, 3, resource);
    const signedTx = await tronWeb.trx.sign(tx, pk);
    const receipt = await tronWeb.trx.sendRawTransaction(signedTx);
    await waitUnconfirmedTransaction(receipt.transaction.txID);
}

async function freezeForEnergyAndBandwidth(
    adminAddress,
    freezeForEnergy = 10,
    freezeForBandWidth = 10,
    minEnergy = 20000,
    minBandWidth = 5000) {
    try {
        const resources = await tronWeb.trx.getAccountResources(adminAddress);
        const adminPk = account.getPrivateKey(adminAddress);
        if (!resources.TotalEnergyWeight || (resources.TotalEnergyLimit - resources.EnergyUsed < minEnergy)) {
            console.log(`${colors.black.bgRed(`Freezing ${freezeForEnergy} TRX for ENERGY`)}`);
            await freezeBalance(freezeForEnergy, "ENERGY", adminPk);
        }
        if (!resources.TotalNetWeight || (resources.TotalNetLimit - resources.NetUsed < minBandWidth)) {
            console.log(`${colors.black.bgRed(`Freezing ${freezeForBandWidth} TRX for BANDWIDTH`)}`);
            await freezeBalance(freezeForBandWidth, "BANDWIDTH", adminPk);
        }
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    balance: freezeBalance,
    forEnergyAndBandwidth: freezeForEnergyAndBandwidth,
};
