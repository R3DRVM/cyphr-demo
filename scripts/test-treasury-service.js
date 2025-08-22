import { createTreasuryService } from '../src/services/treasuryService';
import { Keypair } from '@solana/web3.js';

async function testTreasuryService() {
  console.log('🧪 Testing Treasury Service...\n');
  
  try {
    // Create treasury service
    const treasuryService = await createTreasuryService();
    
    if (!treasuryService) {
      console.log('❌ Failed to create treasury service');
      return;
    }
    
    console.log('✅ Treasury service created successfully');
    
    // Check balance
    const balance = await treasuryService.getBalance();
    console.log(`💰 Treasury Balance: ${balance.toFixed(4)} SOL`);
    
    if (balance < 0.1) {
      console.log('❌ Treasury needs at least 0.1 SOL for testing');
      return;
    }
    
    // Create a test recipient (random keypair)
    const testRecipient = Keypair.generate();
    console.log(`🎯 Test Recipient: ${testRecipient.publicKey.toString()}`);
    
    // Test sending a small amount
    const testAmount = 0.01; // 0.01 SOL
    console.log(`\n🚀 Testing send of ${testAmount} SOL...`);
    
    const signature = await treasuryService.sendToUser(
      testRecipient.publicKey, 
      testAmount, 
      'Test transaction from treasury service'
    );
    
    console.log(`✅ Test transaction successful!`);
    console.log(`📝 Signature: ${signature}`);
    console.log(`🔗 Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    // Check new balance
    const newBalance = await treasuryService.getBalance();
    console.log(`💰 New Treasury Balance: ${newBalance.toFixed(4)} SOL`);
    
    console.log('\n🎯 Treasury service is working correctly!');
    console.log('   Ready for automated withdrawals in CyphrBot.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTreasuryService().catch(console.error);
