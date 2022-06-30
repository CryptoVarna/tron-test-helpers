const { utils } = require("ethers");

function encodeFunctionCall(contract, functionName, ...params) {
    const mabi = contract.abi.find((m) => m.name === functionName);
    if (!mabi) {
        throw new Error(`Unable to find ABI for the function ${functionName}`);
    }
    mabi.type = mabi.type.toLowerCase();
    const json = [mabi];
    const iface = new utils.Interface(json);
    return iface.encodeFunctionData(functionName, params);
}

module.exports = {
    encodeFunctionCall,
};
