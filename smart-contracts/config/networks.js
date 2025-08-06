const { clusterApiUrl } = require('@solana/web3.js');

const networks = {
  localnet: {
    name: 'Localnet',
    url: 'http://127.0.0.1:8899',
    wsUrl: 'ws://127.0.0.1:8900',
    commitment: 'confirmed',
    explorer: 'http://localhost:8899',
  },
  devnet: {
    name: 'Devnet',
    url: clusterApiUrl('devnet'),
    wsUrl: clusterApiUrl('devnet', 'ws'),
    commitment: 'confirmed',
    explorer: 'https://explorer.solana.com/?cluster=devnet',
    faucet: 'https://faucet.solana.com/',
  },
  testnet: {
    name: 'Testnet',
    url: clusterApiUrl('testnet'),
    wsUrl: clusterApiUrl('testnet', 'ws'),
    commitment: 'confirmed',
    explorer: 'https://explorer.solana.com/?cluster=testnet',
  },
  mainnet: {
    name: 'Mainnet',
    url: clusterApiUrl('mainnet-beta'),
    wsUrl: clusterApiUrl('mainnet-beta', 'ws'),
    commitment: 'confirmed',
    explorer: 'https://explorer.solana.com/',
  },
};

module.exports = networks; 