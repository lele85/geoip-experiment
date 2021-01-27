const readline = require("readline");
const fs = require("fs");
const Locations = require("./lib/Locations");
const Blocks = require("./lib/Blocks");
const {
    getBlocksPath,
    getOutPath,
    getManifestPath,
    getTableName,
    getDate,
    assertType,
} = require("./lib/Files");

const argv = require("minimist")(process.argv.slice(2), {
    string: ["type"],
    default: {
        type: "IPv4",
    },
});

assertType(argv.type);

(async () => {
    await Locations.loadLocations();
    const readBlocks = readline.createInterface({
        input: fs.createReadStream(getBlocksPath(argv.type)),
        output: false,
        console: false,
    });
    const outFile = await fs.promises.open(getOutPath(argv.type), "w");

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
        const entry = Blocks.getEntryFromLine(line, argv.type);
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
        getManifestPath(argv.type),
        "w"
    );

    manifestFile.write(
        JSON.stringify({
            date: getDate(argv.type),
            table: getTableName(argv.type),
            locations: manifest_locations,
        })
    );
})();
