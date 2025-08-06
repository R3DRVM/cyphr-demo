const { Connection, PublicKey } = require('@solana/web3.js');
const VaultContract = require('../contracts/vault/VaultContract');
const networks = require('../config/networks');

/**
 * Frontend Bridge Service
 * Provides a clean API for the React frontend to interact with smart contracts
 */
class FrontendBridge {
  constructor(network = 'devnet') {
    this.network = network;
    this.connection = new Connection(networks[network].url, 'confirmed');
    this.vaultContract = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the bridge with contract addresses
   */
  async initialize(programId, authorityPublicKey) {
    try {
      console.log('🔧 Initializing Frontend Bridge...');
      
      this.vaultContract = new VaultContract(
        this.connection, 
        programId, 
        new PublicKey(authorityPublicKey)
      );
      
      const initResult = await this.vaultContract.initializeVault();
      
      if (initResult.success) {
        this.isInitialized = true;
        console.log('✅ Frontend Bridge initialized successfully');
        return {
          success: true,
          vaultAddress: initResult.vaultAddress,
          message: 'Bridge initialized successfully'
        };
      } else {
        throw new Error(initResult.error);
      }
    } catch (error) {
      console.error('❌ Bridge initialization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get wallet information for the frontend
   */
  async getWalletInfo(publicKey) {
    try {
      if (!this.isInitialized) {
        throw new Error('Bridge not initialized');
      }

      const balance = await this.connection.getBalance(new PublicKey(publicKey));
      const userDeposit = this.vaultContract.getUserDeposit(new PublicKey(publicKey));
      
      return {
        success: true,
        wallet: {
          publicKey: publicKey,
          balance: balance / 1e9, // Convert lamports to SOL
          connected: true
        },
        vault: {
          userDeposit: userDeposit.deposit,
          totalDeposits: this.vaultContract.getVaultInfo().totalDeposits,
          totalUsers: this.vaultContract.getVaultInfo().totalUsers
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Simulate a strategy execution
   */
  async simulateStrategy(userPublicKey, strategyConfig) {
    try {
      if (!this.isInitialized) {
        throw new Error('Bridge not initialized');
      }

      const simulation = await this.vaultContract.simulateDeposit(
        new PublicKey(userPublicKey), 
        strategyConfig.amount
      );

      if (simulation.success) {
        // Calculate expected returns based on strategy
        const expectedProfit = (strategyConfig.amount * strategyConfig.profitTarget) / 100;
        const aiImprovement = strategyConfig.useAI ? 75 : 0;
        
        return {
          success: true,
          simulation: {
            canExecute: true,
            estimatedFee: simulation.estimatedFee,
            userBalance: simulation.userBalance,
            expectedProfit: expectedProfit,
            totalReturn: strategyConfig.profitTarget + aiImprovement,
            timeToExit: strategyConfig.duration,
            successRate: 95.0,
            riskLevel: strategyConfig.riskLevel,
            aiImprovement: aiImprovement
          }
        };
      } else {
        return {
          success: false,
          error: simulation.error,
          simulation: {
            canExecute: false,
            estimatedFee: 0,
            userBalance: simulation.userBalance || 0
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute a strategy (deposit SOL)
   */
  async executeStrategy(userPublicKey, strategyConfig) {
    try {
      if (!this.isInitialized) {
        throw new Error('Bridge not initialized');
      }

      console.log(`🚀 Executing strategy for user: ${userPublicKey}`);
      console.log(`📊 Strategy config:`, strategyConfig);

      const result = await this.vaultContract.depositSol(
        new PublicKey(userPublicKey),
        strategyConfig.amount
      );

      if (result.success) {
        return {
          success: true,
          transaction: result.transaction,
          amount: result.amount,
          userDeposit: result.userDeposit,
          totalDeposits: result.totalDeposits,
          message: 'Strategy executed successfully'
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('❌ Strategy execution failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Withdraw SOL from vault
   */
  async withdrawSol(userPublicKey, amount) {
    try {
      if (!this.isInitialized) {
        throw new Error('Bridge not initialized');
      }

      console.log(`💸 Processing withdrawal: ${amount} SOL`);

      const result = await this.vaultContract.withdrawSol(
        new PublicKey(userPublicKey),
        amount
      );

      if (result.success) {
        return {
          success: true,
          transaction: result.transaction,
          amount: result.amount,
          remainingDeposit: result.remainingDeposit,
          totalDeposits: result.totalDeposits,
          message: 'Withdrawal successful'
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('❌ Withdrawal failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get vault statistics for dashboard
   */
  getVaultStatistics() {
    try {
      if (!this.isInitialized) {
        throw new Error('Bridge not initialized');
      }

      const stats = this.vaultContract.getStatistics();
      const vaultInfo = this.vaultContract.getVaultInfo();

      return {
        success: true,
        statistics: {
          totalDeposits: stats.totalDeposits,
          totalUsers: stats.totalUsers,
          averageDeposit: stats.averageDeposit,
          largestDeposit: stats.largestDeposit,
          isPaused: stats.isPaused,
          vaultAddress: vaultInfo.vaultAddress
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's vault information
   */
  getUserVaultInfo(userPublicKey) {
    try {
      if (!this.isInitialized) {
        throw new Error('Bridge not initialized');
      }

      const userDeposit = this.vaultContract.getUserDeposit(new PublicKey(userPublicKey));
      const vaultInfo = this.vaultContract.getVaultInfo();

      return {
        success: true,
        userInfo: {
          user: userDeposit.user,
          deposit: userDeposit.deposit,
          lamports: userDeposit.lamports
        },
        vaultInfo: {
          totalDeposits: vaultInfo.totalDeposits,
          totalUsers: vaultInfo.totalUsers,
          isPaused: vaultInfo.isPaused
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Emergency functions (authority only)
   */
  async emergencyPause() {
    try {
      if (!this.isInitialized) {
        throw new Error('Bridge not initialized');
      }

      const result = this.vaultContract.pauseVault();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async emergencyResume() {
    try {
      if (!this.isInitialized) {
        throw new Error('Bridge not initialized');
      }

      const result = this.vaultContract.resumeVault();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get network information
   */
  getNetworkInfo() {
    return {
      network: this.network,
      url: networks[this.network].url,
      explorer: networks[this.network].explorer,
      name: networks[this.network].name
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const version = await this.connection.getVersion();
      return {
        success: true,
        network: this.network,
        solanaVersion: version['solana-core'],
        bridgeInitialized: this.isInitialized,
        vaultInitialized: this.vaultContract !== null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = FrontendBridge; 