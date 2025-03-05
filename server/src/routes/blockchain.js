const express = require("express");
const { ethers } = require("ethers");
const { contract } = require("../config/provider");
const {
  validateFileHash,
  validateEthereumAddress,
} = require("../middleware/validate");
const router = express.Router();

router.post("/upload", validateFileHash, async (req, res) => {
  try {
    const { fileHash } = req.body;
    const tx = await contract.uploadFile(fileHash);
    await tx.wait();
    res
      .status(200)
      .json({ message: "File uploaded successfully!", txHash: tx.hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/delete-file", validateFileHash, async (req, res) => {
  try {
    const { fileHash } = req.body;
    const tx = await contract.deleteFile(fileHash);
    await tx.wait();
    res
      .status(200)
      .json({ message: "File Deleted successfully!", txHash: tx.hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/owner/:fileHash", async (req, res) => {
  try {
    const { fileHash } = req.params;
    const owner = await contract.getFileOwner(fileHash);
    if (owner === ethers.ZeroAddress) {
      return res.status(404).json({ error: "File does not exist." });
    }
    res.status(200).json({ owner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
