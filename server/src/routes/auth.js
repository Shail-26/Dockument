const express = require("express");
const { ethers } = require("ethers");
const router = express.Router();

router.post("/verify-wallet", async (req, res) => {
    try {
        const { address, message, signature } = req.body;
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ error: "Invalid signature" });
        }
    } catch (error) {
        res.status(500).json({ error: "Verification failed" });
    }
});

module.exports = router;
