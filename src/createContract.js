async function createContract(artifact, ...params) {
    const instance = await artifact.new.apply(artifacts, params);
    return tronWeb.contract().at(instance.address);
}

module.exports = createContract;
