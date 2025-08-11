// src/adapters/borrow/solanaAnchor.ts
import { BorrowAdapter, Asset, Health } from './types';
import { getMintDecimals } from '../../services/token';
import { getConnection } from '../../services/connection';
import * as lender from '../lender';
import tokens from '../../config/tokens.devnet.json';

const SOLANA_ASSETS: Asset[] = [
  { symbol: 'WSOL', mint: (tokens as any).mintA, decimals: 9 },
  { symbol: 'USDC', mint: (tokens as any).mintB, decimals: 6 },
];

export const solanaBorrowAdapter: BorrowAdapter = {
  id: 'solana',
  async getCollateralAssets() {
    return SOLANA_ASSETS;
  },
  async getBorrowAssets() {
    return SOLANA_ASSETS;
  },
  async getHealth(): Promise<Health> {
    return lender.getHealth();
  },
  async enableCollateral(asset: Asset, amountUi: number) {
    return lender.enableCollateral(asset.mint, amountUi);
  },
  async borrow(asset: Asset, amountUi: number) {
    return lender.borrow(asset.mint, amountUi);
  },
  async repay(asset: Asset, amountUi: number) {
    return lender.repay(asset.mint, amountUi);
  },
};
