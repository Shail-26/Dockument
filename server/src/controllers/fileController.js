const ethers = require("ethers");
const { contract } = require("../config/provider");
const cache = require("../utils/cache");

exports.getUserFiles = async (req, res) => {
  const { address } = req.params;

  if (!ethers.isAddress(address)) {
    console.log("Debug: Invalid Ethereum address");
    return res
      .status(400)
      .json({ success: false, error: "Invalid Ethereum address" });
  }

  // Check cache first
  const cachedFiles = cache.get(address);
  if (cachedFiles) {
    console.log("Debug: Returning cached files");
    return res.status(200).json({ success: true, files: cachedFiles });
  }

  try {
    const files = await contract.getUserFiles(address);
    console.log("Debug: Fetched files from contract", files);

    // Check if files is an array
    if (!Array.isArray(files)) {
      console.error("Error: Expected an array of files");
      return res
        .status(500)
        .json({ success: false, error: "Expected an array of files" });
    }

    // Cache the result
    cache.set(address, files);

    if (files.length === 0) {
      console.log("Debug: No files found for this user");
      return res
        .status(200)
        .json({
          success: true,
          message: "No files found for this user",
          files: [],
        });
    }

    res.status(200).json({ success: true, files });
  } catch (error) {
    console.error("Error fetching user files:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch user files." });
  }
};
