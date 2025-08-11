import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getConnection } from '../services/connection';
import { getMintDecimals, rawToUi } from '../services/token';
import { getHealth } from '../adapters/lender';
import { DEMO_MODE } from '../config/policy';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { Position } from '../types/position';

interface UsePositionResult {
  position: Position | null;
  refresh: () => Promise<void>;
}

export function usePosition(): UsePositionResult {
  const [position, setPosition] = useState<Position | null>(null);
  const { connected, publicKey } = useSolanaWallet();

  const loadDemoPosition = useCallback(async (): Promise<Position | null> => {
    try {
      const demoState = JSON.parse(localStorage.getItem('demo_lender_state') || '{}');
      if (!demoState.collateral && !demoState.debt) return null;

      return {
        chain: 'solana',
        collateral: {
          symbol: 'SOL',
          amount: demoState.collateral?.amount || 0,
          apy: 0.05,
          valueUsd: (demoState.collateral?.amount || 0) * 150,
        },
        debt: {
          symbol: 'USDC',
          amount: demoState.debt?.amount || 0,
          apr: 0.12,
          ltv: 0.5,
          healthFactor: 2.0,
        },
        exposure: {
          symbol: 'SOL',
          amount: demoState.exposure?.amount || 0,
          avgPrice: 150,
        },
        pnl: 0,
        netCarry: 0.05 - 0.12,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Error loading demo position:', error);
      return null;
    }
  }, []);

  const loadRealPosition = useCallback(async (): Promise<Position | null> => {
    if (!connected || !publicKey) return null;

    try {
      // Safe import with fallback
      let tokensDevnet: any = {};
      let pricesDevnet: any = { SOL: 150, USDC: 1 };
      
      try {
        const tokensModule = await import('../config/tokens.devnet.json');
        tokensDevnet = tokensModule.default || tokensModule;
      } catch (e) {
        console.warn('Could not load tokens.devnet.json, using defaults');
      }
      
      try {
        const pricesModule = await import('../config/prices.devnet.json');
        pricesDevnet = pricesModule.default || pricesModule;
      } catch (e) {
        console.warn('Could not load prices.devnet.json, using defaults');
      }

      if (!tokensDevnet.tokens?.collateral?.mint || !tokensDevnet.tokens?.debt?.mint) {
        console.warn('Missing token configuration, skipping real position load');
        return null;
      }

      const connection = getConnection();
      const health = await getHealth();

      const collateralMint = new PublicKey(tokensDevnet.tokens.collateral.mint);
      const debtMint = new PublicKey(tokensDevnet.tokens.debt.mint);

      const collateralAta = await getAssociatedTokenAddress(collateralMint, publicKey);
      const debtAta = await getAssociatedTokenAddress(debtMint, publicKey);

      let collateralAmount = 0;
      let debtAmount = 0;

      try {
        const collateralAccountInfo = await getAccount(connection, collateralAta);
        const collateralDecimals = await getMintDecimals(connection, collateralMint);
        collateralAmount = rawToUi(BigInt(collateralAccountInfo.amount.toString()), collateralDecimals);
      } catch (e) {
        // Account doesn't exist, amount is 0
      }

      try {
        const debtAccountInfo = await getAccount(connection, debtAta);
        const debtDecimals = await getMintDecimals(connection, debtMint);
        debtAmount = rawToUi(BigInt(debtAccountInfo.amount.toString()), debtDecimals);
      } catch (e) {
        // Account doesn't exist, amount is 0
      }

      const collateralPrice = pricesDevnet[tokensDevnet.tokens.collateral.symbol] || 1;
      const debtPrice = pricesDevnet[tokensDevnet.tokens.debt.symbol] || 1;

      const collateralUsd = collateralAmount * collateralPrice;
      const debtUsd = debtAmount * debtPrice;

      const netCarry = (health.apr || 0) - (health.apr || 0); // Placeholder, needs actual APY/APR from lender
      const pnl = 0; // Placeholder for PnL calculation

      const realPosition: Position = {
        chain: 'solana',
        collateral: {
          symbol: tokensDevnet.tokens.collateral.symbol,
          amount: collateralAmount,
          apy: 0, // Placeholder
          valueUsd: collateralUsd,
        },
        debt: {
          symbol: tokensDevnet.tokens.debt.symbol,
          amount: debtAmount,
          apr: health.apr,
          ltv: health.ltv,
          healthFactor: health.healthFactor,
        },
        exposure: {
          symbol: tokensDevnet.tokens.collateral.symbol,
          amount: collateralAmount,
          avgPrice: collateralPrice,
        },
        pnl: pnl,
        netCarry: netCarry,
        lastUpdated: Date.now(),
      };
      return realPosition;
    } catch (error) {
      console.error('Error loading real position:', error);
      return null;
    }
  }, [connected, publicKey]);

  const refresh = useCallback(async () => {
    try {
      let newPosition: Position | null = null;
      
      if (DEMO_MODE) {
        newPosition = await loadDemoPosition();
      } else {
        newPosition = await loadRealPosition();
      }
      
      setPosition(newPosition);
    } catch (error) {
      console.error('Error refreshing position:', error);
      setPosition(null);
    }
  }, [DEMO_MODE, loadDemoPosition, loadRealPosition]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    position,
    refresh,
  };
}