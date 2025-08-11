export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export interface Policy {
  maxLtv: number;
  maxSlippageBps: number;
  maxBorrowUsd: number;
}

export const DEFAULT_POLICY: Policy = {
  maxLtv: 0.5,
  maxSlippageBps: 100,
  maxBorrowUsd: 5000,
};

