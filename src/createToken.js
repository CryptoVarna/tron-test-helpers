const { assert } = require("chai");
const { setDefault, getPrivateKey } = require("./account.js");
const wait = require("./wait");

async function createToken(
    account, // sender
    name, // Token name, default string
    totalSupply, // Token total supply
    abbreviation, // Token name abbreviation, default string
    description = "default description", // Token description, default string
    url = "defaulturl.com", // Token official website url, default string
    trxRatio = 1, // Define the price by the ratio of trx_num/num
    tokenRatio = 1, // Define the price by the ratio of trx_num/num
    saleStart = Date.now() + 20, // ICO start time
    saleEnd = Date.now() + 31536000000, // ICO end time
    freeBandwidth = 0, // The creator's "donated" bandwidth for use by token holders
    freeBandwidthLimit = 0, // Out of `totalFreeBandwidth`, the amount each token holder get
    frozenAmount = 0, // Token frozen supply
    frozenDuration = 0,
    // for now there is no default for the following values
    precision = 6,
    // ...params,
) {
    const trcOptions = {
        name: name,
        abbreviation: abbreviation,
        description: description,
        url: url,
        totalSupply: totalSupply,
        trxRatio: trxRatio,
        tokenRatio: tokenRatio,
        saleStart: saleStart,
        saleEnd: saleEnd,
        freeBandwidth: freeBandwidth,
        freeBandwidthLimit: freeBandwidthLimit,
        frozenAmount: frozenAmount,
        frozenDuration: frozenDuration,
        precision: precision,
    };

    setDefault(account);
    const privateKey = getPrivateKey(account);
    try {
        const rawTxObj = await tronWeb.transactionBuilder.createToken(trcOptions, account);
        const sign = await tronWeb.trx.sign(rawTxObj, privateKey);
        await tronWeb.trx.sendRawTransaction(sign);
        return waitForObject(account, name);
    } catch (e) {
        const token = (await tronWeb.trx.getTokensIssuedByAddress(account))[name];
        if (token !== undefined) {
            id = token.id;
            msg = "address " + account + " already has a token issued";
            assert(id !== undefined, msg);
            return id;
        } else {
            assert(false, "There is another token issued on the address");
        }
    }

}

async function waitForObject(account, tokenName) {
    let tries = 0;
    while (tries++ < 20) {
        const tokenIssued = (await tronWeb.trx.getTokensIssuedByAddress(account));
        if (tokenIssued !== undefined) {
            const token = tokenIssued[tokenName];
            if (token !== undefined) {
                // To mint the tokens for the user
                await wait(2);
                return token.id;
            }
        }
        await wait(1);
    }

    assert(false, "Cannot create the token");
}

module.exports = createToken;
