# Cyphr Demo

A comprehensive DeFi strategy builder and lending platform built on Solana.

## 🚀 New Features: Borrow → Buy → Take-Profit Flow

The platform now includes a complete lending and trading flow with automated take-profit functionality.

### Features

- **Lending & Borrowing**: Deposit SOL as collateral, borrow USDC
- **Trading**: Execute swaps using borrowed funds
- **Take-Profit Automation**: Set price targets for automatic profit-taking
- **Real-time Insights**: Pool analysis and risk assessment
- **Position Management**: Health factor, LTV, and PnL tracking

### Environment Setup

1. Copy the environment template:
```bash
cp env.local.template .env.local
```

2. Configure the following variables:
```bash
# Take-Profit Settings
VITE_TP_TARGET_BPS=200        # 2% take-profit target
VITE_TP_POLL_MS=15000        # 15 second polling interval

# AI Insights (future feature)
VITE_AI_INSIGHTS=false        # Enable AI-powered analysis
```

### Configuration Files

#### `src/config/lending.devnet.json`
```json
{
  "lendingPool": {
    "address": "YOUR_LENDING_POOL_ADDRESS",
    "collateralToken": "So11111111111111111111111111111111111111112",
    "borrowToken": "YOUR_USDC_MINT_ADDRESS",
    "maxLtv": 0.75,
    "liquidationThreshold": 0.8
  }
}
```

#### `src/config/tokens.devnet.json`
```json
{
  "vaultA": "YOUR_VAULT_A_ADDRESS",
  "vaultB": "YOUR_VAULT_B_ADDRESS",
  "swapState": "YOUR_SWAP_STATE_ADDRESS",
  "swapAuthority": "YOUR_SWAP_AUTHORITY_ADDRESS",
  "mintA": "So11111111111111111111111111111111111111112",
  "mintB": "YOUR_USDC_MINT_ADDRESS"
}
```

### Running the Application

1. **Development Mode (Demo)**:
```bash
npm run dev:demo
```

2. **Development Mode (Real)**:
```bash
npm run dev:real
```

3. **Production Build**:
```bash
npm run build
```

### Testing

#### Demo Mode Testing
```bash
npm run test:demo
```

#### Quick Testing
```bash
npm run test:quick
```

#### Full Devnet Smoke Test
```bash
npm run smoke:devnet
```

The smoke test performs:
1. SOL airdrop (if needed)
2. Collateral deposit simulation
3. USDC borrowing simulation
4. Token swap simulation
5. Reverse swap after 30 seconds
6. Final balance verification

### Architecture

- **Pool Price Service**: Reads vault balances for price calculation
- **Take-Profit Hook**: Manages TP state and automation
- **Insights Hook**: Provides rule-based market analysis
- **Borrow & Trade Panel**: Main UI for lending and trading
- **Summary Panel**: Position metrics and transaction status
- **Insights Panel**: Market analysis and risk assessment

### Take-Profit Engine

The take-profit system:
- Polls pool prices every `VITE_TP_POLL_MS` milliseconds
- Automatically executes reverse swaps when `VITE_TP_TARGET_BPS` is met
- Supports manual disarm and force-sell operations
- Integrates with the existing position management system

### Future Enhancements

- **AI Insights**: Enable `VITE_AI_INSIGHTS=true` for LLM-powered analysis
- **Advanced Strategies**: Multi-leg trades and complex position management
- **Risk Management**: Dynamic position sizing and stop-loss automation

## 🏗️ Original Strategy Builder

The platform includes a comprehensive strategy builder with:
- Drag-and-drop strategy construction
- 55+ strategy inputs and logic operators
- Real-time strategy simulation
- Position tracking and management

## 🔧 Development

### Prerequisites
- Node.js 18+
- Solana CLI
- Phantom Wallet (for testing)

### Installation
```bash
npm install
```

### Local Development
```bash
npm run dev
```

### Build and Deploy
```bash
npm run build
npm run deploy
```

## 📚 Documentation

- [Strategy Builder Guide](./docs/strategy-builder.md)
- [API Reference](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
