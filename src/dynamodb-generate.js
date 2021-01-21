const readline = require("readline");
const fs = require("fs");
const inet = require("inet");
const IPCIDR = require("ip-cidr");
const { argv } = require("process");

console.log(argv[0]);

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
    }
})();

// Blocks
(async function () {
    const IP_HASH_DIMENSION = 5000;
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
        __dirname + `/../out/out-${IP_HASH_DIMENSION}-no-location.json`,
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
        const ip_hash = Math.floor(ip_start_number / IP_HASH_DIMENSION);
        outFile.write(
            `iph${ETX}{"n":"${ip_hash}"}${STX}ips${ETX}{"n":"${ip_start_number}"}${STX}gid${ETX}{"n":"${geoname_id}"}${STX}pc${ETX}{"s":"${postal_code}"}\n`
        );
        count++;
    }
})();
