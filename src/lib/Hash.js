const bs = require("binary-search");
const { BigInteger } = require("jsbn");
const DATE = new Date().toISOString().split("T")[0].replace(/-/g, "");
const { Address6, Address4 } = require("ip-address");

const Address = {
    IPv4: Address4,
    IPv6: Address6,
};

function getType(ip) {
    const ip_type = ip.includes(":") ? "IPv6" : "IPv4";
    return ip_type;
}

function findHash(ip) {
    const ip_type = getType(ip);
    const num = new Address[ip_type](ip).bigInteger().toString();
    const manifest = require(`../../out/${DATE}_manifest_${ip_type}.json`);
    const index = bs(manifest.locations, num, function (element, needle) {
        const e = new BigInteger(element);
        const n = new BigInteger(needle);
        return e.compareTo(n);
    });
    return index >= 0 ? index : -index - 2;
}

module.exports = {
    findHash: findHash,
    getType: getType,
};
