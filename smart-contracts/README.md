# Cyphr Smart Contracts

This directory contains the smart contract logic for the Cyphr DeFi Strategy Builder platform.

## 🏗️ Project Structure

```
smart-contracts/
├── contracts/          # Smart contract source code
│   ├── vault/         # Vault contract for staking SOL
│   ├── strategy/      # Strategy execution contracts
│   └── utils/         # Utility contracts and helpers
├── tests/             # Test files
│   ├── unit/          # Unit tests for individual functions
│   ├── integration/   # Integration tests
│   └── e2e/           # End-to-end tests
├── scripts/           # Deployment and utility scripts
├── config/            # Configuration files
└── docs/              # Documentation
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Solana CLI** (optional, for deployment)
3. **Anchor CLI** (optional, for full development)

### Installation

```bash
npm install
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:contracts
npm run test:integration
npm run test:wallet

# Generate coverage report
npm run test:coverage
```

### Deployment

```bash
# Deploy to devnet
npm run deploy:devnet

# Deploy to testnet
npm run deploy:testnet
```

## 📋 Smart Contracts

### 1. Vault Contract (`contracts/vault/`)

**Purpose**: Manages SOL deposits and withdrawals for strategy execution

**Key Features**:
- SOL deposit/withdrawal functionality
- User deposit tracking
- Vault statistics
- Emergency pause functionality

**Functions**:
- `initialize_vault()` - Initialize the vault
- `deposit_sol()` - Deposit SOL into vault
- `withdraw_sol()` - Withdraw SOL from vault
- `get_vault_info()` - Get vault statistics

### 2. Strategy Contract (`contracts/strategy/`)

**Purpose**: Executes DeFi strategies based on user configuration

**Key Features**:
- Strategy parameter validation
- Execution logic
- Risk management
- Performance tracking

### 3. Utility Contracts (`contracts/utils/`)

**Purpose**: Helper contracts and common functionality

## 🧪 Testing Strategy

### Unit Tests
- Test individual contract functions
- Mock external dependencies
- Validate edge cases

### Integration Tests
- Test contract interactions
- Validate state changes
- Test error conditions

### End-to-End Tests
- Full workflow testing
- Real network simulation
- Performance testing

## 🔧 Configuration

### Environment Variables

```env
# Network Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Contract Addresses
VAULT_PROGRAM_ID=your_vault_program_id
STRATEGY_PROGRAM_ID=your_strategy_program_id

# Testing
TEST_WALLET_PRIVATE_KEY=your_test_wallet_key
TEST_AMOUNT=1.0

# Development
LOG_LEVEL=debug
```

## 📊 Contract Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Wallet   │    │  Vault Contract │    │ Strategy Logic  │
│                 │    │                 │    │                 │
│ • Connect       │───▶│ • Deposit SOL   │───▶│ • Execute       │
│ • Approve       │    │ • Track Users   │    │ • Validate      │
│ • Sign Tx       │    │ • Manage Funds  │    │ • Risk Check    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Frontend App   │    │   Analytics     │    │   Results       │
│                 │    │                 │    │                 │
│ • UI Interface  │    │ • Performance   │    │ • P&L Tracking  │
│ • User Input    │    │ • Risk Metrics  │    │ • History       │
│ • Transaction   │    │ • Statistics    │    │ • Reports       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 Security Considerations

- **Access Control**: Only authorized users can execute strategies
- **Input Validation**: All parameters are validated before execution
- **Emergency Pause**: Ability to pause operations in emergencies
- **Rate Limiting**: Prevent abuse and excessive transactions
- **Audit Trail**: All operations are logged and traceable

## 🚨 Emergency Procedures

### Pause Vault
```bash
npm run emergency:pause
```

### Resume Vault
```bash
npm run emergency:resume
```

### Emergency Withdraw
```bash
npm run emergency:withdraw
```

## 📈 Performance Monitoring

- Transaction success rates
- Gas usage optimization
- Response time tracking
- Error rate monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details 