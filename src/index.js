const readline = require("readline");
const fs = require("fs");
const inet = require("inet");
const IPCIDR = require("ip-cidr");

const ENTRIES_PER_CHUNK = 15000;

const readBlocks = readline.createInterface({
    input: fs.createReadStream(
        __dirname + "/../data/GeoIp2-City-Blocks-IPv4.csv"
    ),
    output: false,
    console: false,
});

const allLocations = {};

fs.readFileSync(__dirname + "/../data/GeoIp2-City-Locations-en.csv")
    .toString()
    .split("\n")
    .slice(1)
    .forEach((line) => {
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
        ] = line.split(",");
        geoname_id = parseInt(geoname_id, 10);
        continent_name = (continent_name || "").split('"').join("");
        country_name = (country_name || "").split('"').join("");
        subdivision_1_name = (subdivision_1_name || "").split('"').join("");
        subdivision_2_name = (subdivision_2_name || "").split('"').join("");
        city_name = (city_name || "").split('"').join("");
        is_in_european_union = parseInt(is_in_european_union, 10);

        allLocations[geoname_id] = [
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
        ];
    });

let manifest = [];
let skip = true;
let count = 0;
let chunkStart = null;
let chunk = { locations: {}, blocks: [] };
let chunkIndex = 0;
readBlocks.on("line", function (line) {
    if (skip) {
        skip = false;
        return;
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

    const ipBlockStart = inet.aton(new IPCIDR(network).start());
    geoname_id = parseInt(geoname_id, 10);
    chunk.locations[geoname_id] = allLocations[geoname_id];
    chunk.blocks.push([ipBlockStart, geoname_id, postal_code]);

    if (count === 0) {
        chunkStart = ipBlockStart;
    }
    count++;
    if (count === ENTRIES_PER_CHUNK) {
        fs.writeFileSync(
            __dirname + `/../out/${chunkIndex}.json`,
            JSON.stringify(chunk)
        );
        chunkIndex += 1;
        chunk = {
            locations: {},
            blocks: [],
        };
        manifest.push(chunkStart);
        count = 0;
        fs.writeFileSync(
            __dirname + `/../out/manifest.json`,
            JSON.stringify(manifest)
        );
    }
});
