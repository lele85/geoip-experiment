const readline = require("readline");
const fs = require("fs");
const Locations = require("./lib/Locations");
const Blocks = require("./lib/Blocks");

(async () => {
    await Locations.loadLocations();
    const readBlocks = readline.createInterface({
        input: fs.createReadStream(
            __dirname + "/../data/GeoIp2-City-Blocks-IPv4.csv"
        ),
        output: false,
        console: false,
    });
    const outFile = await fs.promises.open(
        __dirname + `/../out/out-with-locations.json`,
        "w"
    );

    let skip = true;
    let BLOCKS_PER_HASH = 32;
    let current_hash = 0;
    let count = 0;
    let manifest = [];
    for await (const line of readBlocks) {
        if (skip) {
            skip = false;
            continue;
        }
        const entry = Blocks.getEntryFromLine(line);
        const location = Locations.getLocation(entry.gid);
        outFile.write(Blocks.getExportedEntry(current_hash, entry, location));
        if (count === 0) {
            manifest.push(entry.ips);
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
        __dirname + `/../out/manifest.json`,
        "w"
    );
    manifestFile.write(JSON.stringify(manifest));
})();
