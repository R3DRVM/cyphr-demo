module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.js',
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/scripts/',
    '/config/'
  ],
  
  // Test timeout
  testTimeout: 30000,
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Test results processor
  // testResultsProcessor: 'jest-sonar-reporter',
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Transform configuration
  // transform: {
  //   '^.+\\.js$': 'babel-jest'
  // },
  
  // Environment variables
  setupFiles: ['<rootDir>/tests/env-setup.js'],
  
  // Test reporters
  reporters: ['default']
}; 