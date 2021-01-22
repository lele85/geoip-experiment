const bs = require("binary-search");
const { aton } = require("inet");
const manifest = require("../../out/manifest.json");

function findHash(ip) {
    const num = aton(ip);
    const index = bs(manifest, num, function (element, needle) {
        return element - needle;
    });
    return index >= 0 ? index : -index - 2;
}

module.exports = {
    findHash: findHash,
};
