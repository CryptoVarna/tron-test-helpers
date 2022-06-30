function getDefaultAccount() {
    return {
        address: tronWeb.defaultAddress.base58,
        privateKey: tronWeb.defaultPrivateKey,
    };
}

function setDefaultAccount(address) {
    tronWeb.setAddress(address);
    tronWeb.setPrivateKey(process.env[address]);
}

function getPrivateKey(address) {
    const pk = process.env[address];
    if (!pk) {
        throw new Error(`Private key is not defined for address ${address}. Define it in .env.development.`);
    }
    return pk;
}

function toHexAddress(base58Address, ethereumStyle = false) {
    return ethereumStyle
        ? "0x" + tronWeb.address.toHex(base58Address).substring(2)
        : tronWeb.address.toHex(base58Address);

}

function toBase58Address(hexAddress) {
    return tronWeb.address.fromHex(hexAddress);
}

module.exports = {
    getDefault: getDefaultAccount,
    setDefault: setDefaultAccount,
    toHexAddress,
    toBase58Address,
    getPrivateKey,
};
