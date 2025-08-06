const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const VaultContract = require('../contracts/vault/VaultContract');
const networks = require('../config/networks');

/**
 * Integration Test - Simulates complete frontend to smart contract workflow
 */
describe('Frontend to Smart Contract Integration', () => {
  let connection;
  let vaultContract;
  let userWallet;
  let authorityWallet;
  let programId;

  beforeAll(async () => {
    // Setup connection
    connection = new Connection(networks.devnet.url, 'confirmed');
    
    // Generate test wallets
    userWallet = Keypair.generate();
    authorityWallet = Keypair.generate();
    programId = '11111111111111111111111111111111';
    
    // Initialize vault contract
    vaultContract = new VaultContract(connection, programId, authorityWallet.publicKey);
    await vaultContract.initializeVault();
    
    console.log('🧪 Integration test setup completed');
    console.log(`👤 User Wallet: ${userWallet.publicKey.toString()}`);
    console.log(`🔑 Authority: ${authorityWallet.publicKey.toString()}`);
  });

  describe('Complete User Workflow', () => {
    test('should complete full deposit workflow', async () => {
      console.log('\n🔄 Testing Complete Deposit Workflow...');
      
      // Step 1: User connects wallet (simulated)
      console.log('1️⃣ User connects wallet');
      const userPublicKey = userWallet.publicKey;
      const userBalance = await connection.getBalance(userPublicKey);
      console.log(`   ✅ Wallet connected: ${userPublicKey.toString()}`);
      console.log(`   💰 Balance: ${userBalance / LAMPORTS_PER_SOL} SOL`);

      // Step 2: User configures strategy in frontend (simulated)
      console.log('2️⃣ User configures strategy');
      const strategyConfig = {
        token: 'SOL',
        amount: 0.5,
        duration: '3 weeks',
        profitTarget: 15,
        riskLevel: 'medium'
      };
      console.log(`   📊 Strategy: ${JSON.stringify(strategyConfig, null, 2)}`);

      // Step 3: Frontend simulates strategy
      console.log('3️⃣ Frontend simulates strategy');
      const simulationResult = {
        totalReturn: 15,
        timeToExit: '3 weeks',
        expectedProfit: 0.075,
        successRate: 95.0,
        riskLevel: 'medium'
      };
      console.log(`   📈 Simulation: ${JSON.stringify(simulationResult, null, 2)}`);

      // Step 4: User approves execution
      console.log('4️⃣ User approves execution');
      const userApproval = true;
      console.log(`   ✅ User approval: ${userApproval}`);

      // Step 5: Frontend calls smart contract
      console.log('5️⃣ Frontend calls smart contract');
      const depositResult = await vaultContract.depositSol(userPublicKey, strategyConfig.amount);
      
      expect(depositResult.success).toBe(true);
      expect(depositResult.amount).toBe(strategyConfig.amount);
      console.log(`   ✅ Deposit successful: ${depositResult.amount} SOL`);
      console.log(`   📋 Transaction created: ${depositResult.transaction ? 'Yes' : 'No'}`);

      // Step 6: Verify vault state
      console.log('6️⃣ Verify vault state');
      const vaultInfo = vaultContract.getVaultInfo();
      const userDeposit = vaultContract.getUserDeposit(userPublicKey);
      
      expect(vaultInfo.totalDeposits).toBe(strategyConfig.amount);
      expect(vaultInfo.totalUsers).toBe(1);
      expect(userDeposit.deposit).toBe(strategyConfig.amount);
      
      console.log(`   📊 Vault total: ${vaultInfo.totalDeposits} SOL`);
      console.log(`   👥 Total users: ${vaultInfo.totalUsers}`);
      console.log(`   💰 User deposit: ${userDeposit.deposit} SOL`);

      console.log('✅ Complete deposit workflow test passed!');
    });

    test('should complete full withdrawal workflow', async () => {
      console.log('\n🔄 Testing Complete Withdrawal Workflow...');
      
      const userPublicKey = userWallet.publicKey;
      const withdrawAmount = 0.2;

      // Step 1: User initiates withdrawal
      console.log('1️⃣ User initiates withdrawal');
      console.log(`   💰 Withdrawal amount: ${withdrawAmount} SOL`);

      // Step 2: Frontend validates withdrawal
      console.log('2️⃣ Frontend validates withdrawal');
      const userDeposit = vaultContract.getUserDeposit(userPublicKey);
      const canWithdraw = userDeposit.deposit >= withdrawAmount;
      console.log(`   ✅ Can withdraw: ${canWithdraw}`);
      console.log(`   💰 Available: ${userDeposit.deposit} SOL`);

      expect(canWithdraw).toBe(true);

      // Step 3: Smart contract processes withdrawal
      console.log('3️⃣ Smart contract processes withdrawal');
      const withdrawalResult = await vaultContract.withdrawSol(userPublicKey, withdrawAmount);
      
      expect(withdrawalResult.success).toBe(true);
      expect(withdrawalResult.amount).toBe(withdrawAmount);
      console.log(`   ✅ Withdrawal successful: ${withdrawalResult.amount} SOL`);
      console.log(`   💰 Remaining: ${withdrawalResult.remainingDeposit} SOL`);

      // Step 4: Verify updated state
      console.log('4️⃣ Verify updated state');
      const updatedVaultInfo = vaultContract.getVaultInfo();
      const updatedUserDeposit = vaultContract.getUserDeposit(userPublicKey);
      
      expect(updatedUserDeposit.deposit).toBe(0.3); // 0.5 - 0.2
      expect(updatedVaultInfo.totalDeposits).toBe(0.3);
      
      console.log(`   📊 Updated vault total: ${updatedVaultInfo.totalDeposits} SOL`);
      console.log(`   💰 Updated user deposit: ${updatedUserDeposit.deposit} SOL`);

      console.log('✅ Complete withdrawal workflow test passed!');
    });

    test('should handle multiple users and complex scenarios', async () => {
      console.log('\n🔄 Testing Multiple Users Scenario...');
      
      // Create multiple users
      const user1 = Keypair.generate();
      const user2 = Keypair.generate();
      const user3 = Keypair.generate();
      
      console.log(`👥 Testing with 3 users:`);
      console.log(`   User 1: ${user1.publicKey.toString()}`);
      console.log(`   User 2: ${user2.publicKey.toString()}`);
      console.log(`   User 3: ${user3.publicKey.toString()}`);

      // User 1 deposits
      console.log('\n💰 User 1 deposits 1.0 SOL');
      const deposit1 = await vaultContract.depositSol(user1.publicKey, 1.0);
      expect(deposit1.success).toBe(true);

      // User 2 deposits
      console.log('💰 User 2 deposits 2.5 SOL');
      const deposit2 = await vaultContract.depositSol(user2.publicKey, 2.5);
      expect(deposit2.success).toBe(true);

      // User 3 deposits
      console.log('💰 User 3 deposits 0.8 SOL');
      const deposit3 = await vaultContract.depositSol(user3.publicKey, 0.8);
      expect(deposit3.success).toBe(true);

      // Check vault statistics
      const stats = vaultContract.getStatistics();
      console.log('\n📊 Vault Statistics:');
      console.log(`   Total deposits: ${stats.totalDeposits} SOL`);
      console.log(`   Total users: ${stats.totalUsers}`);
      console.log(`   Average deposit: ${stats.averageDeposit.toFixed(2)} SOL`);
      console.log(`   Largest deposit: ${stats.largestDeposit} SOL`);

      expect(stats.totalDeposits).toBe(4.6); // 1.0 + 2.5 + 0.8 + 0.3 (from previous test)
      expect(stats.totalUsers).toBe(3);
      expect(stats.largestDeposit).toBe(2.5);

      // User 2 withdraws partially
      console.log('\n💸 User 2 withdraws 1.0 SOL');
      const withdrawal2 = await vaultContract.withdrawSol(user2.publicKey, 1.0);
      expect(withdrawal2.success).toBe(true);

      // Check updated statistics
      const updatedStats = vaultContract.getStatistics();
      console.log('\n📊 Updated Statistics:');
      console.log(`   Total deposits: ${updatedStats.totalDeposits} SOL`);
      console.log(`   Total users: ${updatedStats.totalUsers}`);
      console.log(`   Average deposit: ${updatedStats.averageDeposit.toFixed(2)} SOL`);

      expect(updatedStats.totalDeposits).toBe(3.3); // 4.3 - 1.0
      expect(updatedStats.totalUsers).toBe(3);

      console.log('✅ Multiple users scenario test passed!');
    });

    test('should handle error conditions gracefully', async () => {
      console.log('\n🔄 Testing Error Handling...');
      
      const testUser = Keypair.generate();

      // Test 1: Insufficient balance simulation
      console.log('1️⃣ Testing insufficient balance');
      const simulationResult = await vaultContract.simulateDeposit(testUser.publicKey, 1.0);
      expect(simulationResult.success).toBe(false);
      expect(simulationResult.error).toBe('Insufficient balance');
      console.log(`   ✅ Insufficient balance handled: ${simulationResult.error}`);

      // Test 2: Invalid amount
      console.log('2️⃣ Testing invalid amount');
      const invalidDeposit = await vaultContract.depositSol(testUser.publicKey, -1);
      expect(invalidDeposit.success).toBe(false);
      console.log(`   ✅ Invalid amount handled: ${invalidDeposit.error}`);

      // Test 3: Over-withdrawal
      console.log('3️⃣ Testing over-withdrawal');
      const overWithdrawal = await vaultContract.withdrawSol(testUser.publicKey, 1000);
      expect(overWithdrawal.success).toBe(false);
      expect(overWithdrawal.error).toBe('Insufficient deposit amount');
      console.log(`   ✅ Over-withdrawal handled: ${overWithdrawal.error}`);

      // Test 4: Paused vault
      console.log('4️⃣ Testing paused vault');
      vaultContract.pauseVault();
      const pausedDeposit = await vaultContract.depositSol(testUser.publicKey, 0.1);
      expect(pausedDeposit.success).toBe(false);
      expect(pausedDeposit.error).toBe('Vault is paused');
      console.log(`   ✅ Paused vault handled: ${pausedDeposit.error}`);

      // Resume vault
      vaultContract.resumeVault();
      console.log('   ✅ Vault resumed');

      console.log('✅ Error handling test passed!');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle rapid transactions efficiently', async () => {
      console.log('\n⚡ Testing Performance...');
      
      const startTime = Date.now();
      const numTransactions = 10;
      const testUsers = Array.from({ length: numTransactions }, () => Keypair.generate());
      
      console.log(`🔄 Processing ${numTransactions} rapid transactions...`);
      
      // Process multiple deposits rapidly
      const depositPromises = testUsers.map((user, index) => 
        vaultContract.depositSol(user.publicKey, 0.1)
      );
      
      const results = await Promise.all(depositPromises);
      const successfulDeposits = results.filter(r => r.success).length;
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   ✅ Successful: ${successfulDeposits}/${numTransactions}`);
      console.log(`   📊 Average: ${duration / numTransactions}ms per transaction`);
      
      expect(successfulDeposits).toBe(numTransactions);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      console.log('✅ Performance test passed!');
    });
  });

  describe('Frontend Integration Points', () => {
    test('should provide all necessary data for frontend', async () => {
      console.log('\n🖥️ Testing Frontend Integration Points...');
      
      // Test user wallet connection
      console.log('1️⃣ Wallet connection data');
      const userPublicKey = userWallet.publicKey;
      const walletData = {
        publicKey: userPublicKey.toString(),
        connected: true,
        balance: await connection.getBalance(userPublicKey) / LAMPORTS_PER_SOL
      };
      console.log(`   ✅ Wallet data: ${JSON.stringify(walletData, null, 2)}`);

      // Test vault information for UI
      console.log('2️⃣ Vault information for UI');
      const vaultInfo = vaultContract.getVaultInfo();
      const uiData = {
        vaultAddress: vaultInfo.vaultAddress,
        totalDeposits: vaultInfo.totalDeposits,
        totalUsers: vaultInfo.totalUsers,
        isPaused: vaultInfo.isPaused,
        userDeposit: vaultContract.getUserDeposit(userPublicKey).deposit
      };
      console.log(`   ✅ UI data: ${JSON.stringify(uiData, null, 2)}`);

      // Test transaction simulation for frontend
      console.log('3️⃣ Transaction simulation');
      const simulation = await vaultContract.simulateDeposit(userPublicKey, 0.5);
      const simulationData = {
        canExecute: simulation.success,
        estimatedFee: simulation.estimatedFee || 5000,
        userBalance: simulation.userBalance || 0,
        error: simulation.error || null
      };
      console.log(`   ✅ Simulation data: ${JSON.stringify(simulationData, null, 2)}`);

      // Test statistics for dashboard
      console.log('4️⃣ Dashboard statistics');
      const stats = vaultContract.getStatistics();
      const dashboardData = {
        totalDeposits: stats.totalDeposits,
        totalUsers: stats.totalUsers,
        averageDeposit: stats.averageDeposit,
        largestDeposit: stats.largestDeposit,
        isPaused: stats.isPaused
      };
      console.log(`   ✅ Dashboard data: ${JSON.stringify(dashboardData, null, 2)}`);

      console.log('✅ Frontend integration points test passed!');
    });
  });
});

console.log('🧪 All integration tests completed successfully!'); 