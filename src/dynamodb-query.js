const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const inet = require("inet");

const db = new DynamoDB({
    region: "us-west-2",
    endpoint: "http://localhost:8000",
});

const NUMBER_OF_CHUNKS = 5000;

(async function () {
    const ip = "1.1.1.1";
    const ip_num = inet.aton(ip);
    const ip_hash = ip_num % NUMBER_OF_CHUNKS;

    const res = await db.query({
        TableName: "geoip",
        KeyConditionExpression:
            "ip_hash = :ip_hash AND ip_start_number <= :ip_num",
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
