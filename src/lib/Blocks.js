const CIDR = require("ip-cidr");
const inet = require("inet");

function getEntryFromLine(line) {
    let [
        network,
        geoname_id,
        registered_country_geoname_id,
        represented_country_geoname_id,
        is_anonymous_proxy,
        is_satellite_provider,
        postal_code,
        latitude,
        longitude,
        accuracy_radius,
    ] = line.split(",").map((value) => value.replace(/\"/g, ""));
    geoname_id = parseInt(geoname_id, 10) || 0;

    return {
        ips: inet.aton(new CIDR(network).start()),
        gid: geoname_id,
        pc: postal_code,
    };
}

const ETX = "\3";
const STX = "\2";

function getExportedEntry(hash, e, l) {
    return (
        `iph${ETX}{"n":"${hash}"}` +
        `${STX}ips${ETX}{"n":"${e.ips}"}` +
        `${STX}pc${ETX}{"s":"${e.pc}"}` +
        `${STX}lc${ETX}{"s":"${l.lc}"}` +
        `${STX}con_c${ETX}{"s":"${l.con_c}"}` +
        `${STX}con_n${ETX}{"s":"${l.con_n}"}` +
        `${STX}cou_c${ETX}{"s":"${l.cou_c}"}` +
        `${STX}cou_n${ETX}{"s":"${l.cou_n}"}` +
        `${STX}s1_c${ETX}{"s":"${l.s1_c}"}` +
        `${STX}s1_n${ETX}{"s":"${l.s1_n}"}` +
        `${STX}s2_c${ETX}{"s":"${l.s2_c}"}` +
        `${STX}s2_n${ETX}{"s":"${l.s2_n}"}` +
        `${STX}cy_n${ETX}{"s":"${l.cy_n}"}` +
        `${STX}m_c${ETX}{"s":"${l.m_c}"}` +
        `${STX}is_eu${ETX}{"n":"${l.is_eu}"}\n`
    );
}

module.exports = {
    getEntryFromLine: getEntryFromLine,
    getExportedEntry: getExportedEntry,
};
