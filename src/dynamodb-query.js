const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const inet = require("inet");
const manifest = require("../out/manifest.json");
const Hash = require("./lib/Hash");

const db = new DynamoDB({
    region: "us-west-2",
    endpoint: "http://localhost:8000",
});

(async function () {
    const ip = "11.12.3.4";
    const ip_num = inet.aton(ip);
    const ip_hash = Hash.findHash(ip);

    const res = await db.query({
        TableName: "geoip",
        KeyConditionExpression: "iph = :ip_hash AND ips <= :ip_num",
        ExpressionAttributeValues: {
            ":ip_hash": { N: ip_hash },
            ":ip_num": { N: ip_num },
        },
        Limit: 1,
        ScanIndexForward: false,
        ReturnConsumedCapacity: "TOTAL",
    });
    console.log(res.ConsumedCapacity);
    console.log(res.Items);
})();
