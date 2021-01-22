const readline = require("readline");
const fs = require("fs");

const locations = {};

async function loadLocations() {
    const readLocation = readline.createInterface({
        input: fs.createReadStream(
            __dirname + "/../../data/GeoIp2-City-Locations-en.csv"
        ),
        output: false,
        console: false,
    });
    let skip = true;
    for await (const line of readLocation) {
        if (skip) {
            skip = false;
            continue;
        }
        const location = getLocationFromLine(line);
        locations[location.gid] = location;
    }
}

function getLocation(gid) {
    return locations[`${gid}`] || getDefaultLocation();
}

function getLocationFromLine(line) {
    let [
        geoname_id,
        locale_code,
        continent_code,
        continent_name,
        country_iso_code,
        country_name,
        subdivision_1_iso_code,
        subdivision_1_name,
        subdivision_2_iso_code,
        subdivision_2_name,
        city_name,
        metro_code,
        time_zone,
        is_in_european_union,
    ] = line.split(",").map((value) => (value || "").replace(/\"/g, ""));
    geoname_id = parseInt(geoname_id, 10);
    is_in_european_union = parseInt(is_in_european_union, 10) || 0;
    return {
        gid: geoname_id,
        lc: locale_code,
        con_c: continent_code,
        con_n: continent_name,
        cou_c: country_iso_code,
        cou_n: country_name,
        s1_c: subdivision_1_iso_code,
        s1_n: subdivision_1_name,
        s2_c: subdivision_2_iso_code,
        s2_n: subdivision_2_name,
        cy_n: city_name,
        m_c: metro_code,
        is_eu: is_in_european_union,
    };
}

function getDefaultLocation() {
    return getLocationFromLine('0,"","","","","","","","","","","","",0');
}

module.exports = {
    loadLocations: loadLocations,
    getLocationFromLine: getLocationFromLine,
    getDefaultLocation: getDefaultLocation,
    getLocation: getLocation,
};
