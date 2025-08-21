import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import fs from 'fs';

const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';
const OLD_TREASURY_ADDRESS = 'uLZvX3v4MEms7oi1UoybntiazNRxXRg38FeYnJTrNUC';

async function createTreasuryWallet() {
  console.log('🏦 Creating New Treasury Wallet...\n');
  
  // Create new keypair for treasury
  const treasuryKeypair = Keypair.generate();
  const treasuryAddress = treasuryKeypair.publicKey.toString();
  
  console.log('✅ New Treasury Wallet Created:');
  console.log(`   Address: ${treasuryAddress}`);
  console.log(`   Private Key: [${treasuryKeypair.secretKey.join(',')}]`);
  
  // Save to file
  const treasuryData = {
    address: treasuryAddress,
    privateKey: Array.from(treasuryKeypair.secretKey),
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync('treasury-wallet.json', JSON.stringify(treasuryData, null, 2));
  console.log('\n💾 Treasury wallet saved to treasury-wallet.json');
  
  // Connect to devnet
  const connection = new Connection(DEVNET_ENDPOINT, 'confirmed');
  
  // Check old treasury balance
  console.log('\n💰 Checking Old Treasury Balance...');
  const oldTreasuryPubkey = new PublicKey(OLD_TREASURY_ADDRESS);
  const oldBalance = await connection.getBalance(oldTreasuryPubkey);
  const oldBalanceSOL = oldBalance / LAMPORTS_PER_SOL;
  
  if (oldBalanceSOL > 0) {
    console.log(`   Old Treasury Balance: ${oldBalanceSOL.toFixed(4)} SOL`);
    console.log('\n⚠️  IMPORTANT: You need to transfer the SOL from the old treasury to the new one!');
    console.log(`   From: ${OLD_TREASURY_ADDRESS}`);
    console.log(`   To: ${treasuryAddress}`);
    console.log('\n   You can do this manually or I can create a script to do it automatically.');
  } else {
    console.log('   Old Treasury Balance: 0 SOL');
  }
  
  // Request airdrop to new treasury
  console.log('\n🚀 Requesting airdrop to new treasury...');
  try {
    const airdropSignature = await connection.requestAirdrop(treasuryKeypair.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature, 'confirmed');
    
    const newBalance = await connection.getBalance(treasuryKeypair.publicKey);
    const newBalanceSOL = newBalance / LAMPORTS_PER_SOL;
    console.log(`✅ Airdrop successful! New Treasury Balance: ${newBalanceSOL.toFixed(4)} SOL`);
  } catch (error) {
    console.log('❌ Airdrop failed:', error.message);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Fund the new treasury with SOL (either airdrop or transfer from old)');
  console.log('2. Update the treasury address in CyphrBot.tsx');
  console.log('3. Test the automated withdrawal system');
  
  return treasuryData;
}

createTreasuryWallet().catch(console.error);
