export type Position = {
  chain: 'solana';
  collateral: { 
    symbol: string; 
    amount: number; 
    apy?: number; 
    valueUsd?: number; 
  };
  debt: { 
    symbol: string; 
    amount: number; 
    apr?: number; 
    ltv?: number; 
    healthFactor?: number; 
  };
  exposure: { 
    symbol: string; 
    amount: number; 
    avgPrice?: number; 
  };
  pnl?: number; 
  netCarry?: number; 
  lastUpdated: number;
};

