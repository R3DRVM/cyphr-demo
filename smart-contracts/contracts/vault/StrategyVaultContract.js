const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } = require('@solana/web3.js');

/**
 * Advanced Strategy Vault Contract
 * Supports complex DeFi strategies with multiple tokens, time-based logic, 
 * price triggers, volatility analysis, and hedging mechanisms
 */
class StrategyVaultContract {
  constructor(connection, programId, authorityWallet) {
    this.connection = connection;
    this.programId = new PublicKey(programId);
    this.authorityWallet = authorityWallet;
    
    // Vault state
    this.vaultState = {
      totalDeposits: 0,
      totalUsers: 0,
      isPaused: false,
      vaultAddress: null,
      // Yield tracking
      totalYieldGenerated: 0,
      lastYieldCalculation: Date.now(),
      yieldRate: 0.05, // 5% annual yield rate
      userDeposits: new Map(),
      userYieldEarned: new Map(),
      userLastYieldUpdate: new Map(),
      // Strategy tracking
      strategies: new Map(),
      activeStrategies: 0,
      totalPnl: 0,
      // Token data
      supportedTokens: new Map(),
      // Market data simulation
      marketData: new Map(),
      volatilityData: new Map(),
      priceHistory: new Map()
    };
    
    // Generate vault address
    this.vaultState.vaultAddress = Keypair.generate().publicKey.toString();
    
    // Initialize supported tokens
    this.initializeSupportedTokens();
  }

  // Initialize supported tokens with mock data
  initializeSupportedTokens() {
    const tokens = [
      {
        symbol: 'SOL',
        name: 'Solana',
        address: 'So11111111111111111111111111111111111111112',
        decimals: 9,
        price: 100.0,
        volatility: 0.25,
        marketCap: 50000000000,
        volume24h: 2000000000
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        decimals: 6,
        price: 1.0,
        volatility: 0.01,
        marketCap: 30000000000,
        volume24h: 5000000000
      },
      {
        symbol: 'RAY',
        name: 'Raydium',
        address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        decimals: 6,
        price: 2.5,
        volatility: 0.35,
        marketCap: 1000000000,
        volume24h: 50000000
      },
      {
        symbol: 'SRM',
        name: 'Serum',
        address: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
        decimals: 6,
        price: 0.8,
        volatility: 0.30,
        marketCap: 800000000,
        volume24h: 30000000
      }
    ];

    tokens.forEach(token => {
      this.vaultState.supportedTokens.set(token.symbol, token);
      this.vaultState.marketData.set(token.symbol, {
        price: token.price,
        change24h: 0,
        volume24h: token.volume24h,
        marketCap: token.marketCap,
        lastUpdate: Date.now()
      });
      this.vaultState.volatilityData.set(token.symbol, {
        current: token.volatility,
        historical: [],
        lastUpdate: Date.now()
      });
      this.vaultState.priceHistory.set(token.symbol, []);
    });
  }

  // Initialize the vault
  async initializeVault() {
    try {
      console.log('🔧 Initializing Strategy Vault...');
      
      // Reset vault state
      this.vaultState = {
        ...this.vaultState,
        totalDeposits: 0,
        totalUsers: 0,
        isPaused: false,
        totalYieldGenerated: 0,
        lastYieldCalculation: Date.now(),
        userDeposits: new Map(),
        userYieldEarned: new Map(),
        userLastYieldUpdate: new Map(),
        strategies: new Map(),
        activeStrategies: 0,
        totalPnl: 0
      };
      
      console.log(`✅ Strategy Vault initialized successfully`);
      return {
        success: true,
        vaultAddress: this.vaultState.vaultAddress,
        message: 'Strategy Vault initialized successfully',
        supportedTokens: Array.from(this.vaultState.supportedTokens.keys())
      };
    } catch (error) {
      console.error('❌ Strategy Vault initialization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get token data
  getTokenData(symbol) {
    const token = this.vaultState.supportedTokens.get(symbol);
    if (!token) {
      return { success: false, error: 'Token not supported' };
    }

    const marketData = this.vaultState.marketData.get(symbol);
    const volatilityData = this.vaultState.volatilityData.get(symbol);

    return {
      success: true,
      token: {
        ...token,
        marketData,
        volatilityData
      }
    };
  }

  // Get all supported tokens
  getSupportedTokens() {
    return {
      success: true,
      tokens: Array.from(this.vaultState.supportedTokens.values()).map(token => ({
        symbol: token.symbol,
        name: token.name,
        price: this.vaultState.marketData.get(token.symbol)?.price || token.price,
        change24h: this.vaultState.marketData.get(token.symbol)?.change24h || 0,
        volatility: this.vaultState.volatilityData.get(token.symbol)?.current || token.volatility
      }))
    };
  }

  // Update market data (simulated)
  updateMarketData(symbol, newPrice, volatility = null) {
    const token = this.vaultState.supportedTokens.get(symbol);
    if (!token) {
      return { success: false, error: 'Token not supported' };
    }

    const currentData = this.vaultState.marketData.get(symbol);
    const oldPrice = currentData.price;
    const change24h = ((newPrice - oldPrice) / oldPrice) * 100;

    // Update market data
    this.vaultState.marketData.set(symbol, {
      price: newPrice,
      change24h,
      volume24h: currentData.volume24h,
      marketCap: currentData.marketCap,
      lastUpdate: Date.now()
    });

    // Update volatility if provided
    if (volatility !== null) {
      this.vaultState.volatilityData.set(symbol, {
        current: volatility,
        historical: [...this.vaultState.volatilityData.get(symbol).historical, volatility].slice(-100),
        lastUpdate: Date.now()
      });
    }

    // Add to price history
    const priceHistory = this.vaultState.priceHistory.get(symbol);
    priceHistory.push({
      price: newPrice,
      timestamp: Date.now()
    });
    // Keep last 1000 price points
    if (priceHistory.length > 1000) {
      priceHistory.shift();
    }

    return {
      success: true,
      symbol,
      oldPrice,
      newPrice,
      change24h,
      volatility: this.vaultState.volatilityData.get(symbol).current
    };
  }

  // Calculate volatility from price history
  calculateVolatility(symbol, period = 30) {
    const priceHistory = this.vaultState.priceHistory.get(symbol);
    if (!priceHistory || priceHistory.length < 2) {
      return { success: false, error: 'Insufficient price history' };
    }

    // Use available data points, minimum 2 for calculation
    const availablePeriod = Math.min(period, priceHistory.length);
    const recentPrices = priceHistory.slice(-availablePeriod).map(p => p.price);
    const returns = [];
    
    for (let i = 1; i < recentPrices.length; i++) {
      returns.push((recentPrices[i] - recentPrices[i-1]) / recentPrices[i-1]);
    }

    if (returns.length === 0) {
      return { success: false, error: 'No returns calculated' };
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(365); // Annualized

    return {
      success: true,
      volatility,
      period: availablePeriod,
      dataPoints: returns.length
    };
  }

  // Create a strategy
  createStrategy(userPublicKey, strategyConfig) {
    try {
      const userKey = userPublicKey.toString();
      const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const strategy = {
        id: strategyId,
        userId: userKey,
        name: strategyConfig.name || 'Custom Strategy',
        description: strategyConfig.description || '',
        status: 'active',
        createdAt: Date.now(),
        lastExecuted: null,
        totalPnl: 0,
        executions: 0,
        // Token configuration
        baseToken: strategyConfig.baseToken || 'SOL',
        quoteToken: strategyConfig.quoteToken || 'USDC',
        // Position sizing
        positionSize: strategyConfig.positionSize || 0.1, // 10% of deposit
        maxPositionSize: strategyConfig.maxPositionSize || 0.5, // 50% of deposit
        // Time-based logic
        timeFrame: strategyConfig.timeFrame || '1h', // 1h, 4h, 1d, 1w
        executionInterval: strategyConfig.executionInterval || 3600000, // 1 hour in ms
        // Price-based logic
        entryPrice: strategyConfig.entryPrice || null,
        exitPrice: strategyConfig.exitPrice || null,
        stopLoss: strategyConfig.stopLoss || null,
        takeProfit: strategyConfig.takeProfit || null,
        // Volatility logic
        volatilityThreshold: strategyConfig.volatilityThreshold || 0.3,
        volatilityPeriod: strategyConfig.volatilityPeriod || 30,
        // Entry conditions
        entryConditions: strategyConfig.entryConditions || [],
        // Exit conditions
        exitConditions: strategyConfig.exitConditions || [],
        // Hedge configuration
        hedgeEnabled: strategyConfig.hedgeEnabled || false,
        hedgeToken: strategyConfig.hedgeToken || null,
        hedgeRatio: strategyConfig.hedgeRatio || 0.5,
        // Risk management
        maxDrawdown: strategyConfig.maxDrawdown || 0.1, // 10%
        riskPerTrade: strategyConfig.riskPerTrade || 0.02, // 2%
        // Performance tracking
        trades: [],
        currentPosition: null
      };

      this.vaultState.strategies.set(strategyId, strategy);
      this.vaultState.activeStrategies += 1;

      console.log(`📊 Strategy created: ${strategy.name} (${strategyId})`);
      
      return {
        success: true,
        strategyId,
        strategy,
        message: 'Strategy created successfully'
      };
    } catch (error) {
      console.error('❌ Strategy creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Execute strategy
  async executeStrategy(strategyId, marketData = null) {
    try {
      const strategy = this.vaultState.strategies.get(strategyId);
      if (!strategy) {
        return { success: false, error: 'Strategy not found' };
      }

      if (strategy.status !== 'active') {
        return { success: false, error: 'Strategy is not active' };
      }

      // Get current market data
      const currentPrice = this.vaultState.marketData.get(strategy.baseToken)?.price;
      if (!currentPrice) {
        return { success: false, error: 'Unable to get current price' };
      }

      // Check execution interval
      const now = Date.now();
      if (strategy.lastExecuted && (now - strategy.lastExecuted) < strategy.executionInterval) {
        return { success: false, error: 'Execution interval not met' };
      }

      // Evaluate entry conditions
      const shouldEnter = this.evaluateEntryConditions(strategy, currentPrice);
      const shouldExit = this.evaluateExitConditions(strategy, currentPrice);

      let action = null;
      let pnl = 0;

      if (shouldEnter && !strategy.currentPosition) {
        // Enter position
        action = 'enter';
        const positionSize = this.calculatePositionSize(strategy);
        strategy.currentPosition = {
          type: 'long',
          entryPrice: currentPrice,
          size: positionSize,
          timestamp: now,
          hedgePosition: null
        };

        // Execute hedge if enabled
        if (strategy.hedgeEnabled && strategy.hedgeToken) {
          const hedgeSize = positionSize * strategy.hedgeRatio;
          strategy.currentPosition.hedgePosition = {
            token: strategy.hedgeToken,
            size: hedgeSize,
            entryPrice: this.vaultState.marketData.get(strategy.hedgeToken)?.price || 1.0
          };
        }

        console.log(`📈 Strategy ${strategy.name}: Entered position at $${currentPrice}`);
      } else if (shouldExit && strategy.currentPosition) {
        // Exit position
        action = 'exit';
        pnl = this.calculatePnl(strategy.currentPosition, currentPrice);
        
        // Calculate hedge PnL
        let hedgePnl = 0;
        if (strategy.currentPosition.hedgePosition) {
          const hedgePrice = this.vaultState.marketData.get(strategy.hedgePosition.token)?.price || 1.0;
          hedgePnl = this.calculateHedgePnl(strategy.currentPosition.hedgePosition, hedgePrice);
        }

        const totalPnl = pnl + hedgePnl;
        strategy.totalPnl += totalPnl;
        strategy.trades.push({
          entryPrice: strategy.currentPosition.entryPrice,
          exitPrice: currentPrice,
          pnl: totalPnl,
          timestamp: now,
          hedgePnl
        });

        strategy.currentPosition = null;
        strategy.executions += 1;

        console.log(`📉 Strategy ${strategy.name}: Exited position at $${currentPrice}, PnL: $${totalPnl.toFixed(4)}`);
      }

      strategy.lastExecuted = now;

      return {
        success: true,
        strategyId,
        action,
        currentPrice,
        pnl,
        strategy: {
          ...strategy,
          currentPosition: strategy.currentPosition ? {
            ...strategy.currentPosition,
            unrealizedPnl: strategy.currentPosition ? 
              this.calculatePnl(strategy.currentPosition, currentPrice) : 0
          } : null
        }
      };
    } catch (error) {
      console.error('❌ Strategy execution failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Evaluate entry conditions
  evaluateEntryConditions(strategy, currentPrice) {
    if (strategy.entryConditions.length === 0) {
      return true; // No conditions = always enter
    }

    return strategy.entryConditions.every(condition => {
      switch (condition.type) {
        case 'price_above':
          return currentPrice > condition.value;
        case 'price_below':
          return currentPrice < condition.value;
        case 'volatility_above':
          const volatility = this.vaultState.volatilityData.get(strategy.baseToken)?.current;
          return volatility && volatility > condition.value;
        case 'volatility_below':
          const vol = this.vaultState.volatilityData.get(strategy.baseToken)?.current;
          return vol && vol < condition.value;
        case 'time_based':
          const now = new Date();
          const hour = now.getHours();
          return hour >= condition.startHour && hour <= condition.endHour;
        default:
          return true;
      }
    });
  }

  // Evaluate exit conditions
  evaluateExitConditions(strategy, currentPrice) {
    if (!strategy.currentPosition) return false;
    if (strategy.exitConditions.length === 0) return false;

    return strategy.exitConditions.some(condition => {
      switch (condition.type) {
        case 'stop_loss':
          return currentPrice <= strategy.currentPosition.entryPrice * (1 - condition.value);
        case 'take_profit':
          return currentPrice >= strategy.currentPosition.entryPrice * (1 + condition.value);
        case 'time_based':
          const timeInPosition = Date.now() - strategy.currentPosition.timestamp;
          return timeInPosition >= condition.duration;
        case 'volatility_exit':
          const volatility = this.vaultState.volatilityData.get(strategy.baseToken)?.current;
          return volatility && volatility > condition.value;
        default:
          return false;
      }
    });
  }

  // Calculate position size
  calculatePositionSize(strategy) {
    const userDeposit = this.vaultState.userDeposits.get(strategy.userId) || 0;
    return userDeposit * strategy.positionSize;
  }

  // Calculate PnL
  calculatePnl(position, currentPrice) {
    if (!position) return 0;
    const priceChange = (currentPrice - position.entryPrice) / position.entryPrice;
    return position.size * priceChange;
  }

  // Calculate hedge PnL
  calculateHedgePnl(hedgePosition, currentHedgePrice) {
    const priceChange = (currentHedgePrice - hedgePosition.entryPrice) / hedgePosition.entryPrice;
    return hedgePosition.size * priceChange * -1; // Inverse correlation
  }

  // Get strategy performance
  getStrategyPerformance(strategyId) {
    const strategy = this.vaultState.strategies.get(strategyId);
    if (!strategy) {
      return { success: false, error: 'Strategy not found' };
    }

    const trades = strategy.trades;
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.pnl > 0).length;
    const losingTrades = trades.filter(t => t.pnl < 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const avgPnl = totalTrades > 0 ? totalPnl / totalTrades : 0;
    
    const maxDrawdown = this.calculateMaxDrawdown(trades);

    return {
      success: true,
      strategyId,
      performance: {
        totalPnl,
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        avgPnl,
        maxDrawdown,
        currentPosition: strategy.currentPosition,
        lastExecuted: strategy.lastExecuted
      }
    };
  }

  // Calculate max drawdown
  calculateMaxDrawdown(trades) {
    if (trades.length === 0) return 0;
    
    let peak = 0;
    let maxDrawdown = 0;
    let runningPnl = 0;

    trades.forEach(trade => {
      runningPnl += trade.pnl;
      if (runningPnl > peak) {
        peak = runningPnl;
      }
      const drawdown = (peak - runningPnl) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return maxDrawdown;
  }

  // Get all strategies for a user
  getUserStrategies(userPublicKey) {
    const userKey = userPublicKey.toString();
    const userStrategies = Array.from(this.vaultState.strategies.values())
      .filter(strategy => strategy.userId === userKey);

    return {
      success: true,
      strategies: userStrategies.map(strategy => ({
        ...strategy,
        performance: this.getStrategyPerformance(strategy.id).performance
      }))
    };
  }

  // Pause/Resume strategy
  toggleStrategy(strategyId, action) {
    const strategy = this.vaultState.strategies.get(strategyId);
    if (!strategy) {
      return { success: false, error: 'Strategy not found' };
    }

    if (action === 'pause') {
      strategy.status = 'paused';
      console.log(`⏸️ Strategy ${strategy.name} paused`);
    } else if (action === 'resume') {
      strategy.status = 'active';
      console.log(`▶️ Strategy ${strategy.name} resumed`);
    }

    return {
      success: true,
      strategyId,
      status: strategy.status,
      message: `Strategy ${action}d successfully`
    };
  }

  // Delete strategy
  deleteStrategy(strategyId) {
    const strategy = this.vaultState.strategies.get(strategyId);
    if (!strategy) {
      return { success: false, error: 'Strategy not found' };
    }

    this.vaultState.strategies.delete(strategyId);
    if (strategy.status === 'active') {
      this.vaultState.activeStrategies -= 1;
    }

    console.log(`🗑️ Strategy ${strategy.name} deleted`);
    
    return {
      success: true,
      strategyId,
      message: 'Strategy deleted successfully'
    };
  }

  // Get vault analytics
  getVaultAnalytics() {
    const strategies = Array.from(this.vaultState.strategies.values());
    const activeStrategies = strategies.filter(s => s.status === 'active');
    const totalPnl = strategies.reduce((sum, s) => sum + s.totalPnl, 0);
    const totalTrades = strategies.reduce((sum, s) => sum + s.trades.length, 0);

    return {
      success: true,
      analytics: {
        totalStrategies: strategies.length,
        activeStrategies: activeStrategies.length,
        totalPnl,
        totalTrades,
        avgPnlPerStrategy: strategies.length > 0 ? totalPnl / strategies.length : 0,
        avgTradesPerStrategy: strategies.length > 0 ? totalTrades / strategies.length : 0,
        supportedTokens: Array.from(this.vaultState.supportedTokens.keys()),
        marketData: Object.fromEntries(this.vaultState.marketData)
      }
    };
  }

  // Inherit all the basic vault functionality
  calculateUserYield(userPublicKey) {
    const userKey = userPublicKey.toString();
    const userDeposit = this.vaultState.userDeposits.get(userKey) || 0;
    const lastUpdate = this.vaultState.userLastYieldUpdate.get(userKey) || this.vaultState.lastYieldCalculation;
    const currentTime = Date.now();
    
    if (userDeposit === 0) return 0;
    
    const timeElapsed = currentTime - lastUpdate;
    const daysElapsed = timeElapsed / (24 * 60 * 60 * 1000);
    
    const yieldAmount = (userDeposit * this.vaultState.yieldRate * daysElapsed) / 365;
    
    return Math.max(0, yieldAmount);
  }

  // Calculate yield for a user with custom time (for testing)
  calculateUserYieldWithTime(userPublicKey, customTime) {
    const userKey = userPublicKey.toString();
    const userDeposit = this.vaultState.userDeposits.get(userKey) || 0;
    const lastUpdate = this.vaultState.userLastYieldUpdate.get(userKey) || this.vaultState.lastYieldCalculation;
    
    if (userDeposit === 0) return 0;
    
    const timeElapsed = customTime - lastUpdate;
    const daysElapsed = timeElapsed / (24 * 60 * 60 * 1000);
    
    const yieldAmount = (userDeposit * this.vaultState.yieldRate * daysElapsed) / 365;
    
    return Math.max(0, yieldAmount);
  }

  updateAllYields() {
    const currentTime = Date.now();
    let totalYield = 0;
    
    for (const [userKey, deposit] of this.vaultState.userDeposits) {
      const yieldAmount = this.calculateUserYield(userKey);
      const currentEarned = this.vaultState.userYieldEarned.get(userKey) || 0;
      
      this.vaultState.userYieldEarned.set(userKey, currentEarned + yieldAmount);
      this.vaultState.userLastYieldUpdate.set(userKey, currentTime);
      totalYield += yieldAmount;
    }
    
    this.vaultState.totalYieldGenerated += totalYield;
    this.vaultState.lastYieldCalculation = currentTime;
    
    return totalYield;
  }

  // Claim yield for a user
  async claimYield(userPublicKey) {
    try {
      const userKey = userPublicKey.toString();
      const earnedYield = this.vaultState.userYieldEarned.get(userKey) || 0;
      
      if (earnedYield <= 0) {
        return { success: false, error: 'No yield to claim' };
      }
      
      console.log(`🎁 Claiming yield: ${earnedYield.toFixed(6)} SOL`);
      console.log(`👤 User: ${userKey}`);
      
      // Reset earned yield
      this.vaultState.userYieldEarned.set(userKey, 0);
      
      // Create transaction for yield transfer
      const transaction = new Transaction();
      const lamports = Math.floor(earnedYield * LAMPORTS_PER_SOL);
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(this.vaultState.vaultAddress),
          toPubkey: userPublicKey,
          lamports: lamports
        })
      );
      
      console.log(`✅ Yield claimed successfully`);
      
      return {
        success: true,
        amount: earnedYield,
        lamports: lamports,
        transaction: transaction,
        message: 'Yield claimed successfully'
      };
    } catch (error) {
      console.error('❌ Yield claim failed:', error);
      return { success: false, error: error.message };
    }
  }

  async depositSol(userPublicKey, amount) {
    try {
      if (this.vaultState.isPaused) {
        return { success: false, error: 'Vault is paused' };
      }
      
      const userKey = userPublicKey.toString();
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      console.log(`💰 Processing deposit: ${amount} SOL (${lamports} lamports)`);
      console.log(`👤 User: ${userKey}`);
      
      this.updateAllYields();
      
      const currentDeposit = this.vaultState.userDeposits.get(userKey) || 0;
      const newDeposit = currentDeposit + amount;
      this.vaultState.userDeposits.set(userKey, newDeposit);
      
      this.vaultState.userLastYieldUpdate.set(userKey, Date.now());
      
      this.vaultState.totalDeposits += amount;
      if (currentDeposit === 0) {
        this.vaultState.totalUsers += 1;
      }
      
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: new PublicKey(this.vaultState.vaultAddress),
          lamports: lamports
        })
      );
      
      console.log(`✅ Deposit processed successfully`);
      console.log(`📊 Total deposits: ${this.vaultState.totalDeposits} SOL`);
      console.log(`👥 Total users: ${this.vaultState.totalUsers}`);
      
      return {
        success: true,
        amount: amount,
        lamports: lamports,
        userDeposit: newDeposit,
        totalDeposits: this.vaultState.totalDeposits,
        transaction: transaction,
        currentYield: this.vaultState.userYieldEarned.get(userKey) || 0
      };
    } catch (error) {
      console.error('❌ Deposit failed:', error);
      return { success: false, error: error.message };
    }
  }

  async withdrawSol(userPublicKey, amount) {
    try {
      if (this.vaultState.isPaused) {
        return { success: false, error: 'Vault is paused' };
      }
      
      const userKey = userPublicKey.toString();
      
      this.updateAllYields();
      
      const currentDeposit = this.vaultState.userDeposits.get(userKey) || 0;
      const earnedYield = this.vaultState.userYieldEarned.get(userKey) || 0;
      const totalAvailable = currentDeposit + earnedYield;
      
      if (amount > totalAvailable) {
        return {
          success: false,
          error: `Insufficient funds. Available: ${totalAvailable.toFixed(6)} SOL (${currentDeposit} deposit + ${earnedYield.toFixed(6)} yield)`
        };
      }
      
      console.log(`💸 Processing withdrawal: ${amount} SOL`);
      console.log(`👤 User: ${userKey}`);
      console.log(`💰 Available: ${totalAvailable} SOL (${currentDeposit} deposit + ${earnedYield} yield)`);
      
      let withdrawFromDeposit = Math.min(amount, currentDeposit);
      let withdrawFromYield = amount - withdrawFromDeposit;
      
      const newDeposit = currentDeposit - withdrawFromDeposit;
      this.vaultState.userDeposits.set(userKey, newDeposit);
      
      const newYield = earnedYield - withdrawFromYield;
      this.vaultState.userYieldEarned.set(userKey, newYield);
      
      this.vaultState.totalDeposits -= withdrawFromDeposit;
      
      if (newDeposit === 0) {
        this.vaultState.totalUsers = Math.max(0, this.vaultState.totalUsers - 1);
      }
      
      const transaction = new Transaction();
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(this.vaultState.vaultAddress),
          toPubkey: userPublicKey,
          lamports: lamports
        })
      );
      
      console.log(`✅ Withdrawal processed successfully`);
      console.log(`📊 Total deposits: ${this.vaultState.totalDeposits} SOL`);
      console.log(`👥 Total users: ${this.vaultState.totalUsers}`);
      
      return {
        success: true,
        amount: amount,
        lamports: lamports,
        remainingDeposit: newDeposit,
        remainingYield: newYield,
        totalDeposits: this.vaultState.totalDeposits,
        transaction: transaction,
        withdrawFromDeposit: withdrawFromDeposit,
        withdrawFromYield: withdrawFromYield
      };
    } catch (error) {
      console.error('❌ Withdrawal failed:', error);
      return { success: false, error: error.message };
    }
  }

  getUserDeposit(userPublicKey) {
    const userKey = userPublicKey.toString();
    const deposit = this.vaultState.userDeposits.get(userKey) || 0;
    const earnedYield = this.vaultState.userYieldEarned.get(userKey) || 0;
    const currentYield = this.calculateUserYield(userPublicKey);
    const totalAvailable = deposit + earnedYield + currentYield;
    
    return {
      deposit: deposit,
      earnedYield: earnedYield,
      currentYield: currentYield,
      totalAvailable: totalAvailable,
      yieldRate: this.vaultState.yieldRate,
      lastUpdate: this.vaultState.userLastYieldUpdate.get(userKey) || this.vaultState.lastYieldCalculation
    };
  }

  getVaultInfo() {
    return {
      totalDeposits: this.vaultState.totalDeposits,
      totalUsers: this.vaultState.totalUsers,
      isPaused: this.vaultState.isPaused,
      vaultAddress: this.vaultState.vaultAddress,
      totalYieldGenerated: this.vaultState.totalYieldGenerated,
      yieldRate: this.vaultState.yieldRate,
      lastYieldCalculation: this.vaultState.lastYieldCalculation,
      activeStrategies: this.vaultState.activeStrategies,
      totalPnl: this.vaultState.totalPnl
    };
  }

  getStatistics() {
    const stats = this.getVaultInfo();
    const deposits = Array.from(this.vaultState.userDeposits.values());
    const totalYieldDistributed = Array.from(this.vaultState.userYieldEarned.values()).reduce((a, b) => a + b, 0);
    
    return {
      ...stats,
      averageDeposit: deposits.length > 0 ? deposits.reduce((a, b) => a + b, 0) / deposits.length : 0,
      largestDeposit: deposits.length > 0 ? Math.max(...deposits) : 0,
      totalYieldDistributed: totalYieldDistributed,
      activeUsers: this.vaultState.totalUsers,
      yieldPerUser: this.vaultState.totalUsers > 0 ? totalYieldDistributed / this.vaultState.totalUsers : 0,
      strategies: this.vaultState.strategies.size,
      activeStrategies: this.vaultState.activeStrategies
    };
  }

  pauseVault() {
    try {
      this.vaultState.isPaused = true;
      console.log('⏸️ Strategy Vault paused');
      return { success: true, message: 'Strategy Vault paused successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  resumeVault() {
    try {
      this.vaultState.isPaused = false;
      console.log('▶️ Strategy Vault resumed');
      return { success: true, message: 'Strategy Vault resumed successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async emergencyWithdraw(destinationPublicKey) {
    try {
      console.log(`🚨 Emergency withdrawal: ${this.vaultState.totalDeposits} SOL`);
      console.log(`🎯 Destination: ${destinationPublicKey.toString()}`);
      
      const totalAmount = this.vaultState.totalDeposits;
      
      this.vaultState.userDeposits.clear();
      this.vaultState.userYieldEarned.clear();
      this.vaultState.userLastYieldUpdate.clear();
      this.vaultState.totalDeposits = 0;
      this.vaultState.totalUsers = 0;
      this.vaultState.totalYieldGenerated = 0;
      
      const transaction = new Transaction();
      const lamports = Math.floor(totalAmount * LAMPORTS_PER_SOL);
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(this.vaultState.vaultAddress),
          toPubkey: destinationPublicKey,
          lamports: lamports
        })
      );
      
      console.log(`✅ Emergency withdrawal completed`);
      
      return {
        success: true,
        amount: totalAmount,
        destination: destinationPublicKey.toString(),
        transaction: transaction,
        message: 'Emergency withdrawal completed successfully'
      };
    } catch (error) {
      console.error('❌ Emergency withdrawal failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = StrategyVaultContract; 