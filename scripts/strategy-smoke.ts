import { create, execute } from '../src/services/strategyBuilderService';

async function strategySmokeTest() {
  console.log('🚀 Starting Strategy Smoke Test...\n');
  
  try {
    // Sample strategy config
    const sampleConfig = {
      token: "SOL",
      logicType: "time-based" as const,
      durationDays: 21,
      profitTargetPct: 15,
      actionType: "entry" as const,
      action: "stake" as const,
      autoExecute: true
    };
    
    console.log('📋 Sample Strategy Config:');
    console.log(JSON.stringify(sampleConfig, null, 2));
    console.log('');
    
    // Test strategy creation
    console.log('1️⃣ Creating strategy...');
    const createResult = await create(sampleConfig);
    console.log(`✅ Strategy created:`);
    console.log(`   Strategy ID: ${createResult.strategyId}`);
    console.log(`   Signature: ${createResult.signature}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${createResult.signature}?cluster=devnet`);
    console.log('');
    
    // Test strategy execution
    console.log('2️⃣ Executing strategy...');
    const executeResult = await execute(createResult.strategyId);
    console.log(`✅ Strategy executed:`);
    console.log(`   Signature: ${executeResult.signature}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${executeResult.signature}?cluster=devnet`);
    console.log('');
    
    console.log('🎉 Strategy smoke test completed successfully!');
    
  } catch (error) {
    console.error('❌ Strategy smoke test failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  strategySmokeTest().catch(console.error);
}
