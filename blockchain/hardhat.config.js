require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL
const GANACHE_PRIVATE_KEY = process.env.GANACHE_PRIVATE_KEY

module.exports = {
  solidity: '0.8.0',
  ignition: {
    modules: [
        'ignition/file-storage.js'
    ],
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL, 
      accounts: [
        PRIVATE_KEY
      ]
    },
    ganache: {
      url: GANACHE_RPC_URL,
      chainId: 1337, // Default Ganache chain ID
      accounts: [
        GANACHE_PRIVATE_KEY,
      ] // Replace with your Ganache account private key
    }
  }
}
