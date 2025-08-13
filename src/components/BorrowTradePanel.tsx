import React, { useState, useCallback } from 'react';
import { enableCollateral, borrow } from '../adapters/lender';
import { swap } from '../adapters/dex';
import { useTakeProfit } from '../hooks/useTakeProfit';
import { useTxToasts } from '../hooks/useTxToasts';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { createPoolPriceService } from '../services/poolPrice';

interface BorrowTradePanelProps {
  preflightOk: boolean;
}

export const BorrowTradePanel: React.FC<BorrowTradePanelProps> = ({ preflightOk }) => {
  const { connected, publicKey } = useSolanaWallet();
  const { withTxToasts } = useTxToasts();
  
  // State
  const [selectedAsset, setSelectedAsset] = useState<'SOL' | 'USDC'>('SOL');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [poolPrice, setPoolPrice] = useState<number | null>(null);
  
  // Take-profit hook
  const [tpState, tpActions] = useTakeProfit();
  
  // Load pool price on mount
  React.useEffect(() => {
    const loadPoolPrice = async () => {
      try {
        const poolPriceService = createPoolPriceService();
        const price = await poolPriceService.getPrice();
        setPoolPrice(price.aPerB);
      } catch (error) {
        console.error('Failed to load pool price:', error);
      }
    };
    
    if (preflightOk) {
      loadPoolPrice();
    }
  }, [preflightOk]);

  // Handle amount input with tolerant numeric typing
  const handleAmountChange = useCallback((value: string) => {
    // Allow numbers, decimals, and empty string
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  }, []);

  // Enable collateral
  const handleEnableCollateral = useCallback(async () => {
    if (!connected || !publicKey || !preflightOk) return;
    
    setIsLoading(true);
    try {
      const result = await withTxToasts(
        enableCollateral(selectedAsset, parseFloat(amount) || 0),
        {
          pending: 'Enabling collateral...',
          success: `Successfully enabled ${amount} ${selectedAsset} as collateral`,
          error: 'Enable Collateral Failed'
        }
      );
      
      // Refresh position data
      // This would typically trigger a position refresh
      
    } catch (error) {
      console.error('Enable collateral failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, preflightOk, selectedAsset, amount, withTxToasts]);

  // Borrow assets
  const handleBorrow = useCallback(async () => {
    if (!connected || !publicKey || !preflightOk) return;
    
    setIsLoading(true);
    try {
      const borrowAmount = parseFloat(amount) || 0;
      await withTxToasts(
        borrow(selectedAsset === 'SOL' ? 'USDC' : 'SOL', borrowAmount),
        {
          pending: 'Borrowing assets...',
          success: `Successfully borrowed ${amount} ${selectedAsset === 'SOL' ? 'USDC' : 'SOL'}`,
          error: 'Borrow Failed'
        }
      );
      
    } catch (error) {
      console.error('Borrow failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, preflightOk, selectedAsset, amount, withTxToasts]);

  // Buy assets
  const handleBuy = useCallback(async () => {
    if (!connected || !publicKey || !preflightOk) return;
    
    setIsLoading(true);
    try {
      const buyAmount = parseFloat(amount) || 0;
      
      // Determine swap direction based on selected asset
      const inputMint = selectedAsset === 'SOL' ? 'mintB' : 'mintA'; // USDC -> SOL or SOL -> USDC
      const outputMint = selectedAsset === 'SOL' ? 'mintA' : 'mintB';
      
      const result = await withTxToasts(
        swap(inputMint, outputMint, buyAmount, 100), // 1% slippage
        {
          pending: 'Executing buy...',
          success: `Successfully bought ${amount} ${selectedAsset}`,
          error: 'Buy Failed'
        }
      );
      
      // Record entry price for take-profit
      if (poolPrice && result.signature) {
        tpActions.arm({
          side: selectedAsset === 'SOL' ? 'buyA' : 'buyB',
          amountUi: buyAmount,
          entryPrice: poolPrice
        });
      }
      
    } catch (error) {
      console.error('Buy failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, preflightOk, selectedAsset, amount, poolPrice, tpActions, withTxToasts]);

  // Buy and arm take-profit
  const handleBuyAndArmTP = useCallback(async () => {
    if (!connected || !publicKey || !preflightOk) return;
    
    setIsLoading(true);
    try {
      const buyAmount = parseFloat(amount) || 0;
      
      // Execute buy first
      const inputMint = selectedAsset === 'SOL' ? 'mintB' : 'mintA';
      const outputMint = selectedAsset === 'SOL' ? 'mintA' : 'mintB';
      
      const result = await withTxToasts(
        swap(inputMint, outputMint, buyAmount, 100),
        {
          pending: 'Executing buy and arming TP...',
          success: `Bought ${amount} ${selectedAsset} and armed take-profit at ${poolPrice?.toFixed(4)}`,
          error: 'Buy & Arm TP Failed'
        }
      );
      
      // Arm take-profit with entry price
      if (poolPrice && result.signature) {
        tpActions.arm({
          side: selectedAsset === 'SOL' ? 'buyA' : 'buyB',
          amountUi: buyAmount,
          entryPrice: poolPrice
        });
      }
      
    } catch (error) {
      console.error('Buy & Arm TP failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, preflightOk, selectedAsset, amount, poolPrice, tpActions, withTxToasts]);

  // Force sell (execute take-profit now)
  const handleForceSell = useCallback(async () => {
    if (!tpState.armed || !preflightOk) return;
    
    setIsLoading(true);
    try {
      // Execute reverse swap immediately
      const reverseSide = tpState.side === 'buyA' ? 'buyB' : 'buyA';
      await withTxToasts(
        swap(
          reverseSide === 'buyA' ? 'mintA' : 'mintB',
          reverseSide === 'buyA' ? 'mintB' : 'mintA',
          tpState.amountUi,
          100
        ),
        {
          pending: 'Executing force sell...',
          success: `Executed take-profit for ${tpState.amountUi} units`,
          error: 'Force Sell Failed'
        }
      );
      
      // Disarm take-profit
      tpActions.disarm();
      
    } catch (error) {
      console.error('Force sell failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tpState, preflightOk, tpActions, withTxToasts]);

  // Check if actions should be disabled
  const isActionDisabled = !preflightOk || !connected || !publicKey || isLoading || !amount || parseFloat(amount) <= 0;
  const isTPDisabled = !tpState.armed || isLoading;

  return (
    <div className="lending-borrowing-card">
      <div className="panel-header mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Borrow & Trade</h3>
        <p className="text-gray-400 text-sm">
          Enable collateral, borrow assets, and execute trades with take-profit automation
        </p>
      </div>

      {/* Asset Selection */}
      <div className="asset-selection mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Asset</label>
        <select
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value as 'SOL' | 'USDC')}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!preflightOk}
        >
          <option value="SOL">SOL</option>
          <option value="USDC">USDC</option>
        </select>
      </div>

      {/* Amount Input */}
      <div className="amount-input mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="0.0"
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!preflightOk}
        />
        {poolPrice && (
          <p className="text-xs text-gray-500 mt-1">
            Current pool price: {poolPrice.toFixed(4)}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons space-y-3">
        <button
          onClick={handleEnableCollateral}
          disabled={isActionDisabled}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Processing...' : 'Enable Collateral'}
        </button>

        <button
          onClick={handleBorrow}
          disabled={isActionDisabled}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Processing...' : 'Borrow'}
        </button>

        <button
          onClick={handleBuy}
          disabled={isActionDisabled}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Processing...' : 'Buy'}
        </button>

        <button
          onClick={handleBuyAndArmTP}
          disabled={isActionDisabled}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Processing...' : 'Buy & Arm TP'}
        </button>

        <button
          onClick={handleForceSell}
          disabled={isTPDisabled}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Processing...' : 'Force Sell (TP Now)'}
        </button>
      </div>

      {/* Take-Profit Status */}
      {tpState.armed && (
        <div className="tp-status mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-300 mb-2">Take-Profit Status</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400 ml-2">Armed</span>
            </div>
            <div>
              <span className="text-gray-400">Entry Price:</span>
              <span className="text-white ml-2">{tpState.entryPrice.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-gray-400">Current Price:</span>
              <span className="text-white ml-2">
                {tpState.lastPrice ? tpState.lastPrice.toFixed(4) : 'Loading...'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">P&L:</span>
              <span className="text-white ml-2">
                {tpState.lastPrice && tpState.entryPrice 
                  ? (((tpState.lastPrice - tpState.entryPrice) / tpState.entryPrice) * 100).toFixed(2)
                  : '0.00'
                }%
              </span>
            </div>
          </div>
          <button
            onClick={tpActions.disarm}
            className="mt-3 w-full bg-gray-600 hover:bg-gray-700 text-white text-xs py-1 px-3 rounded transition-colors"
          >
            Disarm TP
          </button>
        </div>
      )}

      {/* Preflight Warning */}
      {!preflightOk && (
        <div className="preflight-warning mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <p className="text-yellow-300 text-sm">
            ⚠️ System not ready. Check preflight banner for details.
          </p>
        </div>
      )}
    </div>
  );
};
