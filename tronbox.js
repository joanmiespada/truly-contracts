require('dotenv').config();

const port = process.env.HOST_PORT || 9090

module.exports = {
  networks: {
    tronmainnet: {
      privateKey: process.env.TRONLINK_PRIVATE_KEY,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.trongrid.io',
      network_id: '1'
    },
    shasta: {
      privateKey: process.env.PRIVATE_KEY_SHASTA,
      userFeePercentage: 50,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    },
    nile: {
      privateKey: process.env.TRONLINK_PRIVATE_KEY,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.nileex.io',
      network_id: '3'
    },
    compilers: {
      solc: {
        version: '0.8.11'
      }
    },

  },

  // solc compiler optimize
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    evmVersion: 'london'
  }
}
