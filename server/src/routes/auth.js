const express = require("express");
const { ethers } = require("ethers");
const router = express.Router();

const ISSUER_ADDRESS = "0x52a2Ec069b79AE3394cEC467AEe4ca045CaDD7c7"; // Hardcoded issuer address

router.post("/verify-wallet", async (req, res) => {
    try {
        const { address, message, signature } = req.body;
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
            const isIssuer = address.toLowerCase() === ISSUER_ADDRESS.toLowerCase();
            res.status(200).json({ success: true, isIssuer });
        } else {
            res.status(400).json({ error: "Invalid signature" });
        }
    } catch (error) {
        res.status(500).json({ error: "Verification failed" });
    }
});

module.exports = router;