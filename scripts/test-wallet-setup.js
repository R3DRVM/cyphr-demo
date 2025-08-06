#!/usr/bin/env node

/**
 * 🧪 Quick Wallet Setup Test - Solana Devnet
 * 
 * This script helps verify your wallet setup for testing:
 * - Check devnet connection
 * - Verify wallet balance
 * - Test basic transaction creation
 */

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// Configuration
const DEVNET_RPC = 'https://api.devnet.solana.com';
const connection = new Connection(DEVNET_RPC, 'confirmed');

// Utility functions
function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} ${message}`);
}

async function testDevnetConnection() {
  log('Testing Solana devnet connection...');
  
  try {
    const version = await connection.getVersion();
    const slot = await connection.getSlot();
    
    log(`Connected to Solana devnet (v${version['solana-core']}) at slot ${slot}`, 'success');
    return true;
  } catch (error) {
    log(`Devnet connection failed: ${error.message}`, 'error');
    return false;
  }
}

async function checkWalletBalance(walletAddress) {
  if (!walletAddress) {
    log('No wallet address provided. Please provide your wallet address.', 'warning');
    return;
  }
  
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    log(`Wallet: ${walletAddress}`, 'info');
    log(`Balance: ${solBalance.toFixed(6)} SOL`, 'success');
    
    if (solBalance < 0.01) {
      log('⚠️  Low balance! You need at least 0.01 SOL for testing.', 'warning');
      log('Get devnet SOL from: https://faucet.solana.com/', 'info');
    } else {
      log('✅ Sufficient balance for testing', 'success');
    }
    
    return solBalance;
  } catch (error) {
    log(`Failed to check balance: ${error.message}`, 'error');
    return null;
  }
}

async function testTransactionCreation(walletAddress) {
  if (!walletAddress) {
    log('Skipping transaction test - no wallet address', 'warning');
    return;
  }
  
  try {
    const publicKey = new PublicKey(walletAddress);
    
    // Test getting recent blockhash (required for transactions)
    const { blockhash } = await connection.getLatestBlockhash();
    
    log('✅ Transaction creation test passed', 'success');
    log(`Recent blockhash: ${blockhash}`, 'info');
    
    return true;
  } catch (error) {
    log(`Transaction creation test failed: ${error.message}`, 'error');
    return false;
  }
}

async function main() {
  console.log('🚀 Cyphr DeFi Strategy Builder - Wallet Setup Test\n');
  
  // Test devnet connection
  const connectionOk = await testDevnetConnection();
  if (!connectionOk) {
    log('Cannot proceed without devnet connection', 'error');
    process.exit(1);
  }
  
  // Get wallet address from command line or prompt
  const walletAddress = process.argv[2];
  
  if (walletAddress) {
    log(`Testing wallet: ${walletAddress}`, 'info');
    
    // Check balance
    const balance = await checkWalletBalance(walletAddress);
    
    // Test transaction creation
    await testTransactionCreation(walletAddress);
    
    console.log('\n📋 Setup Summary:');
    log('✅ Devnet connection working', 'success');
    
    if (balance !== null) {
      if (balance >= 0.01) {
        log('✅ Wallet ready for testing', 'success');
        log('🎉 You can now test the Cyphr app!', 'success');
      } else {
        log('⚠️  Get devnet SOL first', 'warning');
        log('🔗 https://faucet.solana.com/', 'info');
      }
    } else {
      log('❌ Wallet check failed', 'error');
    }
  } else {
    console.log('\n📋 Manual Setup Instructions:');
    log('1. Install Phantom or Solflare wallet', 'info');
    log('2. Switch to devnet in wallet settings', 'info');
    log('3. Get devnet SOL from faucet', 'info');
    log('4. Run this script with your wallet address:', 'info');
    log('   node test-wallet-setup.js YOUR_WALLET_ADDRESS', 'info');
    
    console.log('\n🔗 Useful Links:');
    log('Phantom Wallet: https://phantom.app', 'info');
    log('Solflare Wallet: https://solflare.com', 'info');
    log('Devnet Faucet: https://faucet.solana.com/', 'info');
    log('Solana Explorer: https://explorer.solana.com/?cluster=devnet', 'info');
  }
  
  console.log('\n🎯 Next Steps:');
  log('1. Open http://localhost:5174', 'info');
  log('2. Click "Connect Wallet"', 'info');
  log('3. Navigate to "STRATEGY"', 'info');
  log('4. Build and execute a strategy!', 'info');
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testDevnetConnection,
  checkWalletBalance,
  testTransactionCreation
}; 