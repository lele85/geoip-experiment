const readline = require("readline");
const fs = require("fs");
const Locations = require("./lib/Locations");
const Blocks = require("./lib/Blocks");

const IP_TYPE = "IPv4";
const DATE = new Date().toISOString().split("T")[0].replace(/-/g, "");

(async () => {
    await Locations.loadLocations();
    const readBlocks = readline.createInterface({
        input: fs.createReadStream(
            `${__dirname}/../data/GeoIp2-City-Blocks-${IP_TYPE}.csv`
        ),
        output: false,
        console: false,
    });
    const outFile = await fs.promises.open(
        __dirname + `/../out/${DATE}_out_${IP_TYPE.toLowerCase()}.json`,
        "w"
    );

    let skip = true;
    let BLOCKS_PER_HASH = 32;
    let current_hash = 0;
    let count = 0;
    let manifest_locations = [];
    for await (const line of readBlocks) {
        if (skip) {
            skip = false;
            continue;
        }
        const entry = Blocks.getEntryFromLine(line);
        const location = Locations.getLocation(entry.gid);
        outFile.write(Blocks.getExportedEntry(current_hash, entry, location));
        if (count === 0) {
            manifest_locations.push(entry.ips);
        }
        if (count === BLOCKS_PER_HASH - 1) {
            current_hash += 1;
            count = 0;
        } else {
            count += 1;
        }
    }

    // Write manifest
    const manifestFile = await fs.promises.open(
        `${__dirname}/../out/${DATE}-manifest-${IP_TYPE.toLowerCase()}.json`,
        "w"
    );
    manifestFile.write(
        JSON.stringify({
            date: DATE,
            table: `${DATE}_geoip_${IP_TYPE.toLowerCase()}`,
            locations: manifest_locations,
        })
    );
})();
