const { ethers } = require("ethers");
require("dotenv").config();

// const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL || "http://127.0.0.1:7545");
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const wallet = new ethers.Wallet(process.env.GANACHE_PRIVATE_KEY, provider);

const contractAbi = require("../utils/contractAbi.json"); // Move ABI to a separate file
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractAbi, wallet);

module.exports = { contract, provider };
