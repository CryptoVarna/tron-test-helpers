const chaiBN = require("chai-bignumber")(tronWeb.BigNumber);

function useChaiBigNumber() {
    for (const mod of [require.main, module.parent]) {
        try {
            mod.require("chai").use(chaiBN);
        } catch (e) {
            // Ignore errors
        }
    }
}

module.exports = useChaiBigNumber;
