import { Connection, PublicKey } from '@solana/web3.js';
import { getConnection } from './connection';
import { getMintDecimals, rawToUi } from './token';
import tokensDevnet from '../config/tokens.devnet.json';

export interface PoolPrice {
  aPerB: number;
  bPerA: number;
  timestamp: number;
}

export interface PoolBalances {
  vaultABalance: number;
  vaultBBalance: number;
  poolTokenSupply: number;
}

/**
 * Get pool price from vault balances
 */
export async function getPoolPrice(): Promise<PoolPrice> {
  try {
    const connection = getConnection();
    
    // Read vault balances from tokens.devnet.json
    const vaultA = new PublicKey(tokensDevnet.vaultA);
    const vaultB = new PublicKey(tokensDevnet.vaultB);
    const poolTokenMint = new PublicKey(tokensDevnet.poolTokenMint);
    
    // Get vault account info
    const vaultAInfo = await connection.getAccountInfo(vaultA);
    const vaultBInfo = await connection.getAccountInfo(vaultB);
    const poolTokenInfo = await connection.getAccountInfo(poolTokenMint);
    
    if (!vaultAInfo || !vaultBInfo) {
      throw new Error('Vault accounts not found');
    }
    
    // Get mint decimals
    const mintA = new PublicKey(tokensDevnet.mintA);
    const mintB = new PublicKey(tokensDevnet.mintB);
    
    const decimalsA = await getMintDecimals(connection, mintA);
    const decimalsB = await getMintDecimals(connection, mintB);
    
    // Calculate balances in UI units
    const vaultABalance = rawToUi(BigInt(vaultAInfo.lamports), decimalsA);
    const vaultBBalance = rawToUi(BigInt(vaultBInfo.lamports), decimalsB);
    
    // Calculate price ratios
    const aPerB = vaultBBalance > 0 ? vaultABalance / vaultBBalance : 0;
    const bPerA = vaultABalance > 0 ? vaultBBalance / vaultABalance : 0;
    
    return {
      aPerB,
      bPerA,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Failed to get pool price:', error);
    // Return fallback prices
    return {
      aPerB: 1.0,
      bPerA: 1.0,
      timestamp: Date.now()
    };
  }
}

/**
 * Get pool balances
 */
export async function getPoolBalances(): Promise<PoolBalances> {
  try {
    const connection = getConnection();
    
    const vaultA = new PublicKey(tokensDevnet.vaultA);
    const vaultB = new PublicKey(tokensDevnet.vaultB);
    const poolTokenMint = new PublicKey(tokensDevnet.poolTokenMint);
    
    const vaultAInfo = await connection.getAccountInfo(vaultA);
    const vaultBInfo = await connection.getAccountInfo(vaultB);
    const poolTokenInfo = await connection.getAccountInfo(poolTokenMint);
    
    const mintA = new PublicKey(tokensDevnet.mintA);
    const mintB = new PublicKey(tokensDevnet.mintB);
    
    const decimalsA = await getMintDecimals(connection, mintA);
    const decimalsB = await getMintDecimals(connection, mintB);
    
    const vaultABalance = vaultAInfo ? rawToUi(BigInt(vaultAInfo.lamports), decimalsA) : 0;
    const vaultBBalance = vaultBInfo ? rawToUi(BigInt(vaultBInfo.lamports), decimalsB) : 0;
    const poolTokenSupply = poolTokenInfo ? Number(poolTokenInfo.lamports) : 0;
    
    return {
      vaultABalance,
      vaultBBalance,
      poolTokenSupply
    };
  } catch (error) {
    console.error('Failed to get pool balances:', error);
    return {
      vaultABalance: 0,
      vaultBBalance: 0,
      poolTokenSupply: 0
    };
  }
}

/**
 * Calculate price impact for a swap
 */
export function calculatePriceImpact(
  amountIn: number,
  amountOut: number,
  currentPrice: number
): number {
  const expectedOut = amountIn * currentPrice;
  const actualOut = amountOut;
  const impact = ((expectedOut - actualOut) / expectedOut) * 100;
  return Math.max(0, impact);
}
