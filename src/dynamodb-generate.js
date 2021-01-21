const readline = require("readline");
const fs = require("fs");
const inet = require("inet");
const IPCIDR = require("ip-cidr");
const argv = require("minimist")(process.argv.slice(2), {
    boolean: ["location"],
    default: {
        location: false,
        chunks: 5000,
    },
});

const locations = {};
// Locations
(async function () {
    const readLocation = readline.createInterface({
        input: fs.createReadStream(
            __dirname + "/../data/GeoIp2-City-Locations-en.csv"
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
        ] = line.split(",").map((value) => (value || "").replace('"', ""));
        geoname_id = parseInt(geoname_id, 10);
        is_in_european_union = parseInt(is_in_european_union, 10) || 0;

        locations[geoname_id] = {
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
            is_in_european_union,
        };
    }
})();

// Blocks
(async function () {
    const NUMBER_OF_CHUNKS = argv.chunks;
    const ETX = "\3";
    const STX = "\2";

    const readBlocks = readline.createInterface({
        input: fs.createReadStream(
            __dirname + "/../data/GeoIp2-City-Blocks-IPv4.csv"
        ),
        output: false,
        console: false,
    });
    const outFile = await fs.promises.open(
        __dirname +
            `/../out/out-${NUMBER_OF_CHUNKS}-${
                argv.location ? "with" : "no"
            }-locations.json`,
        "w"
    );

    let skip = true;
    let count = 0;
    for await (const line of readBlocks) {
        if (skip) {
            skip = false;
            continue;
        }
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
        ] = line.split(",");
        geoname_id = geoname_id ? parseInt(geoname_id, 10) : 0;
        postal_code = postal_code.replace(/\"/g, "");
        const ip_start = new IPCIDR(network).start();
        const ip_start_number = inet.aton(ip_start);
        const ip_hash = ip_start_number % NUMBER_OF_CHUNKS;
        const l = locations[`${geoname_id}`] || {
            locale_code: "",
            continent_code: "",
            continent_name: "",
            country_iso_code: "",
            country_name: "",
            subdivision_1_iso_code: "",
            subdivision_1_name: "",
            subdivision_2_iso_code: "",
            subdivision_2_name: "",
            city_name: "",
            metro_code: "",
            is_in_european_union: 0,
        };

        const record_base =
            `iph${ETX}{"n":"${ip_hash}"}` +
            `${STX}ips${ETX}{"n":"${ip_start_number}"}` +
            `${STX}gid${ETX}{"n":"${geoname_id}"}` +
            `${STX}pc${ETX}{"s":"${postal_code}"}`;

        const record_location = argv.location
            ? `${STX}lc${ETX}{"s":"${l.locale_code}"}` +
              `${STX}con_c${ETX}{"s":"${l.continent_code}"}` +
              `${STX}con_n${ETX}{"s":"${l.continent_name}"}` +
              `${STX}cou_c${ETX}{"s":"${l.country_iso_code}"}` +
              `${STX}cou_n${ETX}{"s":"${l.country_name}"}` +
              `${STX}s1_c${ETX}{"s":"${l.subdivision_1_iso_code}"}` +
              `${STX}s1_n${ETX}{"s":"${l.subdivision_1_name}"}` +
              `${STX}s2_c${ETX}{"s":"${l.subdivision_2_iso_code}"}` +
              `${STX}s2_n${ETX}{"s":"${l.subdivision_2_name}"}` +
              `${STX}cy_n${ETX}{"s":"${l.city_name}"}` +
              `${STX}m_c${ETX}{"s":"${l.metro_code}"}` +
              `${STX}is_eu${ETX}{"n":"${l.is_in_european_union}"}`
            : "";

        outFile.write(`${record_base}${record_location}\n`);
        count++;
    }
})();
