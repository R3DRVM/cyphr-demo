// src/adapters/borrow/types.ts
export type Asset = { symbol: string; mint: string; decimals: number };

export type Health = { ltv: number; healthFactor: number; apr: number };

export interface BorrowAdapter {
  id: 'solana' | 'roots';
  getCollateralAssets(): Promise<Asset[]>;
  getBorrowAssets(): Promise<Asset[]>;
  getHealth(): Promise<Health>;
  enableCollateral(asset: Asset, amountUi: number): Promise<{ signature: string }>;
  borrow(asset: Asset, amountUi: number): Promise<{ signature: string }>;
  repay(asset: Asset, amountUi: number): Promise<{ signature: string }>;
}
