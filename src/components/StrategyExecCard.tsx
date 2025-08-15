import React, { useState, useEffect } from 'react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { usePreflight } from './Preflight';
import { useTxToasts } from '../hooks/useTxToasts';
import { createStrategy, executeStrategy, getLastStrategyId, type StrategyConfig } from '../services/strategyBridge';
import { useStrategyStore } from '../state/strategyStore';
import { Target, Play, Plus, FileText } from 'lucide-react';

export function StrategyExecCard() {
  const { connected, publicKey } = useSolanaWallet();
  const preflight = usePreflight();
  const { withTxToasts } = useTxToasts();
  const { cfg: strategyConfig } = useStrategyStore();
  
  const [lastStrategyId, setLastStrategyId] = useState<string | null>(null);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use live config from store, fallback to sample if none
  const displayConfig = strategyConfig || {
    name: 'Sample Strategy',
    type: 'momentum',
    parameters: {
      entryThreshold: 0.05,
      exitThreshold: 0.02,
      maxPositionSize: 1000
    }
  };

  // Load last strategy ID from localStorage or service
  useEffect(() => {
    const savedStrategyId = localStorage.getItem('last_strategy_id');
    if (savedStrategyId) {
      setLastStrategyId(savedStrategyId);
    } else {
      const serviceStrategyId = getLastStrategyId();
      if (serviceStrategyId) {
        setLastStrategyId(serviceStrategyId);
        localStorage.setItem('last_strategy_id', serviceStrategyId);
      }
    }
  }, []);

  const handleCreateStrategy = async () => {
    if (!connected || !publicKey || !preflight.ok || !strategyConfig) return;
    
    setIsLoading(true);
    try {
      const result = await withTxToasts(
        createStrategy(strategyConfig),
        {
          pending: 'Creating strategy...',
          success: 'Strategy created successfully',
          error: 'Failed to create strategy'
        }
      );
      
      setLastStrategyId(result.strategyId);
      setLastSignature(result.signature);
      localStorage.setItem('last_strategy_id', result.strategyId);
      
    } catch (error) {
      console.error('Create strategy failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteStrategy = async () => {
    if (!connected || !publicKey || !preflight.ok || !lastStrategyId) return;
    
    setIsLoading(true);
    try {
      const result = await withTxToasts(
        executeStrategy(lastStrategyId),
        {
          pending: 'Executing strategy...',
          success: 'Strategy executed successfully',
          error: 'Failed to execute strategy'
        }
      );
      
      setLastSignature(result.signature);
      
    } catch (error) {
      console.error('Execute strategy failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isCreateDisabled = !connected || !preflight.ok || !strategyConfig || isLoading;
  const isExecuteDisabled = !connected || !preflight.ok || !lastStrategyId || isLoading;

  return (
    <div className="strategy-exec-card">
      <div className="card-header">
        <h3 className="card-title">STRATEGY EXECUTION</h3>
        <Target className="w-4 h-4" />
      </div>

      {/* Strategy Config Preview */}
      <div className="config-preview">
        <div className="preview-header">
          <FileText className="w-4 h-4" />
          <span>Current Strategy Config</span>
        </div>
        <div className="config-content">
          <pre className="config-json">
            {JSON.stringify(displayConfig, null, 2)}
          </pre>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="action-btn create-strategy"
          onClick={handleCreateStrategy}
          disabled={isCreateDisabled}
          title={!preflight.ok ? 'System not ready - check preflight banner' : ''}
        >
          <Plus className="w-4 h-4" />
          Create Strategy
        </button>

        <button
          className="action-btn execute-strategy"
          onClick={handleExecuteStrategy}
          disabled={isExecuteDisabled}
          title={!preflight.ok ? 'System not ready - check preflight banner' : !lastStrategyId ? 'No strategy created yet' : ''}
        >
          <Play className="w-4 h-4" />
          Execute Strategy
        </button>
      </div>

      {/* Last Action Results */}
      {lastStrategyId && (
        <div className="last-action-results">
          <div className="result-item">
            <span className="result-label">Strategy ID:</span>
            <span className="result-value">{lastStrategyId}</span>
          </div>
          
          {lastSignature && (
            <div className="result-item">
              <span className="result-label">Last Signature:</span>
              <span className="result-value">
                <a 
                  href={`https://explorer.solana.com/tx/${lastSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="explorer-link"
                >
                  {lastSignature.substring(0, 8)}...{lastSignature.substring(lastSignature.length - 8)}
                </a>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Status Info */}
      <div className="status-info">
        <div className="status-item">
          <span className="status-label">Wallet:</span>
          <span className={`status-value ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="status-item">
          <span className="status-label">Preflight:</span>
          <span className={`status-value ${preflight.ok ? 'ok' : 'error'}`}>
            {preflight.ok ? 'OK' : 'Error'}
          </span>
        </div>
      </div>
    </div>
  );
}
