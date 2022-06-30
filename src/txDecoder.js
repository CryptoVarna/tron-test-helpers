const { utils } = require("ethers");
const bytes = require("../src/bytes");

function decodeBytes(abi, bytesData) {
    return utils.defaultAbiCoder.decode(abi, bytes.with0x(bytesData));
}

/**
 * Decode result data from the transaction hash
 *
 * @method decodeResultById
 * @param {string} transactionID the transaction hash
 * @return {Object} decoded result with method name
 */
async function decodeResultById(transactionID) {
    try {
        const transaction = await _getTransaction(transactionID);
        const data = "0x" + transaction.raw_data.contract[0].parameter.value.data;
        const contractAddress = transaction.raw_data.contract[0].parameter.value.contract_address;
        if (contractAddress === undefined) throw new Error("No Contract found for this transaction hash.");
        const abi = await _getContractABI(contractAddress);

        const resultInput = _extractInfoFromABI(data, abi);
        const functionABI = abi.find((i) => i.name === resultInput.method);

        if (!functionABI.outputs) {
            return {
                methodName: resultInput.method,
                outputNames: {},
                outputTypes: {},
                decodedOutput: { _length: 0 },
            };
        }
        const outputType = functionABI.outputs;
        const types = outputType.map(({ type }) => type);
        const names = resultInput.namesOutput;
        names.forEach(function (n, l) {
            this[l] || (this[l] = null);
        }, names);

        const encodedResult = (await _getHexEncodedResult(transactionID)).data;
        if (!encodedResult.includes("0x")) {
            let resMessage = "";
            let i = 0;
            const l = encodedResult.length;
            for (; i < l; i += 2) {
                const code = parseInt(encodedResult.substr(i, 2), 16);
                resMessage += String.fromCharCode(code);
            }

            return {
                methodName: resultInput.method,
                outputNames: names,
                outputTypes: types,
                decodedOutput: resMessage,
            };
        }

        const outputs = utils.defaultAbiCoder.decode(types, encodedResult);
        const outputObject = { _length: types.length };
        for (let i = 0; i < types.length; i++) {
            const output = outputs[i];
            outputObject[i] = output;
        }
        return {
            methodName: resultInput.method,
            outputNames: names,
            outputTypes: types,
            decodedOutput: outputObject,
        };
    } catch (err) {
        throw new Error(err);
    }
}

/**
 * Decode result data from the transaction hash
 *
 * @method decodeResultById
 * @param {string} transactionID the transaction hash
 * @return {Object} decoded result with method name
 */
async function decodeInputById(transactionID) {
    try {
        const transaction = await _getTransaction(transactionID);
        const data = "0x" + transaction.raw_data.contract[0].parameter.value.data;
        const contractAddress = transaction.raw_data.contract[0].parameter.value.contract_address;
        if (contractAddress === undefined) throw new Error("No Contract found for this transaction hash.");
        const abi = await _getContractABI(contractAddress);

        const resultInput = _extractInfoFromABI(data, abi);
        const names = resultInput.namesInput;
        const inputs = resultInput.inputs;
        const types = resultInput.typesInput;
        const inputObject = { _length: names.length };
        for (let i = 0; i < names.length; i++) {
            const input = inputs[i];
            inputObject[i] = input;
        }
        return {
            methodName: resultInput.method,
            inputNames: names,
            inputTypes: types,
            decodedInput: inputObject,
        };
    } catch (err) {
        throw new Error(err);
    }
}

/**
 * Decode revert message from the transaction hash (if any)
 *
 * @method decodeRevertMessage
 * @param {string} transactionID the transaction hash
 * @return {Object} decoded result with method name
 */
async function decodeRevertMessage(transactionID) {
    try {
        const transaction = await _getTransaction(transactionID);
        const contractAddress = transaction.raw_data.contract[0].parameter.value.contract_address;
        if (contractAddress === undefined) throw new Error("No Contract found for this transaction hash.");

        let txStatus = transaction.ret[0].contractRet;
        if (txStatus === "REVERT") {
            const encodedResult = await _getHexEncodedResult(transactionID);
            if (encodedResult.assertion) {
                txStatus = "ASSERT";
            }
            let message = encodedResult.data;
            let messageLength = message.length / 2;
            if (encodedResult.message) {
                messageLength = parseInt(message.substr(136, 2), 16);
                if (isNaN(messageLength) || messageLength === 0) {
                    throw new Error("Can't parse the revert message");
                }
                message = message.substr(138, messageLength * 2);
            }
            const resMessage = Buffer.from(message, "hex").toString("utf8").replace(/\0/g, "");
            if (resMessage.length !== messageLength) {
                throw new Error("Can't parse the revert message");
            }

            return {
                txStatus: txStatus,
                revertMessage: resMessage.replace(/\0/g, ""),
            };
        } else {
            return {
                txStatus: txStatus,
                revertMessage: "",
            };
        }
    } catch (err) {
        throw new Error(err);
    }
}

async function _getTransaction(transactionID) {
    try {
        const transaction = await tronWeb.trx.getTransaction(transactionID);
        if (!Object.keys(transaction).length) throw new Error("Transaction not found");
        return transaction;
    } catch (error) {
        throw error;
    }
}

async function _getHexEncodedResult(transactionID) {
    try {
        const transaction = await tronWeb.trx.getUnconfirmedTransactionInfo(transactionID);
        if (!Object.keys(transaction).length) throw new Error("Transaction not found");
        const data = transaction.contractResult[0];
        if (transaction.resMessage) {
            if (data === "") {
                return { message: false, data: transaction.resMessage };
            } else if (data.length < 138) {
                return { message: false, data: transaction.resMessage, assertion: true };
            }
        }
        return { message: true, data: "0x" + data };
    } catch (error) {
        throw error;
    }
}

async function _getContractABI(contractAddress) {
    try {
        const contract = await tronWeb.contract().at(contractAddress);
        if (contract.Error) throw new Error("Contract does not exist");
        return contract.abi;
    } catch (error) {
        throw error;
    }
}

function _genMethodId(methodName, types) {
    const input =
        methodName +
        "(" +
        types
            .reduce((acc, x) => {
                acc.push(_handleInputs(x));
                return acc;
            }, [])
            .join(",") +
        ")";

    return utils.keccak256(Buffer.from(input)).slice(2, 10);
}

function _extractInfoFromABI(data, abi) {
    const dataBuf = Buffer.from(data.replace(/^0x/, ""), "hex");

    const methodId = Array.from(dataBuf.subarray(0, 4), function (byte) {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
    }).join("");

    const inputsBuf = dataBuf.subarray(4);

    return abi.reduce(
        (acc, obj) => {
            if (obj.type === "constructor") return acc;
            if (obj.type === "event") return acc;
            const method = obj.name || null;
            const typesInput = obj.inputs
                ? obj.inputs.map((x) => {
                    if (x.type === "tuple[]") {
                        return x;
                    } else {
                        return x.type;
                    }
                })
                : [];

            const typesOutput = obj.outputs
                ? obj.outputs.map((x) => {
                    if (x.type === "tuple[]") {
                        return x;
                    } else {
                        return x.type;
                    }
                })
                : [];

            const namesInput = obj.inputs
                ? obj.inputs.map((x) => {
                    if (x.type === "tuple[]") {
                        return "";
                    } else {
                        return x.name;
                    }
                })
                : [];

            const namesOutput = obj.outputs
                ? obj.outputs.map((x) => {
                    if (x.type === "tuple[]") {
                        return "";
                    } else {
                        return x.name;
                    }
                })
                : [];
            const hash = _genMethodId(method, typesInput);
            if (hash === methodId) {
                let inputs = [];

                inputs = utils.defaultAbiCoder.decode(typesInput, inputsBuf);

                return {
                    method,
                    typesInput,
                    inputs,
                    namesInput,
                    typesOutput,
                    namesOutput,
                };
            }
            return acc;
        },
        { method: null, typesInput: [], inputs: [], namesInput: [], typesOutput: [], namesOutput: [] }
    );
}

function _handleInputs(input) {
    let tupleArray = false;
    if (input instanceof Object && input.components) {
        input = input.components;
        tupleArray = true;
    }

    if (!Array.isArray(input)) {
        if (input instanceof Object && input.type) {
            return input.type;
        }

        return input;
    }

    const ret =
        "(" +
        input
            .reduce((acc, x) => {
                if (x.type === "tuple") {
                    acc.push(handleInputs(x.components));
                } else if (x.type === "tuple[]") {
                    acc.push(handleInputs(x.components) + "[]");
                } else {
                    acc.push(x.type);
                }
                return acc;
            }, [])
            .join(",") +
        ")";

    if (tupleArray) {
        return ret + "[]";
    }
}
module.exports = {
    decodeBytes,
    decodeResultById,
    decodeInputById,
    decodeRevertMessage,
    extractInfoFromABI: _extractInfoFromABI,
};
