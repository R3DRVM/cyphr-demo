import { useState, useEffect, useCallback, useRef } from 'react';
import { getPoolPrice } from '../services/poolPrice';
import { dexAdapter } from '../adapters/dexAdapter';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { DEMO_MODE } from '../config/policy';

export interface TakeProfitState {
  isArmed: boolean;
  entryPrice: number;
  targetPrice: number;
  currentPrice: number;
  lastUpdate: number;
  status: 'idle' | 'armed' | 'triggered' | 'executed';
}

export interface TakeProfitConfig {
  targetBps: number;
  pollMs: number;
  autoExecute: boolean;
}

const DEFAULT_CONFIG: TakeProfitConfig = {
  targetBps: parseInt(import.meta.env.VITE_TP_TARGET_BPS || '500'),
  pollMs: parseInt(import.meta.env.VITE_TP_POLL_MS || '15000'),
  autoExecute: true
};

export function useTakeProfit(config: Partial<TakeProfitConfig> = {}) {
  const { connected, publicKey } = useSolanaWallet();
  const [state, setState] = useState<TakeProfitState>({
    isArmed: false,
    entryPrice: 0,
    targetPrice: 0,
    currentPrice: 0,
    lastUpdate: 0,
    status: 'idle'
  });
  
  const [amount, setAmount] = useState(0);
  const [inputMint, setInputMint] = useState('');
  const [outputMint, setOutputMint] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Arm take-profit
  const armTakeProfit = useCallback(async (
    entryAmount: number,
    inputToken: string,
    outputToken: string
  ) => {
    try {
      const currentPrice = await getPoolPrice();
      const price = inputToken === 'A' ? currentPrice.aPerB : currentPrice.bPerA;
      
      const targetBps = finalConfig.targetBps / 10000;
      const targetPrice = price * (1 + targetBps);
      
      setState({
        isArmed: true,
        entryPrice: price,
        targetPrice,
        currentPrice: price,
        lastUpdate: Date.now(),
        status: 'armed'
      });
      
      setAmount(entryAmount);
      setInputMint(inputToken);
      setOutputMint(outputToken);
      
      console.log(`[TP] Armed: Entry=${price}, Target=${targetPrice}, Amount=${entryAmount}`);
    } catch (error) {
      console.error('Failed to arm take-profit:', error);
    }
  }, [finalConfig.targetBps]);

  // Disarm take-profit
  const disarmTakeProfit = useCallback(() => {
    setState(prev => ({
      ...prev,
      isArmed: false,
      status: 'idle'
    }));
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    
    console.log('[TP] Disarmed');
  }, []);

  // Execute take-profit
  const executeTakeProfit = useCallback(async () => {
    if (!connected || !publicKey || !state.isArmed) {
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'executed' }));
      
      if (DEMO_MODE) {
        console.log('[TP] Demo mode: Executing take-profit');
        // In demo mode, just disarm
        disarmTakeProfit();
        return;
      }

      // Execute reverse swap
      const result = await dexAdapter.swap({
        inputToken,
        outputToken,
        amountIn: amount,
        maxSlippagePct: 1.0, // 1% slippage for TP
        owner: publicKey,
        sendTransaction: async (tx) => {
          // This would be the actual transaction sending logic
          return 'tp_execution_signature';
        }
      });

      console.log('[TP] Executed:', result);
      disarmTakeProfit();
    } catch (error) {
      console.error('Failed to execute take-profit:', error);
      setState(prev => ({ ...prev, status: 'armed' }));
    }
  }, [connected, publicKey, state.isArmed, amount, inputMint, outputMint, disarmTakeProfit]);

  // Poll for price updates
  useEffect(() => {
    if (!state.isArmed || !finalConfig.autoExecute) {
      return;
    }

    const pollPrice = async () => {
      try {
        const currentPrice = await getPoolPrice();
        const price = inputMint === 'A' ? currentPrice.aPerB : currentPrice.bPerA;
        
        setState(prev => ({
          ...prev,
          currentPrice: price,
          lastUpdate: Date.now()
        }));

        // Check if target is met
        if (price >= state.targetPrice) {
          setState(prev => ({ ...prev, status: 'triggered' }));
          console.log(`[TP] Target met: ${price} >= ${state.targetPrice}`);
          
          if (finalConfig.autoExecute) {
            await executeTakeProfit();
          }
        }
      } catch (error) {
        console.error('Failed to poll price:', error);
      }
    };

    // Initial poll
    pollPrice();
    
    // Set up interval
    intervalRef.current = setInterval(pollPrice, finalConfig.pollMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isArmed, state.targetPrice, inputMint, finalConfig.pollMs, finalConfig.autoExecute, executeTakeProfit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    state,
    armTakeProfit,
    disarmTakeProfit,
    executeTakeProfit,
    isArmed: state.isArmed,
    status: state.status,
    entryPrice: state.entryPrice,
    targetPrice: state.targetPrice,
    currentPrice: state.currentPrice,
    lastUpdate: state.lastUpdate
  };
}
