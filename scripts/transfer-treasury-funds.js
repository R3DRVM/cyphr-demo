import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import fs from 'fs';

const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';
const OLD_TREASURY_ADDRESS = 'uLZvX3v4MEms7oi1UoybntiazNRxXRg38FeYnJTrNUC';

async function transferTreasuryFunds() {
  console.log('💰 Transferring Treasury Funds...\n');
  
  // Check if treasury wallet exists
  if (!fs.existsSync('treasury-wallet.json')) {
    console.log('❌ Treasury wallet not found. Run create-treasury-wallet.js first.');
    return;
  }
  
  const treasuryData = JSON.parse(fs.readFileSync('treasury-wallet.json', 'utf8'));
  const newTreasuryAddress = treasuryData.address;
  
  console.log('📋 Treasury Details:');
  console.log(`   Old Treasury: ${OLD_TREASURY_ADDRESS}`);
  console.log(`   New Treasury: ${newTreasuryAddress}`);
  
  // Connect to devnet
  const connection = new Connection(DEVNET_ENDPOINT, 'confirmed');
  
  // Check old treasury balance
  console.log('\n💰 Checking Balances...');
  const oldTreasuryPubkey = new PublicKey(OLD_TREASURY_ADDRESS);
  const oldBalance = await connection.getBalance(oldTreasuryPubkey);
  const oldBalanceSOL = oldBalance / LAMPORTS_PER_SOL;
  
  console.log(`   Old Treasury: ${oldBalanceSOL.toFixed(4)} SOL`);
  
  if (oldBalanceSOL === 0) {
    console.log('❌ No funds to transfer from old treasury.');
    return;
  }
  
  // Check new treasury balance
  const newTreasuryPubkey = new PublicKey(newTreasuryAddress);
  const newBalance = await connection.getBalance(newTreasuryPubkey);
  const newBalanceSOL = newBalance / LAMPORTS_PER_SOL;
  
  console.log(`   New Treasury: ${newBalanceSOL.toFixed(4)} SOL`);
  
  console.log('\n⚠️  IMPORTANT: This script requires you to manually transfer the funds.');
  console.log('   Since we don\'t have the private key for the old treasury,');
  console.log('   you need to send the SOL from your wallet to the new treasury.');
  
  console.log('\n📝 Manual Transfer Instructions:');
  console.log(`1. Send ${oldBalanceSOL.toFixed(4)} SOL from your wallet to: ${newTreasuryAddress}`);
  console.log('2. Use any Solana wallet (Phantom, etc.)');
  console.log('3. Make sure you\'re on devnet');
  console.log('4. After transfer, run this script again to verify');
  
  // Check if transfer is complete
  console.log('\n🔄 Checking if transfer is complete...');
  const updatedNewBalance = await connection.getBalance(newTreasuryPubkey);
  const updatedNewBalanceSOL = updatedNewBalance / LAMPORTS_PER_SOL;
  
  if (updatedNewBalanceSOL > newBalanceSOL) {
    console.log(`✅ Transfer detected! New Treasury Balance: ${updatedNewBalanceSOL.toFixed(4)} SOL`);
    console.log('\n🎯 Ready to test automated withdrawals!');
  } else {
    console.log('⏳ Waiting for transfer to complete...');
    console.log('   Run this script again after you complete the transfer.');
  }
}

transferTreasuryFunds().catch(console.error);
