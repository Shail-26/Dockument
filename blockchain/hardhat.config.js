require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: '0.8.0',
  networks: {
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/olcfw045kenSVHeqLL_OCFOF7h03E-m9', 
      accounts: [
        '0xf2fe202a74a8d57172c782174fe0815fd9e913ccd60a87c391e4b003be4c3c08'
      ]
    }
  }
}
