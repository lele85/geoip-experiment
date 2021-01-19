const fs = require("fs");
const manifest = require(__dirname + "/../out/manifest.json");

let chunks = manifest.length;
let max = 0;
let sum = 0;
for (let i = 0; i < chunks; i++) {
    const chunk = fs.readFileSync(__dirname + `/../out/${i}.json`).toString();
    const start = new Date().getTime();
    JSON.parse(chunk);
    const end = new Date().getTime();
    const time = end - start;
    sum += time;
    if (time > max) {
        max = time;
    }
}
console.log(`Max parse time: ${max}`);
console.log(`Avg parse time: ${sum / chunks}`);
