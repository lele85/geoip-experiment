const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const inet = require("inet");

const db = new DynamoDB({
    region: "us-west-2",
    endpoint: "http://localhost:8000",
});

const IP_HASH_DIMENSION = 5000;

(async function () {
    const ip = "1.1.1.1";
    const ip_num = inet.aton(ip);
    const ip_hash = Math.floor(ip_num / IP_HASH_DIMENSION);

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
    console.log(res.Items);
})();

/**
 * ExpressionAttributeValues: {
   ":v1": {
     S: "No One You Know"
    }
  }, 
  KeyConditionExpression: "Artist = :v1", 
  ProjectionExpression: "SongTitle", 
  TableName: "Music"
 */
