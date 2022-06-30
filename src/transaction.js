const wait = require("./wait");
const colors = require("ansi-colors");

async function waitConfirmedTransaction(txId, timeout = 20 /* sec */) {
    return new Promise(async (resolve, reject) => {
        while (timeout-- > 0) {
            try {
                await tronWeb.trx.getConfirmedTransaction(txId);
                return resolve(await tronWeb.trx.getTransactionInfo(txId));
            } catch (e) {
                await wait(1);
            }
        }
        reject(new Error("Transaction not confirmed"));
    });
}

async function waitUnconfirmedTransaction(txId, timeout = 20 /* sec */) {
    return new Promise(async (resolve, reject) => {
        while (timeout-- > 0) {
            const receipt = await tronWeb.trx.getUnconfirmedTransactionInfo(txId);
            if (receipt && receipt.id === txId) return resolve(receipt);
            await wait(1);
        }
        reject(new Error("Transaction not confirmed"));
    });
}

async function waitEvents(txId, contract = null, eventName = null, timeout = 20 /* sec */) {
    let events;
    while (timeout-- > 0) {
        events = await tronWeb.event.getEventsByTransactionID(txId);
        if (events.length) {
            if (contract) {
                const contractAddress = tronWeb.address.fromHex(contract.address);
                events = events.filter((event) => event.contract === contractAddress);
            }
            if (eventName) {
                return events.filter((e) => e.name === eventName);
            }
            return events;
        }
        await wait(1);
    }
    throw new Error("The expected event didn't happen");
}

async function getUsedResources(txId, print = true) {
    const info = await waitUnconfirmedTransaction(txId);
    const result = {
        energyFee: info.receipt.energy_fee,
        energyUsageTotal: info.receipt.energy_usage_total,
        netUsage: info.receipt.net_usage,
    };

    if (print === true) {
        console.log(`${colors.black.bgYellow(`Energy Usage:    ${result.energyUsageTotal}`)}`);
        console.log(`${colors.black.bgYellow(`Bandwidth Usage: ${result.netUsage}`)}`);
    }

    return result;
}

module.exports = {
    waitConfirmedTransaction,
    waitUnconfirmedTransaction,
    waitEvents,
    getUsedResources,
};
