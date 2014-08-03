var exports = module.exports = ip4ToInt;

exports.ip4ToInt = ip4ToInt;
exports.intToIP4 = intToIP4;

function ip4ToInt(ipv4) {
    var b = ipv4.split('.', 4);
    return (b.length == 4)
            && (b[0] >= 0 && b[0] <= 255)
            && (b[1] >= 0 && b[1] <= 255)
            && (b[2] >= 0 && b[2] <= 255)
            && (b[3] >= 0 && b[3] <= 255)
            ? ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0 : null;
}

function intToIP4(i) {
    return (i >> 24 & 0xff) + "." + (i >> 16 & 0xff) + "." + (i >> 8 & 0xff) + "." + (i & 0xff);
}
