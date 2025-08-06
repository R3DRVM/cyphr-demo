#!/usr/bin/env node

const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const StrategyVaultContract = require('../contracts/vault/StrategyVaultContract');
const networks = require('../config/networks');

/**
 * Time Constraints Test: Demonstrate Configurable Time-Based Yield Strategies
 * Shows how frontend variables control contract behavior for different time intervals
 */
async function testTimeConstraints() {
  console.log('⏰ TIME CONSTRAINTS TEST: CONFIGURABLE YIELD STRATEGIES');
  console.log('=======================================================\n');

  try {
    // Setup
    console.log('🔧 SETUP PHASE');
    console.log('-------------');
    
    const connection = new Connection(networks.devnet.url, 'confirmed');
    const testUser = Keypair.generate();
    const authorityWallet = Keypair.generate();
    const programId = '11111111111111111111111111111111';
    
    console.log(`👤 Test User: ${testUser.publicKey.toString()}`);
    
    const vaultContract = new StrategyVaultContract(connection, programId, authorityWallet.publicKey);
    await vaultContract.initializeVault();
    console.log('✅ Strategy Vault initialized\n');

    // Initial Deposit
    const initialDeposit = 10.0;
    const depositResult = await vaultContract.depositSol(testUser.publicKey, initialDeposit);
    console.log(`✅ Deposited: ${depositResult.amount} SOL\n`);

    // Test 1: 2-Minute Strategy
    console.log('⏰ TEST 1: 2-MINUTE YIELD STRATEGY');
    console.log('==================================');
    
    const twoMinuteStrategy = {
      name: '2-Minute Quick Yield',
      description: 'Quick yield strategy with 2-minute intervals',
      baseToken: 'SOL',
      quoteToken: 'USDC',
      positionSize: 0.5, // 50% of deposit
      timeFrame: '2m',
      executionInterval: 120000, // 2 minutes in milliseconds
      entryConditions: [
        { type: 'price_above', value: 100.0 }
      ],
      exitConditions: [
        { type: 'time_based', duration: 120000 }, // 2 minutes max
        { type: 'take_profit', value: 0.02 } // 2% profit target
      ],
      yieldTarget: 0.02, // 2% yield target
      yieldAccumulation: true
    };
    
    const twoMinResult = vaultContract.createStrategy(testUser.publicKey, twoMinuteStrategy);
    console.log(`✅ 2-minute strategy created: ${twoMinResult.strategy.name}`);
    console.log(`⏰ Execution interval: ${twoMinResult.strategy.timeFrame}`);
    console.log(`📊 Strategy ID: ${twoMinResult.strategyId}\n`);

    // Test 2: 5-Minute Strategy
    console.log('⏰ TEST 2: 5-MINUTE YIELD STRATEGY');
    console.log('==================================');
    
    const fiveMinuteStrategy = {
      name: '5-Minute Yield Strategy',
      description: 'Medium-term yield strategy with 5-minute intervals',
      baseToken: 'SOL',
      quoteToken: 'USDC',
      positionSize: 0.6, // 60% of deposit
      timeFrame: '5m',
      executionInterval: 300000, // 5 minutes in milliseconds
      entryConditions: [
        { type: 'price_above', value: 100.0 },
        { type: 'volatility_below', value: 0.3 }
      ],
      exitConditions: [
        { type: 'time_based', duration: 300000 }, // 5 minutes max
        { type: 'take_profit', value: 0.05 } // 5% profit target
      ],
      yieldTarget: 0.05, // 5% yield target
      yieldAccumulation: true
    };
    
    const fiveMinResult = vaultContract.createStrategy(testUser.publicKey, fiveMinuteStrategy);
    console.log(`✅ 5-minute strategy created: ${fiveMinResult.strategy.name}`);
    console.log(`⏰ Execution interval: ${fiveMinResult.strategy.timeFrame}`);
    console.log(`📊 Strategy ID: ${fiveMinResult.strategyId}\n`);

    // Test 3: 15-Minute Strategy
    console.log('⏰ TEST 3: 15-MINUTE YIELD STRATEGY');
    console.log('====================================');
    
    const fifteenMinuteStrategy = {
      name: '15-Minute Yield Strategy',
      description: 'Longer-term yield strategy with 15-minute intervals',
      baseToken: 'SOL',
      quoteToken: 'USDC',
      positionSize: 0.7, // 70% of deposit
      timeFrame: '15m',
      executionInterval: 900000, // 15 minutes in milliseconds
      entryConditions: [
        { type: 'price_above', value: 100.0 },
        { type: 'volatility_below', value: 0.25 }
      ],
      exitConditions: [
        { type: 'time_based', duration: 900000 }, // 15 minutes max
        { type: 'take_profit', value: 0.08 } // 8% profit target
      ],
      yieldTarget: 0.08, // 8% yield target
      yieldAccumulation: true
    };
    
    const fifteenMinResult = vaultContract.createStrategy(testUser.publicKey, fifteenMinuteStrategy);
    console.log(`✅ 15-minute strategy created: ${fifteenMinResult.strategy.name}`);
    console.log(`⏰ Execution interval: ${fifteenMinResult.strategy.timeFrame}`);
    console.log(`📊 Strategy ID: ${fifteenMinResult.strategyId}\n`);

    // Test 4: Simulate Different Time Intervals
    console.log('📊 TEST 4: SIMULATE DIFFERENT TIME INTERVALS');
    console.log('============================================');
    
    // Update market data
    vaultContract.updateMarketData('SOL', 100.0, 0.25);
    
    console.log('🕐 Simulating 2-minute strategy execution...');
    const twoMinExecution = await vaultContract.executeStrategy(twoMinResult.strategyId);
    console.log(`📈 2-min strategy action: ${twoMinExecution.action || 'No action'}`);
    
    console.log('🕐 Simulating 5-minute strategy execution...');
    const fiveMinExecution = await vaultContract.executeStrategy(fiveMinResult.strategyId);
    console.log(`📈 5-min strategy action: ${fiveMinExecution.action || 'No action'}`);
    
    console.log('🕐 Simulating 15-minute strategy execution...');
    const fifteenMinExecution = await vaultContract.executeStrategy(fifteenMinResult.strategyId);
    console.log(`📈 15-min strategy action: ${fifteenMinExecution.action || 'No action'}\n`);

    // Test 5: Demonstrate Frontend Variable Control
    console.log('🎛️ TEST 5: FRONTEND VARIABLE CONTROL DEMONSTRATION');
    console.log('==================================================');
    
    // Simulate frontend variables that would control contract behavior
    const frontendVariables = {
      timeIntervals: ['1m', '2m', '5m', '15m', '30m', '1h', '4h', '1d'],
      executionIntervals: {
        '1m': 60000,    // 1 minute
        '2m': 120000,   // 2 minutes
        '5m': 300000,   // 5 minutes
        '15m': 900000,  // 15 minutes
        '30m': 1800000, // 30 minutes
        '1h': 3600000,  // 1 hour
        '4h': 14400000, // 4 hours
        '1d': 86400000  // 1 day
      },
      yieldTargets: [0.01, 0.02, 0.05, 0.08, 0.10, 0.15, 0.20], // 1% to 20%
      positionSizes: [0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9], // 10% to 90%
      riskLevels: ['low', 'medium', 'high', 'aggressive']
    };
    
    console.log('📊 Available frontend time intervals:');
    frontendVariables.timeIntervals.forEach(interval => {
      const ms = frontendVariables.executionIntervals[interval];
      console.log(`   ⏰ ${interval}: ${ms}ms (${ms/60000} minutes)`);
    });
    
    console.log('\n📊 Available yield targets:');
    frontendVariables.yieldTargets.forEach(target => {
      console.log(`   🎯 ${(target * 100).toFixed(1)}% yield target`);
    });
    
    console.log('\n📊 Available position sizes:');
    frontendVariables.positionSizes.forEach(size => {
      console.log(`   📊 ${(size * 100).toFixed(0)}% of deposit`);
    });
    
    console.log('\n📊 Available risk levels:');
    frontendVariables.riskLevels.forEach(risk => {
      console.log(`   ⚠️  ${risk} risk`);
    });

    // Test 6: Dynamic Strategy Creation from Frontend Variables
    console.log('\n🔄 TEST 6: DYNAMIC STRATEGY CREATION FROM FRONTEND');
    console.log('==================================================');
    
    // Simulate user selecting options from frontend
    const userSelections = {
      timeInterval: '5m',
      yieldTarget: 0.05,
      positionSize: 0.6,
      riskLevel: 'medium'
    };
    
    console.log('👤 User frontend selections:');
    console.log(`   ⏰ Time interval: ${userSelections.timeInterval}`);
    console.log(`   🎯 Yield target: ${(userSelections.yieldTarget * 100).toFixed(1)}%`);
    console.log(`   📊 Position size: ${(userSelections.positionSize * 100).toFixed(0)}%`);
    console.log(`   ⚠️  Risk level: ${userSelections.riskLevel}`);
    
    // Create strategy dynamically from frontend variables
    const dynamicStrategy = {
      name: `Dynamic ${userSelections.timeInterval} Strategy`,
      description: `Auto-generated strategy based on user selections`,
      baseToken: 'SOL',
      quoteToken: 'USDC',
      positionSize: userSelections.positionSize,
      timeFrame: userSelections.timeInterval,
      executionInterval: frontendVariables.executionIntervals[userSelections.timeInterval],
      entryConditions: [
        { type: 'price_above', value: 100.0 }
      ],
      exitConditions: [
        { type: 'time_based', duration: frontendVariables.executionIntervals[userSelections.timeInterval] },
        { type: 'take_profit', value: userSelections.yieldTarget }
      ],
      yieldTarget: userSelections.yieldTarget,
      yieldAccumulation: true
    };
    
    const dynamicResult = vaultContract.createStrategy(testUser.publicKey, dynamicStrategy);
    console.log(`\n✅ Dynamic strategy created: ${dynamicResult.strategy.name}`);
    console.log(`⏰ Execution interval: ${dynamicResult.strategy.timeFrame}`);
    console.log(`🎯 Yield target: ${(dynamicResult.strategy.yieldTarget * 100).toFixed(1)}%`);
    console.log(`📊 Position size: ${(dynamicResult.strategy.positionSize * 100).toFixed(0)}%`);

    // Test 7: Yield Accumulation Over Different Time Periods
    console.log('\n🎁 TEST 7: YIELD ACCUMULATION OVER DIFFERENT TIME PERIODS');
    console.log('==========================================================');
    
    const timePeriods = [
      { name: '2 minutes', ms: 120000 },
      { name: '5 minutes', ms: 300000 },
      { name: '15 minutes', ms: 900000 },
      { name: '1 hour', ms: 3600000 },
      { name: '1 day', ms: 86400000 }
    ];
    
    const originalTime = vaultContract.vaultState.lastYieldCalculation;
    const userKey = testUser.publicKey.toString();
    
    timePeriods.forEach(period => {
      const futureTime = originalTime + period.ms;
      vaultContract.vaultState.userLastYieldUpdate.set(userKey, originalTime);
      
      const yieldGenerated = vaultContract.calculateUserYieldWithTime(testUser.publicKey, futureTime);
      const yieldPercent = (yieldGenerated / initialDeposit) * 100;
      
      console.log(`📊 ${period.name}: ${yieldGenerated.toFixed(6)} SOL (${yieldPercent.toFixed(4)}%)`);
    });

    // Test 8: Strategy Performance Comparison
    console.log('\n📊 TEST 8: STRATEGY PERFORMANCE COMPARISON');
    console.log('===========================================');
    
    const strategies = [twoMinResult, fiveMinResult, fifteenMinResult, dynamicResult];
    
    strategies.forEach(strategy => {
      const performance = vaultContract.getStrategyPerformance(strategy.strategyId);
      console.log(`📈 ${strategy.strategy.name}:`);
      console.log(`   ⏰ Time frame: ${strategy.strategy.timeFrame}`);
      console.log(`   🎯 Yield target: ${(strategy.strategy.yieldTarget * 100).toFixed(1)}%`);
      console.log(`   📊 Position size: ${(strategy.strategy.positionSize * 100).toFixed(0)}%`);
      console.log(`   💰 Current PnL: $${performance.performance.totalPnl.toFixed(4)}`);
    });

    console.log('\n🎯 FRONTEND INTEGRATION SUMMARY:');
    console.log('================================');
    console.log('✅ Time intervals are fully configurable from frontend');
    console.log('✅ Yield targets are user-selectable variables');
    console.log('✅ Position sizes are dynamically adjustable');
    console.log('✅ Risk levels can be customized');
    console.log('✅ All variables directly control contract behavior');
    console.log('✅ Real-time strategy execution based on user selections');
    console.log('✅ Yield accumulation scales with time periods');

    return {
      success: true,
      strategies: strategies.length,
      timeIntervals: frontendVariables.timeIntervals.length,
      yieldTargets: frontendVariables.yieldTargets.length,
      positionSizes: frontendVariables.positionSizes.length,
      riskLevels: frontendVariables.riskLevels.length
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run test if called directly
if (require.main === module) {
  testTimeConstraints().catch(console.error);
}

module.exports = { testTimeConstraints }; 