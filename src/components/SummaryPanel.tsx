import React from 'react';
import { usePosition } from '../hooks/usePosition';
import { useTakeProfit } from '../hooks/useTakeProfit';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';

interface SummaryPanelProps {
  preflightOk: boolean;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ preflightOk }) => {
  const { connected, publicKey } = useSolanaWallet();
  const { position } = usePosition();
  const [tpState] = useTakeProfit();

  // Calculate net carry (supply APY - borrow APR)
  const netCarry = position ? position.netCarry : 0;
  const netCarryColor = netCarry >= 0 ? 'text-green-400' : 'text-red-400';

  // Format numbers with appropriate decimals
  const formatNumber = (value: number, decimals: number = 2) => {
    if (value === 0) return '0.00';
    return value.toFixed(decimals);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${formatNumber(value, 2)}%`;
  };

  // Get health factor color
  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor >= 2.0) return 'text-green-400';
    if (healthFactor >= 1.5) return 'text-yellow-400';
    if (healthFactor >= 1.2) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get LTV color
  const getLTVColor = (ltv: number) => {
    if (ltv <= 0.5) return 'text-green-400';
    if (ltv <= 0.7) return 'text-yellow-400';
    if (ltv <= 0.8) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="summary-panel bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 sticky top-4">
      <div className="panel-header mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Position Summary</h3>
        <p className="text-gray-400 text-sm">
          Real-time metrics and risk assessment
        </p>
      </div>

      {!connected ? (
        <div className="not-connected text-center py-8">
          <div className="text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-400">Connect wallet to view position</p>
        </div>
      ) : !preflightOk ? (
        <div className="preflight-warning text-center py-8">
          <div className="text-yellow-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-yellow-400">System not ready</p>
          <p className="text-gray-400 text-sm mt-1">Check preflight banner</p>
        </div>
      ) : !position ? (
        <div className="no-position text-center py-8">
          <div className="text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400">No active position</p>
          <p className="text-gray-500 text-sm mt-1">Enable collateral to get started</p>
        </div>
      ) : (
        <div className="position-metrics space-y-4">
          {/* Health Factor */}
          <div className="metric-item">
            <div className="metric-header flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-300">Health Factor</span>
              <span className={`text-lg font-bold ${getHealthFactorColor(position.debt.healthFactor)}`}>
                {formatNumber(position.debt.healthFactor, 2)}
              </span>
            </div>
            <div className="health-bar bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  position.debt.healthFactor >= 2.0 ? 'bg-green-500' :
                  position.debt.healthFactor >= 1.5 ? 'bg-yellow-500' :
                  position.debt.healthFactor >= 1.2 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(position.debt.healthFactor * 50, 100)}%` }}
              />
            </div>
          </div>

          {/* LTV */}
          <div className="metric-item">
            <div className="metric-header flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-300">Loan-to-Value</span>
              <span className={`text-lg font-bold ${getLTVColor(position.debt.ltv)}`}>
                {formatPercentage(position.debt.ltv * 100)}
              </span>
            </div>
            <div className="ltv-bar bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  position.debt.ltv <= 0.5 ? 'bg-green-500' :
                  position.debt.ltv <= 0.7 ? 'bg-yellow-500' :
                  position.debt.ltv <= 0.8 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${position.debt.ltv * 100}%` }}
              />
            </div>
          </div>

          {/* Collateral */}
          <div className="metric-item bg-gray-800/50 rounded-lg p-3">
            <div className="metric-header flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">Collateral</span>
              <span className="text-sm text-gray-400">{position.collateral.symbol}</span>
            </div>
            <div className="metric-value text-2xl font-bold text-white mb-1">
              {formatNumber(position.collateral.amount, 4)}
            </div>
            <div className="metric-details text-sm text-gray-400">
              APY: {formatPercentage(position.collateral.apy * 100)} | 
              Value: ${formatNumber(position.collateral.valueUsd, 2)}
            </div>
          </div>

          {/* Debt */}
          <div className="metric-item bg-gray-800/50 rounded-lg p-3">
            <div className="metric-header flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">Debt</span>
              <span className="text-sm text-gray-400">{position.debt.symbol}</span>
            </div>
            <div className="metric-value text-2xl font-bold text-white mb-1">
              {formatNumber(position.debt.amount, 2)}
            </div>
            <div className="metric-details text-sm text-gray-400">
              APR: {formatPercentage(position.debt.apr * 100)} | 
              LTV: {formatPercentage(position.debt.ltv * 100)}
            </div>
          </div>

          {/* Net Carry */}
          <div className="metric-item bg-gray-800/50 rounded-lg p-3">
            <div className="metric-header flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">Net Carry</span>
              <span className="text-sm text-gray-400">Supply APY - Borrow APR</span>
            </div>
            <div className={`metric-value text-2xl font-bold mb-1 ${netCarryColor}`}>
              {formatPercentage(netCarry * 100)}
            </div>
            <div className="metric-details text-sm text-gray-400">
              {netCarry >= 0 ? 'Positive carry' : 'Negative carry'}
            </div>
          </div>

          {/* P&L */}
          <div className="metric-item bg-gray-800/50 rounded-lg p-3">
            <div className="metric-header flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">P&L</span>
              <span className="text-sm text-gray-400">Unrealized</span>
            </div>
            <div className={`metric-value text-2xl font-bold mb-1 ${
              position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatPercentage(position.pnl)}
            </div>
            <div className="metric-details text-sm text-gray-400">
              Last updated: {new Date(position.lastUpdated).toLocaleTimeString()}
            </div>
          </div>

          {/* Take-Profit Status */}
          {tpState.armed && (
            <div className="tp-status bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
              <div className="metric-header flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-300">Take-Profit</span>
                <span className="text-sm text-green-400">Armed</span>
              </div>
              <div className="metric-value text-lg font-bold text-white mb-1">
                {formatNumber(tpState.amountUi, 4)} {tpState.side === 'buyA' ? 'SOL' : 'USDC'}
              </div>
              <div className="metric-details text-sm text-gray-400">
                Entry: {tpState.entryPrice.toFixed(4)} | 
                Current: {tpState.lastPrice ? tpState.lastPrice.toFixed(4) : 'Loading...'} | 
                P&L: {formatPercentage(tpState.currentPnL)}
              </div>
            </div>
          )}

          {/* Transaction Status */}
          <div className="transaction-status bg-gray-800/50 rounded-lg p-3">
            <div className="metric-header flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">Transaction Status</span>
              <span className="text-sm text-green-400">Ready</span>
            </div>
            <div className="metric-details text-sm text-gray-400">
              Wallet: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
            </div>
            <div className="metric-details text-sm text-gray-400">
              Network: Devnet
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
