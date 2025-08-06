#!/usr/bin/env node

const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const VaultContract = require('../contracts/vault/VaultContract');
const networks = require('../config/networks');

/**
 * Comprehensive Smart Contract Testing with Detailed Status Reporting
 */
async function testSmartContracts() {
  console.log('🧪 COMPREHENSIVE SMART CONTRACT TESTING');
  console.log('========================================\n');

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
    console.log(`🏦 Program ID: ${programId}`);
    
    const vaultContract = new VaultContract(connection, programId, authorityWallet.publicKey);
    console.log('✅ Vault contract instance created\n');

    // Test 1: Vault Initialization
    console.log('🏦 TEST 1: VAULT INITIALIZATION');
    console.log('===============================');
    
    testResults.total++;
    console.log('Step 1.1: Initializing vault...');
    const initResult = await vaultContract.initializeVault();
    
    if (initResult.success) {
      console.log('✅ Vault initialized successfully');
      console.log(`📋 Vault Address: ${initResult.vaultAddress}`);
      console.log(`📝 Message: ${initResult.message}`);
      testResults.passed++;
      testResults.details.push({
        test: 'Vault Initialization',
        status: 'PASSED',
        vaultAddress: initResult.vaultAddress
      });
    } else {
      console.log('❌ Vault initialization failed');
      console.log(`📝 Error: ${initResult.error}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Vault Initialization',
        status: 'FAILED',
        error: initResult.error
      });
    }
    console.log('');

    // Test 2: Initial Vault State
    console.log('📊 TEST 2: INITIAL VAULT STATE');
    console.log('==============================');
    
    testResults.total++;
    console.log('Step 2.1: Checking initial vault state...');
    const initialVaultInfo = vaultContract.getVaultInfo();
    
    const expectedInitialState = {
      totalDeposits: 0,
      totalUsers: 0,
      isPaused: false
    };
    
    const stateCheck = 
      initialVaultInfo.totalDeposits === expectedInitialState.totalDeposits &&
      initialVaultInfo.totalUsers === expectedInitialState.totalUsers &&
      initialVaultInfo.isPaused === expectedInitialState.isPaused;
    
    if (stateCheck) {
      console.log('✅ Initial vault state is correct');
      console.log(`📊 Total deposits: ${initialVaultInfo.totalDeposits} SOL`);
      console.log(`👥 Total users: ${initialVaultInfo.totalUsers}`);
      console.log(`⏸️ Is paused: ${initialVaultInfo.isPaused}`);
      testResults.passed++;
      testResults.details.push({
        test: 'Initial Vault State',
        status: 'PASSED',
        totalDeposits: initialVaultInfo.totalDeposits,
        totalUsers: initialVaultInfo.totalUsers,
        isPaused: initialVaultInfo.isPaused
      });
    } else {
      console.log('❌ Initial vault state is incorrect');
      console.log(`Expected: ${JSON.stringify(expectedInitialState)}`);
      console.log(`Actual: ${JSON.stringify(initialVaultInfo)}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Initial Vault State',
        status: 'FAILED',
        expected: expectedInitialState,
        actual: initialVaultInfo
      });
    }
    console.log('');

    // Test 3: Deposit Simulation
    console.log('💰 TEST 3: DEPOSIT SIMULATION');
    console.log('============================');
    
    testResults.total++;
    console.log('Step 3.1: Simulating deposit without execution...');
    const simulationResult = await vaultContract.simulateDeposit(testUser.publicKey, 1.0);
    
    if (!simulationResult.success) {
      console.log('✅ Deposit simulation correctly failed (expected)');
      console.log(`📝 Reason: ${simulationResult.error}`);
      console.log(`💰 Required: ${simulationResult.required || 'N/A'} lamports`);
      console.log(`💰 Available: ${simulationResult.available || 'N/A'} lamports`);
      testResults.passed++;
      testResults.details.push({
        test: 'Deposit Simulation',
        status: 'PASSED',
        reason: simulationResult.error,
        expected: 'Should fail due to insufficient balance'
      });
    } else {
      console.log('❌ Deposit simulation unexpectedly succeeded');
      testResults.failed++;
      testResults.details.push({
        test: 'Deposit Simulation',
        status: 'FAILED',
        reason: 'Should have failed due to insufficient balance'
      });
    }
    console.log('');

    // Test 4: First Deposit
    console.log('💳 TEST 4: FIRST DEPOSIT');
    console.log('========================');
    
    testResults.total++;
    console.log('Step 4.1: Processing first deposit...');
    const depositAmount = 0.5;
    const depositResult = await vaultContract.depositSol(testUser.publicKey, depositAmount);
    
    if (depositResult.success) {
      console.log('✅ First deposit successful');
      console.log(`💰 Amount: ${depositResult.amount} SOL`);
      console.log(`🔢 Lamports: ${depositResult.lamports}`);
      console.log(`👤 User deposit: ${depositResult.userDeposit} SOL`);
      console.log(`📊 Total deposits: ${depositResult.totalDeposits} SOL`);
      console.log(`📋 Transaction created: ${depositResult.transaction ? 'Yes' : 'No'}`);
      testResults.passed++;
      testResults.details.push({
        test: 'First Deposit',
        status: 'PASSED',
        amount: depositResult.amount,
        userDeposit: depositResult.userDeposit,
        totalDeposits: depositResult.totalDeposits
      });
    } else {
      console.log('❌ First deposit failed');
      console.log(`📝 Error: ${depositResult.error}`);
      testResults.failed++;
      testResults.details.push({
        test: 'First Deposit',
        status: 'FAILED',
        error: depositResult.error
      });
    }
    console.log('');

    // Test 5: Vault State After First Deposit
    console.log('📊 TEST 5: VAULT STATE AFTER FIRST DEPOSIT');
    console.log('==========================================');
    
    testResults.total++;
    console.log('Step 5.1: Checking vault state after first deposit...');
    const vaultInfoAfterDeposit = vaultContract.getVaultInfo();
    const userDepositAfterFirst = vaultContract.getUserDeposit(testUser.publicKey);
    
    const expectedStateAfterDeposit = {
      totalDeposits: depositAmount,
      totalUsers: 1,
      isPaused: false
    };
    
    const stateCheckAfterDeposit = 
      vaultInfoAfterDeposit.totalDeposits === expectedStateAfterDeposit.totalDeposits &&
      vaultInfoAfterDeposit.totalUsers === expectedStateAfterDeposit.totalUsers &&
      userDepositAfterFirst.deposit === depositAmount;
    
    if (stateCheckAfterDeposit) {
      console.log('✅ Vault state after first deposit is correct');
      console.log(`📊 Total deposits: ${vaultInfoAfterDeposit.totalDeposits} SOL`);
      console.log(`👥 Total users: ${vaultInfoAfterDeposit.totalUsers}`);
      console.log(`👤 User deposit: ${userDepositAfterFirst.deposit} SOL`);
      testResults.passed++;
      testResults.details.push({
        test: 'Vault State After First Deposit',
        status: 'PASSED',
        totalDeposits: vaultInfoAfterDeposit.totalDeposits,
        totalUsers: vaultInfoAfterDeposit.totalUsers,
        userDeposit: userDepositAfterFirst.deposit
      });
    } else {
      console.log('❌ Vault state after first deposit is incorrect');
      console.log(`Expected: ${JSON.stringify(expectedStateAfterDeposit)}`);
      console.log(`Actual: ${JSON.stringify(vaultInfoAfterDeposit)}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Vault State After First Deposit',
        status: 'FAILED',
        expected: expectedStateAfterDeposit,
        actual: vaultInfoAfterDeposit
      });
    }
    console.log('');

    // Test 6: Second Deposit (Same User)
    console.log('💳 TEST 6: SECOND DEPOSIT (SAME USER)');
    console.log('=====================================');
    
    testResults.total++;
    console.log('Step 6.1: Processing second deposit from same user...');
    const secondDepositAmount = 0.3;
    const secondDepositResult = await vaultContract.depositSol(testUser.publicKey, secondDepositAmount);
    
    if (secondDepositResult.success) {
      console.log('✅ Second deposit successful');
      console.log(`💰 Amount: ${secondDepositResult.amount} SOL`);
      console.log(`👤 User deposit: ${secondDepositResult.userDeposit} SOL`);
      console.log(`📊 Total deposits: ${secondDepositResult.totalDeposits} SOL`);
      testResults.passed++;
      testResults.details.push({
        test: 'Second Deposit (Same User)',
        status: 'PASSED',
        amount: secondDepositResult.amount,
        userDeposit: secondDepositResult.userDeposit,
        totalDeposits: secondDepositResult.totalDeposits
      });
    } else {
      console.log('❌ Second deposit failed');
      console.log(`📝 Error: ${secondDepositResult.error}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Second Deposit (Same User)',
        status: 'FAILED',
        error: secondDepositResult.error
      });
    }
    console.log('');

    // Test 7: Multiple Users
    console.log('👥 TEST 7: MULTIPLE USERS');
    console.log('=========================');
    
    testResults.total++;
    console.log('Step 7.1: Adding deposits from multiple users...');
    
    const user2 = Keypair.generate();
    const user3 = Keypair.generate();
    
    console.log(`👤 User 2: ${user2.publicKey.toString()}`);
    console.log(`👤 User 3: ${user3.publicKey.toString()}`);
    
    const deposit2 = await vaultContract.depositSol(user2.publicKey, 1.0);
    const deposit3 = await vaultContract.depositSol(user3.publicKey, 0.8);
    
    const multipleUsersSuccess = deposit2.success && deposit3.success;
    
    if (multipleUsersSuccess) {
      console.log('✅ Multiple users deposits successful');
      console.log(`💰 User 2 deposit: ${deposit2.userDeposit} SOL`);
      console.log(`💰 User 3 deposit: ${deposit3.userDeposit} SOL`);
      console.log(`📊 Total deposits: ${deposit3.totalDeposits} SOL`);
      console.log(`👥 Total users: ${vaultContract.getVaultInfo().totalUsers}`);
      testResults.passed++;
      testResults.details.push({
        test: 'Multiple Users',
        status: 'PASSED',
        user2Deposit: deposit2.userDeposit,
        user3Deposit: deposit3.userDeposit,
        totalDeposits: deposit3.totalDeposits,
        totalUsers: vaultContract.getVaultInfo().totalUsers
      });
    } else {
      console.log('❌ Multiple users deposits failed');
      console.log(`User 2: ${deposit2.success ? 'Success' : 'Failed'}`);
      console.log(`User 3: ${deposit3.success ? 'Success' : 'Failed'}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Multiple Users',
        status: 'FAILED',
        user2Success: deposit2.success,
        user3Success: deposit3.success
      });
    }
    console.log('');

    // Test 8: Partial Withdrawal
    console.log('💸 TEST 8: PARTIAL WITHDRAWAL');
    console.log('=============================');
    
    testResults.total++;
    console.log('Step 8.1: Processing partial withdrawal...');
    const withdrawAmount = 0.2;
    const withdrawalResult = await vaultContract.withdrawSol(testUser.publicKey, withdrawAmount);
    
    if (withdrawalResult.success) {
      console.log('✅ Partial withdrawal successful');
      console.log(`💰 Amount: ${withdrawalResult.amount} SOL`);
      console.log(`💰 Remaining: ${withdrawalResult.remainingDeposit} SOL`);
      console.log(`📊 Total deposits: ${withdrawalResult.totalDeposits} SOL`);
      testResults.passed++;
      testResults.details.push({
        test: 'Partial Withdrawal',
        status: 'PASSED',
        amount: withdrawalResult.amount,
        remaining: withdrawalResult.remainingDeposit,
        totalDeposits: withdrawalResult.totalDeposits
      });
    } else {
      console.log('❌ Partial withdrawal failed');
      console.log(`📝 Error: ${withdrawalResult.error}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Partial Withdrawal',
        status: 'FAILED',
        error: withdrawalResult.error
      });
    }
    console.log('');

    // Test 9: Over-Withdrawal Prevention
    console.log('🚫 TEST 9: OVER-WITHDRAWAL PREVENTION');
    console.log('=====================================');
    
    testResults.total++;
    console.log('Step 9.1: Attempting over-withdrawal...');
    const overWithdrawAmount = 1000; // Much more than available
    const overWithdrawalResult = await vaultContract.withdrawSol(testUser.publicKey, overWithdrawAmount);
    
    if (!overWithdrawalResult.success) {
      console.log('✅ Over-withdrawal correctly prevented');
      console.log(`📝 Error: ${overWithdrawalResult.error}`);
      testResults.passed++;
      testResults.details.push({
        test: 'Over-Withdrawal Prevention',
        status: 'PASSED',
        error: overWithdrawalResult.error,
        expected: 'Should fail due to insufficient deposit'
      });
    } else {
      console.log('❌ Over-withdrawal unexpectedly succeeded');
      testResults.failed++;
      testResults.details.push({
        test: 'Over-Withdrawal Prevention',
        status: 'FAILED',
        reason: 'Should have failed due to insufficient deposit'
      });
    }
    console.log('');

    // Test 10: Full Withdrawal
    console.log('💸 TEST 10: FULL WITHDRAWAL');
    console.log('===========================');
    
    testResults.total++;
    console.log('Step 10.1: Processing full withdrawal...');
    const currentUserDeposit = vaultContract.getUserDeposit(testUser.publicKey).deposit;
    const fullWithdrawalResult = await vaultContract.withdrawSol(testUser.publicKey, currentUserDeposit);
    
    if (fullWithdrawalResult.success) {
      console.log('✅ Full withdrawal successful');
      console.log(`💰 Amount: ${fullWithdrawalResult.amount} SOL`);
      console.log(`💰 Remaining: ${fullWithdrawalResult.remainingDeposit} SOL`);
      console.log(`📊 Total deposits: ${fullWithdrawalResult.totalDeposits} SOL`);
      testResults.passed++;
      testResults.details.push({
        test: 'Full Withdrawal',
        status: 'PASSED',
        amount: fullWithdrawalResult.amount,
        remaining: fullWithdrawalResult.remainingDeposit,
        totalDeposits: fullWithdrawalResult.totalDeposits
      });
    } else {
      console.log('❌ Full withdrawal failed');
      console.log(`📝 Error: ${fullWithdrawalResult.error}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Full Withdrawal',
        status: 'FAILED',
        error: fullWithdrawalResult.error
      });
    }
    console.log('');

    // Test 11: Pause Functionality
    console.log('⏸️ TEST 11: PAUSE FUNCTIONALITY');
    console.log('===============================');
    
    testResults.total++;
    console.log('Step 11.1: Pausing vault...');
    const pauseResult = vaultContract.pauseVault();
    
    if (pauseResult.success) {
      console.log('✅ Vault paused successfully');
      console.log(`📝 Message: ${pauseResult.message}`);
      
      console.log('Step 11.2: Attempting deposit while paused...');
      const pausedDepositResult = await vaultContract.depositSol(testUser.publicKey, 0.1);
      
      if (!pausedDepositResult.success) {
        console.log('✅ Deposit correctly blocked while paused');
        console.log(`📝 Error: ${pausedDepositResult.error}`);
        
        console.log('Step 11.3: Resuming vault...');
        const resumeResult = vaultContract.resumeVault();
        
        if (resumeResult.success) {
          console.log('✅ Vault resumed successfully');
          console.log(`📝 Message: ${resumeResult.message}`);
          testResults.passed++;
          testResults.details.push({
            test: 'Pause Functionality',
            status: 'PASSED',
            pauseMessage: pauseResult.message,
            resumeMessage: resumeResult.message
          });
        } else {
          console.log('❌ Vault resume failed');
          console.log(`📝 Error: ${resumeResult.error}`);
          testResults.failed++;
          testResults.details.push({
            test: 'Pause Functionality',
            status: 'FAILED',
            error: resumeResult.error
          });
        }
      } else {
        console.log('❌ Deposit allowed while paused');
        testResults.failed++;
        testResults.details.push({
          test: 'Pause Functionality',
          status: 'FAILED',
          reason: 'Deposit should have been blocked while paused'
        });
      }
    } else {
      console.log('❌ Vault pause failed');
      console.log(`📝 Error: ${pauseResult.error}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Pause Functionality',
        status: 'FAILED',
        error: pauseResult.error
      });
    }
    console.log('');

    // Test 12: Statistics
    console.log('📊 TEST 12: VAULT STATISTICS');
    console.log('============================');
    
    testResults.total++;
    console.log('Step 12.1: Getting vault statistics...');
    const stats = vaultContract.getStatistics();
    
    console.log('📊 Vault Statistics:');
    console.log(`   Total deposits: ${stats.totalDeposits} SOL`);
    console.log(`   Total users: ${stats.totalUsers}`);
    console.log(`   Average deposit: ${stats.averageDeposit.toFixed(2)} SOL`);
    console.log(`   Largest deposit: ${stats.largestDeposit} SOL`);
    console.log(`   Is paused: ${stats.isPaused}`);
    console.log(`   Vault address: ${stats.vaultAddress}`);
    
    if (stats.totalDeposits > 0 && stats.totalUsers > 0) {
      console.log('✅ Vault statistics are valid');
      testResults.passed++;
      testResults.details.push({
        test: 'Vault Statistics',
        status: 'PASSED',
        totalDeposits: stats.totalDeposits,
        totalUsers: stats.totalUsers,
        averageDeposit: stats.averageDeposit,
        largestDeposit: stats.largestDeposit
      });
    } else {
      console.log('❌ Vault statistics are invalid');
      testResults.failed++;
      testResults.details.push({
        test: 'Vault Statistics',
        status: 'FAILED',
        reason: 'Statistics should show deposits and users'
      });
    }
    console.log('');

    // Test 13: Emergency Functions
    console.log('🚨 TEST 13: EMERGENCY FUNCTIONS');
    console.log('===============================');
    
    testResults.total++;
    console.log('Step 13.1: Testing emergency withdrawal...');
    const emergencyDestination = Keypair.generate();
    const emergencyResult = await vaultContract.emergencyWithdraw(emergencyDestination.publicKey);
    
    if (emergencyResult.success) {
      console.log('✅ Emergency withdrawal successful');
      console.log(`💰 Amount: ${emergencyResult.amount} SOL`);
      console.log(`🎯 Destination: ${emergencyResult.destination}`);
      testResults.passed++;
      testResults.details.push({
        test: 'Emergency Functions',
        status: 'PASSED',
        amount: emergencyResult.amount,
        destination: emergencyResult.destination
      });
    } else {
      console.log('❌ Emergency withdrawal failed');
      console.log(`📝 Error: ${emergencyResult.error}`);
      testResults.failed++;
      testResults.details.push({
        test: 'Emergency Functions',
        status: 'FAILED',
        error: emergencyResult.error
      });
    }
    console.log('');

    // Final Results
    console.log('📋 FINAL TEST RESULTS');
    console.log('=====================');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    console.log('');

    if (testResults.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Smart contracts are working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the details above.');
    }

    console.log('\n📝 DETAILED TEST RESULTS:');
    console.log('========================');
    testResults.details.forEach((detail, index) => {
      const status = detail.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} Test ${index + 1}: ${detail.test} - ${detail.status}`);
      if (detail.error) {
        console.log(`   Error: ${detail.error}`);
      }
    });

    return testResults;

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return {
      total: 1,
      passed: 0,
      failed: 1,
      details: [{
        test: 'Test Execution',
        status: 'FAILED',
        error: error.message
      }]
    };
  }
}

// Run test if called directly
if (require.main === module) {
  testSmartContracts().catch(console.error);
}

module.exports = { testSmartContracts }; 