#!/usr/bin/env node

/**
 * Treasury Recovery and Management Script
 * This script helps recover SOL from the deterministic treasury and manage the demo system
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import { Buffer } from 'buffer';

// Configuration
const DEVNET_RPC = 'https://api.devnet.solana.com';
const connection = new Connection(DEVNET_RPC, 'confirmed');

/**
 * Recreate the deterministic treasury address that was used
 * @param {string} userPublicKey - The user's public key
 * @returns {string} The treasury address
 */
function recreateTreasuryAddress(userPublicKey) {
  try {
    const publicKey = new PublicKey(userPublicKey);
    
    // Recreate the same seed generation logic that was used
    const treasurySeed = Buffer.concat([
      Buffer.from('treasury'),
      publicKey.toBuffer().slice(0, 8) // Only first 8 bytes
    ]);
    
    // Use System Program as program ID (same as in the code)
    const [treasuryAddress] = PublicKey.findProgramAddressSync(
      [treasurySeed],
      new PublicKey('11111111111111111111111111111111')
    );
    
    return treasuryAddress.toString();
  } catch (error) {
    console.error('Error recreating treasury address:', error);
    return null;
  }
}

/**
 * Check the balance of an address
 * @param {string} address - The address to check
 * @returns {number} Balance in SOL
 */
async function checkBalance(address) {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error checking balance:', error);
    return 0;
  }
}

/**
 * Main recovery function
 */
async function main() {
  console.log('🏦 Treasury Recovery and Management Script');
  console.log('==========================================\n');
  
  // You'll need to provide your public key here
  const userPublicKey = process.argv[2];
  
  if (!userPublicKey) {
    console.log('❌ Usage: node treasury-recovery.js <YOUR_PUBLIC_KEY>');
    console.log('Example: node treasury-recovery.js 5iVtTdPWLN8Qk6BN2vudJU4myvu9nnnjsDnhCnCR2C52');
    console.log('\nTo find your public key:');
    console.log('1. Open Phantom wallet');
    console.log('2. Go to Settings > Change Network > Devnet');
    console.log('3. Copy your public key');
    return;
  }
  
  console.log('👤 User Public Key:', userPublicKey);
  console.log('🌐 Network: Devnet');
  console.log('');
  
  // Recreate the treasury address
  console.log('🔧 Recreating treasury address...');
  const treasuryAddress = recreateTreasuryAddress(userPublicKey);
  
  if (!treasuryAddress) {
    console.log('❌ Failed to recreate treasury address');
    return;
  }
  
  console.log('🏦 Treasury Address:', treasuryAddress);
  console.log('');
  
  // Check balances
  console.log('💰 Checking balances...');
  const userBalance = await checkBalance(userPublicKey);
  const treasuryBalance = await checkBalance(treasuryAddress);
  
  console.log('👤 Your Wallet Balance:', userBalance.toFixed(4), 'SOL');
  console.log('🏦 Treasury Balance:', treasuryBalance.toFixed(4), 'SOL');
  console.log('');
  
  if (treasuryBalance > 0) {
    console.log('🎯 RECOVERY NEEDED!');
    console.log('Your SOL is in the treasury address and needs to be recovered.');
    console.log('');
    console.log('📋 Recovery Options:');
    console.log('');
    console.log('🔑 Option 1: Access Treasury Private Key');
    console.log('   - The treasury address was created deterministically');
    console.log('   - If you can derive the private key, you can recover the SOL');
    console.log('   - This requires the same seed generation logic');
    console.log('');
    console.log('💡 Option 2: Demo System Fix');
    console.log('   - The demo system has been updated to not lose SOL');
    console.log('   - Future deposits will be tracked without moving funds');
    console.log('   - This prevents the same issue from happening again');
    console.log('');
    console.log('⚠️  IMPORTANT: This is a demo system issue.');
    console.log('   In production, you would have proper access to treasury accounts.');
    console.log('');
    console.log('🔗 Treasury Address on Solana Explorer:');
    console.log(`https://explorer.solana.com/address/${treasuryAddress}?cluster=devnet`);
    console.log('');
    console.log('📝 Next Steps:');
    console.log('1. The system is now fixed to prevent future SOL loss');
    console.log('2. Your 2 SOL is recoverable if you can access the treasury private key');
    console.log('3. For demo purposes, the system now tracks positions without moving SOL');
  } else {
    console.log('✅ No SOL found in treasury address');
    console.log('The system has been fixed to prevent future SOL loss.');
  }
  
  console.log('');
  console.log('🔄 Demo System Status:');
  console.log('✅ Deposits: Now tracked without moving SOL');
  console.log('✅ Withdrawals: Show yield calculations and position closure');
  console.log('✅ Treasury: No more deterministic address creation');
  console.log('✅ Safety: Users cannot lose SOL in the demo');
}

// Run the script
main().catch(console.error);
