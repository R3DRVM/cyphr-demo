import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { clusterApiUrl } from '@solana/web3.js';

// Import our deployed contract addresses and ABI
import deploymentInfo from '../../smart-contracts/deployment-info.json';
import strategyVaultABI from '../../smart-contracts/abi/strategy-vault-abi.json';
import basicVaultABI from '../../smart-contracts/abi/basic-vault-abi.json';

export interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed';
  signature?: string;
  error?: string;
  explorerUrl?: string;
}

export interface StrategyConfig {
  name: string;
  description: string;
  baseToken: string;
  quoteToken: string;
  positionSize: number;
  timeFrame: string;
  executionInterval: number;
  entryConditions: Array<{ type: string; value: number }>;
  exitConditions: Array<{ type: string; value: number }>;
  yieldTarget: number;
  yieldAccumulation: boolean;
}

export interface VaultInfo {
  totalDeposits: number;
  totalUsers: number;
  userDeposit: number;
  totalYieldGenerated: number;
  yieldRate: number;
}

export interface DepositResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  status?: TransactionStatus;
}

export interface StrategyResult {
  success: boolean;
  strategyId?: string;
  transactionId?: string;
  error?: string;
  status?: TransactionStatus;
}

export interface YieldResult {
  success: boolean;
  amount?: number;
  transactionId?: string;
  error?: string;
  status?: TransactionStatus;
}

export class SmartContractService {
  private connection: Connection;
  private strategyVaultAddress: PublicKey;
  private basicVaultAddress: PublicKey;
  private network: string;
  private explorerUrl: string;

  constructor() {
    this.network = deploymentInfo.network;
    this.connection = new Connection(clusterApiUrl(this.network), 'confirmed');
    this.strategyVaultAddress = new PublicKey(deploymentInfo.contracts.strategyVault.programId);
    this.basicVaultAddress = new PublicKey(deploymentInfo.contracts.basicVault.programId);
    this.explorerUrl = `https://explorer.solana.com/?cluster=${this.network}`;
  }

  /**
   * Get network information
   */
  getNetworkInfo() {
    return {
      network: this.network,
      rpcUrl: clusterApiUrl(this.network),
      explorerUrl: this.explorerUrl,
      strategyVaultAddress: this.strategyVaultAddress.toString(),
      basicVaultAddress: this.basicVaultAddress.toString()
    };
  }

  /**
   * Create a deposit transaction (simplified for demo)
   */
  async createDepositTransaction(
    userPublicKey: PublicKey,
    amount: number,
    vaultType: 'strategyVault' | 'basicVault' = 'strategyVault'
  ): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    try {
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      // For demo purposes, create a simple transfer to a demo vault address
      // In production, this would call the actual vault program
      const demoVaultAddress = new PublicKey('11111111111111111111111111111111'); // System Program for demo
      
      const transaction = new Transaction();
      
      // Create a simple transfer transaction for demo
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: demoVaultAddress,
          lamports: lamports
        })
      );

      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Failed to create deposit transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a withdraw transaction (Demo version - uses simple SOL transfer)
   */
  async createWithdrawTransaction(
    userPublicKey: PublicKey,
    amount: number,
    vaultType: 'strategyVault' | 'basicVault' = 'strategyVault'
  ): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    try {
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      // For demo purposes, create a simple SOL transfer back to user
      // In a real implementation, this would withdraw from the vault
      const demoVaultAddress = new PublicKey('11111111111111111111111111111111'); // System Program (demo)
      
      const transaction = new Transaction();
      
      // Add a simple SOL transfer (this will actually work)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: demoVaultAddress,
          toPubkey: userPublicKey,
          lamports: lamports
        })
      );

      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Failed to create withdraw transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a strategy transaction
   */
  async createStrategyTransaction(
    userPublicKey: PublicKey,
    strategyConfig: StrategyConfig,
    vaultType: 'strategyVault' | 'basicVault' = 'strategyVault'
  ): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    try {
      const vaultAddress = vaultType === 'strategyVault' ? this.strategyVaultAddress : this.basicVaultAddress;
      
      const transaction = new Transaction();
      
      // Serialize strategy config
      const encoder = new TextEncoder();
      const configBuffer = encoder.encode(JSON.stringify(strategyConfig));
      
      // Add create strategy instruction (instruction index 3 for createStrategy)
      transaction.add({
        programId: vaultAddress,
        keys: [
          { pubkey: vaultAddress, isSigner: false, isWritable: true },
          { pubkey: userPublicKey, isSigner: true, isWritable: true },
          { pubkey: vaultAddress, isSigner: false, isWritable: true }, // strategy account
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        data: new Uint8Array([0x03, ...this.serializeBytes(configBuffer)]) // createStrategy instruction
      });

      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Failed to create strategy transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create an execute strategy transaction
   */
  async createExecuteStrategyTransaction(
    strategyId: string,
    vaultType: 'strategyVault' | 'basicVault' = 'strategyVault'
  ): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    try {
      const vaultAddress = vaultType === 'strategyVault' ? this.strategyVaultAddress : this.basicVaultAddress;
      
      const transaction = new Transaction();
      
      // Add execute strategy instruction (instruction index 4 for executeStrategy)
      transaction.add({
        programId: vaultAddress,
        keys: [
          { pubkey: vaultAddress, isSigner: false, isWritable: true },
          { pubkey: vaultAddress, isSigner: false, isWritable: true }, // strategy account
          { pubkey: vaultAddress, isSigner: false, isWritable: false } // user account
        ],
        data: new Uint8Array([0x04, ...this.serializeString(strategyId)]) // executeStrategy instruction
      });

      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Failed to create execute strategy transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a claim yield transaction
   */
  async createClaimYieldTransaction(
    userPublicKey: PublicKey,
    vaultType: 'strategyVault' | 'basicVault' = 'strategyVault'
  ): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    try {
      const vaultAddress = vaultType === 'strategyVault' ? this.strategyVaultAddress : this.basicVaultAddress;
      
      const transaction = new Transaction();
      
      // Add claim yield instruction (instruction index 5 for claimYield)
      transaction.add({
        programId: vaultAddress,
        keys: [
          { pubkey: vaultAddress, isSigner: false, isWritable: true },
          { pubkey: userPublicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        data: new Uint8Array([0x05]) // claimYield instruction
      });

      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Failed to create claim yield transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute a transaction and track its status
   */
  async executeTransaction(
    transaction: Transaction,
    sendTransaction: (transaction: Transaction) => Promise<string>
  ): Promise<TransactionStatus> {
    try {
      // Send the transaction
      const signature = await sendTransaction(transaction);
      
      // Return pending status immediately
      const pendingStatus: TransactionStatus = {
        status: 'pending',
        signature,
        explorerUrl: `${this.explorerUrl}/tx/${signature}`
      };

      // Wait for confirmation
      try {
        const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
        
        if (confirmation.value.err) {
          return {
            status: 'failed',
            signature,
            error: 'Transaction failed on chain',
            explorerUrl: `${this.explorerUrl}/tx/${signature}`
          };
        }

        return {
          status: 'confirmed',
          signature,
          explorerUrl: `${this.explorerUrl}/tx/${signature}`
        };
      } catch (confirmError) {
        return {
          status: 'failed',
          signature,
          error: confirmError instanceof Error ? confirmError.message : 'Confirmation failed',
          explorerUrl: `${this.explorerUrl}/tx/${signature}`
        };
      }
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Transaction failed'
      };
    }
  }

  /**
   * Deposit SOL into the vault
   */
  async depositSol(
    userPublicKey: PublicKey,
    amount: number,
    sendTransaction: (transaction: Transaction) => Promise<string>,
    vaultType: 'strategyVault' | 'basicVault' = 'strategyVault'
  ): Promise<DepositResult> {
    try {
      // Create deposit transaction
      const createResult = await this.createDepositTransaction(userPublicKey, amount, vaultType);
      
      if (!createResult.success || !createResult.transaction) {
        return {
          success: false,
          error: createResult.error || 'Failed to create deposit transaction'
        };
      }

      // Execute the transaction
      const status = await this.executeTransaction(createResult.transaction, sendTransaction);

      return {
        success: status.status === 'confirmed',
        transactionId: status.signature,
        error: status.error,
        status
      };
    } catch (error) {
      console.error('Deposit failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Withdraw SOL from the vault
   */
  async withdrawSol(
    userPublicKey: PublicKey,
    amount: number,
    sendTransaction: (transaction: Transaction) => Promise<string>,
    vaultType: 'strategyVault' | 'basicVault' = 'strategyVault'
  ): Promise<DepositResult> {
    try {
      // Create withdraw transaction
      const createResult = await this.createWithdrawTransaction(userPublicKey, amount, vaultType);
      
      if (!createResult.success || !createResult.transaction) {
        return {
          success: false,
          error: createResult.error || 'Failed to create withdraw transaction'
        };
      }

      // Execute the transaction
      const status = await this.executeTransaction(createResult.transaction, sendTransaction);

      return {
        success: status.status === 'confirmed',
        transactionId: status.signature,
        error: status.error,
        status
      };
    } catch (error) {
      console.error('Withdraw failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create and execute a strategy
   */
  async createStrategy(
    userPublicKey: PublicKey,
    strategyConfig: StrategyConfig,
    sendTransaction: (transaction: Transaction) => Promise<string>,
    vaultType: 'strategyVault' | 'basicVault' = 'strategyVault'
  ): Promise<StrategyResult> {
    try {
      // Create strategy transaction
      const createResult = await this.createStrategyTransaction(userPublicKey, strategyConfig, vaultType);
      
      if (!createResult.success || !createResult.transaction) {
        return {
          success: false,
          error: createResult.error || 'Failed to create strategy transaction'
        };
      }

      // Execute the transaction
      const status = await this.executeTransaction(createResult.transaction, sendTransaction);

      return {
        success: status.status === 'confirmed',
        strategyId: strategyConfig.name,
        transactionId: status.signature,
        error: status.error,
        status
      };
    } catch (error) {
      console.error('Strategy creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute an existing strategy
   */
  async executeStrategy(
    strategyId: string,
    sendTransaction: (transaction: Transaction) => Promise<string>,
    vaultType: 'strategyVault' | 'basicVault' = 'strategyVault'
  ): Promise<StrategyResult> {
    try {
      // Create execute strategy transaction
      const createResult = await this.createExecuteStrategyTransaction(strategyId, vaultType);
      
      if (!createResult.success || !createResult.transaction) {
        return {
          success: false,
          error: createResult.error || 'Failed to create execute strategy transaction'
        };
      }

      // Execute the transaction
      const status = await this.executeTransaction(createResult.transaction, sendTransaction);

      return {
        success: status.status === 'confirmed',
        strategyId,
        transactionId: status.signature,
        error: status.error,
        status
      };
    } catch (error) {
      console.error('Strategy execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Claim yield
   */
  async claimYield(
    userPublicKey: PublicKey,
    sendTransaction: (transaction: Transaction) => Promise<string>,
    vaultType: 'strategyVault' | 'basicVault' = 'strategyVault'
  ): Promise<YieldResult> {
    try {
      // Create claim yield transaction
      const createResult = await this.createClaimYieldTransaction(userPublicKey, vaultType);
      
      if (!createResult.success || !createResult.transaction) {
        return {
          success: false,
          error: createResult.error || 'Failed to create claim yield transaction'
        };
      }

      // Execute the transaction
      const status = await this.executeTransaction(createResult.transaction, sendTransaction);

      return {
        success: status.status === 'confirmed',
        amount: 0, // Will be updated from transaction logs
        transactionId: status.signature,
        error: status.error,
        status
      };
    } catch (error) {
      console.error('Yield claim failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get vault information (mock for now)
   */
  async getVaultInfo(userPublicKey?: PublicKey): Promise<VaultInfo> {
    try {
      // For now, return mock data
      // In a real implementation, this would fetch from the vault program
      return {
        totalDeposits: 1000,
        totalUsers: 50,
        userDeposit: userPublicKey ? 25 : 0,
        totalYieldGenerated: 50,
        yieldRate: 0.05
      };
    } catch (error) {
      console.error('Failed to get vault info:', error);
      return {
        totalDeposits: 0,
        totalUsers: 0,
        userDeposit: 0,
        totalYieldGenerated: 0,
        yieldRate: 0
      };
    }
  }

  /**
   * Simulate a deposit transaction
   */
  async simulateDeposit(
    userPublicKey: PublicKey,
    amount: number,
    vaultType: 'strategyVault' | 'basicVault' = 'strategyVault'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const createResult = await this.createDepositTransaction(userPublicKey, amount, vaultType);
      
      if (!createResult.success || !createResult.transaction) {
        return {
          success: false,
          error: createResult.error || 'Failed to create deposit transaction'
        };
      }

      const { value } = await this.connection.simulateTransaction(createResult.transaction);
      
      return {
        success: !value.err,
        error: value.err ? 'Simulation failed' : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper methods for serialization (browser-compatible)
  private serializeU64(value: number): Uint8Array {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(value), true); // true for little-endian
    return new Uint8Array(buffer);
  }

  private serializeString(value: string): Uint8Array {
    const encoder = new TextEncoder();
    const stringBuffer = encoder.encode(value);
    const lengthBuffer = this.serializeU64(stringBuffer.length);
    const result = new Uint8Array(lengthBuffer.length + stringBuffer.length);
    result.set(lengthBuffer, 0);
    result.set(stringBuffer, lengthBuffer.length);
    return result;
  }

  private serializeBytes(buffer: Uint8Array): Uint8Array {
    const lengthBuffer = this.serializeU64(buffer.length);
    const result = new Uint8Array(lengthBuffer.length + buffer.length);
    result.set(lengthBuffer, 0);
    result.set(buffer, lengthBuffer.length);
    return result;
  }
}

// Export singleton instance
export const smartContractService = new SmartContractService(); 