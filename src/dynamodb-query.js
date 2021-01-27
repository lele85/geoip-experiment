const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const Hash = require("./lib/Hash");
const { Address6, Address4 } = require("ip-address");
const { getManifest } = require("./lib/Files");

const Address = {
    IPv4: Address4,
    IPv6: Address6,
};

const db = new DynamoDB({
    region: "us-west-2",
    endpoint: "http://localhost:8000",
});

(async function () {
    //const ip = "1.1.1.1";
    const ip = "2001:240::";
    const ip_type = Hash.getType(ip);
    const ip_num = new Address[ip_type](ip).bigInteger().toString();
    const ip_hash = Hash.findHash(ip);
    const manifest = getManifest(ip_type);

    const res = await db.query({
        TableName: manifest.table,
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
