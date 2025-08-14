import React, { useState, useEffect } from 'react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { enableCollateral, borrow, repay } from '../adapters/lender';
import { dexAdapter } from '../adapters/dexAdapter';
import { useTakeProfit } from '../hooks/useTakeProfit';
import { getPoolPrice } from '../services/poolPrice';
import { usePreflight } from './Preflight';
import { useTxToasts } from '../hooks/useTxToasts';
import { 
  Wallet, 
  Coins, 
  TrendingUp, 
  Target, 
  Zap,
  ArrowUpDown,
  DollarSign
} from 'lucide-react';

export interface BorrowTradePanelProps {
  onPositionUpdate: () => void;
}

export function BorrowTradePanel({ onPositionUpdate }: BorrowTradePanelProps) {
  const { connected, publicKey } = useSolanaWallet();
  const preflight = usePreflight();
  const { withTxToasts } = useTxToasts();
  
  const [selectedAsset, setSelectedAsset] = useState('SOL');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [poolPrice, setPoolPrice] = useState({ aPerB: 0, bPerA: 0, timestamp: 0 });
  
  const {
    isArmed,
    status: tpStatus,
    entryPrice,
    targetPrice,
    currentPrice,
    armTakeProfit,
    disarmTakeProfit,
    executeTakeProfit
  } = useTakeProfit();

  // Load pool price on mount
  useEffect(() => {
    const loadPoolPrice = async () => {
      try {
        const price = await getPoolPrice();
        setPoolPrice(price);
      } catch (error) {
        console.error('Failed to load pool price:', error);
      }
    };

    loadPoolPrice();
    const interval = setInterval(loadPoolPrice, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, []);

  // Validation helper
  const isValidAmount = () => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
  };

  const handleEnableCollateral = async () => {
    if (!connected || !publicKey || !preflight.ok || !isValidAmount()) return;
    
    setIsLoading(true);
    try {
      const result = await withTxToasts(
        enableCollateral(
          selectedAsset === 'SOL' ? 'So11111111111111111111111111111111111111112' : '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
          parseFloat(amount)
        ),
        {
          pending: 'Enabling collateral...',
          success: `Successfully enabled ${amount} ${selectedAsset} as collateral`,
          error: 'Failed to enable collateral'
        }
      );
      
      onPositionUpdate();
      setAmount('');
    } catch (error) {
      console.error('Enable collateral failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!connected || !publicKey || !preflight.ok || !isValidAmount()) return;
    
    setIsLoading(true);
    try {
      const result = await withTxToasts(
        borrow(
          '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // USDC mint
          parseFloat(amount)
        ),
        {
          pending: 'Borrowing USDC...',
          success: `Successfully borrowed ${amount} USDC`,
          error: 'Failed to borrow USDC'
        }
      );
      
      onPositionUpdate();
      setAmount('');
    } catch (error) {
      console.error('Borrow failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!connected || !publicKey || !preflight.ok || !isValidAmount()) return;
    
    setIsLoading(true);
    try {
      const result = await withTxToasts(
        dexAdapter.swap({
          inputToken: 'USDC',
          outputToken: 'SOL',
          amountIn: parseFloat(amount),
          maxSlippagePct: 1.0,
          owner: publicKey,
          sendTransaction: async (tx) => {
            // This would be the actual transaction sending logic
            return 'buy_signature';
          }
        }),
        {
          pending: 'Buying SOL...',
          success: `Successfully bought ${amount} SOL`,
          error: 'Failed to buy SOL'
        }
      );
      
      onPositionUpdate();
      setAmount('');
    } catch (error) {
      console.error('Buy failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyAndArmTP = async () => {
    if (!connected || !publicKey || !preflight.ok || !isValidAmount()) return;
    
    setIsLoading(true);
    try {
      // First buy
      const buyResult = await withTxToasts(
        dexAdapter.swap({
          inputToken: 'USDC',
          outputToken: 'SOL',
          amountIn: parseFloat(amount),
          maxSlippagePct: 1.0,
          owner: publicKey,
          sendTransaction: async (tx) => {
            // This would be the actual transaction sending logic
            return 'buy_signature';
          }
        }),
        {
          pending: 'Buying SOL...',
          success: `Successfully bought ${amount} SOL`,
          error: 'Failed to buy SOL'
        }
      );
      
      // Then arm take profit
      await armTakeProfit(parseFloat(amount), 'A', 'B'); // Using the correct signature
      
      onPositionUpdate();
      setAmount('');
    } catch (error) {
      console.error('Buy and arm TP failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceSell = async () => {
    if (!connected || !publicKey || !preflight.ok || !isValidAmount()) return;
    
    setIsLoading(true);
    try {
      const result = await withTxToasts(
        dexAdapter.swap({
          inputToken: 'SOL',
          outputToken: 'USDC',
          amountIn: parseFloat(amount),
          maxSlippagePct: 1.0,
          owner: publicKey,
          sendTransaction: async (tx) => {
            // This would be the actual transaction sending logic
            return 'sell_signature';
          }
        }),
        {
          pending: 'Force selling SOL...',
          success: `Successfully sold ${amount} SOL`,
          error: 'Failed to force sell SOL'
        }
      );
      
      onPositionUpdate();
      setAmount('');
    } catch (error) {
      console.error('Force sell failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isActionDisabled = !connected || !preflight.ok || !isValidAmount() || isLoading;

  return (
    <div className="borrow-trade-panel">
      <div className="panel-header">
        <h3 className="panel-title">BORROW & TRADE</h3>
        <Wallet className="w-4 h-4" />
      </div>

      {/* Asset Selection */}
      <div className="asset-selection">
        <label className="asset-label">Select Asset</label>
        <select 
          value={selectedAsset} 
          onChange={(e) => setSelectedAsset(e.target.value)}
          className="asset-select"
          disabled={!connected}
        >
          <option value="SOL">SOL</option>
          <option value="USDC">USDC</option>
        </select>
      </div>

      {/* Amount Input */}
      <div className="amount-input-group">
        <label className="amount-label">Amount</label>
        <div className="amount-input-wrapper">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="amount-input"
            disabled={!connected}
          />
          <button 
            className="max-btn"
            onClick={() => setAmount(selectedAsset === 'SOL' ? '10' : '1000')}
            disabled={!connected}
          >
            MAX
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="action-btn enable-collateral"
          onClick={handleEnableCollateral}
          disabled={isActionDisabled || selectedAsset !== 'SOL'}
        >
          <Coins className="w-4 h-4" />
          Enable Collateral
        </button>

        <button
          className="action-btn borrow"
          onClick={handleBorrow}
          disabled={isActionDisabled || selectedAsset !== 'USDC'}
        >
          <TrendingUp className="w-4 h-4" />
          Borrow
        </button>

        <button
          className="action-btn buy"
          onClick={handleBuy}
          disabled={isActionDisabled}
        >
          <ArrowUpDown className="w-4 h-4" />
          Buy
        </button>

        <button
          className="action-btn buy-tp"
          onClick={handleBuyAndArmTP}
          disabled={isActionDisabled}
        >
          <Target className="w-4 h-4" />
          Buy & Arm TP
        </button>

        <button
          className="action-btn force-sell"
          onClick={handleForceSell}
          disabled={isActionDisabled}
        >
          <Zap className="w-4 h-4" />
          Force Sell
        </button>
      </div>

      {/* Take-Profit Status */}
      {isArmed && (
        <div className="tp-status">
          <div className="tp-header">
            <Target className="w-4 h-4 text-blue-400" />
            <span>Take-Profit: {tpStatus}</span>
          </div>
          
          <div className="tp-details">
            <div className="tp-item">
              <span>Entry:</span>
              <span>{entryPrice.toFixed(4)}</span>
            </div>
            <div className="tp-item">
              <span>Target:</span>
              <span>{targetPrice.toFixed(4)}</span>
            </div>
            <div className="tp-item">
              <span>Current:</span>
              <span>{currentPrice.toFixed(4)}</span>
            </div>
          </div>
          
          <div className="tp-actions">
            <button
              className="tp-btn disarm"
              onClick={disarmTakeProfit}
              disabled={!isArmed}
            >
              Disarm
            </button>
            <button
              className="tp-btn execute"
              onClick={executeTakeProfit}
              disabled={tpStatus !== 'triggered'}
            >
              Execute Now
            </button>
          </div>
        </div>
      )}

      {/* Pool Price Display */}
      <div className="pool-price">
        <div className="price-header">
          <DollarSign className="w-4 h-4" />
          <span>Pool Price</span>
        </div>
        <div className="price-values">
          <div className="price-item">
            <span>SOL/USDC:</span>
            <span>{poolPrice.aPerB.toFixed(4)}</span>
          </div>
          <div className="price-item">
            <span>USDC/SOL:</span>
            <span>{poolPrice.bPerA.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
