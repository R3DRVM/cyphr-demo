// Environment setup for tests
require('dotenv').config();

// Set default test environment variables if not provided
process.env.TEST_NETWORK = process.env.TEST_NETWORK || 'devnet';
process.env.TEST_AMOUNT = process.env.TEST_AMOUNT || '1.0';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';

// Mock environment variables for testing
if (!process.env.DEVNET_VAULT_PROGRAM_ID) {
  process.env.DEVNET_VAULT_PROGRAM_ID = '11111111111111111111111111111111';
}

if (!process.env.DEVNET_VAULT_ADDRESS) {
  process.env.DEVNET_VAULT_ADDRESS = '55555555555555555555555555555555';
}

if (!process.env.DEVNET_VAULT_AUTHORITY) {
  process.env.DEVNET_VAULT_AUTHORITY = '66666666666666666666666666666666';
}

console.log('🔧 Test environment variables configured'); 