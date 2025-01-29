const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // For environment variables
const { ethers } = require('ethers');
const { JsonRpcProvider } = require('ethers');
const multer = require('multer');
const upload = multer();
const { Blob } = require('buffer');
const app = express();
const PORT = process.env.PORT || 5000;
const axios = require('axios');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Basic route to check server health
app.get('/', (req, res) => {
    res.send('Blockchain API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


const provider = new JsonRpcProvider(process.env.INFURA_API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "fileHash",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "FileUploaded",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "files",
        "outputs": [
            {
                "internalType": "string",
                "name": "fileHash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_fileHash",
                "type": "string"
            }
        ],
        "name": "getFileOwner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_fileHash",
                "type": "string"
            }
        ],
        "name": "getFileTimestamp",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_fileHash",
                "type": "string"
            }
        ],
        "name": "uploadFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractAbi, wallet);

// API to upload file hash
app.post('/upload', async (req, res) => {
    const { fileHash } = req.body;

    if (!fileHash) {
        return res.status(400).json({ error: 'File hash is required.' });
    }

    try {
        const tx = await contract.uploadFile(fileHash);
        await tx.wait(); // Wait for transaction to be mined
        res.status(200).json({ message: 'File uploaded successfully!', txHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// API to fetch file owner
app.get('/owner/:fileHash', async (req, res) => {
    const { fileHash } = req.params;

    if (!fileHash) {
        return res.status(400).json({ error: 'File hash is required.' });
    }

    try {
        const owner = await contract.getFileOwner(fileHash);

        // Check if owner is the zero address
        if (owner === ethers.ZeroAddress) {
            console.log("Debug: Owner is AddressZero");
            return res.status(404).json({ error: 'File does not exist.' });
        }

        res.status(200).json({ owner });
    } catch (error) {
        console.error("Error stack trace:", error);
        res.status(500).json({ error: `Error fetching file owner: ${error.message}` });
    }
});

app.post("/upload-to-ipfs", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, error: "No file provided." });
        }

        const fileData = new FormData();
        // Append the file buffer with proper filename and content type
        const fileBlob = new Blob([file.buffer], { type: file.mimetype });

        // Append the Blob to FormData
        fileData.append("file", fileBlob, file.originalname);

        // Send request to Pinata
        const responseData = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: fileData,
            headers: {
                "Content-Type": "multipart/form-data",
                "pinata_api_key": process.env.PINATA_API_KEY,
                "pinata_secret_api_key": process.env.PINATA_SECRET_API_KEY,
            },
        });

        const ipfsHash = responseData.data.IpfsHash;
        const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

        res.status(200).json({ success: true, ipfsHash, url });
    } catch (error) {
        console.error("Upload to IPFS error:", error.response?.data || error.message);
        res.status(500).json({ success: false, error: "Failed to upload file to Pinata." });
    }
});


