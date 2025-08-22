import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

/**
 * Safely create a PublicKey from various input types
 */
export function safePk(input: string | PublicKey | null | undefined, label: string): PublicKey {
  if (!input) {
    throw new Error(`Missing ${label}`);
  }
  
  if (input instanceof PublicKey) {
    return input;
  }
  
  if (typeof input === 'string') {
    try {
      return new PublicKey(input);
    } catch (error) {
      throw new Error(`Invalid ${label}: ${input}`);
    }
  }
  
  throw new Error(`Invalid ${label} type: ${typeof input}`);
}

/**
 * Safely create a PublicKey array
 */
export function safePkArray(inputs: (string | PublicKey | null | undefined)[], label: string): PublicKey[] {
  return inputs.map((input, index) => safePk(input, `${label}[${index}]`));
}

/**
 * Validate that a PublicKey is not the default/placeholder value
 */
export function validatePkNotDefault(pk: PublicKey, label: string): void {
  const defaultPk = new PublicKey('11111111111111111111111111111111');
  if (pk.equals(defaultPk)) {
    throw new Error(`${label} is using default placeholder value. Please configure a valid address.`);
  }
}

/**
 * Safe BN construction with fallback
 */
export function safeBN(value: any, fallback: BN = new BN(0)): BN {
  if (!value) return fallback;
  
  try {
    if (typeof value === 'string') {
      return new BN(value);
    }
    if (typeof value === 'number') {
      return new BN(value.toString());
    }
    if (value instanceof BN) {
      return value;
    }
    if (value._bn) {
      return new BN(value._bn.toString());
    }
    return fallback;
  } catch (error) {
    console.warn('Failed to create BN from:', value, error);
    return fallback;
  }
}

/**
 * Validate amount is finite and positive
 */
export function validateAmount(amount: number, label: string, minValue: number = 0): number {
  if (typeof amount !== 'number' || !isFinite(amount)) {
    throw new Error(`Invalid ${label}: must be a finite number`);
  }
  
  if (amount < minValue) {
    throw new Error(`${label} must be at least ${minValue}`);
  }
  
  return amount;
}

/**
 * Safe lamports conversion with validation
 */
export function safeLamportsFromSol(solAmount: number | string, label: string): number {
  const amount = typeof solAmount === 'string' ? parseFloat(solAmount) : solAmount;
  const validatedAmount = validateAmount(amount, label, 0);
  return Math.round(validatedAmount * 1e9); // Convert SOL to lamports
}

/**
 * Safe USDC amount conversion with validation
 */
export function safeUsdcFromAmount(usdcAmount: number | string, label: string): number {
  const amount = typeof usdcAmount === 'string' ? parseFloat(usdcAmount) : usdcAmount;
  const validatedAmount = validateAmount(amount, label, 0);
  return Math.round(validatedAmount * 1e6); // Convert USDC to smallest unit
}

