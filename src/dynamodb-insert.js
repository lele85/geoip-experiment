const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const readline = require("readline");
const fs = require("fs");
const Locations = require("./lib/Locations");
const Blocks = require("./lib/Blocks");
const { assertType, getManifest, getBlocksPath } = require("./lib/Files");

const argv = require("minimist")(process.argv.slice(2), {
    string: ["type"],
    default: {
        type: "IPv4",
    },
});

assertType(argv.type);

const manifest = getManifest(argv.type);

const db = new DynamoDB({
    region: "us-west-2",
    endpoint: "http://localhost:8000",
});

function createDatabase() {
    var params = {
        TableName: manifest.table,
        KeySchema: [
            { AttributeName: "iph", KeyType: "HASH" }, // Partition key
            { AttributeName: "ips", KeyType: "RANGE" }, //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "iph", AttributeType: "N" },
            { AttributeName: "ips", AttributeType: "N" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1000,
            WriteCapacityUnits: 1000,
        },
    };
    return new Promise((resolve) => {
        db.createTable(params, (err) => {
            if (err) {
                console.log("Database already present");
            } else {
                console.log("Database created");
            }
            resolve();
        });
    });
}

let batch = [];
async function writeBatch() {
    return await db.batchWriteItem({
        RequestItems: {
            [manifest.table]: batch,
        },
    });
}

(async () => {
    await createDatabase();
    await Locations.loadLocations();
    const readBlocks = readline.createInterface({
        input: fs.createReadStream(getBlocksPath(argv.type)),
        output: false,
        console: false,
    });

    let skip = true;
    let BLOCKS_PER_HASH = 32;
    let current_hash = 0;
    let count = 0;

    for await (const line of readBlocks) {
        if (skip) {
            skip = false;
            continue;
        }
        const entry = Blocks.getEntryFromLine(line, argv.type);
        const location = Locations.getLocation(entry.gid);

        if (count === BLOCKS_PER_HASH - 1) {
            current_hash += 1;
            count = 0;
        } else {
            count += 1;
        }

        if (batch.length === 25) {
            await writeBatch();
            batch = [];
        }

        batch.push({
            PutRequest: {
                Item: {
                    iph: { N: current_hash },
                    ips: { N: entry.ips },
                    pc: { S: entry.pc },
                    lc: { S: location.lc },
                    con_c: { S: location.con_c },
                    con_n: { S: location.con_n },
                    cou_c: { S: location.cou_c },
                    cou_n: { S: location.cou_n },
                    s1_c: { S: location.s1_c },
                    s1_n: { S: location.s1_n },
                    s2_c: { S: location.s2_c },
                    s2_n: { S: location.s2_n },
                    cy_n: { S: location.cy_n },
                    m_c: { S: location.m_c },
                    is_eu: { N: location.is_eu },
                },
            },
        });
    }
    await writeBatch();
})();
