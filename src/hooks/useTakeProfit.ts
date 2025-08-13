import { useState, useEffect, useCallback, useRef } from 'react';
import { createPoolPriceService, PoolPriceService } from '../services/poolPrice';
import { swap } from '../adapters/dex';

export interface TakeProfitState {
  armed: boolean;
  side: 'buyA' | 'buyB' | null;
  amountUi: number;
  entryPrice: number;
  lastPrice: number | null;
  targetBps: number;
  lastUpdate: number;
}

export interface TakeProfitActions {
  arm: (params: { side: 'buyA' | 'buyB'; amountUi: number; entryPrice: number }) => void;
  disarm: () => void;
  refresh: () => void;
}

export function useTakeProfit(): [TakeProfitState, TakeProfitActions] {
  const [state, setState] = useState<TakeProfitState>({
    armed: false,
    side: null,
    amountUi: 0,
    entryPrice: 0,
    lastPrice: null,
    targetBps: Number(import.meta.env.VITE_TP_TARGET_BPS) || 200,
    lastUpdate: 0
  });

  const poolPriceService = useRef<PoolPriceService | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const pollMs = Number(import.meta.env.VITE_TP_POLL_MS) || 15000;

  // Initialize pool price service
  useEffect(() => {
    try {
      poolPriceService.current = createPoolPriceService();
    } catch (error) {
      console.error('Failed to create pool price service:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  // Start polling when armed
  useEffect(() => {
    if (state.armed && poolPriceService.current) {
      // Start polling
      pollInterval.current = setInterval(async () => {
        try {
          const currentPrice = await poolPriceService.current!.getPrice();
          const priceToCheck = state.side === 'buyA' ? currentPrice.aPerB : currentPrice.bPerA;
          
          setState(prev => ({
            ...prev,
            lastPrice: priceToCheck,
            lastUpdate: Date.now()
          }));

          // Check if take-profit target is met
          if (poolPriceService.current!.isTakeProfitTargetMet(
            state.entryPrice, 
            priceToCheck, 
            state.targetBps
          )) {
            console.log('Take-profit target met! Executing reverse swap...');
            
            // Execute reverse swap
            await executeTakeProfit();
            
            // Disarm after execution
            disarm();
          }
        } catch (error) {
          console.error('Error in take-profit polling:', error);
        }
      }, pollMs);

      // Initial price fetch
      const fetchInitialPrice = async () => {
        try {
          const price = await poolPriceService.current!.getPrice();
          const priceToCheck = state.side === 'buyA' ? price.aPerB : price.bPerA;
          
          setState(prev => ({
            ...prev,
            lastPrice: priceToCheck,
            lastUpdate: Date.now()
          }));
        } catch (error) {
          console.error('Error fetching initial price:', error);
        }
      };
      
      fetchInitialPrice();
    } else {
      // Stop polling when disarmed
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    }
  }, [state.armed, state.side, state.entryPrice, state.targetBps, pollMs]);

  // Execute take-profit (reverse swap)
  const executeTakeProfit = useCallback(async () => {
    if (!state.armed || !poolPriceService.current) return;

    try {
      console.log(`Executing take-profit: ${state.side} -> reverse`);
      
      // Determine reverse swap direction
      const reverseSide = state.side === 'buyA' ? 'buyB' : 'buyA';
      
      // Execute reverse swap
      const result = await swap(
        state.side === 'buyA' ? 'mintA' : 'mintB', // input mint
        state.side === 'buyA' ? 'mintB' : 'mintA', // output mint
        state.amountUi,
        100 // 1% slippage for TP
      );

      if (result.signature) {
        console.log('Take-profit executed successfully:', result.signature);
        
        // Update local state to reflect the trade
        // This could trigger a position refresh
      } else {
        console.error('Take-profit execution failed');
      }
    } catch (error) {
      console.error('Error executing take-profit:', error);
    }
  }, [state.armed, state.side, state.amountUi]);

  // Arm take-profit
  const arm = useCallback((params: { side: 'buyA' | 'buyB'; amountUi: number; entryPrice: number }) => {
    const { side, amountUi, entryPrice } = params;
    
    console.log(`Arming take-profit: ${side}, amount: ${amountUi}, entry: ${entryPrice}`);
    
    setState(prev => ({
      ...prev,
      armed: true,
      side,
      amountUi,
      entryPrice,
      lastUpdate: Date.now()
    }));
  }, []);

  // Disarm take-profit
  const disarm = useCallback(() => {
    console.log('Disarming take-profit');
    
    setState(prev => ({
      ...prev,
      armed: false,
      side: null,
      amountUi: 0,
      entryPrice: 0,
      lastPrice: null,
      lastUpdate: 0
    }));
  }, []);

  // Refresh take-profit state
  const refresh = useCallback(async () => {
    if (!poolPriceService.current || !state.armed) return;

    try {
      const currentPrice = await poolPriceService.current.getPrice();
      const priceToCheck = state.side === 'buyA' ? currentPrice.aPerB : currentPrice.bPerA;
      
      setState(prev => ({
        ...prev,
        lastPrice: priceToCheck,
        lastUpdate: Date.now()
      }));
    } catch (error) {
      console.error('Error refreshing take-profit:', error);
    }
  }, [state.armed, state.side]);

  // Calculate current P&L
  const currentPnL = useCallback((): number => {
    if (!state.armed || !state.lastPrice || !state.entryPrice) return 0;
    
    const priceChange = ((state.lastPrice - state.entryPrice) / state.entryPrice) * 100;
    return priceChange;
  }, [state.armed, state.lastPrice, state.entryPrice]);

  // Check if target is met
  const isTargetMet = useCallback((): boolean => {
    if (!state.armed || !state.lastPrice || !state.entryPrice) return false;
    
    return poolPriceService.current?.isTakeProfitTargetMet(
      state.entryPrice,
      state.lastPrice,
      state.targetBps
    ) || false;
  }, [state.armed, state.lastPrice, state.entryPrice, state.targetBps]);

  return [
    {
      ...state,
      currentPnL: currentPnL(),
      isTargetMet: isTargetMet()
    },
    { arm, disarm, refresh }
  ];
}
