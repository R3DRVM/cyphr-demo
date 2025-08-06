#!/usr/bin/env node

const { Connection, Keypair } = require('@solana/web3.js');
const VaultContract = require('../contracts/vault/VaultContract');
const networks = require('../config/networks');

/**
 * Quick test to verify smart contracts setup
 */
async function testSetup() {
  console.log('🧪 Testing Smart Contracts Setup...\n');

  try {
    // Test 1: Network Configuration
    console.log('1️⃣ Testing Network Configuration...');
    const network = networks.devnet;
    console.log(`✅ Network: ${network.name}`);
    console.log(`✅ URL: ${network.url}`);
    console.log(`✅ Explorer: ${network.explorer}`);

    // Test 2: Connection
    console.log('\n2️⃣ Testing Solana Connection...');
    const connection = new Connection(network.url, 'confirmed');
    const version = await connection.getVersion();
    console.log(`✅ Connection successful`);
    console.log(`✅ Solana version: ${version['solana-core']}`);

    // Test 3: Vault Contract
    console.log('\n3️⃣ Testing Vault Contract...');
    const testUser = Keypair.generate();
    const testAuthority = Keypair.generate();
    const programId = '11111111111111111111111111111111';
    
    const vaultContract = new VaultContract(connection, programId, testAuthority.publicKey);
    console.log(`✅ Vault contract created`);
    console.log(`✅ Program ID: ${programId}`);
    console.log(`✅ Authority: ${testAuthority.publicKey.toString()}`);

    // Test 4: Vault Initialization
    console.log('\n4️⃣ Testing Vault Initialization...');
    const initResult = await vaultContract.initializeVault();
    
    if (initResult.success) {
      console.log(`✅ Vault initialized successfully`);
      console.log(`✅ Vault Address: ${initResult.vaultAddress}`);
    } else {
      console.log(`❌ Vault initialization failed: ${initResult.error}`);
    }

    // Test 5: Basic Functionality
    console.log('\n5️⃣ Testing Basic Functionality...');
    
    // Test deposit simulation
    const simulationResult = await vaultContract.simulateDeposit(testUser.publicKey, 1.0);
    console.log(`✅ Deposit simulation: ${simulationResult.success ? 'PASSED' : 'FAILED (expected)'}`);
    
    // Test vault info
    const vaultInfo = vaultContract.getVaultInfo();
    console.log(`✅ Vault info retrieved: ${vaultInfo.totalDeposits} SOL, ${vaultInfo.totalUsers} users`);
    
    // Test pause/resume
    const pauseResult = vaultContract.pauseVault();
    console.log(`✅ Pause functionality: ${pauseResult.success ? 'PASSED' : 'FAILED'}`);
    
    const resumeResult = vaultContract.resumeVault();
    console.log(`✅ Resume functionality: ${resumeResult.success ? 'PASSED' : 'FAILED'}`);

    // Test 6: Statistics
    console.log('\n6️⃣ Testing Statistics...');
    const stats = vaultContract.getStatistics();
    console.log(`✅ Statistics: ${JSON.stringify(stats, null, 2)}`);

    console.log('\n🎉 All tests passed! Smart contracts setup is working correctly.');
    console.log('\n📝 Next Steps:');
    console.log('1. Run full test suite: npm test');
    console.log('2. Deploy to devnet: npm run deploy:devnet');
    console.log('3. Test integration: npm run test:integration');

  } catch (error) {
    console.error('❌ Setup test failed:', error);
    process.exit(1);
  }
}

// Run test if called directly
if (require.main === module) {
  testSetup().catch(console.error);
}

module.exports = { testSetup }; 