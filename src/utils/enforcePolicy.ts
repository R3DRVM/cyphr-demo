import { DEFAULT_POLICY } from '../config/policy';

interface BorrowIntent {
  collateralMint: string;
  collateralAmount: number;
  borrowMint: string;
  borrowAmount: number;
  targetMint: string;
  slippageBps: number;
  borrowAmountUsd?: number;
  ltv?: number;
}

export function enforcePolicy(intent: BorrowIntent): void {
  const errors: string[] = [];

  // Check LTV
  if (intent.ltv && intent.ltv > DEFAULT_POLICY.maxLtv) {
    errors.push(`LTV ${(intent.ltv * 100).toFixed(1)}% exceeds maximum ${(DEFAULT_POLICY.maxLtv * 100).toFixed(1)}%`);
  }

  // Check slippage
  if (intent.slippageBps > DEFAULT_POLICY.maxSlippageBps) {
    errors.push(`Slippage ${intent.slippageBps}bps exceeds maximum ${DEFAULT_POLICY.maxSlippageBps}bps`);
  }

  // Check borrow amount USD
  if (intent.borrowAmountUsd && intent.borrowAmountUsd > DEFAULT_POLICY.maxBorrowUsd) {
    errors.push(`Borrow amount $${intent.borrowAmountUsd} exceeds maximum $${DEFAULT_POLICY.maxBorrowUsd}`);
  }

  // Check minimum amounts
  if (intent.collateralAmount <= 0) {
    errors.push('Collateral amount must be positive');
  }

  if (intent.borrowAmount <= 0) {
    errors.push('Borrow amount must be positive');
  }

  if (errors.length > 0) {
    throw new Error(`Policy violation: ${errors.join(', ')}`);
  }
}

