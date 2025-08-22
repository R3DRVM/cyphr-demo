#!/usr/bin/env node

/**
 * Treasury Test Script
 * This script demonstrates how the treasury system works
 */

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';

// Configuration
const DEVNET_RPC = 'https://api.devnet.solana.com';
const connection = new Connection(DEVNET_RPC, 'confirmed');

/**
 * Simple test of the treasury system
 */
async function testTreasurySystem() {
  console.log('🧪 Testing Treasury System');
  console.log('==========================\n');
  
  try {
    // Create test accounts
    const userKeypair = Keypair.generate();
    const treasuryKeypair = Keypair.generate();
    
    console.log('👤 Test User Account:', userKeypair.publicKey.toString());
    console.log('🏦 Test Treasury Account:', treasuryKeypair.publicKey.toString());
    console.log('');
    
    // Fund the treasury with some SOL (simulating your funding)
    const treasuryFunding = 10; // 10 SOL
    const treasuryLamports = treasuryFunding * LAMPORTS_PER_SOL;
    
    console.log(`💰 Funding treasury with ${treasuryFunding} SOL...`);
    
    // In a real scenario, you would fund this from your main wallet
    // For this test, we'll simulate the treasury having funds
    console.log('📝 Note: In a real demo, you would fund the treasury from your main wallet');
    console.log('   This test shows the transaction structure that would be used');
    console.log('');
    
    // Simulate a user deposit
    const userDeposit = 1; // 1 SOL
    const userDepositLamports = userDeposit * LAMPORTS_PER_SOL;
    
    console.log(`📥 User deposits ${userDeposit} SOL to treasury...`);
    console.log('Transaction would include:');
    console.log('1. SOL transfer from user to treasury');
    console.log('2. Memo recording the deposit action');
    console.log('');
    
    // Simulate yield calculation
    const targetAPY = 25; // 25% APY
    const timeElapsed = 1; // 1 year for demo
    const yieldEarned = userDeposit * (targetAPY / 100) * timeElapsed;
    const totalReturn = userDeposit + yieldEarned;
    
    console.log(`🎯 Yield calculation:`);
    console.log(`   Deposit: ${userDeposit} SOL`);
    console.log(`   APY: ${targetAPY}%`);
    console.log(`   Time: ${timeElapsed} year`);
    console.log(`   Yield earned: ${yieldEarned} SOL`);
    console.log(`   Total return: ${totalReturn} SOL`);
    console.log('');
    
    // Simulate withdrawal
    console.log(`📤 User withdraws ${totalReturn} SOL from treasury...`);
    console.log('Transaction would include:');
    console.log('1. SOL transfer from treasury to user');
    console.log('2. Memo recording the withdrawal with yield');
    console.log('');
    
    console.log('✅ Treasury system test completed!');
    console.log('');
    console.log('📋 To make this work in your demo:');
    console.log('1. Create a treasury account: node setup-treasury.js create');
    console.log('2. Fund the treasury: node setup-treasury.js fund <ADDRESS> <AMOUNT> <FUNDER_PRIVATE_KEY>');
    console.log('3. Update the treasury address in your demo code');
    console.log('4. Test the full flow: deposit → yield calculation → withdrawal');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTreasurySystem().catch(console.error);
