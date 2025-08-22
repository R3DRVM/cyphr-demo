#!/usr/bin/env node

/**
 * Working Treasury Setup Script
 * This creates a REAL treasury account that can actually send and receive SOL
 */

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';
import fs from 'fs';

// Configuration
const DEVNET_RPC = 'https://api.devnet.solana.com';
const connection = new Connection(DEVNET_RPC, 'confirmed');

/**
 * Create a working treasury account
 */
async function createWorkingTreasury() {
  console.log('🏦 Creating Working Treasury Account');
  console.log('====================================\n');
  
  try {
    // Generate a new keypair for the treasury
    const treasuryKeypair = Keypair.generate();
    
    console.log('✅ Treasury Account Created!');
    console.log('Public Key:', treasuryKeypair.publicKey.toString());
    console.log('Private Key (Base64):', Buffer.from(treasuryKeypair.secretKey).toString('base64'));
    console.log('');
    
    // Save treasury info to a file
    const treasuryInfo = {
      publicKey: treasuryKeypair.publicKey.toString(),
      privateKey: Buffer.from(treasuryKeypair.secretKey).toString('base64'),
      createdAt: new Date().toISOString()
    };
    
    fs.writeFileSync('treasury-info.json', JSON.stringify(treasuryInfo, null, 2));
    console.log('💾 Treasury info saved to treasury-info.json');
    console.log('');
    
    console.log('📋 Next Steps:');
    console.log('1. Fund this treasury with SOL (at least 10 SOL for demo)');
    console.log('2. Copy the public key above');
    console.log('3. Update the treasury address in your demo code');
    console.log('');
    console.log('💰 To fund the treasury, you can:');
    console.log('   - Send SOL from your main wallet to:', treasuryKeypair.publicKey.toString());
    console.log('   - Or use a faucet to get devnet SOL');
    console.log('');
    console.log('🔗 View on Solana Explorer:');
    console.log(`https://explorer.solana.com/address/${treasuryKeypair.publicKey.toString()}?cluster=devnet`);
    
    return treasuryKeypair;
    
  } catch (error) {
    console.error('❌ Error creating treasury:', error);
    return null;
  }
}

/**
 * Fund the treasury from a funder account
 */
async function fundTreasury(treasuryAddress, amount, funderPrivateKey) {
  try {
    console.log(`💰 Funding treasury with ${amount} SOL...`);
    
    // Recreate the funder keypair from private key
    const funderKeypair = Keypair.fromSecretKey(
      Buffer.from(funderPrivateKey, 'base64')
    );
    
    const lamports = amount * LAMPORTS_PER_SOL;
    
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
 */
async function checkBalance(treasuryAddress) {
  try {
    const balance = await connection.getBalance(new PublicKey(treasuryAddress));
    console.log('🏦 Treasury Balance:', (balance / LAMPORTS_PER_SOL).toFixed(4), 'SOL');
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('❌ Error checking balance:', error);
    return 0;
  }
}

/**
 * Update the demo code with the treasury address
 */
function updateDemoCode(treasuryAddress) {
  try {
    console.log('🔧 Updating demo code with treasury address...');
    
    // Read the current CyphrBot.tsx file
    let code = fs.readFileSync('src/pages/CyphrBot.tsx', 'utf8');
    
    // Replace the placeholder treasury address
    const oldAddress = '11111111111111111111111111111111';
    const newAddress = treasuryAddress;
    
    if (code.includes(oldAddress)) {
      code = code.replace(oldAddress, newAddress);
      fs.writeFileSync('src/pages/CyphrBot.tsx', code);
      console.log('✅ Demo code updated with treasury address:', newAddress);
    } else {
      console.log('⚠️  Treasury address not found in code, manual update needed');
    }
    
  } catch (error) {
    console.error('❌ Error updating demo code:', error);
  }
}

/**
 * Main function
 */
async function main() {
  const command = process.argv[2];
  
  if (command === 'create') {
    await createWorkingTreasury();
    
  } else if (command === 'fund') {
    const treasuryAddress = process.argv[3];
    const amount = parseFloat(process.argv[4]);
    const funderPrivateKey = process.argv[5];
    
    if (!treasuryAddress || !amount || !funderPrivateKey) {
      console.log('❌ Usage: node create-working-treasury.js fund <TREASURY_ADDRESS> <AMOUNT> <FUNDER_PRIVATE_KEY>');
      return;
    }
    
    await fundTreasury(treasuryAddress, amount, funderPrivateKey);
    
  } else if (command === 'balance') {
    const treasuryAddress = process.argv[3];
    
    if (!treasuryAddress) {
      console.log('❌ Usage: node create-working-treasury.js balance <TREASURY_ADDRESS>');
      return;
    }
    
    await checkBalance(treasuryAddress);
    
  } else if (command === 'update-code') {
    const treasuryAddress = process.argv[3];
    
    if (!treasuryAddress) {
      console.log('❌ Usage: node create-working-treasury.js update-code <TREASURY_ADDRESS>');
      return;
    }
    
    updateDemoCode(treasuryAddress);
    
  } else {
    console.log('🏦 Working Treasury Setup Script');
    console.log('================================\n');
    console.log('Commands:');
    console.log('  create      - Create a new working treasury account');
    console.log('  fund        - Fund treasury with SOL');
    console.log('  balance     - Check treasury balance');
    console.log('  update-code - Update demo code with treasury address');
    console.log('');
    console.log('Examples:');
    console.log('  node create-working-treasury.js create');
    console.log('  node create-working-treasury.js fund <ADDRESS> <AMOUNT> <FUNDER_PRIVATE_KEY>');
    console.log('  node create-working-treasury.js balance <ADDRESS>');
    console.log('  node create-working-treasury.js update-code <ADDRESS>');
    console.log('');
    console.log('📋 Complete Setup Flow:');
    console.log('1. node create-working-treasury.js create');
    console.log('2. Fund the treasury (send SOL to the address)');
    console.log('3. node create-working-treasury.js update-code <TREASURY_ADDRESS>');
    console.log('4. Test the demo!');
  }
}

// Run the script
main().catch(console.error);
