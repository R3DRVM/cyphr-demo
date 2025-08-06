const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

/**
 * Contract Service for Frontend Integration
 * Loads deployed contract addresses and ABI files for real blockchain interaction
 */
class ContractService {
  constructor() {
    this.deploymentInfo = null;
    this.strategyVaultABI = null;
    this.basicVaultABI = null;
    this.connection = null;
    this.network = null;
  }

  /**
   * Initialize the contract service
   */
  async initialize(networkName = 'devnet') {
    try {
      console.log('🔧 Initializing Contract Service...');
      
      // Load deployment info
      const deploymentInfoPath = path.join(__dirname, '..', 'deployment-info.json');
      if (fs.existsSync(deploymentInfoPath)) {
        this.deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
        console.log('✅ Deployment info loaded');
      } else {
        throw new Error('No deployment info found. Please deploy contracts first.');
      }

      // Load ABI files
      const abiDir = path.join(__dirname, '..', 'abi');
      
      const strategyVaultABIPath = path.join(abiDir, 'strategy-vault-abi.json');
      if (fs.existsSync(strategyVaultABIPath)) {
        this.strategyVaultABI = JSON.parse(fs.readFileSync(strategyVaultABIPath, 'utf8'));
        console.log('✅ Strategy Vault ABI loaded');
      }

      const basicVaultABIPath = path.join(abiDir, 'basic-vault-abi.json');
      if (fs.existsSync(basicVaultABIPath)) {
        this.basicVaultABI = JSON.parse(fs.readFileSync(basicVaultABIPath, 'utf8'));
        console.log('✅ Basic Vault ABI loaded');
      }

      // Setup network connection
      const networks = require('../config/networks');
      this.network = networks[networkName];
      this.connection = new Connection(this.network.url, 'confirmed');
      
      console.log(`🌐 Connected to ${this.network.name}`);
      console.log(`📡 Network URL: ${this.network.url}`);
      
      return {
        success: true,
        deploymentInfo: this.deploymentInfo,
        network: this.network.name,
        contracts: {
          strategyVault: this.deploymentInfo.contracts.strategyVault.programId,
          basicVault: this.deploymentInfo.contracts.basicVault.programId
        }
      };

    } catch (error) {
      console.error('❌ Contract service initialization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get contract addresses
   */
  getContractAddresses() {
    if (!this.deploymentInfo) {
      throw new Error('Contract service not initialized');
    }

    return {
      strategyVault: this.deploymentInfo.contracts.strategyVault.programId,
      basicVault: this.deploymentInfo.contracts.basicVault.programId,
      network: this.deploymentInfo.network,
      deployedAt: this.deploymentInfo.deployedAt
    };
  }

  /**
   * Get ABI for a contract
   */
  getABI(contractName) {
    switch (contractName) {
      case 'strategyVault':
        return this.strategyVaultABI;
      case 'basicVault':
        return this.basicVaultABI;
      default:
        throw new Error(`Unknown contract: ${contractName}`);
    }
  }

  /**
   * Create a transaction for depositing SOL
   */
  async createDepositTransaction(userPublicKey, amount, contractName = 'strategyVault') {
    try {
      const contractAddress = this.getContractAddresses()[contractName];
      const abi = this.getABI(contractName);
      
      const transaction = new Transaction();
      
      // Add deposit instruction
      transaction.add({
        programId: new PublicKey(contractAddress),
        keys: [
          { pubkey: new PublicKey(contractAddress), isSigner: false, isWritable: true },
          { pubkey: userPublicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        data: Buffer.from([0x01, ...this.serializeU64(amount * LAMPORTS_PER_SOL)]) // depositSol instruction
      });

      return {
        success: true,
        transaction,
        contractAddress,
        amount,
        lamports: amount * LAMPORTS_PER_SOL
      };

    } catch (error) {
      console.error('❌ Failed to create deposit transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a transaction for withdrawing SOL
   */
  async createWithdrawTransaction(userPublicKey, amount, contractName = 'strategyVault') {
    try {
      const contractAddress = this.getContractAddresses()[contractName];
      const abi = this.getABI(contractName);
      
      const transaction = new Transaction();
      
      // Add withdraw instruction
      transaction.add({
        programId: new PublicKey(contractAddress),
        keys: [
          { pubkey: new PublicKey(contractAddress), isSigner: false, isWritable: true },
          { pubkey: userPublicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        data: Buffer.from([0x02, ...this.serializeU64(amount * LAMPORTS_PER_SOL)]) // withdrawSol instruction
      });

      return {
        success: true,
        transaction,
        contractAddress,
        amount,
        lamports: amount * LAMPORTS_PER_SOL
      };

    } catch (error) {
      console.error('❌ Failed to create withdraw transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a transaction for creating a strategy
   */
  async createStrategyTransaction(userPublicKey, strategyConfig, contractName = 'strategyVault') {
    try {
      const contractAddress = this.getContractAddresses()[contractName];
      const abi = this.getABI(contractName);
      
      const transaction = new Transaction();
      
      // Serialize strategy config
      const configBuffer = Buffer.from(JSON.stringify(strategyConfig));
      
      // Add create strategy instruction
      transaction.add({
        programId: new PublicKey(contractAddress),
        keys: [
          { pubkey: new PublicKey(contractAddress), isSigner: false, isWritable: true },
          { pubkey: userPublicKey, isSigner: true, isWritable: true },
          { pubkey: new PublicKey(contractAddress), isSigner: false, isWritable: true }, // strategy account
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        data: Buffer.from([0x03, ...this.serializeBytes(configBuffer)]) // createStrategy instruction
      });

      return {
        success: true,
        transaction,
        contractAddress,
        strategyConfig
      };

    } catch (error) {
      console.error('❌ Failed to create strategy transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a transaction for executing a strategy
   */
  async createExecuteStrategyTransaction(strategyId, contractName = 'strategyVault') {
    try {
      const contractAddress = this.getContractAddresses()[contractName];
      const abi = this.getABI(contractName);
      
      const transaction = new Transaction();
      
      // Add execute strategy instruction
      transaction.add({
        programId: new PublicKey(contractAddress),
        keys: [
          { pubkey: new PublicKey(contractAddress), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(contractAddress), isSigner: false, isWritable: true }, // strategy account
          { pubkey: new PublicKey(contractAddress), isSigner: false, isWritable: false } // user account
        ],
        data: Buffer.from([0x04, ...this.serializeString(strategyId)]) // executeStrategy instruction
      });

      return {
        success: true,
        transaction,
        contractAddress,
        strategyId
      };

    } catch (error) {
      console.error('❌ Failed to create execute strategy transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a transaction for claiming yield
   */
  async createClaimYieldTransaction(userPublicKey, contractName = 'strategyVault') {
    try {
      const contractAddress = this.getContractAddresses()[contractName];
      const abi = this.getABI(contractName);
      
      const transaction = new Transaction();
      
      // Add claim yield instruction
      transaction.add({
        programId: new PublicKey(contractAddress),
        keys: [
          { pubkey: new PublicKey(contractAddress), isSigner: false, isWritable: true },
          { pubkey: userPublicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        data: Buffer.from([0x05]) // claimYield instruction
      });

      return {
        success: true,
        transaction,
        contractAddress
      };

    } catch (error) {
      console.error('❌ Failed to create claim yield transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get contract state
   */
  async getContractState(contractName = 'strategyVault') {
    try {
      const contractAddress = this.getContractAddresses()[contractName];
      
      // Get account info
      const accountInfo = await this.connection.getAccountInfo(new PublicKey(contractAddress));
      
      if (!accountInfo) {
        return {
          success: false,
          error: 'Contract not found'
        };
      }

      return {
        success: true,
        contractAddress,
        accountInfo: {
          lamports: accountInfo.lamports,
          owner: accountInfo.owner.toString(),
          executable: accountInfo.executable,
          dataLength: accountInfo.data.length
        }
      };

    } catch (error) {
      console.error('❌ Failed to get contract state:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get deployment info
   */
  getDeploymentInfo() {
    return this.deploymentInfo;
  }

  /**
   * Get network info
   */
  getNetworkInfo() {
    return {
      name: this.network.name,
      url: this.network.url,
      explorer: this.network.explorer
    };
  }

  /**
   * Helper: Serialize u64
   */
  serializeU64(value) {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(BigInt(value), 0);
    return buffer;
  }

  /**
   * Helper: Serialize string
   */
  serializeString(value) {
    const stringBuffer = Buffer.from(value, 'utf8');
    const lengthBuffer = this.serializeU64(stringBuffer.length);
    return Buffer.concat([lengthBuffer, stringBuffer]);
  }

  /**
   * Helper: Serialize bytes
   */
  serializeBytes(buffer) {
    const lengthBuffer = this.serializeU64(buffer.length);
    return Buffer.concat([lengthBuffer, buffer]);
  }
}

module.exports = ContractService; 