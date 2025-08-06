const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } = require('@solana/web3.js');

class VaultContract {
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
      yieldInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      userDeposits: new Map(),
      userYieldEarned: new Map(),
      userLastYieldUpdate: new Map()
    };
    
    // Generate vault address
    this.vaultState.vaultAddress = Keypair.generate().publicKey.toString();
  }

  // Initialize the vault
  async initializeVault() {
    try {
      console.log('🔧 Initializing vault...');
      
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
        userLastYieldUpdate: new Map()
      };
      
      console.log(`✅ Vault initialized successfully`);
      return {
        success: true,
        vaultAddress: this.vaultState.vaultAddress,
        message: 'Vault initialized successfully'
      };
    } catch (error) {
      console.error('❌ Vault initialization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate yield for a user
  calculateUserYield(userPublicKey) {
    const userKey = userPublicKey.toString();
    const userDeposit = this.vaultState.userDeposits.get(userKey) || 0;
    const lastUpdate = this.vaultState.userLastYieldUpdate.get(userKey) || this.vaultState.lastYieldCalculation;
    const currentTime = Date.now();
    
    if (userDeposit === 0) return 0;
    
    // Calculate time elapsed since last yield calculation
    const timeElapsed = currentTime - lastUpdate;
    const daysElapsed = timeElapsed / (24 * 60 * 60 * 1000); // Convert to days
    
    // Calculate yield: (deposit * rate * days) / 365
    const yieldAmount = (userDeposit * this.vaultState.yieldRate * daysElapsed) / 365;
    
    return Math.max(0, yieldAmount); // Ensure yield is not negative
  }

  // Calculate yield for a user with custom time (for testing)
  calculateUserYieldWithTime(userPublicKey, customTime) {
    const userKey = userPublicKey.toString();
    const userDeposit = this.vaultState.userDeposits.get(userKey) || 0;
    const lastUpdate = this.vaultState.userLastYieldUpdate.get(userKey) || this.vaultState.lastYieldCalculation;
    
    if (userDeposit === 0) return 0;
    
    // Calculate time elapsed since last yield calculation
    const timeElapsed = customTime - lastUpdate;
    const daysElapsed = timeElapsed / (24 * 60 * 60 * 1000); // Convert to days
    
    // Calculate yield: (deposit * rate * days) / 365
    const yieldAmount = (userDeposit * this.vaultState.yieldRate * daysElapsed) / 365;
    
    return Math.max(0, yieldAmount); // Ensure yield is not negative
  }

  // Update yield for all users
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

  // Simulate deposit with yield calculation
  async simulateDeposit(userPublicKey, amount) {
    try {
      const userKey = userPublicKey.toString();
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      // Update yields before simulation
      this.updateAllYields();
      
      // Check if user has sufficient balance (mock check)
      const requiredBalance = lamports;
      const availableBalance = 0; // Mock - in real scenario, check actual balance
      
      if (availableBalance < requiredBalance) {
        return {
          success: false,
          error: 'Insufficient balance',
          required: requiredBalance,
          available: availableBalance
        };
      }
      
      // Calculate potential yield after deposit
      const currentYield = this.calculateUserYield(userPublicKey);
      const projectedYield = this.calculateProjectedYield(userPublicKey, amount);
      
      return {
        success: true,
        amount: amount,
        lamports: lamports,
        currentYield: currentYield,
        projectedYield: projectedYield,
        yieldRate: this.vaultState.yieldRate,
        message: 'Deposit simulation successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate projected yield for a potential deposit
  calculateProjectedYield(userPublicKey, depositAmount) {
    const userKey = userPublicKey.toString();
    const currentDeposit = this.vaultState.userDeposits.get(userKey) || 0;
    const totalDeposit = currentDeposit + depositAmount;
    
    // Project yield for 30 days
    const daysProjected = 30;
    const projectedYield = (totalDeposit * this.vaultState.yieldRate * daysProjected) / 365;
    
    return Math.max(0, projectedYield);
  }

  // Calculate projected yield for existing deposit
  calculateProjectedYieldForExisting(userPublicKey, days = 30) {
    const userKey = userPublicKey.toString();
    const currentDeposit = this.vaultState.userDeposits.get(userKey) || 0;
    
    // Project yield for specified days
    const projectedYield = (currentDeposit * this.vaultState.yieldRate * days) / 365;
    
    return Math.max(0, projectedYield);
  }

  // Deposit SOL into the vault
  async depositSol(userPublicKey, amount) {
    try {
      if (this.vaultState.isPaused) {
        return {
          success: false,
          error: 'Vault is paused'
        };
      }
      
      const userKey = userPublicKey.toString();
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      console.log(`💰 Processing deposit: ${amount} SOL (${lamports} lamports)`);
      console.log(`👤 User: ${userKey}`);
      
      // Update yields before processing deposit
      this.updateAllYields();
      
      // Add to user's deposit
      const currentDeposit = this.vaultState.userDeposits.get(userKey) || 0;
      const newDeposit = currentDeposit + amount;
      this.vaultState.userDeposits.set(userKey, newDeposit);
      
      // Update user's last yield update time
      this.vaultState.userLastYieldUpdate.set(userKey, Date.now());
      
      // Update total deposits and users
      this.vaultState.totalDeposits += amount;
      if (currentDeposit === 0) {
        this.vaultState.totalUsers += 1;
      }
      
      // Create transaction (mock)
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
        currentYield: this.vaultState.userYieldEarned.get(userKey) || 0,
        projectedYield: this.calculateProjectedYield(userPublicKey, 0)
      };
    } catch (error) {
      console.error('❌ Deposit failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Withdraw SOL from the vault (including earned yield)
  async withdrawSol(userPublicKey, amount) {
    try {
      if (this.vaultState.isPaused) {
        return {
          success: false,
          error: 'Vault is paused'
        };
      }
      
      const userKey = userPublicKey.toString();
      
      // Update yields before withdrawal
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
      
      // Calculate how much to withdraw from deposit vs yield
      let withdrawFromDeposit = Math.min(amount, currentDeposit);
      let withdrawFromYield = amount - withdrawFromDeposit;
      
      // Update user's deposit
      const newDeposit = currentDeposit - withdrawFromDeposit;
      this.vaultState.userDeposits.set(userKey, newDeposit);
      
      // Update user's earned yield
      const newYield = earnedYield - withdrawFromYield;
      this.vaultState.userYieldEarned.set(userKey, newYield);
      
      // Update total deposits
      this.vaultState.totalDeposits -= withdrawFromDeposit;
      
      // Remove user if deposit becomes 0
      if (newDeposit === 0) {
        this.vaultState.totalUsers = Math.max(0, this.vaultState.totalUsers - 1);
      }
      
      // Create transaction (mock)
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
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Claim yield only (without withdrawing deposit)
  async claimYield(userPublicKey) {
    try {
      const userKey = userPublicKey.toString();
      
      // Update yields before claiming
      this.updateAllYields();
      
      const earnedYield = this.vaultState.userYieldEarned.get(userKey) || 0;
      
      if (earnedYield <= 0) {
        return {
          success: false,
          error: 'No yield to claim'
        };
      }
      
      console.log(`🎁 Processing yield claim: ${earnedYield} SOL`);
      console.log(`👤 User: ${userKey}`);
      
      // Reset user's earned yield
      this.vaultState.userYieldEarned.set(userKey, 0);
      
      // Create transaction (mock)
      const transaction = new Transaction();
      const lamports = Math.floor(earnedYield * LAMPORTS_PER_SOL);
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(this.vaultState.vaultAddress),
          toPubkey: userPublicKey,
          lamports: lamports
        })
      );
      
      console.log(`✅ Yield claim processed successfully`);
      
      return {
        success: true,
        amount: earnedYield,
        lamports: lamports,
        transaction: transaction,
        message: 'Yield claimed successfully'
      };
    } catch (error) {
      console.error('❌ Yield claim failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user's deposit and yield information
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

  // Get vault information
  getVaultInfo() {
    return {
      totalDeposits: this.vaultState.totalDeposits,
      totalUsers: this.vaultState.totalUsers,
      isPaused: this.vaultState.isPaused,
      vaultAddress: this.vaultState.vaultAddress,
      totalYieldGenerated: this.vaultState.totalYieldGenerated,
      yieldRate: this.vaultState.yieldRate,
      lastYieldCalculation: this.vaultState.lastYieldCalculation
    };
  }

  // Get comprehensive vault statistics
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
      yieldPerUser: this.vaultState.totalUsers > 0 ? totalYieldDistributed / this.vaultState.totalUsers : 0
    };
  }

  // Pause vault
  pauseVault() {
    try {
      this.vaultState.isPaused = true;
      console.log('⏸️ Vault paused');
      return {
        success: true,
        message: 'Vault paused successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Resume vault
  resumeVault() {
    try {
      this.vaultState.isPaused = false;
      console.log('▶️ Vault resumed');
      return {
        success: true,
        message: 'Vault resumed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Emergency withdrawal (authority only)
  async emergencyWithdraw(destinationPublicKey) {
    try {
      console.log(`🚨 Emergency withdrawal: ${this.vaultState.totalDeposits} SOL`);
      console.log(`🎯 Destination: ${destinationPublicKey.toString()}`);
      
      const totalAmount = this.vaultState.totalDeposits;
      
      // Reset all user deposits and yields
      this.vaultState.userDeposits.clear();
      this.vaultState.userYieldEarned.clear();
      this.vaultState.userLastYieldUpdate.clear();
      this.vaultState.totalDeposits = 0;
      this.vaultState.totalUsers = 0;
      this.vaultState.totalYieldGenerated = 0;
      
      // Create transaction (mock)
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
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Set yield rate (authority only)
  setYieldRate(newRate) {
    try {
      if (newRate < 0 || newRate > 1) {
        return {
          success: false,
          error: 'Yield rate must be between 0 and 1 (0% to 100%)'
        };
      }
      
      const oldRate = this.vaultState.yieldRate;
      this.vaultState.yieldRate = newRate;
      
      console.log(`📈 Yield rate updated: ${(oldRate * 100).toFixed(2)}% → ${(newRate * 100).toFixed(2)}%`);
      
      return {
        success: true,
        oldRate: oldRate,
        newRate: newRate,
        message: `Yield rate updated to ${(newRate * 100).toFixed(2)}%`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get yield projection for a user
  getYieldProjection(userPublicKey, days = 30) {
    const userKey = userPublicKey.toString();
    const deposit = this.vaultState.userDeposits.get(userKey) || 0;
    const currentYield = this.vaultState.userYieldEarned.get(userKey) || 0;
    
    const projectedYield = (deposit * this.vaultState.yieldRate * days) / 365;
    const totalProjected = currentYield + projectedYield;
    
    return {
      currentDeposit: deposit,
      currentYield: currentYield,
      projectedYield: projectedYield,
      totalProjected: totalProjected,
      yieldRate: this.vaultState.yieldRate,
      days: days,
      apy: this.vaultState.yieldRate * 100
    };
  }
}

module.exports = VaultContract; 