const { ethers } = require("ethers");

const validateFileHash = (req, res, next) => {
    const { fileHash } = req.body;
    if (!fileHash) {
        return res.status(400).json({ error: "File hash is required." });
    }
    next();
};

const validateEthereumAddress = (req, res, next) => {
    const { address } = req.params;
    if (!ethers.isAddress(address)) {
        return res.status(400).json({ error: "Invalid Ethereum address." });
    }
    next();
};

module.exports = { validateFileHash, validateEthereumAddress };
