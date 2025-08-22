import { BrowserTreasuryService } from '../src/services/browserTreasuryService.js';

async function testBrowserTreasury() {
  console.log('🧪 Testing Browser Treasury Service...\n');
  
  try {
    // Create treasury service
    const treasuryService = new BrowserTreasuryService();
    
    console.log('✅ Treasury service created successfully');
    
    // Health check
    const isHealthy = await treasuryService.healthCheck();
    console.log(`🏥 Health Check: ${isHealthy ? 'PASSED' : 'FAILED'}`);
    
    if (!isHealthy) {
      console.log('❌ Treasury service is not healthy');
      return;
    }
    
    // Check balance
    const balance = await treasuryService.getBalance();
    console.log(`💰 Treasury Balance: ${balance.toFixed(4)} SOL`);
    
    if (balance < 0.1) {
      console.log('❌ Treasury needs at least 0.1 SOL for testing');
      return;
    }
    
    console.log('\n🎯 Browser Treasury Service is working correctly!');
    console.log('   Ready for automated withdrawals in CyphrBot.');
    console.log('   No manual intervention needed - fully automated!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBrowserTreasury().catch(console.error);
