function TRC165(functionSignatures = []) {
    const INTERFACE_ID_LENGTH = 4;

    const interfaceIdBuffer = functionSignatures
        .map((signature) => tronWeb.sha3(signature)) // keccak256
        .map(
            (h) => Buffer.from(h.substring(2), "hex").slice(0, 4) // bytes4()
        )
        .reduce((memo, bytes) => {
            for (let i = 0; i < INTERFACE_ID_LENGTH; i++) {
                memo[i] = memo[i] ^ bytes[i]; // xor
            }
            return memo;
        }, Buffer.alloc(INTERFACE_ID_LENGTH));

    return `0x${interfaceIdBuffer.toString("hex")}`;
}

function TRC1820(interfaceName) {
    return tronWeb.sha3(interfaceName); // keccak256
}

module.exports = {
    TRC165,
    TRC1820,
};
