#!/usr/bin/env node

const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const VaultContract = require('../contracts/vault/VaultContract');
const networks = require('../config/networks');

/**
 * Comprehensive Yield Functionality Testing
 */
async function testYieldFunctionality() {
  console.log('🌱 YIELD FUNCTIONALITY TESTING');
  console.log('===============================\n');

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
    
    const vaultContract = new VaultContract(connection, programId, authorityWallet.publicKey);
    console.log('✅ Vault contract instance created\n');

    // Initialize vault
    const initResult = await vaultContract.initializeVault();
    if (!initResult.success) {
      throw new Error('Failed to initialize vault');
    }
    console.log('✅ Vault initialized\n');

    // Test 1: Initial Yield Rate
    console.log('📈 TEST 1: INITIAL YIELD RATE');
    console.log('=============================');
    
    testResults.total++;
    const initialYieldRate = vaultContract.vaultState.yieldRate;
    const expectedRate = 0.05; // 5%
    
    if (initialYieldRate === expectedRate) {
      console.log('✅ Initial yield rate is correct');
      console.log(`📊 Yield Rate: ${(initialYieldRate * 100).toFixed(2)}% APY`);
      testResults.passed++;
      testResults.details.push({
        test: 'Initial Yield Rate',
        status: 'PASSED',
        rate: initialYieldRate,
        apy: (initialYieldRate * 100).toFixed(2) + '%'
      });
    } else {
      console.log('❌ Initial yield rate is incorrect');
      console.log(`Expected: ${expectedRate}, Actual: ${initialYieldRate}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Initial Yield Rate',
        status: 'FAILED',
        expected: expectedRate,
        actual: initialYieldRate
      });
    }
    console.log('');

    // Test 2: First Deposit with Yield Projection
    console.log('💰 TEST 2: FIRST DEPOSIT WITH YIELD PROJECTION');
    console.log('==============================================');
    
    testResults.total++;
    const depositAmount = 1.0;
    console.log(`Step 2.1: Depositing ${depositAmount} SOL...`);
    
    const depositResult = await vaultContract.depositSol(testUser.publicKey, depositAmount);
    
    if (depositResult.success) {
      console.log('✅ First deposit successful');
      console.log(`💰 Amount: ${depositResult.amount} SOL`);
      console.log(`📊 Current Yield: ${depositResult.currentYield.toFixed(6)} SOL`);
      console.log(`🔮 Projected Yield (30 days): ${depositResult.projectedYield.toFixed(6)} SOL`);
      
      // Check yield projection
      const projection = vaultContract.getYieldProjection(testUser.publicKey, 30);
      const expectedProjection = (depositAmount * initialYieldRate * 30) / 365;
      
      if (Math.abs(projection.projectedYield - expectedProjection) < 0.000001) {
        console.log('✅ Yield projection calculation is correct');
        testResults.passed++;
        testResults.details.push({
          test: 'First Deposit with Yield Projection',
          status: 'PASSED',
          deposit: depositAmount,
          currentYield: depositResult.currentYield,
          projectedYield: depositResult.projectedYield,
          apy: (initialYieldRate * 100).toFixed(2) + '%'
        });
      } else {
        console.log('❌ Yield projection calculation is incorrect');
        testResults.failed++;
        testResults.details.push({
          test: 'First Deposit with Yield Projection',
          status: 'FAILED',
          expected: expectedProjection,
          actual: projection.projectedYield
        });
      }
    } else {
      console.log('❌ First deposit failed');
      console.log(`📝 Error: ${depositResult.error}`);
      testResults.failed++;
      testResults.details.push({
        test: 'First Deposit with Yield Projection',
        status: 'FAILED',
        error: depositResult.error
      });
    }
    console.log('');

    // Test 3: Yield Accumulation Over Time
    console.log('⏰ TEST 3: YIELD ACCUMULATION OVER TIME');
    console.log('=======================================');
    
    testResults.total++;
    console.log('Step 3.1: Simulating time passage and yield accumulation...');
    
    // Get initial yield
    const initialUserInfo = vaultContract.getUserDeposit(testUser.publicKey);
    console.log(`📊 Initial earned yield: ${initialUserInfo.earnedYield.toFixed(6)} SOL`);
    
    // Simulate time passage (1 day)
    const oneDayMs = 24 * 60 * 60 * 1000;
    const originalTime = vaultContract.vaultState.lastYieldCalculation;
    const simulatedTime = originalTime + oneDayMs; // Add 1 day to current time
    
    // Manually update user's last yield update time to simulate time passage
    const userKey = testUser.publicKey.toString();
    vaultContract.vaultState.userLastYieldUpdate.set(userKey, originalTime);
    
    // Calculate yield with simulated time
    const yieldGenerated = vaultContract.calculateUserYieldWithTime(testUser.publicKey, simulatedTime);
    console.log(`📈 Yield generated in 1 day: ${yieldGenerated.toFixed(6)} SOL`);
    
    // Update the vault state to reflect the simulated time
    vaultContract.vaultState.userYieldEarned.set(userKey, yieldGenerated);
    vaultContract.vaultState.userLastYieldUpdate.set(userKey, simulatedTime);
    vaultContract.vaultState.lastYieldCalculation = simulatedTime;
    
    // Get updated user info
    const updatedUserInfo = vaultContract.getUserDeposit(testUser.publicKey);
    console.log(`📊 Updated earned yield: ${updatedUserInfo.earnedYield.toFixed(6)} SOL`);
    
    // Calculate expected yield for 1 day
    const expectedDailyYield = (depositAmount * initialYieldRate) / 365;
    const actualYield = updatedUserInfo.earnedYield - initialUserInfo.earnedYield;
    
    if (Math.abs(actualYield - expectedDailyYield) < 0.000001) {
      console.log('✅ Yield accumulation over time is correct');
      console.log(`📊 Expected daily yield: ${expectedDailyYield.toFixed(6)} SOL`);
      console.log(`📊 Actual yield generated: ${actualYield.toFixed(6)} SOL`);
      testResults.passed++;
      testResults.details.push({
        test: 'Yield Accumulation Over Time',
        status: 'PASSED',
        expectedDaily: expectedDailyYield,
        actualDaily: actualYield,
        totalEarned: updatedUserInfo.earnedYield
      });
    } else {
      console.log('❌ Yield accumulation over time is incorrect');
      console.log(`Expected: ${expectedDailyYield}, Actual: ${actualYield}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Yield Accumulation Over Time',
        status: 'FAILED',
        expected: expectedDailyYield,
        actual: actualYield
      });
    }
    console.log('');

    // Test 4: Yield Claim Functionality
    console.log('🎁 TEST 4: YIELD CLAIM FUNCTIONALITY');
    console.log('===================================');
    
    testResults.total++;
    console.log('Step 4.1: Claiming earned yield...');
    
    const claimResult = await vaultContract.claimYield(testUser.publicKey);
    
    if (claimResult.success) {
      console.log('✅ Yield claim successful');
      console.log(`💰 Claimed amount: ${claimResult.amount.toFixed(6)} SOL`);
      
      // Check that yield was reset
      const afterClaimInfo = vaultContract.getUserDeposit(testUser.publicKey);
      if (afterClaimInfo.earnedYield === 0) {
        console.log('✅ User yield balance correctly reset to 0');
        testResults.passed++;
        testResults.details.push({
          test: 'Yield Claim Functionality',
          status: 'PASSED',
          claimedAmount: claimResult.amount,
          remainingYield: afterClaimInfo.earnedYield
        });
      } else {
        console.log('❌ User yield balance not reset correctly');
        testResults.failed++;
        testResults.details.push({
          test: 'Yield Claim Functionality',
          status: 'FAILED',
          remainingYield: afterClaimInfo.earnedYield
        });
      }
    } else {
      console.log('❌ Yield claim failed');
      console.log(`📝 Error: ${claimResult.error}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Yield Claim Functionality',
        status: 'FAILED',
        error: claimResult.error
      });
    }
    console.log('');

    // Test 5: Withdrawal with Yield
    console.log('💸 TEST 5: WITHDRAWAL WITH YIELD');
    console.log('================================');
    
    testResults.total++;
    console.log('Step 5.1: Adding more deposits and generating yield...');
    
    // Add another deposit
    const secondDeposit = await vaultContract.depositSol(testUser.publicKey, 0.5);
    if (!secondDeposit.success) {
      throw new Error('Second deposit failed');
    }
    
    // Simulate more time passage (2 days)
    const simulatedTime2 = originalTime + (2 * oneDayMs);
    vaultContract.vaultState.userLastYieldUpdate.set(userKey, originalTime);
    
    const yieldGenerated2 = vaultContract.calculateUserYieldWithTime(testUser.publicKey, simulatedTime2);
    vaultContract.vaultState.userYieldEarned.set(userKey, yieldGenerated2);
    vaultContract.vaultState.userLastYieldUpdate.set(userKey, simulatedTime2);
    vaultContract.vaultState.lastYieldCalculation = simulatedTime2;
    
    const userInfoBeforeWithdrawal = vaultContract.getUserDeposit(testUser.publicKey);
    console.log(`💰 Total available: ${userInfoBeforeWithdrawal.totalAvailable.toFixed(6)} SOL`);
    console.log(`📊 Deposit: ${userInfoBeforeWithdrawal.deposit} SOL`);
    console.log(`🎁 Earned yield: ${userInfoBeforeWithdrawal.earnedYield.toFixed(6)} SOL`);
    
    console.log('Step 5.2: Withdrawing more than deposit (including yield)...');
    const withdrawalAmount = userInfoBeforeWithdrawal.deposit + 0.0001; // More than deposit but within available
    const withdrawalResult = await vaultContract.withdrawSol(testUser.publicKey, withdrawalAmount);
    
    if (withdrawalResult.success) {
      console.log('✅ Withdrawal with yield successful');
      console.log(`💰 Withdrawn amount: ${withdrawalResult.amount} SOL`);
      console.log(`📊 From deposit: ${withdrawalResult.withdrawFromDeposit} SOL`);
      console.log(`🎁 From yield: ${withdrawalResult.withdrawFromYield} SOL`);
      console.log(`💰 Remaining deposit: ${withdrawalResult.remainingDeposit} SOL`);
      console.log(`🎁 Remaining yield: ${withdrawalResult.remainingYield.toFixed(6)} SOL`);
      
      testResults.passed++;
      testResults.details.push({
        test: 'Withdrawal with Yield',
        status: 'PASSED',
        withdrawnAmount: withdrawalResult.amount,
        fromDeposit: withdrawalResult.withdrawFromDeposit,
        fromYield: withdrawalResult.withdrawFromYield,
        remainingDeposit: withdrawalResult.remainingDeposit,
        remainingYield: withdrawalResult.remainingYield
      });
    } else {
      console.log('❌ Withdrawal with yield failed');
      console.log(`📝 Error: ${withdrawalResult.error}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Withdrawal with Yield',
        status: 'FAILED',
        error: withdrawalResult.error
      });
    }
    console.log('');

    // Test 6: Yield Rate Adjustment
    console.log('📈 TEST 6: YIELD RATE ADJUSTMENT');
    console.log('===============================');
    
    testResults.total++;
    console.log('Step 6.1: Adjusting yield rate...');
    
    const newRate = 0.08; // 8% APY
    const rateAdjustment = vaultContract.setYieldRate(newRate);
    
    if (rateAdjustment.success) {
      console.log('✅ Yield rate adjustment successful');
      console.log(`📊 Old rate: ${(rateAdjustment.oldRate * 100).toFixed(2)}%`);
      console.log(`📊 New rate: ${(rateAdjustment.newRate * 100).toFixed(2)}%`);
      
      // Test yield projection with new rate
      const newProjection = vaultContract.calculateProjectedYieldForExisting(testUser.publicKey, 30);
      const expectedNewProjection = (0 * newRate * 30) / 365; // User has 0 deposit after withdrawal
      
      if (Math.abs(newProjection - expectedNewProjection) < 0.000001) {
        console.log('✅ Yield projection with new rate is correct');
                  console.log(`🔮 New projected yield (30 days): ${newProjection.toFixed(6)} SOL`);
        testResults.passed++;
        testResults.details.push({
          test: 'Yield Rate Adjustment',
          status: 'PASSED',
          oldRate: rateAdjustment.oldRate,
          newRate: rateAdjustment.newRate,
                      newProjection: newProjection
        });
      } else {
        console.log('❌ Yield projection with new rate is incorrect');
        testResults.failed++;
        testResults.details.push({
          test: 'Yield Rate Adjustment',
          status: 'FAILED',
          expected: expectedNewProjection,
          actual: newProjection
        });
      }
    } else {
      console.log('❌ Yield rate adjustment failed');
      console.log(`📝 Error: ${rateAdjustment.error}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Yield Rate Adjustment',
        status: 'FAILED',
        error: rateAdjustment.error
      });
    }
    console.log('');

    // Test 7: Multiple Users with Yield
    console.log('👥 TEST 7: MULTIPLE USERS WITH YIELD');
    console.log('===================================');
    
    testResults.total++;
    console.log('Step 7.1: Adding multiple users with different deposits...');
    
    const user2 = Keypair.generate();
    const user3 = Keypair.generate();
    
    const deposit2 = await vaultContract.depositSol(user2.publicKey, 2.0);
    const deposit3 = await vaultContract.depositSol(user3.publicKey, 1.5);
    
    if (deposit2.success && deposit3.success) {
      console.log('✅ Multiple users deposits successful');
      
      // Simulate time passage for yield generation
      const simulatedTime3 = originalTime + (3 * oneDayMs);
      
      // Update user 2 yield
      const user2Key = user2.publicKey.toString();
      vaultContract.vaultState.userLastYieldUpdate.set(user2Key, originalTime);
      const yield2 = vaultContract.calculateUserYieldWithTime(user2.publicKey, simulatedTime3);
      vaultContract.vaultState.userYieldEarned.set(user2Key, yield2);
      vaultContract.vaultState.userLastYieldUpdate.set(user2Key, simulatedTime3);
      
      // Update user 3 yield
      const user3Key = user3.publicKey.toString();
      vaultContract.vaultState.userLastYieldUpdate.set(user3Key, originalTime);
      const yield3 = vaultContract.calculateUserYieldWithTime(user3.publicKey, simulatedTime3);
      vaultContract.vaultState.userYieldEarned.set(user3Key, yield3);
      vaultContract.vaultState.userLastYieldUpdate.set(user3Key, simulatedTime3);
      
      vaultContract.vaultState.lastYieldCalculation = simulatedTime3;
      
      const user2Info = vaultContract.getUserDeposit(user2.publicKey);
      const user3Info = vaultContract.getUserDeposit(user3.publicKey);
      
      console.log(`👤 User 2: ${user2Info.deposit} SOL deposit, ${user2Info.earnedYield.toFixed(6)} SOL yield`);
      console.log(`👤 User 3: ${user3Info.deposit} SOL deposit, ${user3Info.earnedYield.toFixed(6)} SOL yield`);
      
      // Verify yield calculations are proportional to deposits
      const user2ExpectedYield = (user2Info.deposit * newRate * 3) / 365;
      const user3ExpectedYield = (user3Info.deposit * newRate * 3) / 365;
      
      const user2YieldCorrect = Math.abs(user2Info.earnedYield - user2ExpectedYield) < 0.000001;
      const user3YieldCorrect = Math.abs(user3Info.earnedYield - user3ExpectedYield) < 0.000001;
      
      if (user2YieldCorrect && user3YieldCorrect) {
        console.log('✅ Multiple users yield calculations are correct');
        console.log(`📊 User 2 expected: ${user2ExpectedYield.toFixed(6)} SOL, actual: ${user2Info.earnedYield.toFixed(6)} SOL`);
        console.log(`📊 User 3 expected: ${user3ExpectedYield.toFixed(6)} SOL, actual: ${user3Info.earnedYield.toFixed(6)} SOL`);
        testResults.passed++;
        testResults.details.push({
          test: 'Multiple Users with Yield',
          status: 'PASSED',
          user2Deposit: user2Info.deposit,
          user2Yield: user2Info.earnedYield,
          user3Deposit: user3Info.deposit,
          user3Yield: user3Info.earnedYield
        });
      } else {
        console.log('❌ Multiple users yield calculations are incorrect');
        testResults.failed++;
        testResults.details.push({
          test: 'Multiple Users with Yield',
          status: 'FAILED',
          user2Expected: user2ExpectedYield,
          user2Actual: user2Info.earnedYield,
          user3Expected: user3ExpectedYield,
          user3Actual: user3Info.earnedYield
        });
      }
    } else {
      console.log('❌ Multiple users deposits failed');
      testResults.failed++;
      testResults.details.push({
        test: 'Multiple Users with Yield',
        status: 'FAILED',
        user2Success: deposit2.success,
        user3Success: deposit3.success
      });
    }
    console.log('');

    // Test 8: Comprehensive Statistics with Yield
    console.log('📊 TEST 8: COMPREHENSIVE STATISTICS WITH YIELD');
    console.log('==============================================');
    
    testResults.total++;
    console.log('Step 8.1: Getting comprehensive vault statistics...');
    
    const stats = vaultContract.getStatistics();
    
    console.log('📊 Vault Statistics with Yield:');
    console.log(`   Total deposits: ${stats.totalDeposits} SOL`);
    console.log(`   Total users: ${stats.totalUsers}`);
    console.log(`   Total yield generated: ${stats.totalYieldGenerated.toFixed(6)} SOL`);
    console.log(`   Total yield distributed: ${stats.totalYieldDistributed.toFixed(6)} SOL`);
    console.log(`   Average deposit: ${stats.averageDeposit.toFixed(2)} SOL`);
    console.log(`   Largest deposit: ${stats.largestDeposit} SOL`);
    console.log(`   Yield per user: ${stats.yieldPerUser.toFixed(6)} SOL`);
    console.log(`   Current yield rate: ${(stats.yieldRate * 100).toFixed(2)}% APY`);
    
    if (stats.totalYieldDistributed > 0) {
      console.log('✅ Comprehensive statistics with yield are valid');
      testResults.passed++;
      testResults.details.push({
        test: 'Comprehensive Statistics with Yield',
        status: 'PASSED',
        totalYieldGenerated: stats.totalYieldGenerated,
        totalYieldDistributed: stats.totalYieldDistributed,
        yieldPerUser: stats.yieldPerUser,
        apy: (stats.yieldRate * 100).toFixed(2) + '%'
      });
    } else {
      console.log('❌ Comprehensive statistics with yield are invalid');
      testResults.failed++;
      testResults.details.push({
        test: 'Comprehensive Statistics with Yield',
        status: 'FAILED',
        totalYieldGenerated: stats.totalYieldGenerated,
        totalYieldDistributed: stats.totalYieldDistributed
      });
    }
    console.log('');

    // Final Results
    console.log('📋 FINAL YIELD TEST RESULTS');
    console.log('===========================');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    console.log('');

    if (testResults.failed === 0) {
      console.log('🎉 ALL YIELD TESTS PASSED! Yield functionality is working correctly.');
    } else {
      console.log('⚠️  Some yield tests failed. Please review the details above.');
    }

    console.log('\n📝 DETAILED YIELD TEST RESULTS:');
    console.log('================================');
    testResults.details.forEach((detail, index) => {
      const status = detail.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} Test ${index + 1}: ${detail.test} - ${detail.status}`);
      if (detail.error) {
        console.log(`   Error: ${detail.error}`);
      }
    });

    return testResults;

  } catch (error) {
    console.error('❌ Yield test execution failed:', error);
    return {
      total: 1,
      passed: 0,
      failed: 1,
      details: [{
        test: 'Yield Test Execution',
        status: 'FAILED',
        error: error.message
      }]
    };
  }
}

// Run test if called directly
if (require.main === module) {
  testYieldFunctionality().catch(console.error);
}

module.exports = { testYieldFunctionality }; 