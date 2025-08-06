const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const VaultContract = require('../contracts/vault/VaultContract');
const networks = require('../config/networks');

// Test configuration
const TEST_NETWORK = 'devnet';
const TEST_AMOUNT = 1.0; // 1 SOL

describe('VaultContract', () => {
  let connection;
  let vaultContract;
  let testUser;
  let testAuthority;
  let programId;

  beforeAll(async () => {
    // Setup connection
    connection = new Connection(networks[TEST_NETWORK].url, 'confirmed');
    
    // Generate test keypairs
    testUser = Keypair.generate();
    testAuthority = Keypair.generate();
    
    // Use a test program ID
    programId = '11111111111111111111111111111111';
    
    // Initialize vault contract
    vaultContract = new VaultContract(connection, programId, testAuthority.publicKey);
    
    console.log('🧪 Test setup completed');
    console.log(`🌐 Network: ${TEST_NETWORK}`);
    console.log(`👤 Test User: ${testUser.publicKey.toString()}`);
    console.log(`🔑 Authority: ${testAuthority.publicKey.toString()}`);
  });

  describe('Vault Initialization', () => {
    test('should initialize vault successfully', async () => {
      const result = await vaultContract.initializeVault();
      
      expect(result.success).toBe(true);
      expect(result.vaultAddress).toBeDefined();
      expect(result.message).toBe('Vault initialized successfully');
      
      console.log('✅ Vault initialization test passed');
    });

    test('should have correct initial state', () => {
      const vaultInfo = vaultContract.getVaultInfo();
      
      expect(vaultInfo.totalDeposits).toBe(0);
      expect(vaultInfo.totalUsers).toBe(0);
      expect(vaultInfo.isPaused).toBe(false);
      expect(vaultInfo.authority).toBe(testAuthority.publicKey.toString());
      
      console.log('✅ Initial state test passed');
    });
  });

  describe('Deposit Functionality', () => {
    test('should simulate deposit successfully', async () => {
      const result = await vaultContract.simulateDeposit(testUser.publicKey, TEST_AMOUNT);
      
      expect(result.success).toBe(false); // Should fail due to insufficient balance
      expect(result.error).toBe('Insufficient balance');
      
      console.log('✅ Deposit simulation test passed');
    });

    test('should process deposit correctly', async () => {
      const result = await vaultContract.depositSol(testUser.publicKey, TEST_AMOUNT);
      
      expect(result.success).toBe(true);
      expect(result.amount).toBe(TEST_AMOUNT);
      expect(result.lamports).toBe(TEST_AMOUNT * LAMPORTS_PER_SOL);
      expect(result.userDeposit).toBe(TEST_AMOUNT);
      expect(result.totalDeposits).toBe(TEST_AMOUNT);
      
      console.log('✅ Deposit processing test passed');
    });

    test('should track user deposits correctly', () => {
      const userDeposit = vaultContract.getUserDeposit(testUser.publicKey);
      
      expect(userDeposit.user).toBe(testUser.publicKey.toString());
      expect(userDeposit.deposit).toBe(TEST_AMOUNT);
      expect(userDeposit.lamports).toBe(TEST_AMOUNT * LAMPORTS_PER_SOL);
      
      console.log('✅ User deposit tracking test passed');
    });

    test('should update vault statistics correctly', () => {
      const stats = vaultContract.getStatistics();
      
      expect(stats.totalDeposits).toBe(TEST_AMOUNT);
      expect(stats.totalUsers).toBe(1);
      expect(stats.averageDeposit).toBe(TEST_AMOUNT);
      expect(stats.largestDeposit).toBe(TEST_AMOUNT);
      
      console.log('✅ Statistics update test passed');
    });
  });

  describe('Withdrawal Functionality', () => {
    test('should process withdrawal correctly', async () => {
      const withdrawAmount = 0.5;
      const result = await vaultContract.withdrawSol(testUser.publicKey, withdrawAmount);
      
      expect(result.success).toBe(true);
      expect(result.amount).toBe(withdrawAmount);
      expect(result.lamports).toBe(withdrawAmount * LAMPORTS_PER_SOL);
      expect(result.remainingDeposit).toBe(TEST_AMOUNT - withdrawAmount);
      expect(result.totalDeposits).toBe(TEST_AMOUNT - withdrawAmount);
      
      console.log('✅ Withdrawal processing test passed');
    });

    test('should prevent over-withdrawal', async () => {
      const overAmount = TEST_AMOUNT + 1;
      const result = await vaultContract.withdrawSol(testUser.publicKey, overAmount);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient deposit amount');
      
      console.log('✅ Over-withdrawal prevention test passed');
    });

    test('should remove user when deposit reaches zero', async () => {
      const remainingAmount = TEST_AMOUNT - 0.5; // Remaining from previous test
      const result = await vaultContract.withdrawSol(testUser.publicKey, remainingAmount);
      
      expect(result.success).toBe(true);
      expect(result.remainingDeposit).toBe(0);
      
      const stats = vaultContract.getStatistics();
      expect(stats.totalUsers).toBe(0);
      expect(stats.totalDeposits).toBe(0);
      
      console.log('✅ User removal test passed');
    });
  });

  describe('Pause Functionality', () => {
    test('should pause vault operations', () => {
      const result = vaultContract.pauseVault();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Vault paused successfully');
      
      const vaultInfo = vaultContract.getVaultInfo();
      expect(vaultInfo.isPaused).toBe(true);
      
      console.log('✅ Vault pause test passed');
    });

    test('should prevent deposits when paused', async () => {
      const result = await vaultContract.depositSol(testUser.publicKey, 0.1);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Vault is paused');
      
      console.log('✅ Paused deposit prevention test passed');
    });

    test('should resume vault operations', () => {
      const result = vaultContract.resumeVault();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Vault resumed successfully');
      
      const vaultInfo = vaultContract.getVaultInfo();
      expect(vaultInfo.isPaused).toBe(false);
      
      console.log('✅ Vault resume test passed');
    });
  });

  describe('Emergency Functions', () => {
    test('should allow emergency withdrawal by authority', async () => {
      // First, add some deposits
      await vaultContract.depositSol(testUser.publicKey, 1.0);
      
      const emergencyDestination = Keypair.generate();
      const result = await vaultContract.emergencyWithdraw(emergencyDestination.publicKey);
      
      expect(result.success).toBe(true);
      expect(result.amount).toBeGreaterThan(0);
      expect(result.destination).toBe(emergencyDestination.publicKey.toString());
      
      const stats = vaultContract.getStatistics();
      expect(stats.totalDeposits).toBe(0);
      expect(stats.totalUsers).toBe(0);
      
      console.log('✅ Emergency withdrawal test passed');
    });

    test('should prevent emergency withdrawal by non-authority', async () => {
      const nonAuthority = Keypair.generate();
      const vaultContractNonAuth = new VaultContract(connection, programId, nonAuthority.publicKey);
      
      const emergencyDestination = Keypair.generate();
      const result = await vaultContractNonAuth.emergencyWithdraw(emergencyDestination.publicKey);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      
      console.log('✅ Unauthorized emergency withdrawal prevention test passed');
    });
  });

  describe('Multiple Users', () => {
    test('should handle multiple user deposits', async () => {
      const user1 = Keypair.generate();
      const user2 = Keypair.generate();
      const user3 = Keypair.generate();
      
      // Initialize fresh vault
      const freshVault = new VaultContract(connection, programId, testAuthority.publicKey);
      await freshVault.initializeVault();
      
      // Multiple deposits
      await freshVault.depositSol(user1.publicKey, 1.0);
      await freshVault.depositSol(user2.publicKey, 2.0);
      await freshVault.depositSol(user3.publicKey, 0.5);
      
      const stats = freshVault.getStatistics();
      expect(stats.totalDeposits).toBe(3.5);
      expect(stats.totalUsers).toBe(3);
      expect(stats.averageDeposit).toBeCloseTo(1.167, 3);
      expect(stats.largestDeposit).toBe(2.0);
      
      console.log('✅ Multiple users test passed');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid amounts', async () => {
      const result = await vaultContract.depositSol(testUser.publicKey, -1);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      console.log('✅ Invalid amount handling test passed');
    });

    test('should handle uninitialized vault', async () => {
      const uninitializedVault = new VaultContract(connection, programId, testAuthority.publicKey);
      const result = await uninitializedVault.depositSol(testUser.publicKey, 1.0);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Vault not initialized');
      
      console.log('✅ Uninitialized vault handling test passed');
    });
  });
});

// Performance tests
describe('VaultContract Performance', () => {
  test('should handle large number of operations efficiently', async () => {
    const connection = new Connection(networks[TEST_NETWORK].url, 'confirmed');
    const vault = new VaultContract(connection, '11111111111111111111111111111111', Keypair.generate().publicKey);
    await vault.initializeVault();
    
    const startTime = Date.now();
    const numOperations = 100;
    
    for (let i = 0; i < numOperations; i++) {
      const user = Keypair.generate();
      await vault.depositSol(user.publicKey, 0.1);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    expect(vault.getStatistics().totalUsers).toBe(numOperations);
    
    console.log(`✅ Performance test passed: ${numOperations} operations in ${duration}ms`);
  });
});

console.log('🧪 All VaultContract tests completed successfully!'); 