/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
require('babel-register')({
    ignore: /node_modules\/(?!openzeppelin-solidity)/
});
require('babel-polyfill');
module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8242,
            network_id: "*", // Match any network id
            gasPrice: 0x01      // <-- Use this low gas price
        },
        integration: {
            host: "integration.my-dapp.com",
            port: 80,
            network_id: "*"
        }
    },
    compilers: {
        solc: {
            version: "0.5.3"
        }
    }
};
