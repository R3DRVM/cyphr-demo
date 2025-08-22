import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';

/**
 * Convert UI amount to lamports (BigInt)
 */
export function toLamports(amountUi: number): bigint {
  // Clamp to non-negative
  const safeAmount = Math.max(0, amountUi);
  // Multiply by LAMPORTS_PER_SOL and round
  const lamports = Math.round(safeAmount * LAMPORTS_PER_SOL);
  return BigInt(lamports);
}

/**
 * Convert UI amount to BN lamports
 */
export function toBNLamports(amountUi: number): BN {
  const lamports = toLamports(amountUi);
  return new BN(lamports.toString());
}

/**
 * Safely create BN from any value
 */
export function safeBN(x: any): BN {
  if (x === undefined || x === null) {
    return new BN(0);
  }
  
  try {
    if (typeof x === 'string') {
      return new BN(x);
    }
    if (typeof x === 'number') {
      return new BN(x.toString());
    }
    if (x instanceof BN) {
      return x;
    }
    if (x._bn) {
      return new BN(x._bn.toString());
    }
    return new BN(0);
  } catch (error) {
    console.warn('Failed to create BN from:', x, error);
    return new BN(0);
  }
}

/**
 * Safely create PublicKey from string
 */
export function safePublicKey(address: string | undefined): string {
  if (!address || address === 'undefined' || address === 'null') {
    throw new Error('Invalid address: address is undefined or null');
  }
  
  // Check if it's a valid base58 string (basic validation)
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
    throw new Error(`Invalid address format: ${address}`);
  }
  
  return address;
}

/**
 * Format SOL amount with 4 decimal places
 */
export function formatSOL(lamports: number): string {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
}

/**
 * Format USDC amount with 2 decimal places
 */
export function formatUSDC(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Parse SOL amount from string (e.g., "1.5", "0.25 sol", "2 SOL")
 */
export function parseSolAmount(str: string): number | null {
  const match = str.match(/(\d+(?:\.\d+)?)\s*(?:sol|solana)?/i);
  if (!match) return null;
  
  const amount = parseFloat(match[1]);
  return isNaN(amount) ? null : amount;
}

/**
 * Parse USDC amount from string (e.g., "50", "100 usdc", "25.5 USDC")
 */
export function parseUsdcAmount(str: string): number | null {
  const match = str.match(/(\d+(?:\.\d+)?)\s*(?:usdc)?/i);
  if (!match) return null;
  
  const amount = parseFloat(match[1]);
  return isNaN(amount) ? null : amount;
}

/**
 * Parse percentage to basis points (e.g., "15%" -> 1500)
 */
export function parsePercentBps(str: string): number | null {
  const match = str.match(/(\d+)%/);
  if (!match) return null;
  
  const percent = parseInt(match[1]);
  return isNaN(percent) ? null : percent * 100;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.ceil(sol * LAMPORTS_PER_SOL);
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Assert amount is valid
 */
export function assertAmount(value: number, label: string, minValue: number = 0): number {
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new Error(`Invalid ${label}: must be a finite number`);
  }
  if (value < minValue) {
    throw new Error(`${label} must be at least ${minValue}`);
  }
  return value;
}
