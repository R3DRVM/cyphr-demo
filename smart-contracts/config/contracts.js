// Contract configuration for Cyphr DeFi Strategy Builder
const contracts = {
  // Vault Contract - Manages SOL deposits and withdrawals
  vault: {
    name: 'CyphrVault',
    description: 'SOL staking vault for DeFi strategies',
    version: '1.0.0',
    programId: process.env.VAULT_PROGRAM_ID || '11111111111111111111111111111111', // Placeholder
    features: [
      'SOL deposits',
      'SOL withdrawals', 
      'User tracking',
      'Vault statistics',
      'Emergency pause'
    ],
    accounts: {
      vault: 'vault',
      userDeposit: 'user_deposit',
      authority: 'authority'
    }
  },

  // Strategy Contract - Executes DeFi strategies
  strategy: {
    name: 'CyphrStrategy',
    description: 'DeFi strategy execution engine',
    version: '1.0.0',
    programId: process.env.STRATEGY_PROGRAM_ID || '22222222222222222222222222222222', // Placeholder
    features: [
      'Strategy validation',
      'Execution logic',
      'Risk management',
      'Performance tracking'
    ],
    accounts: {
      strategy: 'strategy',
      execution: 'execution',
      user: 'user'
    }
  },

  // Utility Contracts
  utils: {
    priceOracle: {
      name: 'PriceOracle',
      description: 'Token price feed oracle',
      programId: process.env.PRICE_ORACLE_PROGRAM_ID || '33333333333333333333333333333333'
    },
    riskManager: {
      name: 'RiskManager', 
      description: 'Risk assessment and management',
      programId: process.env.RISK_MANAGER_PROGRAM_ID || '44444444444444444444444444444444'
    }
  }
};

// Contract addresses by network
const addresses = {
  devnet: {
    vault: {
      programId: process.env.DEVNET_VAULT_PROGRAM_ID || '11111111111111111111111111111111',
      vault: process.env.DEVNET_VAULT_ADDRESS || '55555555555555555555555555555555',
      authority: process.env.DEVNET_VAULT_AUTHORITY || '66666666666666666666666666666666'
    },
    strategy: {
      programId: process.env.DEVNET_STRATEGY_PROGRAM_ID || '22222222222222222222222222222222'
    }
  },
  testnet: {
    vault: {
      programId: process.env.TESTNET_VAULT_PROGRAM_ID || '11111111111111111111111111111111',
      vault: process.env.TESTNET_VAULT_ADDRESS || '77777777777777777777777777777777',
      authority: process.env.TESTNET_VAULT_AUTHORITY || '88888888888888888888888888888888'
    },
    strategy: {
      programId: process.env.TESTNET_STRATEGY_PROGRAM_ID || '22222222222222222222222222222222'
    }
  },
  mainnet: {
    vault: {
      programId: process.env.MAINNET_VAULT_PROGRAM_ID || '11111111111111111111111111111111',
      vault: process.env.MAINNET_VAULT_ADDRESS || '99999999999999999999999999999999',
      authority: process.env.MAINNET_VAULT_AUTHORITY || 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    },
    strategy: {
      programId: process.env.MAINNET_STRATEGY_PROGRAM_ID || '22222222222222222222222222222222'
    }
  }
};

module.exports = {
  contracts,
  addresses,
  getContractAddress: (network, contract, account) => {
    return addresses[network]?.[contract]?.[account] || null;
  },
  getProgramId: (network, contract) => {
    return addresses[network]?.[contract]?.programId || null;
  }
}; 