#!/usr/bin/env node

const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const StrategyVaultContract = require('../contracts/vault/StrategyVaultContract');
const networks = require('../config/networks');

/**
 * Comprehensive Strategy Vault Testing
 */
async function testStrategyVault() {
  console.log('🚀 ADVANCED STRATEGY VAULT TESTING');
  console.log('===================================\n');

  let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  try {
    // Setup
    console.log('🔧 SETUP PHASE');
    console.log('-------------');
    
    const connection = new Connection(networks.devnet.url, 'confirmed');
    console.log('✅ Connected to Solana devnet');
    
    const testUser = Keypair.generate();
    const authorityWallet = Keypair.generate();
    const programId = '11111111111111111111111111111111';
    
    console.log(`👤 Test User: ${testUser.publicKey.toString()}`);
    console.log(`🔑 Authority: ${authorityWallet.publicKey.toString()}`);
    
    const vaultContract = new StrategyVaultContract(connection, programId, authorityWallet.publicKey);
    console.log('✅ Strategy Vault contract instance created\n');

    // Initialize vault
    const initResult = await vaultContract.initializeVault();
    if (!initResult.success) {
      throw new Error('Failed to initialize strategy vault');
    }
    console.log('✅ Strategy Vault initialized\n');

    // Test 1: Token Data & Market Data
    console.log('🪙 TEST 1: TOKEN DATA & MARKET DATA');
    console.log('===================================');
    
    testResults.total++;
    console.log('Step 1.1: Getting supported tokens...');
    
    const supportedTokens = vaultContract.getSupportedTokens();
    if (supportedTokens.success && supportedTokens.tokens.length > 0) {
      console.log('✅ Supported tokens retrieved successfully');
      console.log(`📊 Tokens: ${supportedTokens.tokens.map(t => t.symbol).join(', ')}`);
      
      // Test token data retrieval
      const solData = vaultContract.getTokenData('SOL');
      if (solData.success) {
        console.log(`💰 SOL Price: $${solData.token.marketData.price}`);
        console.log(`📈 SOL Volatility: ${(solData.token.volatilityData.current * 100).toFixed(2)}%`);
        testResults.passed++;
        testResults.details.push({
          test: 'Token Data & Market Data',
          status: 'PASSED',
          tokensCount: supportedTokens.tokens.length,
          solPrice: solData.token.marketData.price,
          solVolatility: solData.token.volatilityData.current
        });
      } else {
        console.log('❌ Failed to get SOL token data');
        testResults.failed++;
        testResults.details.push({
          test: 'Token Data & Market Data',
          status: 'FAILED',
          error: solData.error
        });
      }
    } else {
      console.log('❌ Failed to get supported tokens');
      testResults.failed++;
      testResults.details.push({
        test: 'Token Data & Market Data',
        status: 'FAILED',
        error: 'No supported tokens found'
      });
    }
    console.log('');

    // Test 2: Market Data Updates
    console.log('📊 TEST 2: MARKET DATA UPDATES');
    console.log('==============================');
    
    testResults.total++;
    console.log('Step 2.1: Updating SOL price...');
    
    const oldPrice = vaultContract.vaultState.marketData.get('SOL').price;
    const newPrice = oldPrice * 1.05; // 5% increase
    const newVolatility = 0.28;
    
    const updateResult = vaultContract.updateMarketData('SOL', newPrice, newVolatility);
    if (updateResult.success) {
      console.log('✅ Market data updated successfully');
      console.log(`📈 Price change: $${oldPrice} → $${newPrice} (${updateResult.change24h.toFixed(2)}%)`);
      console.log(`📊 Volatility: ${(newVolatility * 100).toFixed(2)}%`);
      
      // Add more price history for volatility calculation
      for (let i = 0; i < 15; i++) {
        const testPrice = oldPrice + (i * 0.5);
        vaultContract.updateMarketData('SOL', testPrice, newVolatility);
      }
      
      // Test volatility calculation
      const volatilityResult = vaultContract.calculateVolatility('SOL', 10);
      if (volatilityResult.success) {
        console.log(`📈 Calculated volatility: ${(volatilityResult.volatility * 100).toFixed(2)}%`);
        testResults.passed++;
        testResults.details.push({
          test: 'Market Data Updates',
          status: 'PASSED',
          priceChange: updateResult.change24h,
          newVolatility: newVolatility,
          calculatedVolatility: volatilityResult.volatility
        });
      } else {
        console.log('❌ Failed to calculate volatility');
        testResults.failed++;
        testResults.details.push({
          test: 'Market Data Updates',
          status: 'FAILED',
          error: volatilityResult.error
        });
      }
    } else {
      console.log('❌ Failed to update market data');
      testResults.failed++;
      testResults.details.push({
        test: 'Market Data Updates',
        status: 'FAILED',
        error: updateResult.error
      });
    }
    console.log('');

    // Test 3: Strategy Creation
    console.log('📈 TEST 3: STRATEGY CREATION');
    console.log('============================');
    
    testResults.total++;
    console.log('Step 3.1: Creating a basic strategy...');
    
    const strategyConfig = {
      name: 'SOL Momentum Strategy',
      description: 'Buy SOL when price increases by 5%',
      baseToken: 'SOL',
      quoteToken: 'USDC',
      positionSize: 0.2, // 20% of deposit
      timeFrame: '1h',
      executionInterval: 3600000, // 1 hour
      entryConditions: [
        { type: 'price_above', value: 105.0 },
        { type: 'volatility_below', value: 0.3 }
      ],
      exitConditions: [
        { type: 'stop_loss', value: 0.05 }, // 5% stop loss
        { type: 'take_profit', value: 0.10 } // 10% take profit
      ],
      hedgeEnabled: true,
      hedgeToken: 'USDC',
      hedgeRatio: 0.3
    };
    
    const strategyResult = vaultContract.createStrategy(testUser.publicKey, strategyConfig);
    if (strategyResult.success) {
      console.log('✅ Strategy created successfully');
      console.log(`📊 Strategy ID: ${strategyResult.strategyId}`);
      console.log(`📈 Strategy Name: ${strategyResult.strategy.name}`);
      console.log(`🎯 Base Token: ${strategyResult.strategy.baseToken}`);
      console.log(`🛡️ Hedge Enabled: ${strategyResult.strategy.hedgeEnabled}`);
      testResults.passed++;
      testResults.details.push({
        test: 'Strategy Creation',
        status: 'PASSED',
        strategyId: strategyResult.strategyId,
        strategyName: strategyResult.strategy.name,
        entryConditions: strategyResult.strategy.entryConditions.length,
        exitConditions: strategyResult.strategy.exitConditions.length
      });
    } else {
      console.log('❌ Failed to create strategy');
      testResults.failed++;
      testResults.details.push({
        test: 'Strategy Creation',
        status: 'FAILED',
        error: strategyResult.error
      });
    }
    console.log('');

    // Test 4: Strategy Execution
    console.log('⚡ TEST 4: STRATEGY EXECUTION');
    console.log('=============================');
    
    testResults.total++;
    console.log('Step 4.1: Executing strategy...');
    
    // First, deposit some SOL to enable strategy execution
    const depositResult = await vaultContract.depositSol(testUser.publicKey, 1.0);
    if (!depositResult.success) {
      throw new Error('Failed to deposit SOL for strategy testing');
    }
    
    // Update SOL price to trigger entry condition
    vaultContract.updateMarketData('SOL', 110.0, 0.25); // Above 105 threshold
    
    const executionResult = await vaultContract.executeStrategy(strategyResult.strategyId);
    if (executionResult.success) {
      console.log('✅ Strategy executed successfully');
      console.log(`🎯 Action: ${executionResult.action || 'No action'}`);
      console.log(`💰 Current Price: $${executionResult.currentPrice}`);
      
      if (executionResult.action === 'enter') {
        console.log(`📈 Position entered at $${executionResult.currentPrice}`);
        console.log(`📊 Position size: ${executionResult.strategy.currentPosition.size} SOL`);
        testResults.passed++;
        testResults.details.push({
          test: 'Strategy Execution',
          status: 'PASSED',
          action: executionResult.action,
          entryPrice: executionResult.currentPrice,
          positionSize: executionResult.strategy.currentPosition.size
        });
      } else {
        console.log('ℹ️ No entry conditions met');
        testResults.passed++;
        testResults.details.push({
          test: 'Strategy Execution',
          status: 'PASSED',
          action: 'no_action',
          reason: 'Entry conditions not met'
        });
      }
    } else {
      console.log('❌ Strategy execution failed');
      testResults.failed++;
      testResults.details.push({
        test: 'Strategy Execution',
        status: 'FAILED',
        error: executionResult.error
      });
    }
    console.log('');

    // Test 5: Strategy Performance Tracking
    console.log('📊 TEST 5: STRATEGY PERFORMANCE TRACKING');
    console.log('========================================');
    
    testResults.total++;
    console.log('Step 5.1: Getting strategy performance...');
    
    const performanceResult = vaultContract.getStrategyPerformance(strategyResult.strategyId);
    if (performanceResult.success) {
      console.log('✅ Strategy performance retrieved successfully');
      console.log(`📈 Total PnL: $${performanceResult.performance.totalPnl.toFixed(4)}`);
      console.log(`📊 Total Trades: ${performanceResult.performance.totalTrades}`);
      console.log(`🎯 Win Rate: ${performanceResult.performance.winRate.toFixed(2)}%`);
      console.log(`📉 Max Drawdown: ${(performanceResult.performance.maxDrawdown * 100).toFixed(2)}%`);
      
      testResults.passed++;
      testResults.details.push({
        test: 'Strategy Performance Tracking',
        status: 'PASSED',
        totalPnl: performanceResult.performance.totalPnl,
        totalTrades: performanceResult.performance.totalTrades,
        winRate: performanceResult.performance.winRate,
        maxDrawdown: performanceResult.performance.maxDrawdown
      });
    } else {
      console.log('❌ Failed to get strategy performance');
      testResults.failed++;
      testResults.details.push({
        test: 'Strategy Performance Tracking',
        status: 'FAILED',
        error: performanceResult.error
      });
    }
    console.log('');

    // Test 6: Multiple Strategies
    console.log('🔄 TEST 6: MULTIPLE STRATEGIES');
    console.log('==============================');
    
    testResults.total++;
    console.log('Step 6.1: Creating multiple strategies...');
    
    // Create a second strategy
    const strategyConfig2 = {
      name: 'SOL Volatility Strategy',
      description: 'Trade based on volatility spikes',
      baseToken: 'SOL',
      quoteToken: 'USDC',
      positionSize: 0.15,
      volatilityThreshold: 0.3,
      entryConditions: [
        { type: 'volatility_above', value: 0.3 }
      ],
      exitConditions: [
        { type: 'volatility_exit', value: 0.4 }
      ]
    };
    
    const strategyResult2 = vaultContract.createStrategy(testUser.publicKey, strategyConfig2);
    if (strategyResult2.success) {
      console.log('✅ Second strategy created successfully');
      
      // Get user strategies
      const userStrategies = vaultContract.getUserStrategies(testUser.publicKey);
      if (userStrategies.success && userStrategies.strategies.length >= 2) {
        console.log(`📊 User has ${userStrategies.strategies.length} strategies`);
        console.log(`📈 Active strategies: ${userStrategies.strategies.filter(s => s.status === 'active').length}`);
        
        testResults.passed++;
        testResults.details.push({
          test: 'Multiple Strategies',
          status: 'PASSED',
          totalStrategies: userStrategies.strategies.length,
          activeStrategies: userStrategies.strategies.filter(s => s.status === 'active').length
        });
      } else {
        console.log('❌ Failed to get user strategies');
        testResults.failed++;
        testResults.details.push({
          test: 'Multiple Strategies',
          status: 'FAILED',
          error: 'User strategies not found'
        });
      }
    } else {
      console.log('❌ Failed to create second strategy');
      testResults.failed++;
      testResults.details.push({
        test: 'Multiple Strategies',
        status: 'FAILED',
        error: strategyResult2.error
      });
    }
    console.log('');

    // Test 7: Strategy Management
    console.log('⚙️ TEST 7: STRATEGY MANAGEMENT');
    console.log('==============================');
    
    testResults.total++;
    console.log('Step 7.1: Testing strategy pause/resume...');
    
    // Pause strategy
    const pauseResult = vaultContract.toggleStrategy(strategyResult.strategyId, 'pause');
    if (pauseResult.success) {
      console.log('✅ Strategy paused successfully');
      
      // Try to execute paused strategy
      const pausedExecution = await vaultContract.executeStrategy(strategyResult.strategyId);
      if (!pausedExecution.success && pausedExecution.error.includes('not active')) {
        console.log('✅ Paused strategy correctly blocked execution');
        
        // Resume strategy
        const resumeResult = vaultContract.toggleStrategy(strategyResult.strategyId, 'resume');
        if (resumeResult.success) {
          console.log('✅ Strategy resumed successfully');
          testResults.passed++;
          testResults.details.push({
            test: 'Strategy Management',
            status: 'PASSED',
            pauseSuccess: true,
            resumeSuccess: true,
            executionBlocked: true
          });
        } else {
          console.log('❌ Failed to resume strategy');
          testResults.failed++;
          testResults.details.push({
            test: 'Strategy Management',
            status: 'FAILED',
            error: resumeResult.error
          });
        }
      } else {
        console.log('❌ Paused strategy was not blocked');
        testResults.failed++;
        testResults.details.push({
          test: 'Strategy Management',
          status: 'FAILED',
          error: 'Paused strategy execution not blocked'
        });
      }
    } else {
      console.log('❌ Failed to pause strategy');
      testResults.failed++;
      testResults.details.push({
        test: 'Strategy Management',
        status: 'FAILED',
        error: pauseResult.error
      });
    }
    console.log('');

    // Test 8: Vault Analytics
    console.log('📈 TEST 8: VAULT ANALYTICS');
    console.log('==========================');
    
    testResults.total++;
    console.log('Step 8.1: Getting vault analytics...');
    
    const analyticsResult = vaultContract.getVaultAnalytics();
    if (analyticsResult.success) {
      console.log('✅ Vault analytics retrieved successfully');
      console.log(`📊 Total Strategies: ${analyticsResult.analytics.totalStrategies}`);
      console.log(`⚡ Active Strategies: ${analyticsResult.analytics.activeStrategies}`);
      console.log(`💰 Total PnL: $${analyticsResult.analytics.totalPnl.toFixed(4)}`);
      console.log(`📈 Total Trades: ${analyticsResult.analytics.totalTrades}`);
      console.log(`🪙 Supported Tokens: ${analyticsResult.analytics.supportedTokens.join(', ')}`);
      
      testResults.passed++;
      testResults.details.push({
        test: 'Vault Analytics',
        status: 'PASSED',
        totalStrategies: analyticsResult.analytics.totalStrategies,
        activeStrategies: analyticsResult.analytics.activeStrategies,
        totalPnl: analyticsResult.analytics.totalPnl,
        totalTrades: analyticsResult.analytics.totalTrades
      });
    } else {
      console.log('❌ Failed to get vault analytics');
      testResults.failed++;
      testResults.details.push({
        test: 'Vault Analytics',
        status: 'FAILED',
        error: analyticsResult.error
      });
    }
    console.log('');

    // Test 9: Advanced Strategy Features
    console.log('🎯 TEST 9: ADVANCED STRATEGY FEATURES');
    console.log('=====================================');
    
    testResults.total++;
    console.log('Step 9.1: Testing advanced strategy features...');
    
    // Create a complex strategy with time-based conditions
    const advancedStrategyConfig = {
      name: 'Advanced SOL Strategy',
      description: 'Complex strategy with time and price conditions',
      baseToken: 'SOL',
      quoteToken: 'USDC',
      positionSize: 0.25,
      timeFrame: '4h',
      executionInterval: 14400000, // 4 hours
      entryConditions: [
        { type: 'price_above', value: 100.0 },
        { type: 'time_based', startHour: 9, endHour: 17 }, // Market hours
        { type: 'volatility_below', value: 0.35 }
      ],
      exitConditions: [
        { type: 'stop_loss', value: 0.03 }, // 3% stop loss
        { type: 'take_profit', value: 0.08 }, // 8% take profit
        { type: 'time_based', duration: 86400000 } // 24 hours max
      ],
      hedgeEnabled: true,
      hedgeToken: 'USDC',
      hedgeRatio: 0.4,
      maxDrawdown: 0.05, // 5% max drawdown
      riskPerTrade: 0.015 // 1.5% risk per trade
    };
    
    const advancedStrategyResult = vaultContract.createStrategy(testUser.publicKey, advancedStrategyConfig);
    if (advancedStrategyResult.success) {
      console.log('✅ Advanced strategy created successfully');
      console.log(`📊 Strategy: ${advancedStrategyResult.strategy.name}`);
      console.log(`🕐 Time-based conditions: ${advancedStrategyResult.strategy.entryConditions.filter(c => c.type === 'time_based').length}`);
      console.log(`🛡️ Risk management: ${advancedStrategyResult.strategy.maxDrawdown * 100}% max drawdown`);
      console.log(`🎯 Risk per trade: ${advancedStrategyResult.strategy.riskPerTrade * 100}%`);
      
      testResults.passed++;
      testResults.details.push({
        test: 'Advanced Strategy Features',
        status: 'PASSED',
        strategyName: advancedStrategyResult.strategy.name,
        timeConditions: advancedStrategyResult.strategy.entryConditions.filter(c => c.type === 'time_based').length,
        maxDrawdown: advancedStrategyResult.strategy.maxDrawdown,
        riskPerTrade: advancedStrategyResult.strategy.riskPerTrade
      });
    } else {
      console.log('❌ Failed to create advanced strategy');
      testResults.failed++;
      testResults.details.push({
        test: 'Advanced Strategy Features',
        status: 'FAILED',
        error: advancedStrategyResult.error
      });
    }
    console.log('');

    // Test 10: Strategy Deletion
    console.log('🗑️ TEST 10: STRATEGY DELETION');
    console.log('==============================');
    
    testResults.total++;
    console.log('Step 10.1: Testing strategy deletion...');
    
    const deleteResult = vaultContract.deleteStrategy(strategyResult2.strategyId);
    if (deleteResult.success) {
      console.log('✅ Strategy deleted successfully');
      
      // Verify strategy is gone
      const deletedStrategy = vaultContract.vaultState.strategies.get(strategyResult2.strategyId);
      if (!deletedStrategy) {
        console.log('✅ Strategy correctly removed from vault');
        testResults.passed++;
        testResults.details.push({
          test: 'Strategy Deletion',
          status: 'PASSED',
          strategyId: strategyResult2.strategyId,
          deletionSuccess: true
        });
      } else {
        console.log('❌ Strategy still exists after deletion');
        testResults.failed++;
        testResults.details.push({
          test: 'Strategy Deletion',
          status: 'FAILED',
          error: 'Strategy not properly deleted'
        });
      }
    } else {
      console.log('❌ Failed to delete strategy');
      testResults.failed++;
      testResults.details.push({
        test: 'Strategy Deletion',
        status: 'FAILED',
        error: deleteResult.error
      });
    }
    console.log('');

    // Final Results
    console.log('📋 FINAL STRATEGY VAULT TEST RESULTS');
    console.log('====================================');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    console.log('');

    if (testResults.failed === 0) {
      console.log('🎉 ALL STRATEGY VAULT TESTS PASSED! Advanced functionality is working correctly.');
    } else {
      console.log('⚠️  Some strategy vault tests failed. Please review the details above.');
    }

    console.log('\n📝 DETAILED STRATEGY VAULT TEST RESULTS:');
    console.log('========================================');
    testResults.details.forEach((detail, index) => {
      const status = detail.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} Test ${index + 1}: ${detail.test} - ${detail.status}`);
      if (detail.error) {
        console.log(`   Error: ${detail.error}`);
      }
    });

    return testResults;

  } catch (error) {
    console.error('❌ Strategy vault test execution failed:', error);
    return {
      total: 1,
      passed: 0,
      failed: 1,
      details: [{
        test: 'Strategy Vault Test Execution',
        status: 'FAILED',
        error: error.message
      }]
    };
  }
}

// Run test if called directly
if (require.main === module) {
  testStrategyVault().catch(console.error);
}

module.exports = { testStrategyVault }; 