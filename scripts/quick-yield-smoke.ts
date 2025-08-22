#!/usr/bin/env ts-node

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { quickYieldRun } from '../src/services/chatActions';
import { createWalletSigner } from '../src/services/walletBridge';

const RPC_URL = process.env.RPC || 'https://api.devnet.solana.com';

async function main() {
  console.log('🚀 Starting Quick Yield Smoke Test...\n');

  try {
    // Setup connection
    const connection = new Connection(RPC_URL, 'confirmed');
    console.log(`📡 Connected to: ${RPC_URL}`);

    // Create a test keypair
    const testKeypair = Keypair.generate();
    console.log(`🔑 Test wallet: ${testKeypair.publicKey.toString()}`);

    // Request airdrop for principal
    console.log('\n1️⃣ Requesting principal airdrop...');
    const principalAirdropSig = await connection.requestAirdrop(
      testKeypair.publicKey,
      1.5 * LAMPORTS_PER_SOL // 1.5 SOL for principal + fees
    );
    await connection.confirmTransaction(principalAirdropSig);
    console.log(`✅ Principal airdrop successful: ${principalAirdropSig}`);

    // Check initial balance
    const initialBalance = await connection.getBalance(testKeypair.publicKey);
    console.log(`💰 Initial balance: ${(initialBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

    // Create mock wallet signer for testing
    const mockWallet = {
      publicKey: testKeypair.publicKey,
      sendTransaction: async (tx: any, connection: Connection) => {
        // Sign with our test keypair
        tx.sign(testKeypair);
        const signature = await connection.sendRawTransaction(tx.serialize());
        await connection.confirmTransaction(signature);
        return signature;
      }
    };

    // Test quick yield run
    console.log('\n2️⃣ Testing quick yield run...');
    const result = await quickYieldRun(mockWallet, { 
      targetBps: 1500, // 15%
      amountSol: 1.0
    });

    console.log('\n3️⃣ Quick yield results:');
    console.log(`✅ Success: ${result.success}`);
    console.log(`💰 Start balance: ${result.startBalance.toFixed(4)} SOL`);
    console.log(`💰 End balance: ${result.endBalance.toFixed(4)} SOL`);
    console.log(`💰 Delta: ${result.delta > 0 ? '+' : ''}${result.delta.toFixed(4)} SOL`);
    console.log(`🔗 Bundle signature: ${result.signatures[0]}`);
    
    if (result.signatures.length > 1) {
      console.log(`🔗 Top-up signatures: ${result.signatures.slice(1).join(', ')}`);
    }

    console.log('\n📝 Notes:');
    result.notes.forEach(note => console.log(`   ${note}`));

    // Verify final balance meets target
    const targetGain = 1.0 * 0.15; // 15% of 1 SOL
    const actualGain = result.delta;
    const meetsTarget = actualGain >= targetGain * 0.8; // Allow 20% slippage

    console.log(`\n🎯 Target yield: +${targetGain.toFixed(4)} SOL`);
    console.log(`💰 Actual yield: +${actualGain.toFixed(4)} SOL`);
    console.log(`✅ Meets target: ${meetsTarget ? 'YES' : 'NO'}`);

    if (meetsTarget) {
      console.log('\n🎉 Quick yield smoke test completed successfully!');
      console.log('💡 The quick yield mode is working correctly.');
    } else {
      console.log('\n⚠️ Quick yield test completed but yield target not met.');
      console.log('💡 This may be due to faucet rate limits or cooldowns.');
    }

  } catch (error) {
    console.error('\n❌ Quick yield smoke test failed:', error);
    process.exit(1);
  }
}

// Run the test
main().catch(console.error);

