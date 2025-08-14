import React, { useState } from 'react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { usePreflight } from './Preflight';
import { useToast } from '../hooks/useToast';
import { 
  Play, 
  Plus, 
  Settings, 
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export interface StrategyConfig {
  name: string;
  description: string;
  baseToken: string;
  quoteToken: string;
  positionSize: number;
  timeFrame: string;
  executionInterval: number;
  entryConditions: Array<{ type: string; value: number }>;
  exitConditions: Array<{ type: string; value: number }>;
  yieldTarget: number;
  yieldAccumulation: boolean;
}

export interface StrategyExecution {
  id: string;
  config: StrategyConfig;
  status: 'pending' | 'running' | 'completed' | 'failed';
  signature?: string;
  createdAt: number;
  lastExecuted?: number;
  pnl?: number;
  explorerUrl?: string;
}

export function StrategyBridge() {
  const { connected, publicKey } = useSolanaWallet();
  const preflight = usePreflight();
  const { showToast } = useToast();
  
  const [strategies, setStrategies] = useState<StrategyExecution[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Mock strategy creation (in real implementation, this would call the strategy program)
  const createStrategy = async (config: StrategyConfig): Promise<string> => {
    if (!connected || !publicKey || !preflight.ok) {
      throw new Error('Wallet not connected or system not ready');
    }

    setIsCreating(true);
    try {
      // In demo mode, create a mock signature
      const signature = 'strategy_' + Math.random().toString(36).substring(2, 15);
      
      const newStrategy: StrategyExecution = {
        id: Math.random().toString(36).substring(2, 15),
        config,
        status: 'pending',
        signature,
        createdAt: Date.now(),
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      };

      setStrategies(prev => [...prev, newStrategy]);

      showToast({
        type: 'success',
        title: 'Strategy Created',
        message: `Strategy "${config.name}" created successfully`,
        explorerUrl: newStrategy.explorerUrl
      });

      return newStrategy.id;
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Strategy Creation Failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  // Mock strategy execution (in real implementation, this would call the strategy program)
  const executeStrategy = async (strategyId: string): Promise<void> => {
    if (!connected || !publicKey || !preflight.ok) {
      throw new Error('Wallet not connected or system not ready');
    }

    setIsExecuting(true);
    try {
      const strategy = strategies.find(s => s.id === strategyId);
      if (!strategy) {
        throw new Error('Strategy not found');
      }

      // Update strategy status
      setStrategies(prev => prev.map(s => 
        s.id === strategyId 
          ? { ...s, status: 'running', lastExecuted: Date.now() }
          : s
      ));

      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock execution result
      const executionSignature = 'exec_' + Math.random().toString(36).substring(2, 15);
      const pnl = (Math.random() - 0.5) * 100; // Random PnL between -50% and +50%

      setStrategies(prev => prev.map(s => 
        s.id === strategyId 
          ? { 
              ...s, 
              status: 'completed', 
              signature: executionSignature,
              pnl,
              explorerUrl: `https://explorer.solana.com/tx/${executionSignature}?cluster=devnet`
            }
          : s
      ));

      showToast({
        type: 'success',
        title: 'Strategy Executed',
        message: `Strategy "${strategy.config.name}" executed successfully`,
        explorerUrl: `https://explorer.solana.com/tx/${executionSignature}?cluster=devnet`
      });
    } catch (error) {
      setStrategies(prev => prev.map(s => 
        s.id === strategyId 
          ? { ...s, status: 'failed' }
          : s
      ));

      showToast({
        type: 'error',
        title: 'Strategy Execution Failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Create a sample strategy for demo purposes
  const createSampleStrategy = async () => {
    const sampleConfig: StrategyConfig = {
      name: 'SOL-USDC Yield Strategy',
      description: 'Automated yield farming between SOL and USDC',
      baseToken: 'SOL',
      quoteToken: 'USDC',
      positionSize: 1000,
      timeFrame: '1h',
      executionInterval: 3600,
      entryConditions: [
        { type: 'price_above', value: 150 },
        { type: 'volume_above', value: 1000000 }
      ],
      exitConditions: [
        { type: 'price_below', value: 140 },
        { type: 'profit_target', value: 5 }
      ],
      yieldTarget: 0.15,
      yieldAccumulation: true
    };

    try {
      await createStrategy(sampleConfig);
    } catch (error) {
      console.error('Failed to create sample strategy:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'running':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Settings className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'running':
        return 'text-blue-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!connected) {
    return (
      <div className="strategy-bridge">
        <div className="panel-header">
          <h3 className="panel-title">STRATEGY BRIDGE</h3>
          <Target className="w-4 h-4" />
        </div>
        <div className="not-connected">
          <p>Connect wallet to manage strategies</p>
        </div>
      </div>
    );
  }

  return (
    <div className="strategy-bridge">
      <div className="panel-header">
        <h3 className="panel-title">STRATEGY BRIDGE</h3>
        <Target className="w-4 h-4" />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className="action-btn create-sample"
          onClick={createSampleStrategy}
          disabled={!preflight.ok || isCreating}
        >
          <Plus className="w-4 h-4" />
          {isCreating ? 'Creating...' : 'Create Sample Strategy'}
        </button>
      </div>

      {/* Strategy List */}
      <div className="strategy-list">
        <h4 className="section-title">Active Strategies</h4>
        
        {strategies.length === 0 ? (
          <div className="no-strategies">
            <p>No strategies created yet</p>
            <p className="text-sm text-gray-400">Create a strategy to get started</p>
          </div>
        ) : (
          <div className="strategies">
            {strategies.map(strategy => (
              <div key={strategy.id} className="strategy-item">
                <div className="strategy-header">
                  <div className="strategy-info">
                    <h5 className="strategy-name">{strategy.config.name}</h5>
                    <p className="strategy-description">{strategy.config.description}</p>
                  </div>
                  <div className="strategy-status">
                    {getStatusIcon(strategy.status)}
                    <span className={`status-text ${getStatusColor(strategy.status)}`}>
                      {strategy.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="strategy-details">
                  <div className="detail-item">
                    <span>Position:</span>
                    <span>{strategy.config.positionSize} {strategy.config.baseToken}</span>
                  </div>
                  <div className="detail-item">
                    <span>Timeframe:</span>
                    <span>{strategy.config.timeFrame}</span>
                  </div>
                  <div className="detail-item">
                    <span>Yield Target:</span>
                    <span>{(strategy.config.yieldTarget * 100).toFixed(1)}%</span>
                  </div>
                  {strategy.pnl !== undefined && (
                    <div className="detail-item">
                      <span>P&L:</span>
                      <span className={strategy.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {strategy.pnl >= 0 ? '+' : ''}{strategy.pnl.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="strategy-actions">
                  <button
                    className="strategy-btn execute"
                    onClick={() => executeStrategy(strategy.id)}
                    disabled={!preflight.ok || isExecuting || strategy.status === 'running'}
                  >
                    <Play className="w-4 h-4" />
                    {strategy.status === 'running' ? 'Executing...' : 'Execute'}
                  </button>
                  
                  {strategy.explorerUrl && (
                    <a
                      href={strategy.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="strategy-btn view"
                    >
                      View
                    </a>
                  )}
                </div>

                <div className="strategy-meta">
                  <span>Created: {new Date(strategy.createdAt).toLocaleDateString()}</span>
                  {strategy.lastExecuted && (
                    <span>Last: {new Date(strategy.lastExecuted).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strategy Builder Integration */}
      <div className="strategy-builder-integration">
        <h4 className="section-title">Strategy Builder</h4>
        <p className="integration-text">
          Use the Strategy Builder below to create custom strategies with drag-and-drop nodes.
          Click "Create Strategy" to deploy your strategy on-chain.
        </p>
      </div>
    </div>
  );
}
