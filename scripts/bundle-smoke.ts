#!/usr/bin/env ts-node

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { TxBundler } from '../src/services/txBundler';

const RPC_URL = process.env.RPC || 'https://api.devnet.solana.com';

async function main() {
  console.log('🚀 Starting Bundle Smoke Test...\n');

  try {
    // Setup connection
    const connection = new Connection(RPC_URL, 'confirmed');
    console.log(`📡 Connected to: ${RPC_URL}`);

    // Create a test keypair
    const testKeypair = Keypair.generate();
    console.log(`🔑 Test wallet: ${testKeypair.publicKey.toString()}`);

    // Request airdrop
    console.log('\n1️⃣ Requesting airdrop...');
    const airdropSig = await connection.requestAirdrop(
      testKeypair.publicKey,
      0.1 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSig);
    console.log(`✅ Airdrop successful: ${airdropSig}`);

    // Check balance
    const balance = await connection.getBalance(testKeypair.publicKey);
    console.log(`💰 Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

    // Create transaction bundler
    console.log('\n2️⃣ Testing transaction bundler...');
    const bundler = new TxBundler(connection, testKeypair.publicKey, {
      v0: true,
      computeUnitLimit: 200_000,
      computeUnitPriceMicrolamports: 5_000
    });

    // Add some memo instructions
    bundler.addMemo('test-start', 'Bundle smoke test');
    bundler.addMemo('step-1', 'First instruction');
    bundler.addMemo('step-2', 'Second instruction');
    bundler.addMemo('test-end', 'Bundle smoke test complete');

    // Build transaction
    console.log('📦 Building bundled transaction...');
    const tx = await bundler.build();
    console.log(`✅ Transaction built with ${bundler.getInstructionCount()} instructions`);

    // Get transaction summary
    const summary = bundler.getSummary();
    console.log('\n📋 Transaction summary:');
    summary.forEach(line => console.log(`   ${line}`));

    // Sign and send transaction
    console.log('\n3️⃣ Signing and sending transaction...');
    
    // Create a mock wallet signer for testing
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

    const signature = await bundler.send(mockWallet);
    console.log(`✅ Transaction sent successfully!`);
    console.log(`🔗 Signature: ${signature}`);
    console.log(`🔍 Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

    // Verify transaction
    console.log('\n4️⃣ Verifying transaction...');
    const txInfo = await connection.getTransaction(signature, { commitment: 'confirmed' });
    if (txInfo) {
      console.log(`✅ Transaction confirmed in block ${txInfo.slot}`);
      console.log(`💰 Fee: ${txInfo.meta?.fee || 0} lamports`);
    } else {
      console.log('❌ Transaction not found');
    }

    console.log('\n🎉 Bundle smoke test completed successfully!');
    console.log('💡 The transaction bundler is working correctly.');

  } catch (error) {
    console.error('\n❌ Bundle smoke test failed:', error);
    process.exit(1);
  }
}

// Run the test
main().catch(console.error);
