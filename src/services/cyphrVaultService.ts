import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import idl from '../config/cyphr-vaults-idl.json';

// Import the IDL type
const IDL = idl as any;

// Program configuration - This is your deployed contract address
const PROGRAM_ID = new PublicKey('5iVtTdPWLN8Qk6BN2vudJU4myvu9nnnjsDnhCnCR2C52');
const DEVNET_RPC = 'https://api.devnet.solana.com';

// Type definitions for our smart contract data structures
export interface Condition {
  conditionType: string;
  value: BN;
}

export interface StrategyConfig {
  name: string;
  description: string;
  baseToken: string;
  quoteToken: string;
  positionSize: BN;
  timeFrame: string;
  executionInterval: BN;
  yieldTarget: BN;
  yieldAccumulation: boolean;
  entryConditions: Condition[];
  exitConditions: Condition[];
}

export interface BasicVaultState {
  authority: PublicKey;
  totalDeposits: BN;
  totalUsers: number;
  isPaused: boolean;
  totalYieldGenerated: BN;
  lastYieldCalculation: BN;
  yieldRate: BN;
  bump: number;
}

export interface UserDeposit {
  user: PublicKey;
  depositAmount: BN;
  yieldEarned: BN;
  lastYieldUpdate: BN;
  bump: number;
}

export interface StrategyVaultState {
  authority: PublicKey;
  totalDeposits: BN;
  totalUsers: number;
  isPaused: boolean;
  totalYieldGenerated: BN;
  lastYieldCalculation: BN;
  yieldRate: BN;
  activeStrategies: number;
  totalPnl: BN;
  bump: number;
}

export interface StrategyState {
  id: string;
  owner: PublicKey;
  name: string;
  description: string;
  baseToken: string;
  quoteToken: string;
  positionSize: BN;
  timeFrame: string;
  executionInterval: BN;
  yieldTarget: BN;
  yieldAccumulation: boolean;
  isActive: boolean;
  createdAt: BN;
  lastExecution: BN;
  totalPnl: BN;
  entryConditions: Condition[];
  exitConditions: Condition[];
  bump: number;
}

// Transaction status types for UI feedback
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface TransactionResult {
  signature: string;
  status: TransactionStatus;
  error?: string;
  explorerUrl: string;
}

// Main service class for interacting with the Cyphr Vaults program
export class CyphrVaultService {
  private program: Program;
  private connection: Connection;
  private wallet: any;

  constructor(wallet: any) {
    this.wallet = wallet;
    this.connection = new Connection(DEVNET_RPC, 'confirmed');
    
    // Create the provider for Anchor
    const provider = new AnchorProvider(
      this.connection,
      { 
        publicKey: wallet.publicKey, 
        signTransaction: (tx) => wallet.signTransaction(tx),
        signAllTransactions: (txs) => wallet.signAllTransactions(txs)
      },
      { commitment: 'confirmed' }
    );

    // Create the program instance using our IDL and program ID
    this.program = new Program(IDL, PROGRAM_ID, provider) as any;
  }

  // Helper method to find Program Derived Addresses (PDAs) - these are deterministic addresses
  private async findPDA(seeds: Buffer[]): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(seeds, this.program.programId);
  }

  // Helper method to convert SOL to lamports (Solana's smallest unit)
  private solToLamports(sol: number): BN {
    return new BN(sol * LAMPORTS_PER_SOL);
  }

  // Helper method to convert lamports to SOL for display
  private lamportsToSol(lamports: BN): number {
    return lamports.toNumber() / LAMPORTS_PER_SOL;
  }

  // Helper method to create explorer URL for transaction tracking
  private getExplorerUrl(signature: string): string {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  }

  /**
   * Initialize the basic vault - creates the vault state account
   * This is typically called once by the vault authority
   */
  async initializeBasicVault(): Promise<TransactionResult> {
    try {
      // Find the PDA for the vault state
      const [vaultStatePda] = await this.findPDA([Buffer.from('basic_vault')]);

      // Create the transaction using Anchor's methods
      const tx = await this.program.methods
        .initializeBasicVault()
        .accounts({
          vaultState: vaultStatePda,
          authority: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        status: 'confirmed',
        explorerUrl: this.getExplorerUrl(tx)
      };
    } catch (error) {
      return {
        signature: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        explorerUrl: ''
      };
    }
  }

  /**
   * Deposit SOL into the basic vault
   * @param amount - Amount of SOL to deposit
   */
  async depositSol(amount: number): Promise<TransactionResult> {
    try {
      // Find the PDAs for vault state and user deposit
      const [vaultStatePda] = await this.findPDA([Buffer.from('basic_vault')]);
      const [userDepositPda] = await this.findPDA([
        Buffer.from('user_deposit'),
        this.wallet.publicKey.toBuffer()
      ]);

      // Convert SOL to lamports
      const lamports = this.solToLamports(amount);

      // Create the transaction
      const tx = await this.program.methods
        .depositSol(lamports)
        .accounts({
          vaultState: vaultStatePda,
          userDeposit: userDepositPda,
          user: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        status: 'confirmed',
        explorerUrl: this.getExplorerUrl(tx)
      };
    } catch (error) {
      return {
        signature: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        explorerUrl: ''
      };
    }
  }

  /**
   * Withdraw SOL from the basic vault
   * @param amount - Amount of SOL to withdraw
   */
  async withdrawSol(amount: number): Promise<TransactionResult> {
    try {
      // Find the PDAs
      const [vaultStatePda] = await this.findPDA([Buffer.from('basic_vault')]);
      const [userDepositPda] = await this.findPDA([
        Buffer.from('user_deposit'),
        this.wallet.publicKey.toBuffer()
      ]);

      // Convert SOL to lamports
      const lamports = this.solToLamports(amount);

      // Create the transaction
      const tx = await this.program.methods
        .withdrawSol(lamports)
        .accounts({
          vaultState: vaultStatePda,
          userDeposit: userDepositPda,
          user: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        status: 'confirmed',
        explorerUrl: this.getExplorerUrl(tx)
      };
    } catch (error) {
      return {
        signature: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        explorerUrl: ''
      };
    }
  }

  /**
   * Claim yield from the basic vault
   * This transfers accumulated yield to the user's wallet
   */
  async claimYield(): Promise<TransactionResult> {
    try {
      // Find the PDAs
      const [vaultStatePda] = await this.findPDA([Buffer.from('basic_vault')]);
      const [userDepositPda] = await this.findPDA([
        Buffer.from('user_deposit'),
        this.wallet.publicKey.toBuffer()
      ]);

      // Create the transaction
      const tx = await this.program.methods
        .claimYield()
        .accounts({
          vaultState: vaultStatePda,
          userDeposit: userDepositPda,
          user: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        status: 'confirmed',
        explorerUrl: this.getExplorerUrl(tx)
      };
    } catch (error) {
      return {
        signature: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        explorerUrl: ''
      };
    }
  }

  /**
   * Initialize the strategy vault
   * This creates the strategy vault state account
   */
  async initializeStrategyVault(): Promise<TransactionResult> {
    try {
      // Find the PDA for the strategy vault state
      const [vaultStatePda] = await this.findPDA([Buffer.from('strategy_vault')]);

      // Create the transaction
      const tx = await this.program.methods
        .initializeStrategyVault()
        .accounts({
          vaultState: vaultStatePda,
          authority: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        status: 'confirmed',
        explorerUrl: this.getExplorerUrl(tx)
      };
    } catch (error) {
      return {
        signature: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        explorerUrl: ''
      };
    }
  }

  /**
   * Create a new strategy
   * @param config - Strategy configuration with all parameters
   */
  async createStrategy(config: StrategyConfig): Promise<TransactionResult> {
    try {
      // Find the PDAs
      const [vaultStatePda] = await this.findPDA([Buffer.from('strategy_vault')]);
      const [strategyStatePda] = await this.findPDA([
        Buffer.from('strategy'),
        this.wallet.publicKey.toBuffer(),
        Buffer.from(config.name)
      ]);

      // Create the transaction
      const tx = await this.program.methods
        .createStrategy(config)
        .accounts({
          vaultState: vaultStatePda,
          strategyState: strategyStatePda,
          owner: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        status: 'confirmed',
        explorerUrl: this.getExplorerUrl(tx)
      };
    } catch (error) {
      return {
        signature: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        explorerUrl: ''
      };
    }
  }

  /**
   * Execute a strategy
   * @param strategyId - ID of the strategy to execute
   */
  async executeStrategy(strategyId: string): Promise<TransactionResult> {
    try {
      // Find the PDAs
      const [vaultStatePda] = await this.findPDA([Buffer.from('strategy_vault')]);
      const [strategyStatePda] = await this.findPDA([
        Buffer.from('strategy'),
        this.wallet.publicKey.toBuffer(),
        Buffer.from(strategyId)
      ]);

      // Create the transaction
      const tx = await this.program.methods
        .executeStrategy(strategyId)
        .accounts({
          vaultState: vaultStatePda,
          strategyState: strategyStatePda,
          owner: this.wallet.publicKey,
        })
        .rpc();

      return {
        signature: tx,
        status: 'confirmed',
        explorerUrl: this.getExplorerUrl(tx)
      };
    } catch (error) {
      return {
        signature: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        explorerUrl: ''
      };
    }
  }

  /**
   * Deposit SOL into the strategy vault
   * @param amount - Amount of SOL to deposit
   */
  async depositStrategySol(amount: number): Promise<TransactionResult> {
    try {
      // Find the PDAs
      const [vaultStatePda] = await this.findPDA([Buffer.from('strategy_vault')]);
      const [userDepositPda] = await this.findPDA([
        Buffer.from('strategy_user_deposit'),
        this.wallet.publicKey.toBuffer()
      ]);

      // Convert SOL to lamports
      const lamports = this.solToLamports(amount);

      // Create the transaction
      const tx = await this.program.methods
        .depositStrategySol(lamports)
        .accounts({
          vaultState: vaultStatePda,
          userDeposit: userDepositPda,
          user: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        status: 'confirmed',
        explorerUrl: this.getExplorerUrl(tx)
      };
    } catch (error) {
      return {
        signature: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        explorerUrl: ''
      };
    }
  }

  /**
   * Claim yield from the strategy vault
   */
  async claimStrategyYield(): Promise<TransactionResult> {
    try {
      // Find the PDAs
      const [vaultStatePda] = await this.findPDA([Buffer.from('strategy_vault')]);
      const [userDepositPda] = await this.findPDA([
        Buffer.from('strategy_user_deposit'),
        this.wallet.publicKey.toBuffer()
      ]);

      // Create the transaction
      const tx = await this.program.methods
        .claimStrategyYield()
        .accounts({
          vaultState: vaultStatePda,
          userDeposit: userDepositPda,
          user: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        status: 'confirmed',
        explorerUrl: this.getExplorerUrl(tx)
      };
    } catch (error) {
      return {
        signature: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        explorerUrl: ''
      };
    }
  }

  /**
   * Get basic vault state - reads current vault data
   */
  async getBasicVaultState(): Promise<BasicVaultState | null> {
    try {
      const [vaultStatePda] = await this.findPDA([Buffer.from('basic_vault')]);
      const vaultState = await (this.program as any).account.basicVaultState.fetch(vaultStatePda);
      return vaultState as BasicVaultState;
    } catch (error) {
      console.error('Failed to fetch basic vault state:', error);
      return null;
    }
  }

  /**
   * Get user deposit for basic vault - reads user's deposit data
   */
  async getUserDeposit(): Promise<UserDeposit | null> {
    try {
      const [userDepositPda] = await this.findPDA([
        Buffer.from('user_deposit'),
        this.wallet.publicKey.toBuffer()
      ]);
      const userDeposit = await (this.program as any).account.userDeposit.fetch(userDepositPda);
      return userDeposit as UserDeposit;
    } catch (error) {
      console.error('Failed to fetch user deposit:', error);
      return null;
    }
  }

  /**
   * Get strategy vault state - reads strategy vault data
   */
  async getStrategyVaultState(): Promise<StrategyVaultState | null> {
    try {
      const [vaultStatePda] = await this.findPDA([Buffer.from('strategy_vault')]);
      const vaultState = await (this.program as any).account.strategyVaultState.fetch(vaultStatePda);
      return vaultState as StrategyVaultState;
    } catch (error) {
      console.error('Failed to fetch strategy vault state:', error);
      return null;
    }
  }

  /**
   * Get strategy state by ID - reads specific strategy data
   * @param strategyId - ID of the strategy
   */
  async getStrategyState(strategyId: string): Promise<StrategyState | null> {
    try {
      const [strategyStatePda] = await this.findPDA([
        Buffer.from('strategy'),
        this.wallet.publicKey.toBuffer(),
        Buffer.from(strategyId)
      ]);
      const strategyState = await (this.program as any).account.strategyState.fetch(strategyStatePda);
      return strategyState as StrategyState;
    } catch (error) {
      console.error('Failed to fetch strategy state:', error);
      return null;
    }
  }
}

// Hook to use the Cyphr Vault Service - provides easy access to the service
export const useCyphrVaultService = () => {
  const { wallet, connected } = useSolanaWallet();
  
  if (!connected || !wallet) {
    throw new Error('Wallet not connected');
  }

  return new CyphrVaultService(wallet);
}; 