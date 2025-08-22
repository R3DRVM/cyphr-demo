#!/usr/bin/env ts-node

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getTreasuryInfo } from '../src/services/demoTreasury';
import { configService } from '../src/services/config';

const RPC_URL = process.env.RPC || 'https://api.devnet.solana.com';

async function main() {
  console.log('🔍 Treasury Fund Check...\n');

  try {
    // Setup connection
    const connection = new Connection(RPC_URL, 'confirmed');
    console.log(`📡 Connected to: ${RPC_URL}`);

    // Check treasury configuration
    const treasurySecret = configService.getTreasurySecret();
    if (!treasurySecret) {
      console.log('❌ Treasury not configured');
      console.log('💡 Set VITE_TREASURY_SECRET in your environment');
      return;
    }

    console.log('✅ Treasury secret configured');

    // Get treasury info
    const info = await getTreasuryInfo();
    
    if (!info.configured) {
      console.log('❌ Treasury not properly configured');
      return;
    }

    console.log('\n📊 Treasury Information:');
    console.log(`🔑 Public Key: ${info.publicKey}`);
    console.log(`💰 Balance: ${info.balance?.toFixed(4)} SOL`);
    console.log(`📅 Daily Spent: ${info.dailySpent.toFixed(4)} SOL`);
    console.log(`📅 Daily Budget: ${info.dailyBudget.toFixed(4)} SOL`);
    console.log(`👤 Per-User Cap: ${info.userCap.toFixed(4)} SOL`);
    console.log(`📈 Available Today: ${(info.dailyBudget - info.dailySpent).toFixed(4)} SOL`);

    // Check if treasury needs funding
    if (info.balance && info.balance < 1) {
      console.log('\n⚠️ Treasury balance low (< 1 SOL)');
      
      try {
        // Create treasury keypair
        const treasuryKeypair = Keypair.fromSecretKey(
          Uint8Array.from(JSON.parse(treasurySecret))
        );

        // Request airdrop
        console.log('\n🚀 Requesting treasury airdrop...');
        const airdropSig = await connection.requestAirdrop(
          treasuryKeypair.publicKey,
          2 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(airdropSig);
        
        console.log(`✅ Treasury airdrop successful: ${airdropSig}`);
        
        // Check new balance
        const newBalance = await connection.getBalance(treasuryKeypair.publicKey);
        console.log(`💰 New treasury balance: ${(newBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        
      } catch (error) {
        console.error('❌ Treasury airdrop failed:', error);
      }
    } else {
      console.log('\n✅ Treasury has sufficient funds');
    }

    console.log('\n🎉 Treasury fund check completed!');

  } catch (error) {
    console.error('\n❌ Treasury fund check failed:', error);
    process.exit(1);
  }
}

// Run the check
main().catch(console.error);

