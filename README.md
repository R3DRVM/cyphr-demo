# Cyphr Demo - End-to-End Devnet Platform

A professional-grade DeFi platform built on Solana, featuring lending, borrowing, trading, and automated strategy execution.

## 🚀 Features

- **Lending & Borrowing**: Deposit SOL as collateral, borrow USDC
- **DEX Integration**: TokenSwap for asset trading with slippage protection
- **Take-Profit Automation**: Client-side TP watcher with configurable targets
- **Strategy Builder**: Visual drag-and-drop strategy creation
- **Real-time Analytics**: Pool prices, health factors, and market insights
- **Bloomberg-style UI**: Professional terminal interface with dark theme

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Phantom Wallet (for testing)
- Solana CLI (optional, for advanced testing)

### Installation

```bash
git clone <repository-url>
cd demo-cyphr
npm install
```

### Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.template .env.local
```

#### Required Environment Variables

```bash
# Devnet Demo Configuration
VITE_DEMO_MODE=true                    # Enable demo mode (localStorage + fake sigs)
VITE_SOLANA_NETWORK=devnet            # Solana network (devnet/mainnet)
VITE_RPC_URL=https://api.devnet.solana.com  # RPC endpoint

# Program IDs (replace with actual deployed programs)
VITE_LENDING_PROGRAM_ID=11111111111111111111111111111111
VITE_STRATEGY_PROGRAM_ID=11111111111111111111111111111111

# Take Profit Configuration
VITE_TP_TARGET_BPS=500                # Target profit in basis points (5%)
VITE_TP_POLL_MS=15000                 # Polling interval in milliseconds

# AI Insights (visual only)
VITE_AI_INSIGHTS=true                 # Enable AI insights panel

# TokenSwap Pool Configuration
VITE_POOL_ADDRESS=11111111111111111111111111111111
VITE_SWAP_AUTHORITY=11111111111111111111111111111111
```

### Configuration Files

#### `src/config/tokens.devnet.json`
Required keys (replace placeholder values):
```json
{
  "mintA": "So11111111111111111111111111111111111111112",
  "mintB": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  "vaultA": "actual_vault_a_address",
  "vaultB": "actual_vault_b_address",
  "swapState": "actual_swap_state_address",
  "swapAuthority": "actual_swap_authority_address",
  "feeAccount": "actual_fee_account_address",
  "poolTokenMint": "actual_pool_token_mint_address"
}
```

#### `src/config/lending.devnet.json`
Required keys:
```json
{
  "lendingPool": {
    "address": "actual_lending_pool_address",
    "collateralToken": "So11111111111111111111111111111111111111112",
    "borrowToken": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  }
}
```

## 🏃‍♂️ Running the Application

### Development Server

```bash
# Start with demo mode (default)
npm run dev

# Start with real devnet mode
VITE_DEMO_MODE=false npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## 🚀 Running the Devnet Demo (V2)

### V2 Lending Experience

The platform now supports two lending interfaces:

- **Legacy Mode** (`VITE_LENDING_V2=false`): Original lending section
- **V2 Mode** (`VITE_LENDING_V2=true`): Enhanced borrowing & trading panels

### Quick Start for V2

1. **Copy environment template:**
   ```bash
   cp env.local.template .env.local
   ```

2. **Configure for real devnet testing:**
   ```bash
   VITE_LENDING_V2=true          # Enable V2 lending panels
   VITE_DEMO_MODE=false          # Use real devnet (not demo mode)
   VITE_DEBUG_TX=true            # Enable transaction simulation logs
   VITE_TP_TARGET_BPS=200        # 2% take-profit target
   VITE_TP_POLL_MS=15000         # 15-second polling
   VITE_AI_INSIGHTS=false        # Disable AI insights for now
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Optional: Run smoke tests:**
   ```bash
   npm run smoke:devnet
   ```

### V2 Features

- **BorrowTradePanel**: Enable Collateral → Borrow → Buy → Buy & Arm TP → Force Sell
- **SummaryPanel**: Real-time HF, LTV, Collateral, Debt, Net Carry, PnL updates
- **InsightsPanel**: Rule-based insights from pool ratios
- **StrategyExecCard**: Create and execute strategies (real program or Memo fallback)
- **Enhanced Safety**: Transaction simulation, compute budget management, position auto-refresh

### Switching Between Modes

- **To V2**: Set `VITE_LENDING_V2=true` in `.env.local`
- **To Legacy**: Set `VITE_LENDING_V2=false` in `.env.local`
- **Demo Mode**: Set `VITE_DEMO_MODE=true` for localStorage-based testing
- **Real Devnet**: Set `VITE_DEMO_MODE=false` for actual blockchain interaction

### Acceptance Criteria

With `VITE_LENDING_V2=true` and `VITE_DEMO_MODE=false` on devnet with Phantom funded:

1. ✅ **Lending Flow**: Enable Collateral → Borrow → Buy → Buy & Arm TP → Force Sell all succeed
2. ✅ **Transaction Feedback**: Each tx shows toast with "View on Explorer" button
3. ✅ **Auto-refresh**: Summary panel updates after each transaction
4. ✅ **Strategy Bridge**: Create Strategy returns signature + stable strategyId
5. ✅ **Debug Logs**: `VITE_DEBUG_TX=true` shows simulation (err/logs/computeUnits) before send

## 🧪 Testing

### Smoke Test

Run the comprehensive end-to-end test on devnet:

```bash
# Run smoke test with demo mode
DEMO_MODE=true npm run smoke:devnet

# Run smoke test with real devnet transactions
npm run smoke:devnet
```

The smoke test performs:
1. **Airdrop SOL** (if needed)
2. **Deposit 1 SOL** as collateral
3. **Borrow 5 USDC** against collateral
4. **Swap 1 USDC** for SOL via TokenSwap
5. **Wait 30 seconds** then reverse swap

### Quick Tests

```bash
# Quick devnet test
npm run test:quick

# Demo mode test
npm run test:demo
```

## 🎯 Demo Flow

### 1. System Check
- Connect Phantom wallet to devnet
- Verify environment configuration
- Check token configuration
- Validate Solana connection

### 2. Lending & Borrowing
- **Enable Collateral**: Deposit SOL as collateral
- **Borrow USDC**: Borrow against SOL collateral
- **Monitor Health**: Track LTV ratio and health factor

### 3. Trading
- **Buy Assets**: Swap USDC for SOL
- **Buy & Arm TP**: Execute trade and set take-profit
- **Force Sell**: Manual position exit

### 4. Take-Profit Automation
- **Arm TP**: Set price target for automatic selling
- **Monitor**: Real-time price tracking
- **Execute**: Automatic TP when target is met

### 5. Strategy Management
- **Create Strategy**: Build custom yield strategies
- **Execute Strategy**: Deploy strategies on-chain
- **Monitor Performance**: Track strategy PnL

## 🏗️ Architecture

### Core Components

- **Preflight**: System health check and validation
- **BorrowTradePanel**: Lending, borrowing, and trading controls
- **SummaryPanel**: Position overview and transaction history
- **StrategyBridge**: Strategy creation and execution
- **DemoRunner**: One-click demo automation
- **InsightsPanel**: AI-powered market analysis

### Smart Contract Integration

- **Lending Adapter**: Collateral management and borrowing
- **DEX Adapter**: TokenSwap integration with slippage protection
- **Pool Price Service**: Real-time price calculation from vault balances
- **Take-Profit Hook**: Automated TP execution

### State Management

- **Demo Mode**: localStorage-based state with mock signatures
- **Real Mode**: On-chain transactions with Explorer links
- **Position Tracking**: Real-time balance and health monitoring
- **Transaction History**: Complete operation log with signatures

## 🔧 Troubleshooting

### Common Issues

1. **Preflight Check Fails**
   - Verify environment variables are set
   - Check token configuration addresses
   - Ensure wallet is connected to devnet

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript compilation: `npx tsc --noEmit`

3. **Devnet Connection Issues**
   - Verify RPC URL is accessible
   - Check network status at [Solana Status](https://status.solana.com)
   - Try alternative RPC endpoints

4. **Wallet Connection Problems**
   - Ensure Phantom is installed and unlocked
   - Switch to devnet network in wallet
   - Clear browser cache and reload

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 📚 API Reference

### Lending Functions
- `enableCollateral(mint, amount)` - Enable token as collateral
- `borrow(borrowMint, amount)` - Borrow assets against collateral
- `repay(borrowMint, amount)` - Repay borrowed assets
- `getHealth()` - Get position health metrics

### Trading Functions
- `getQuote(inputToken, outputToken, amountIn)` - Get swap quote
- `swap(inputToken, outputToken, amountIn, maxSlippage)` - Execute swap
- `getPoolPrice()` - Get current pool price ratios

### Strategy Functions
- `createStrategy(strategyConfig)` - Deploy new strategy
- `executeStrategy(strategyId)` - Run strategy execution
- `getStrategyPerformance(strategyId)` - Get strategy metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `