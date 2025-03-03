const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 10 }); // Cache for 60 seconds

module.exports = cache;
