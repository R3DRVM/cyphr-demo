import React from 'react';
import { Position } from '../types/position';

interface PositionCardProps {
  position: Position;
  onRepay?: () => Promise<void>;
  onUnwind?: () => Promise<void>;
  onRepayAndUnwind?: () => Promise<void>;
  preflightOk?: boolean;
}

export function PositionCard({ position, onRepay, onUnwind, onRepayAndUnwind, preflightOk = true }: PositionCardProps) {
  const hasOutstandingDebt = position.debt.amount > 0;
  const hasExposure = position.exposure.amount > 0;
  const shouldShowUnwind = hasOutstandingDebt || hasExposure;

  // Calculate position metrics
  const totalValue = position.collateral.amount + position.exposure.amount;
  const debtRatio = totalValue > 0 ? (position.debt.amount / totalValue) * 100 : 0;
  const healthFactor = debtRatio < 80 ? 'Healthy' : debtRatio < 95 ? 'Warning' : 'Danger';

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Healthy': return 'text-cyphr-teal';
      case 'Warning': return 'text-cyphr-orange';
      case 'Danger': return 'text-cyphr-red';
      default: return 'text-cyphr-gray';
    }
  };

  const getHealthBgColor = (health: string) => {
    switch (health) {
      case 'Healthy': return 'bg-cyphr-teal/20 border-cyphr-teal/30';
      case 'Warning': return 'bg-cyphr-orange/20 border-cyphr-orange/30';
      case 'Danger': return 'bg-cyphr-red/20 border-cyphr-red/30';
      default: return 'bg-cyphr-gray/20 border-cyphr-gray/30';
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyphr-dark/80 to-cyphr-dark/40 rounded-2xl border border-cyphr-gray/20 p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-cyphr-blue to-cyphr-purple rounded-xl flex items-center justify-center mr-4">
            <img src="/assets/icons/PositionCard.png" alt="Position" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-cyphr-white">Active Position</h3>
            <p className="text-cyphr-gray">Your current DeFi strategy position</p>
          </div>
        </div>
        
        {/* Health Status */}
        <div className={`px-4 py-2 rounded-xl border ${getHealthBgColor(healthFactor)}`}>
          <span className={`text-sm font-semibold ${getHealthColor(healthFactor)}`}>
            {healthFactor}
          </span>
        </div>
      </div>

      {/* Position Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Collateral */}
        <div className="bg-gradient-to-br from-cyphr-dark/60 to-cyphr-dark/40 rounded-xl p-4 border border-cyphr-gray/20">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyphr-teal to-cyphr-teal/80 rounded-lg flex items-center justify-center mr-3">
              <img src="/assets/icons/DepositIcon.png" alt="Collateral" className="w-4 h-4" />
            </div>
            <span className="text-cyphr-gray text-sm font-medium">Collateral</span>
          </div>
          <div className="text-2xl font-bold text-cyphr-white">
            {position.collateral.amount.toFixed(4)}
          </div>
          <div className="text-cyphr-gray text-sm">{position.collateral.symbol}</div>
        </div>

        {/* Exposure */}
        <div className="bg-gradient-to-br from-cyphr-dark/60 to-cyphr-dark/40 rounded-xl p-4 border border-cyphr-gray/20">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyphr-blue to-cyphr-blue/80 rounded-lg flex items-center justify-center mr-3">
              <img src="/assets/icons/TokenDataIcon.png" alt="Exposure" className="w-4 h-4" />
            </div>
            <span className="text-cyphr-gray text-sm font-medium">Exposure</span>
          </div>
          <div className="text-2xl font-bold text-cyphr-white">
            {position.exposure.amount.toFixed(4)}
          </div>
          <div className="text-cyphr-gray text-sm">{position.exposure.symbol}</div>
        </div>

        {/* Debt */}
        <div className="bg-gradient-to-br from-cyphr-dark/60 to-cyphr-dark/40 rounded-xl p-4 border border-cyphr-gray/20">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyphr-orange to-cyphr-red rounded-lg flex items-center justify-center mr-3">
              <img src="/assets/icons/ActionIcon.png" alt="Debt" className="w-4 h-4" />
            </div>
            <span className="text-cyphr-gray text-sm font-medium">Debt</span>
          </div>
          <div className="text-2xl font-bold text-cyphr-white">
            {position.debt.amount.toFixed(4)}
          </div>
          <div className="text-cyphr-gray text-sm">{position.debt.symbol}</div>
        </div>

        {/* PnL */}
        <div className="bg-gradient-to-br from-cyphr-dark/60 to-cyphr-dark/40 rounded-xl p-4 border border-cyphr-gray/20">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyphr-purple to-cyphr-purple/80 rounded-lg flex items-center justify-center mr-3">
              <img src="/assets/icons/PNLIcon.png" alt="PnL" className="w-4 h-4" />
            </div>
            <span className="text-cyphr-gray text-sm font-medium">P&L</span>
          </div>
          <div className={`text-2xl font-bold ${(position.pnl || 0) >= 0 ? 'text-cyphr-teal' : 'text-cyphr-red'}`}>
            {(position.pnl || 0) >= 0 ? '+' : ''}{(position.pnl || 0).toFixed(4)}
          </div>
          <div className="text-cyphr-gray text-sm">USD</div>
        </div>
      </div>

      {/* Debt Ratio Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-cyphr-gray text-sm font-medium">Debt Ratio</span>
          <span className="text-cyphr-white font-semibold">{debtRatio.toFixed(2)}%</span>
        </div>
        <div className="w-full bg-cyphr-dark/50 rounded-full h-3 border border-cyphr-gray/20">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              debtRatio < 80 ? 'bg-gradient-to-r from-cyphr-teal to-cyphr-blue' :
              debtRatio < 95 ? 'bg-gradient-to-r from-cyphr-orange to-cyphr-yellow' :
              'bg-gradient-to-r from-cyphr-red to-cyphr-red/80'
            }`}
            style={{ width: `${Math.min(debtRatio, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-cyphr-gray mt-2">
          <span>0%</span>
          <span>80%</span>
          <span>95%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Action Buttons */}
      {shouldShowUnwind && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-cyphr-white">Position Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {onRepay && hasOutstandingDebt && (
              <button
                onClick={onRepay}
                disabled={!preflightOk}
                className="bg-gradient-to-r from-cyphr-teal to-cyphr-blue hover:from-cyphr-teal/90 hover:to-cyphr-blue/90 disabled:from-cyphr-gray disabled:to-cyphr-gray/50 disabled:cursor-not-allowed text-cyphr-dark font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
                title={!preflightOk ? 'System not ready - check preflight banner' : ''}
              >
                💳 Repay Debt
              </button>
            )}
            {onUnwind && hasExposure && (
              <button
                onClick={onUnwind}
                disabled={!preflightOk}
                className="bg-gradient-to-r from-cyphr-orange to-cyphr-red hover:from-cyphr-orange/90 hover:to-cyphr-red/90 disabled:from-cyphr-gray disabled:to-cyphr-gray/50 disabled:cursor-not-allowed text-cyphr-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
                title={!preflightOk ? 'System not ready - check preflight banner' : ''}
              >
                🔄 Close Position
              </button>
            )}
            {onRepayAndUnwind && shouldShowUnwind && (
              <button
                onClick={onRepayAndUnwind}
                disabled={!preflightOk}
                className="bg-gradient-to-r from-cyphr-purple to-cyphr-blue hover:from-cyphr-purple/90 hover:to-cyphr-blue/90 disabled:from-cyphr-gray disabled:to-cyphr-gray/50 disabled:cursor-not-allowed text-cyphr-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
                title={!preflightOk ? 'System not ready - check preflight banner' : ''}
              >
                🚀 Repay & Unwind
              </button>
            )}
          </div>
        </div>
      )}

      {/* Position Status */}
      <div className="mt-6 pt-6 border-t border-cyphr-gray/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-cyphr-teal rounded-full mr-2 animate-pulse"></div>
            <span className="text-cyphr-gray text-sm">Position Active</span>
          </div>
          <span className="text-cyphr-gray text-sm">
            Created: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

