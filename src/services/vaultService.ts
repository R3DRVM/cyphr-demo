import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { connection, VAULT_PROGRAM_ID } from '../config/solana';

export interface VaultInfo {
  totalDeposits: number;
  totalUsers: number;
  userDeposit: number;
}

export interface DepositResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export class VaultService {
  private connection: Connection;
  private programId: PublicKey;

  constructor() {
    this.connection = connection;
    this.programId = new PublicKey(VAULT_PROGRAM_ID);
  }

  /**
   * Deposit SOL into the vault
   */
  async depositSol(
    userPublicKey: PublicKey,
    amount: number,
    sendTransaction: (transaction: Transaction) => Promise<string>
  ): Promise<DepositResult> {
    try {
      // Convert SOL to lamports
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      // Create a simple transfer transaction for now
      // In a real implementation, this would call the vault program
      const transaction = new Transaction();
      
      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: this.programId, // This would be the vault PDA in real implementation
          lamports: lamports
        })
      );

      // Use the wallet's sendTransaction method
      const signature = await sendTransaction(transaction);

      return {
        success: true,
        transactionId: signature
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
   * Get vault information
   */
  async getVaultInfo(userPublicKey?: PublicKey): Promise<VaultInfo> {
    try {
      // For now, return mock data
      // In a real implementation, this would fetch from the vault program
      return {
        totalDeposits: 1000, // Mock total deposits in SOL
        totalUsers: 50, // Mock total users
        userDeposit: userPublicKey ? 25 : 0 // Mock user deposit
      };
    } catch (error) {
      console.error('Failed to get vault info:', error);
      return {
        totalDeposits: 0,
        totalUsers: 0,
        userDeposit: 0
      };
    }
  }

  /**
   * Simulate a deposit transaction
   */
  async simulateDeposit(
    userPublicKey: PublicKey,
    amount: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: this.programId,
          lamports: lamports
        })
      );

      const { value } = await this.connection.simulateTransaction(transaction);
      
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
}

// Export singleton instance
export const vaultService = new VaultService(); 