require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
  solidity: '0.8.0',
  ignition: {
    modules: [
        'ignition/file-storage.js'
    ],
  },
  networks: {
    sepolia: {
<<<<<<< HEAD
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    apiKey: ETHERSCAN_API_KEY,
  },
=======
      url: 'https://eth-sepolia.g.alchemy.com/v2/olcfw045kenSVHeqLL_OCFOF7h03E-m9', 
      accounts: [
        '0xf2fe202a74a8d57172c782174fe0815fd9e913ccd60a87c391e4b003be4c3c08'
      ]
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337, // Default Ganache chain ID
      accounts: ["0xbc2a4d08990d8fb9467b503bcae28124dc5cf92fb8d649246792c79787c209f2"] // Replace with your Ganache account private key
    }
  }
>>>>>>> f61bc096d630e67ae055d42d941a56747ebfa450
}
