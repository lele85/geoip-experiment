const DATE = new Date().toISOString().split("T")[0].replace(/-/g, "");

function getDate() {
    return DATE;
}

/**
 * @param {"IPv4"|"IPv6"} type
 * @returns {string}
 */
function getManifestPath(type) {
    return `${__dirname}/../../out/${DATE}_manifest_${type}.json`;
}

/**
 * @param {"IPv4"|"IPv6"} type
 * @returns {string}
 */
function getOutPath(type) {
    return `${__dirname}/../../out/${DATE}_out_${type}.json`;
}

/**
 * @param {"IPv4"|"IPv6"} type
 */
function getBlocksPath(type) {
    return `${__dirname}/../../data/GeoIp2-City-Blocks-${type}.csv`;
}

function getLocationsPath() {
    return `${__dirname}/../../data/GeoIp2-City-Locations-en.csv`;
}

/**
 * @param {"IPv4"|"IPv6"} type
 * @returns {{table:string, date:string, locations: any[]}}
 */
function getManifest(type) {
    return require(getManifestPath(type));
}

/**
 * @param {"IPv4"|"IPv6"} type
 */
function getTableName(type) {
    return `${DATE}_geoip_${type}`;
}

/**
 *
 * @param {string} type
 */
function assertType(type) {
    if (!["IPv4", "IPv6"].includes(type)) {
        throw `Invalid type ${type}, Please pass either IPv4 or IPv6.`;
    }
}

module.exports = {
    getManifestPath: getManifestPath,
    getManifest: getManifest,
    getOutPath: getOutPath,
    getBlocksPath: getBlocksPath,
    getLocationsPath: getLocationsPath,
    getTableName: getTableName,
    getDate: getDate,
    assertType: assertType,
};
