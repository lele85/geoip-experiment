module.exports = {
    getIPv4HashKey: (ip) => {
        return parseInt(ip.split(".")[0], 10);
    },
};
