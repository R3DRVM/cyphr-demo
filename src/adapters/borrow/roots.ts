// src/adapters/borrow/roots.ts
import { BorrowAdapter, Asset, Health } from './types';

const DEMO_MODE = (import.meta as any).env?.VITE_DEMO_MODE === 'true';

const ROOTS_ASSETS: Asset[] = [
  { symbol: 'USDC', mint: '0xUSDC', decimals: 6 },
  { symbol: 'WBERA', mint: '0xWBERA', decimals: 18 },
];

let sim = { collateral: 0, debt: 0 };

export const rootsBorrowAdapter: BorrowAdapter = {
  id: 'roots',
  async getCollateralAssets() { return ROOTS_ASSETS; },
  async getBorrowAssets() { return ROOTS_ASSETS; },
  async getHealth(): Promise<Health> {
    const ltv = sim.collateral ? sim.debt / sim.collateral : 0;
    const healthFactor = sim.debt ? (sim.collateral * 0.85) / sim.debt : 10;
    return { ltv, healthFactor, apr: 0.1 };
  },
  async enableCollateral(asset: Asset, amountUi: number) {
    if (DEMO_MODE) { sim.collateral += amountUi; return { signature: 'roots-demo-enable' }; }
    throw new Error('RootsFi integration pending (adapter stub)');
  },
  async borrow(asset: Asset, amountUi: number) {
    if (DEMO_MODE) { sim.debt += amountUi; return { signature: 'roots-demo-borrow' }; }
    throw new Error('RootsFi integration pending (adapter stub)');
  },
  async repay(asset: Asset, amountUi: number) {
    if (DEMO_MODE) { sim.debt = Math.max(0, sim.debt - amountUi); return { signature: 'roots-demo-repay' }; }
    throw new Error('RootsFi integration pending (adapter stub)');
  },
};
