import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import { getConnection } from './connection';

export interface PoolPrice {
  aPerB: number;  // Price of A in terms of B
  bPerA: number;  // Price of B in terms of A
  timestamp: number;
}

export interface PoolState {
  vaultABalance: bigint;
  vaultBBalance: bigint;
  decimalsA: number;
  decimalsB: number;
}

/**
 * Pool Price Service - calculates price ratios from vault balances
 * No external price oracles, purely on-chain data
 */
export class PoolPriceService {
  private connection: Connection;
  private vaultA: PublicKey;
  private vaultB: PublicKey;
  private decimalsA: number;
  private decimalsB: number;
  private lastUpdate: number = 0;
  private cache: PoolPrice | null = null;
  private cacheTtl: number = 5000; // 5 seconds cache

  constructor(
    vaultA: string,
    vaultB: string,
    decimalsA: number,
    decimalsB: number
  ) {
    this.connection = getConnection();
    this.vaultA = new PublicKey(vaultA);
    this.vaultB = new PublicKey(vaultB);
    this.decimalsA = decimalsA;
    this.decimalsB = decimalsB;
  }

  /**
   * Get current pool price, with caching
   */
  async getPrice(): Promise<PoolPrice> {
    const now = Date.now();
    
    // Return cached price if still valid
    if (this.cache && (now - this.lastUpdate) < this.cacheTtl) {
      return this.cache;
    }

    try {
      const poolState = await this.getPoolState();
      const price = this.calculatePrice(poolState);
      
      this.cache = price;
      this.lastUpdate = now;
      
      return price;
    } catch (error) {
      console.error('Error getting pool price:', error);
      
      // Return cached price if available, otherwise throw
      if (this.cache) {
        return this.cache;
      }
      throw error;
    }
  }

  /**
   * Get raw pool state (vault balances)
   */
  async getPoolState(): Promise<PoolState> {
    try {
      const [vaultAAccount, vaultBAccount] = await Promise.all([
        getAccount(this.connection, this.vaultA),
        getAccount(this.connection, this.vaultB)
      ]);

      return {
        vaultABalance: BigInt(vaultAAccount.amount.toString()),
        vaultBBalance: BigInt(vaultBAccount.amount.toString()),
        decimalsA: this.decimalsA,
        decimalsB: this.decimalsB
      };
    } catch (error) {
      console.error('Error getting pool state:', error);
      throw new Error(`Failed to get pool state: ${error.message}`);
    }
  }

  /**
   * Calculate price ratios from vault balances
   */
  private calculatePrice(poolState: PoolState): PoolPrice {
    const { vaultABalance, vaultBBalance, decimalsA, decimalsB } = poolState;
    
    // Convert to UI amounts
    const amountA = Number(vaultABalance) / Math.pow(10, decimalsA);
    const amountB = Number(vaultBBalance) / Math.pow(10, decimalsB);
    
    // Calculate price ratios
    const aPerB = amountA / amountB;  // How much A you get for 1 B
    const bPerA = amountB / amountA;  // How much B you get for 1 A
    
    return {
      aPerB,
      bPerA,
      timestamp: Date.now()
    };
  }

  /**
   * Get price change from entry price
   */
  calculatePriceChange(entryPrice: number, currentPrice: number): number {
    return ((currentPrice - entryPrice) / entryPrice) * 100;
  }

  /**
   * Check if take-profit target is met
   */
  isTakeProfitTargetMet(entryPrice: number, currentPrice: number, targetBps: number): boolean {
    const priceChange = this.calculatePriceChange(entryPrice, currentPrice);
    const targetPercent = targetBps / 100;
    return priceChange >= targetPercent;
  }

  /**
   * Force refresh (clear cache)
   */
  refresh(): void {
    this.cache = null;
    this.lastUpdate = 0;
  }
}

/**
 * Factory function to create pool price service from config
 */
export function createPoolPriceService(): PoolPriceService {
  // Import config dynamically to avoid build issues
  let tokensConfig: any = {};
  
  try {
    // Try to load from config
    const configModule = require('../config/tokens.devnet.json');
    tokensConfig = configModule.default || configModule;
  } catch (e) {
    console.warn('Could not load tokens.devnet.json, using defaults');
    tokensConfig = {
      vaultA: 'placeholder_vault_a',
      vaultB: 'placeholder_vault_b',
      tokens: {
        collateral: { decimals: 9 },
        debt: { decimals: 6 }
      }
    };
  }

  const vaultA = tokensConfig.vaultA || 'placeholder_vault_a';
  const vaultB = tokensConfig.vaultB || 'placeholder_vault_b';
  const decimalsA = tokensConfig.tokens?.collateral?.decimals || 9;
  const decimalsB = tokensConfig.tokens?.debt?.decimals || 6;

  return new PoolPriceService(vaultA, vaultB, decimalsA, decimalsB);
}
