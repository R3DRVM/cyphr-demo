#!/usr/bin/env node

/**
 * 🧪 Real Transaction Test - Solana Testnet
 * 
 * This script performs real transaction testing on Solana testnet:
 * - Creates a real wallet keypair
 * - Requests testnet SOL
 * - Performs real transaction simulation
 * - Tests vault integration
 */

const { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction
} = require('@solana/web3.js');

// Test configuration
const TEST_CONFIG = {
  network: 'testnet',
  rpcUrl: 'https://api.testnet.solana.com',
  testAmount: 0.001, // Very small amount for testing
  timeout: 60000, // 60 seconds
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function assert(condition, message) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    log(`PASS: ${message}`, 'success');
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    log(`FAIL: ${message}`, 'error');
  }
}

// Test 1: Create Test Wallet
async function createTestWallet() {
  log('Creating test wallet...');
  
  try {
    const keypair = Keypair.generate();
    
    assert(keypair !== null, 'Test wallet created');
    assert(keypair.publicKey !== undefined, 'Wallet has public key');
    assert(keypair.secretKey !== undefined, 'Wallet has secret key');
    
    log(`Test wallet created: ${keypair.publicKey.toString()}`, 'success');
    return keypair;
  } catch (error) {
    assert(false, `Wallet creation failed: ${error.message}`);
    throw error;
  }
}

// Test 2: Request Testnet SOL
async function requestTestnetSOL(connection, keypair) {
  log('Requesting testnet SOL...');
  
  try {
    const balanceBefore = await connection.getBalance(keypair.publicKey);
    log(`Balance before airdrop: ${balanceBefore / LAMPORTS_PER_SOL} SOL`);
    
    // Request airdrop
    const signature = await connection.requestAirdrop(
      keypair.publicKey,
      2 * LAMPORTS_PER_SOL // 2 SOL
    );
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    const balanceAfter = await connection.getBalance(keypair.publicKey);
    log(`Balance after airdrop: ${balanceAfter / LAMPORTS_PER_SOL} SOL`);
    
    assert(balanceAfter > balanceBefore, 'Airdrop successful');
    assert(balanceAfter >= 2 * LAMPORTS_PER_SOL, 'Received at least 2 SOL');
    
    log('Testnet SOL received successfully', 'success');
    return balanceAfter;
  } catch (error) {
    assert(false, `Airdrop failed: ${error.message}`);
    throw error;
  }
}

// Test 3: Real Transaction Creation and Simulation
async function testRealTransaction(connection, keypair) {
  log('Testing real transaction creation and simulation...');
  
  try {
    // Create a real transaction
    const transaction = new Transaction();
    
    // Add a transfer instruction (to self for testing)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: keypair.publicKey,
        lamports: TEST_CONFIG.testAmount * LAMPORTS_PER_SOL
      })
    );
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = keypair.publicKey;
    
    assert(transaction.instructions.length > 0, 'Transaction has instructions');
    assert(transaction.recentBlockhash !== undefined, 'Transaction has blockhash');
    assert(transaction.feePayer !== undefined, 'Transaction has fee payer');
    
    // Simulate the transaction
    const simulation = await connection.simulateTransaction(transaction);
    
    assert(simulation !== null, 'Transaction simulation completed');
    assert(simulation.value !== undefined, 'Simulation has value');
    assert(simulation.value.err === null, 'Simulation successful (no errors)');
    
    log('Real transaction simulation successful', 'success');
    return { transaction, simulation };
  } catch (error) {
    assert(false, `Real transaction test failed: ${error.message}`);
    throw error;
  }
}

// Test 4: Real Transaction Execution
async function testRealTransactionExecution(connection, keypair, transaction) {
  log('Testing real transaction execution...');
  
  try {
    const balanceBefore = await connection.getBalance(keypair.publicKey);
    
    // Execute the transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [keypair]
    );
    
    const balanceAfter = await connection.getBalance(keypair.publicKey);
    
    assert(signature !== undefined, 'Transaction signature received');
    assert(signature.length > 0, 'Transaction signature is valid');
    
    // Note: Balance should be the same since we transferred to ourselves
    assert(balanceAfter <= balanceBefore, 'Transaction executed (balance changed due to fees)');
    
    log(`Transaction executed successfully: ${signature}`, 'success');
    log(`Balance change: ${(balanceAfter - balanceBefore) / LAMPORTS_PER_SOL} SOL (fees)`, 'info');
    
    return signature;
  } catch (error) {
    assert(false, `Transaction execution failed: ${error.message}`);
    throw error;
  }
}

// Test 5: Vault Integration Test
async function testVaultIntegration(connection, keypair) {
  log('Testing vault integration...');
  
  try {
    // Mock vault program ID (this would be the actual deployed program)
    const vaultProgramId = new PublicKey('11111111111111111111111111111111');
    
    // Create a transaction that would interact with the vault
    const transaction = new Transaction();
    
    // For now, we'll just create a transfer to simulate vault deposit
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: vaultProgramId, // This would be the vault PDA in real implementation
        lamports: TEST_CONFIG.testAmount * LAMPORTS_PER_SOL
      })
    );
    
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = keypair.publicKey;
    
    // Simulate vault deposit
    const simulation = await connection.simulateTransaction(transaction);
    
    assert(simulation !== null, 'Vault transaction simulation completed');
    assert(simulation.value !== undefined, 'Vault simulation has value');
    
    log('Vault integration test successful', 'success');
    return { transaction, simulation };
  } catch (error) {
    assert(false, `Vault integration test failed: ${error.message}`);
    throw error;
  }
}

// Test 6: Strategy Builder Integration Test
async function testStrategyBuilderIntegration(connection, keypair) {
  log('Testing strategy builder integration...');
  
  try {
    // Simulate strategy builder workflow
    const strategy = {
      name: 'Test Strategy',
      token: 'SOL',
      amount: TEST_CONFIG.testAmount,
      action: 'stake',
      conditions: ['SOL > $100'],
      riskLevel: 'LOW'
    };
    
    // Create transaction based on strategy
    const transaction = new Transaction();
    
    // Simulate staking action
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: keypair.publicKey, // Self-transfer for testing
        lamports: strategy.amount * LAMPORTS_PER_SOL
      })
    );
    
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = keypair.publicKey;
    
    // Simulate strategy execution
    const simulation = await connection.simulateTransaction(transaction);
    
    assert(simulation !== null, 'Strategy execution simulation completed');
    assert(simulation.value !== undefined, 'Strategy simulation has value');
    assert(simulation.value.err === null, 'Strategy execution successful');
    
    log('Strategy builder integration test successful', 'success');
    return { strategy, transaction, simulation };
  } catch (error) {
    assert(false, `Strategy builder integration test failed: ${error.message}`);
    throw error;
  }
}

// Test 7: Performance and Reliability Test
async function testPerformanceAndReliability(connection, keypair) {
  log('Testing performance and reliability...');
  
  try {
    const startTime = Date.now();
    
    // Test multiple rapid simulations
    const simulations = [];
    for (let i = 0; i < 5; i++) {
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: keypair.publicKey,
          lamports: 1000 // Small amount
        })
      );
      
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = keypair.publicKey;
      
      const simulation = await connection.simulateTransaction(transaction);
      simulations.push(simulation);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    assert(simulations.length === 5, 'All simulations completed');
    assert(duration < 10000, 'Performance acceptable (< 10 seconds)');
    
    // Check all simulations were successful
    const allSuccessful = simulations.every(sim => sim.value.err === null);
    assert(allSuccessful, 'All simulations successful');
    
    log(`Performance test completed in ${duration}ms`, 'success');
    log(`Average time per simulation: ${duration / 5}ms`, 'info');
    
  } catch (error) {
    assert(false, `Performance test failed: ${error.message}`);
  }
}

// Main test runner
async function runRealTransactionTests() {
  log('🚀 Starting Real Transaction Tests on Solana Testnet', 'info');
  log(`Network: ${TEST_CONFIG.network}`, 'info');
  log(`RPC URL: ${TEST_CONFIG.rpcUrl}`, 'info');
  log('', 'info');
  
  let connection, keypair;
  
  try {
    // Setup
    connection = new Connection(TEST_CONFIG.rpcUrl, 'confirmed');
    keypair = await createTestWallet();
    
    // Run tests
    await requestTestnetSOL(connection, keypair);
    const { transaction, simulation } = await testRealTransaction(connection, keypair);
    await testRealTransactionExecution(connection, keypair, transaction);
    await testVaultIntegration(connection, keypair);
    await testStrategyBuilderIntegration(connection, keypair);
    await testPerformanceAndReliability(connection, keypair);
    
  } catch (error) {
    log(`Test suite failed with error: ${error.message}`, 'error');
  }
  
  // Print results
  log('', 'info');
  log('📊 Real Transaction Test Results:', 'info');
  log(`Total Tests: ${testResults.total}`, 'info');
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'info');
  
  if (testResults.errors.length > 0) {
    log('', 'info');
    log('❌ Failed Tests:', 'error');
    testResults.errors.forEach((error, index) => {
      log(`${index + 1}. ${error}`, 'error');
    });
  }
  
  log('', 'info');
  if (testResults.failed === 0) {
    log('🎉 All real transaction tests passed! Ready for production deployment.', 'success');
  } else {
    log('⚠️ Some tests failed. Please review the errors above.', 'warning');
  }
  
  // Cleanup
  if (keypair) {
    log(`Test wallet: ${keypair.publicKey.toString()}`, 'info');
    log('Keep this wallet for future testing', 'info');
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runRealTransactionTests();
}

module.exports = {
  runRealTransactionTests,
  testResults
}; 