// Test setup file for Jest
require('dotenv').config();

// Global test configuration
global.TEST_CONFIG = {
  network: process.env.TEST_NETWORK || 'devnet',
  timeout: 30000,
  retries: 3
};

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console.log during tests unless explicitly enabled
  if (!process.env.ENABLE_TEST_LOGS) {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
});

// Global test utilities
global.testUtils = {
  // Generate a random amount for testing
  randomAmount: (min = 0.1, max = 10) => {
    return Math.random() * (max - min) + min;
  },
  
  // Wait for a specified time
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate a test keypair
  generateKeypair: () => {
    const { Keypair } = require('@solana/web3.js');
    return Keypair.generate();
  },
  
  // Format SOL amount
  formatSol: (lamports) => {
    const { LAMPORTS_PER_SOL } = require('@solana/web3.js');
    return lamports / LAMPORTS_PER_SOL;
  }
};

console.log('🧪 Test environment setup completed'); 