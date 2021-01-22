const { aton } = require("inet");

module.exports = {
    getIPv4HashKey: (ip) => {
        const ip_num = aton(ip);
        const hash = ip_num % 128000000;
        return hash;
    },
};
