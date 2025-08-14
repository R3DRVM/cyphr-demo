import React, { useState, useEffect } from 'react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { getHealth } from '../adapters/lender';
import { getPoolPrice } from '../services/poolPrice';
import { usePreflight } from './Preflight';
import { 
  Activity, 
  TrendingUp, 
  Shield, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export interface SummaryPanelProps {
  onRefresh: () => void;
}

export interface TransactionStatus {
  id: string;
  type: 'deposit' | 'borrow' | 'swap' | 'repay';
  status: 'pending' | 'confirmed' | 'failed';
  signature?: string;
  amount: number;
  asset: string;
  timestamp: number;
  explorerUrl?: string;
}

export function SummaryPanel({ onRefresh }: SummaryPanelProps) {
  const { connected, publicKey } = useSolanaWallet();
  const preflight = usePreflight();
  
  const [healthMetrics, setHealthMetrics] = useState({
    ltv: 0,
    healthFactor: 0,
    apr: 0
  });
  
  const [position, setPosition] = useState({
    collateral: 0,
    debt: 0,
    availableToBorrow: 0
  });
  
  const [poolPrice, setPoolPrice] = useState({ aPerB: 0, bPerA: 0 });
  const [transactions, setTransactions] = useState<TransactionStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load health metrics and position data
  useEffect(() => {
    const loadData = async () => {
      if (!connected || !preflight.ok) return;
      
      setIsLoading(true);
      try {
        // Load health metrics
        const health = await getHealth();
        setHealthMetrics(health);
        
        // Load pool price
        const price = await getPoolPrice();
        setPoolPrice(price);
        
        // Load position from localStorage (demo mode) or on-chain
        const demoState = JSON.parse(localStorage.getItem('demo_lender_state') || '{}');
        if (demoState.collateral || demoState.debt) {
          setPosition({
            collateral: demoState.collateral?.amount || 0,
            debt: demoState.debt?.amount || 0,
            availableToBorrow: Math.max(0, (demoState.collateral?.amount || 0) * 0.75 - (demoState.debt?.amount || 0))
          });
        }
      } catch (error) {
        console.error('Failed to load summary data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [connected, preflight.ok]);

  // Mock transaction history for demo
  useEffect(() => {
    if (connected && preflight.ok) {
      const mockTransactions: TransactionStatus[] = [
        {
          id: '1',
          type: 'deposit',
          status: 'confirmed',
          signature: 'demo_deposit_123',
          amount: 10,
          asset: 'SOL',
          timestamp: Date.now() - 3600000,
          explorerUrl: 'https://explorer.solana.com/tx/demo_deposit_123?cluster=devnet'
        },
        {
          id: '2',
          type: 'borrow',
          status: 'confirmed',
          signature: 'demo_borrow_456',
          amount: 7500,
          asset: 'USDC',
          timestamp: Date.now() - 1800000,
          explorerUrl: 'https://explorer.solana.com/tx/demo_borrow_456?cluster=devnet'
        }
      ];
      setTransactions(mockTransactions);
    }
  }, [connected, preflight.ok]);

  const getHealthColor = (healthFactor: number) => {
    if (healthFactor >= 1.5) return 'text-green-400';
    if (healthFactor >= 1.2) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLTVColor = (ltv: number) => {
    if (ltv <= 0.5) return 'text-green-400';
    if (ltv <= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400';
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
      <div className="summary-panel">
        <div className="panel-header">
          <h3 className="panel-title">SUMMARY</h3>
          <Activity className="w-4 h-4" />
        </div>
        <div className="not-connected">
          <p>Connect wallet to view summary</p>
        </div>
      </div>
    );
  }

  return (
    <div className="summary-panel">
      <div className="panel-header">
        <h3 className="panel-title">SUMMARY</h3>
        <Activity className="w-4 h-4" />
      </div>

      {/* Health Metrics */}
      <div className="health-metrics">
        <div className="metric-item">
          <div className="metric-header">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Health Factor</span>
          </div>
          <div className={`metric-value ${getHealthColor(healthMetrics.healthFactor)}`}>
            {isLoading ? '...' : healthMetrics.healthFactor.toFixed(2)}
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-header">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span>LTV Ratio</span>
          </div>
          <div className={`metric-value ${getLTVColor(healthMetrics.ltv)}`}>
            {isLoading ? '...' : (healthMetrics.ltv * 100).toFixed(1)}%
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-header">
            <DollarSign className="w-4 h-4 text-purple-400" />
            <span>APR</span>
          </div>
          <div className="metric-value">
            {isLoading ? '...' : (healthMetrics.apr * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Position Overview */}
      <div className="position-overview">
        <h4 className="section-title">Position Overview</h4>
        
        <div className="position-item">
          <span>Collateral (SOL):</span>
          <span>{position.collateral.toFixed(2)}</span>
        </div>
        
        <div className="position-item">
          <span>Debt (USDC):</span>
          <span>{position.debt.toFixed(2)}</span>
        </div>
        
        <div className="position-item">
          <span>Available to Borrow:</span>
          <span>{position.availableToBorrow.toFixed(2)} USDC</span>
        </div>
      </div>

      {/* Pool Price */}
      <div className="pool-price-summary">
        <h4 className="section-title">Pool Price</h4>
        
        <div className="price-item">
          <span>SOL/USDC:</span>
          <span>${poolPrice.aPerB.toFixed(4)}</span>
        </div>
        
        <div className="price-item">
          <span>USDC/SOL:</span>
          <span>${poolPrice.bPerA.toFixed(4)}</span>
        </div>
      </div>

      {/* Transaction History */}
      <div className="transaction-history">
        <h4 className="section-title">Recent Transactions</h4>
        
        {transactions.length === 0 ? (
          <div className="no-transactions">
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map(tx => (
              <div key={tx.id} className="transaction-item">
                <div className="transaction-header">
                  {getStatusIcon(tx.status)}
                  <span className={`transaction-type ${getStatusColor(tx.status)}`}>
                    {tx.type.toUpperCase()}
                  </span>
                  <span className="transaction-amount">
                    {tx.amount} {tx.asset}
                  </span>
                </div>
                
                <div className="transaction-details">
                  <span className="transaction-time">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </span>
                  
                  {tx.explorerUrl && (
                    <a 
                      href={tx.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transaction-link"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <button 
        className="refresh-btn"
        onClick={onRefresh}
        disabled={isLoading}
      >
        {isLoading ? 'Refreshing...' : 'Refresh Data'}
      </button>
    </div>
  );
}
