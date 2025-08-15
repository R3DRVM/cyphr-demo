import { PublicKey } from '@solana/web3.js';
import { usePosition } from '../hooks/usePosition';
import { getHealth } from '../adapters/lender';
import lendingConfig from '../config/lending.devnet.json';
import tokensConfig from '../config/tokens.devnet.json';

/**
 * Vault information service
 */
export async function getVaultInfo(): Promise<{
  tvlUsd: number;
  supplyApy: number;
  borrowApr: number;
  maxLtv: number;
}> {
  try {
    // Read from existing configs with safe fallbacks
    const maxLtv = lendingConfig.lendingPool?.maxLtv || 0.75;
    const supplyApy = lendingConfig.lendingPool?.supplyRate || 0.06;
    const borrowApr = lendingConfig.lendingPool?.borrowRate || 0.08;
    
    // Mock TVL for now - in real implementation this would come from on-chain data
    const tvlUsd = 1000000; // $1M placeholder
    
    return {
      tvlUsd,
      supplyApy,
      borrowApr,
      maxLtv
    };
  } catch (error) {
    console.warn('Failed to get vault info, using defaults:', error);
    return {
      tvlUsd: 1000000,
      supplyApy: 0.06,
      borrowApr: 0.08,
      maxLtv: 0.75
    };
  }
}

/**
 * Get user vault statistics
 */
export async function getUserVaultStats(pubkey: PublicKey): Promise<{
  collateralSol: number;
  debtUsdc: number;
  ltv: number;
  health: number;
}> {
  try {
    // Get health metrics from lender adapter
    const health = await getHealth();
    
    // For now, return mock data that matches Summary panel expectations
    // In real implementation, this would read actual on-chain positions
    const collateralSol = 0.5; // Mock 0.5 SOL collateral
    const debtUsdc = 50; // Mock $50 USDC debt
    const ltv = health.ltv || 0.5;
    const healthFactor = health.healthFactor || 2.0;
    
    return {
      collateralSol,
      debtUsdc,
      ltv,
      health: healthFactor
    };
  } catch (error) {
    console.warn('Failed to get user vault stats, using defaults:', error);
    return {
      collateralSol: 0,
      debtUsdc: 0,
      ltv: 0,
      health: 0
    };
  }
} 