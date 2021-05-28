const { projectId, mnemonic } = require('./secrets.json')
const HDWalletProvider = require('@truffle/hdwallet-provider');

require('babel-register');
require('babel-polyfill');
require('dotenv').config();



module.exports = {
  

  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },

    //NB: Its important to wrap the provider as a function
  //CONSOLE COMMANDS  
  //truffle migrate --network rinkeby 
  //use 'truffle networks" to see where are contracts are deployed and their transaction hash
  rinkeby: {
    provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${projectId}`),
    network_id: 4,       // Rinkeby's id
    gas: 8500000,
    gasPrice: 1000000000,  // 1 gwei (in wei) (default: 100 gwei)
    confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
  }


  },
  contracts_directory: './src/contracts',
  contracts_build_directory: './src/abis/',

  
  mocha: {

  },

  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
      
    }
  },


  db: {
    enabled: false
  }
};
