const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const inet = require("inet");
const ipUtils = require("./lib/ipUtils");

const db = new DynamoDB({
    region: "us-west-2",
    endpoint: "http://localhost:8000",
});

(async function () {
    const ip = "1.1.1.1";
    const ip_num = inet.aton(ip);
    const ip_hash = ipUtils.getIPv4HashKey(ip);

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
