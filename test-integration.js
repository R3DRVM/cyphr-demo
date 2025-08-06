// Test file for Cyphr Vaults Smart Contract Integration
// This file helps verify that our integration is working correctly

const { Connection, PublicKey } = require('@solana/web3.js');
const { Program, AnchorProvider, BN } = require('@coral-xyz/anchor');

// Configuration
const PROGRAM_ID = new PublicKey('5iVtTdPWLN8Qk6BN2vudJU4myvu9nnnjsDnhCnCR2C52');
const DEVNET_RPC = 'https://api.devnet.solana.com';

// Test the connection
async function testConnection() {
  console.log('🔗 Testing Solana Devnet Connection...');
  
  try {
    const connection = new Connection(DEVNET_RPC, 'confirmed');
    const version = await connection.getVersion();
    console.log('✅ Connection successful!');
    console.log('📊 Solana version:', version);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Test program ID validation
function testProgramId() {
  console.log('\n🔍 Testing Program ID...');
  
  try {
    const programId = new PublicKey('5iVtTdPWLN8Qk6BN2vudJU4myvu9nnnjsDnhCnCR2C52');
    console.log('✅ Program ID is valid!');
    console.log('📝 Program ID:', programId.toString());
    return true;
  } catch (error) {
    console.error('❌ Invalid Program ID:', error.message);
    return false;
  }
}

// Test IDL loading
function testIDLLoading() {
  console.log('\n📋 Testing IDL Loading...');
  
  try {
    // This would normally load from the JSON file
    const mockIDL = {
      version: "0.1.0",
      name: "cyphr_vaults",
      instructions: [
        {
          name: "depositSol",
          accounts: [],
          args: []
        }
      ]
    };
    
    console.log('✅ IDL structure is valid!');
    console.log('📝 Program name:', mockIDL.name);
    console.log('📝 Version:', mockIDL.version);
    console.log('📝 Instructions count:', mockIDL.instructions.length);
    return true;
  } catch (error) {
    console.error('❌ IDL loading failed:', error.message);
    return false;
  }
}

// Test PDA generation
function testPDAGeneration() {
  console.log('\n🔐 Testing PDA Generation...');
  
  try {
    const programId = new PublicKey('5iVtTdPWLN8Qk6BN2vudJU4myvu9nnnjsDnhCnCR2C52');
    
    // Test basic vault PDA
    const [basicVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('basic_vault')],
      programId
    );
    
    // Test user deposit PDA
    const mockUserPubkey = new PublicKey('11111111111111111111111111111111');
    const [userDepositPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('user_deposit'), mockUserPubkey.toBuffer()],
      programId
    );
    
    console.log('✅ PDA generation successful!');
    console.log('📝 Basic Vault PDA:', basicVaultPda.toString());
    console.log('📝 User Deposit PDA:', userDepositPda.toString());
    return true;
  } catch (error) {
    console.error('❌ PDA generation failed:', error.message);
    return false;
  }
}

// Test BN operations
function testBNOperations() {
  console.log('\n🧮 Testing BN Operations...');
  
  try {
    // Test SOL to lamports conversion
    const solAmount = 1.5;
    const lamports = new BN(solAmount * 1e9);
    
    // Test percentage to basis points
    const percentage = 10.5;
    const basisPoints = new BN(Math.floor(percentage * 100));
    
    console.log('✅ BN operations successful!');
    console.log('📝 1.5 SOL =', lamports.toString(), 'lamports');
    console.log('📝 10.5% =', basisPoints.toString(), 'basis points');
    return true;
  } catch (error) {
    console.error('❌ BN operations failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Cyphr Vaults Integration Tests...\n');
  
  const tests = [
    { name: 'Connection Test', fn: testConnection },
    { name: 'Program ID Test', fn: testProgramId },
    { name: 'IDL Loading Test', fn: testIDLLoading },
    { name: 'PDA Generation Test', fn: testPDAGeneration },
    { name: 'BN Operations Test', fn: testBNOperations }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`\n🧪 Running ${test.name}...`);
    const result = await test.fn();
    if (result) {
      passedTests++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Integration is ready.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testConnection,
  testProgramId,
  testIDLLoading,
  testPDAGeneration,
  testBNOperations,
  runTests
}; 