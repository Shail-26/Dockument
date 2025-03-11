const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const upload = multer();
const router = express.Router();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

// 🔹 Function to Upload File to IPFS
const uploadFileToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("file", file.buffer, { filename: file.originalname, contentType: file.mimetype });

    const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
            ...formData.getHeaders(),
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
    });

    return response.data.IpfsHash; // 🔹 Returns File CID
};

// 🔹 Function to Upload Metadata to IPFS
const uploadMetadataToIPFS = async (metadata) => {
    const response = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
        headers: {
            "Content-Type": "application/json",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
    });

    return response.data.IpfsHash; // 🔹 Returns Metadata CID
};

// 🔹 Upload File & Store Metadata on IPFS
router.post("/upload-to-ipfs", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file provided." });
        }

        // 1️⃣ Upload File to IPFS
        const fileCID = await uploadFileToIPFS(file);

        // 2️⃣ Create Metadata JSON
        const metadata = {
            fileName: file.originalname,
            fileHash: fileCID
        };

        // 3️⃣ Upload Metadata to IPFS
        const metadataCID = await uploadMetadataToIPFS(metadata);

        console.log("Uploaded File Details:", {
            filename: file.originalname,
            fileCID: fileCID,
            metadataCID: metadataCID,
            fileURL: `https://gateway.pinata.cloud/ipfs/${fileCID}`,
            metadataURL: `https://gateway.pinata.cloud/ipfs/${metadataCID}`
        });

        res.status(200).json({ 
            success: true, 
            filename: file.originalname, 
            fileCID: fileCID, 
            metadataCID: metadataCID,
            fileURL: `https://gateway.pinata.cloud/ipfs/${fileCID}`,
            metadataURL: `https://gateway.pinata.cloud/ipfs/${metadataCID}`
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Failed to upload file to Pinata." });
    }
});

module.exports = router;
