const express = require("express");
const multer = require("multer");
const axios = require("axios");
const upload = multer();
require("dotenv").config();

const router = express.Router();

router.post("/upload-to-ipfs", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file provided." });
        }

        const formData = new FormData();
        formData.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname);

        const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                PINATA_API_KEY: process.env.PINATA_API_KEY,
                PINATA_SECRET_API_KEY: process.env.PINATA_SECRET_API_KEY,
            },
        });

        res.status(200).json({ success: true, ipfsHash: response.data.IpfsHash, url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to upload file to Pinata." });
    }
});

module.exports = router;
