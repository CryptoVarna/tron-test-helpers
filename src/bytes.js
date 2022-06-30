function without0x(bytes) {
    if (bytes.indexOf("0x") === 0) {
        return bytes.substr(2);
    }
    return bytes;
}

function with0x(bytes) {
    if (bytes.indexOf("0x") !== 0) {
        return "0x" + bytes;
    }
    return bytes;
}

module.exports = {
    with0x,
    without0x,
};
