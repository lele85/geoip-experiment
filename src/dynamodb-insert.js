const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const readline = require("readline");
const fs = require("fs");
const inet = require("inet");
const IPCIDR = require("ip-cidr");

const db = new DynamoDB({
    region: "us-west-2",
    endpoint: "http://localhost:8000",
});

const ITEMS_TO_SAVE = 5000;
const IP_HASH_DIMENSION = 5000;

function createDatabase() {
    var params = {
        TableName: "geoip",
        KeySchema: [
            { AttributeName: "ip_hash", KeyType: "HASH" }, // Partition key
            { AttributeName: "ip_start_number", KeyType: "RANGE" }, //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "ip_hash", AttributeType: "N" },
            { AttributeName: "ip_start_number", AttributeType: "N" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
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
            geoip: batch,
        },
    });
}

(async function () {
    await createDatabase();
    const readBlocks = readline.createInterface({
        input: fs.createReadStream(
            __dirname + "/../data/GeoIp2-City-Blocks-IPv4.csv"
        ),
        output: false,
        console: false,
    });
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
        const ip_start = new IPCIDR(network).start();
        const ip_start_number = inet.aton(ip_start);
        const ip_hash = Math.floor(ip_start_number / IP_HASH_DIMENSION);
        if (batch.length === 25) {
            await writeBatch();
            batch = [];
        } else {
            batch.push({
                PutRequest: {
                    Item: {
                        ip_hash: { N: ip_hash },
                        ip_start_number: { N: ip_start_number },
                        geoname_id: { N: geoname_id },
                        postal_code: { S: postal_code },
                    },
                },
            });
        }

        count++;
        console.log(count);
    }
    await writeBatch();
})();
