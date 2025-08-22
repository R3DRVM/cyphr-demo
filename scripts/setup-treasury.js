#!/usr/bin/env node

/**
 * Treasury Setup Script
 * This script helps set up a proper treasury account for the demo system
 */

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';

// Configuration
const DEVNET_RPC = 'https://api.devnet.solana.com';
const connection = new Connection(DEVNET_RPC, 'confirmed');

/**
 * Create a new treasury account
 * @returns {Object} Treasury keypair and address
 */
function createTreasuryAccount() {
  // Generate a new keypair for the treasury
  const treasuryKeypair = Keypair.generate();
  
  console.log('🏦 New Treasury Account Created:');
  console.log('Private Key:', Buffer.from(treasuryKeypair.secretKey).toString('base64'));
  console.log('Public Key:', treasuryKeypair.publicKey.toString());
  console.log('');
  
  return {
    keypair: treasuryKeypair,
    address: treasuryKeypair.publicKey.toString()
  };
}

/**
 * Fund the treasury account
 * @param {string} treasuryAddress - Treasury address to fund
 * @param {number} amount - Amount of SOL to fund
 * @param {string} funderPrivateKey - Private key of the funder (base64)
 */
async function fundTreasury(treasuryAddress, amount, funderPrivateKey) {
  try {
    // Recreate the funder keypair from private key
    const funderKeypair = Keypair.fromSecretKey(
      Buffer.from(funderPrivateKey, 'base64')
    );
    
    const lamports = amount * LAMPORTS_PER_SOL;
    
    console.log(`💰 Funding treasury with ${amount} SOL...`);
    console.log('From:', funderKeypair.publicKey.toString());
    console.log('To:', treasuryAddress);
    console.log('Amount:', lamports, 'lamports');
    
    // Create transfer transaction
    const transaction = new Transaction();
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: funderKeypair.publicKey,
        toPubkey: new PublicKey(treasuryAddress),
        lamports: lamports
      })
    );
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = funderKeypair.publicKey;
    
    // Sign and send transaction
    const signature = await connection.sendTransaction(transaction, [funderKeypair]);
    
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error('Transaction failed');
    }
    
    console.log('✅ Treasury funded successfully!');
    console.log('Transaction Hash:', signature);
    console.log('Explorer Link:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    // Check treasury balance
    const treasuryBalance = await connection.getBalance(new PublicKey(treasuryAddress));
    console.log('Treasury Balance:', (treasuryBalance / LAMPORTS_PER_SOL).toFixed(4), 'SOL');
    
  } catch (error) {
    console.error('❌ Error funding treasury:', error);
  }
}

/**
 * Check treasury balance
 * @param {string} treasuryAddress - Treasury address to check
 */
async function checkTreasuryBalance(treasuryAddress) {
  try {
    const balance = await connection.getBalance(new PublicKey(treasuryAddress));
    console.log('🏦 Treasury Balance:', (balance / LAMPORTS_PER_SOL).toFixed(4), 'SOL');
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('❌ Error checking treasury balance:', error);
    return 0;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🏦 Treasury Setup Script');
  console.log('========================\n');
  
  const command = process.argv[2];
  
  if (command === 'create') {
    // Create new treasury account
    const treasury = createTreasuryAccount();
    
    console.log('📋 Next Steps:');
    console.log('1. Save the private key securely');
    console.log('2. Fund the treasury using: node setup-treasury.js fund <ADDRESS> <AMOUNT> <FUNDER_PRIVATE_KEY>');
    console.log('3. Update the treasury address in your demo code');
    
  } else if (command === 'fund') {
    // Fund treasury account
    const treasuryAddress = process.argv[3];
    const amount = parseFloat(process.argv[4]);
    const funderPrivateKey = process.argv[5];
    
    if (!treasuryAddress || !amount || !funderPrivateKey) {
      console.log('❌ Usage: node setup-treasury.js fund <TREASURY_ADDRESS> <AMOUNT> <FUNDER_PRIVATE_KEY>');
      return;
    }
    
    await fundTreasury(treasuryAddress, amount, funderPrivateKey);
    
  } else if (command === 'balance') {
    // Check treasury balance
    const treasuryAddress = process.argv[3];
    
    if (!treasuryAddress) {
      console.log('❌ Usage: node setup-treasury.js balance <TREASURY_ADDRESS>');
      return;
    }
    
    await checkTreasuryBalance(treasuryAddress);
    
  } else {
    console.log('🏦 Treasury Setup Script');
    console.log('========================\n');
    console.log('Commands:');
    console.log('  create  - Create a new treasury account');
    console.log('  fund    - Fund treasury with SOL');
    console.log('  balance - Check treasury balance');
    console.log('');
    console.log('Examples:');
    console.log('  node setup-treasury.js create');
    console.log('  node setup-treasury.js fund <ADDRESS> <AMOUNT> <FUNDER_PRIVATE_KEY>');
    console.log('  node setup-treasury.js balance <ADDRESS>');
  }
}

// Run the script
main().catch(console.error);
