// src/components/borrow/BorrowPanel.tsx
import React, { useState, useEffect } from 'react';
import { useBorrow } from '../../hooks/useBorrow';
import { useTxToasts } from '../../hooks/useTxToasts';
import { Lock, Zap, CreditCard } from 'lucide-react';

interface BorrowPanelProps {
  preflightOk?: boolean;
}

export default function BorrowPanel({ preflightOk = true }: BorrowPanelProps) {
  const { provider, setProvider, adapter } = useBorrow();
  const { withTxToasts } = useTxToasts();
  const [assetIdx, setAssetIdx] = useState(0);
  const [amount, setAmount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    if (adapter) {
      adapter.getCollateralAssets().then(setAssets);
    }
  }, [adapter]);

  const handleEnable = async () => {
    if (!adapter || !assets[assetIdx]) return;
    setBusy(true);
    try {
      await withTxToasts(
        adapter.enableCollateral(assets[assetIdx], amount),
        {
          pending: `Enabling ${assets[assetIdx].symbol} as collateral...`,
          success: `${assets[assetIdx].symbol} enabled as collateral!`,
          error: `Failed to enable ${assets[assetIdx].symbol}`
        }
      );
    } catch (error) {
      console.error('Enable collateral error:', error);
    } finally {
      setBusy(false);
    }
  };

  const handleBorrow = async () => {
    if (!adapter || !assets[assetIdx]) return;
    setBusy(true);
    try {
      await withTxToasts(
        adapter.borrow(assets[assetIdx], amount),
        {
          pending: `Borrowing ${amount} ${assets[assetIdx].symbol}...`,
          success: `Successfully borrowed ${amount} ${assets[assetIdx].symbol}!`,
          error: `Failed to borrow ${assets[assetIdx].symbol}`
        }
      );
    } catch (error) {
      console.error('Borrow error:', error);
    } finally {
      setBusy(false);
    }
  };

  const handleRepay = async () => {
    if (!adapter || !assets[assetIdx]) return;
    setBusy(true);
    try {
      await withTxToasts(
        adapter.repay(assets[assetIdx], amount),
        {
          pending: `Repaying ${amount} ${assets[assetIdx].symbol}...`,
          success: `Successfully repaid ${amount} ${assets[assetIdx].symbol}!`,
          error: `Failed to repay ${assets[assetIdx].symbol}`
        }
      );
    } catch (error) {
      console.error('Repay error:', error);
    } finally {
      setBusy(false);
    }
  };

  if (!adapter) {
    return (
      <div className="bg-gradient-to-br from-cyphr-dark/80 to-cyphr-dark/40 rounded-2xl border border-cyphr-gray/20 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyphr-gray to-cyphr-gray/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img src="/assets/icons/WalletIcon.png" alt="Wallet" className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-cyphr-gray mb-2">No Borrow Adapter</h3>
          <p className="text-cyphr-gray/70">Please connect a wallet to access borrowing features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-cyphr-dark/80 to-cyphr-dark/40 rounded-2xl border border-cyphr-gray/20 p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-cyphr-orange to-cyphr-red rounded-xl flex items-center justify-center mr-4">
          <img src="/assets/icons/ActionIcon.png" alt="Borrow" className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-cyphr-white">Quick Borrow</h3>
          <p className="text-cyphr-gray">Enable collateral and borrow assets</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Asset Selection */}
        <div>
          <label className="block text-sm font-medium text-cyphr-gray mb-2">
            Select Asset
          </label>
          <select
            value={assetIdx}
            onChange={(e) => setAssetIdx(Number(e.target.value))}
            className="w-full bg-cyphr-dark/50 border border-cyphr-gray/30 rounded-xl px-4 py-3 text-cyphr-white focus:outline-none focus:ring-2 focus:ring-cyphr-orange/50 focus:border-transparent transition-all duration-200"
          >
            {assets.map((asset, idx) => (
              <option key={idx} value={idx}>
                {asset.symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-cyphr-gray mb-2">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0.0"
              className="w-full bg-cyphr-dark/50 border border-cyphr-gray/30 rounded-xl px-4 py-3 text-cyphr-white placeholder-cyphr-gray/50 focus:outline-none focus:ring-2 focus:ring-cyphr-orange/50 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-cyphr-gray text-sm">{assets[assetIdx]?.symbol || 'TOKEN'}</span>
            </div>
          </div>
        </div>

        {/* Asset Info */}
        {assets[assetIdx] && (
          <div className="bg-cyphr-dark/30 rounded-xl p-4 border border-cyphr-gray/20">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-cyphr-gray">Asset:</span>
              <span className="text-cyphr-white font-medium">{assets[assetIdx].symbol}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-cyphr-gray">Decimals:</span>
              <span className="text-cyphr-white">{assets[assetIdx].decimals}</span>
            </div>
          </div>
        )}

        {/* Enable Collateral Button */}
        <button
          disabled={!preflightOk || busy || amount <= 0 || !assets[assetIdx]}
          onClick={handleEnable}
          className="w-full rounded-xl bg-gradient-to-r from-cyphr-teal to-cyphr-blue hover:from-cyphr-teal/80 hover:to-cyphr-blue/80 disabled:from-cyphr-gray disabled:to-cyphr-gray/50 disabled:cursor-not-allowed text-cyphr-dark font-bold py-4 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
          title={!preflightOk ? 'System not ready - check preflight banner' : ''}
        >
          {busy ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyphr-dark mr-2"></div>
              Processing...
            </div>
          ) : (
            <><Lock className="w-4 h-4 inline mr-1" />Enable Collateral</>
          )}
        </button>

        {/* Borrow/Repay Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={!preflightOk || busy || amount <= 0 || !assets[assetIdx]}
            onClick={handleBorrow}
            className="rounded-xl bg-gradient-to-r from-cyphr-orange to-cyphr-red hover:from-cyphr-orange/80 hover:to-cyphr-red/80 disabled:from-cyphr-gray disabled:to-cyphr-gray/50 disabled:cursor-not-allowed text-cyphr-white font-semibold py-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
            title={!preflightOk ? 'System not ready - check preflight banner' : ''}
          >
            {busy ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyphr-white mr-2"></div>
                ...
              </div>
            ) : (
              <><Zap className="w-4 h-4 inline mr-1" />Borrow</>
            )}
          </button>

          <button
            disabled={!preflightOk || busy || amount <= 0 || !assets[assetIdx]}
            onClick={handleRepay}
            className="rounded-xl bg-cyphr-dark hover:bg-cyphr-gray/20 border border-cyphr-gray/30 text-cyphr-white font-semibold py-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            title={!preflightOk ? 'System not ready - check preflight banner' : ''}
          >
            {busy ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyphr-white mr-2"></div>
                ...
              </div>
            ) : (
              <><CreditCard className="w-4 h-4 inline mr-1" />Repay</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
