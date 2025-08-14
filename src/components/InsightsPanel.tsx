import React, { useState, useEffect } from 'react';
import { getPoolPrice } from '../services/poolPrice';
import { getPoolBalances } from '../services/poolPrice';
import { TrendingUp, TrendingDown, AlertTriangle, Info, Target, DollarSign } from 'lucide-react';

export interface PoolInsight {
  type: 'opportunity' | 'risk' | 'neutral';
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
}

export function InsightsPanel() {
  const [poolPrice, setPoolPrice] = useState({ aPerB: 0, bPerA: 0, timestamp: 0 });
  const [poolBalances, setPoolBalances] = useState({ vaultABalance: 0, vaultBBalance: 0, poolTokenSupply: 0 });
  const [insights, setInsights] = useState<PoolInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load pool data and generate insights
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [price, balances] = await Promise.all([
          getPoolPrice(),
          getPoolBalances()
        ]);
        
        setPoolPrice(price);
        setPoolBalances(balances);
        
        // Generate insights based on pool data
        const newInsights = generateInsights(price, balances);
        setInsights(newInsights);
      } catch (error) {
        console.error('Failed to load insights data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const generateInsights = (price: any, balances: any): PoolInsight[] => {
    const insights: PoolInsight[] = [];
    
    // Price trend analysis
    if (price.aPerB > 150) {
      insights.push({
        type: 'opportunity',
        title: 'High SOL Price',
        description: 'SOL is trading above $150, indicating strong momentum',
        recommendation: 'Consider taking profits or reducing exposure',
        confidence: 0.8
      });
    } else if (price.aPerB < 100) {
      insights.push({
        type: 'opportunity',
        title: 'Low SOL Price',
        description: 'SOL is trading below $100, potential buying opportunity',
        recommendation: 'Consider accumulating SOL at these levels',
        confidence: 0.7
      });
    }

    // Liquidity analysis
    const totalLiquidity = balances.vaultABalance + balances.vaultBBalance;
    if (totalLiquidity < 1000000) {
      insights.push({
        type: 'risk',
        title: 'Low Liquidity',
        description: 'Pool has limited liquidity, may experience high slippage',
        recommendation: 'Use smaller trade sizes or wait for better conditions',
        confidence: 0.9
      });
    }

    // Balance ratio analysis
    if (balances.vaultABalance > 0 && balances.vaultBBalance > 0) {
      const ratio = balances.vaultABalance / balances.vaultBBalance;
      if (ratio > 2) {
        insights.push({
          type: 'opportunity',
          title: 'SOL Heavy Pool',
          description: 'Pool is heavily weighted towards SOL',
          recommendation: 'Consider rebalancing or adding USDC liquidity',
          confidence: 0.6
        });
      } else if (ratio < 0.5) {
        insights.push({
          type: 'opportunity',
          title: 'USDC Heavy Pool',
          description: 'Pool is heavily weighted towards USDC',
          recommendation: 'Consider rebalancing or adding SOL liquidity',
          confidence: 0.6
        });
      }
    }

    // Volatility analysis (mock)
    const volatility = Math.random() * 0.1; // 0-10% volatility
    if (volatility > 0.05) {
      insights.push({
        type: 'risk',
        title: 'High Volatility',
        description: 'Pool experiencing increased price volatility',
        recommendation: 'Use tighter stop-losses and smaller position sizes',
        confidence: 0.7
      });
    }

    // Yield opportunity (mock)
    if (insights.length === 0) {
      insights.push({
        type: 'neutral',
        title: 'Stable Conditions',
        description: 'Pool is operating within normal parameters',
        recommendation: 'Continue with current strategy, monitor for changes',
        confidence: 0.5
      });
    }

    return insights;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'risk':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'neutral':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'border-green-500 bg-green-900/20';
      case 'risk':
        return 'border-red-500 bg-red-900/20';
      case 'neutral':
        return 'border-blue-500 bg-blue-900/20';
      default:
        return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="insights-panel">
      <div className="panel-header">
        <h3 className="panel-title">AI INSIGHTS</h3>
        <Target className="w-4 h-4" />
      </div>

      {/* Pool Overview */}
      <div className="pool-overview">
        <h4 className="section-title">Pool Overview</h4>
        
        <div className="overview-grid">
          <div className="overview-item">
            <div className="overview-label">
              <DollarSign className="w-4 h-4" />
              <span>SOL/USDC Price</span>
            </div>
            <div className="overview-value">
              ${poolPrice.aPerB.toFixed(4)}
            </div>
          </div>
          
          <div className="overview-item">
            <div className="overview-label">
              <DollarSign className="w-4 h-4" />
              <span>USDC/SOL Price</span>
            </div>
            <div className="overview-value">
              ${poolPrice.bPerA.toFixed(4)}
            </div>
          </div>
          
          <div className="overview-item">
            <div className="overview-label">
              <span>SOL Liquidity</span>
            </div>
            <div className="overview-value">
              {poolBalances.vaultABalance.toFixed(2)} SOL
            </div>
          </div>
          
          <div className="overview-item">
            <div className="overview-label">
              <span>USDC Liquidity</span>
            </div>
            <div className="overview-value">
              {poolBalances.vaultBBalance.toFixed(2)} USDC
            </div>
          </div>
        </div>
      </div>

      {/* Market Analysis */}
      <div className="market-analysis">
        <h4 className="section-title">Market Analysis</h4>
        
        <div className="analysis-item">
          <div className="analysis-header">
            <span>Price Trend</span>
            <span className="analysis-value">
              {poolPrice.aPerB > 150 ? 'Bullish' : poolPrice.aPerB < 100 ? 'Bearish' : 'Neutral'}
            </span>
          </div>
          <div className="analysis-bar">
            <div 
              className="analysis-fill"
              style={{ 
                width: `${Math.min(Math.max((poolPrice.aPerB - 50) / 200 * 100, 0), 100)}%`,
                backgroundColor: poolPrice.aPerB > 150 ? '#10b981' : poolPrice.aPerB < 100 ? '#ef4444' : '#3b82f6'
              }}
            />
          </div>
        </div>
        
        <div className="analysis-item">
          <div className="analysis-header">
            <span>Liquidity Health</span>
            <span className="analysis-value">
              {poolBalances.vaultABalance + poolBalances.vaultBBalance > 1000000 ? 'Good' : 'Low'}
            </span>
          </div>
          <div className="analysis-bar">
            <div 
              className="analysis-fill"
              style={{ 
                width: `${Math.min((poolBalances.vaultABalance + poolBalances.vaultBBalance) / 2000000 * 100, 100)}%`,
                backgroundColor: poolBalances.vaultABalance + poolBalances.vaultBBalance > 1000000 ? '#10b981' : '#f59e0b'
              }}
            />
          </div>
        </div>
        
        <div className="analysis-item">
          <div className="analysis-header">
            <span>Balance Ratio</span>
            <span className="analysis-value">
              {poolBalances.vaultABalance > 0 && poolBalances.vaultBBalance > 0 
                ? (poolBalances.vaultABalance / poolBalances.vaultBBalance).toFixed(2) 
                : 'N/A'}
            </span>
          </div>
          <div className="analysis-bar">
            <div 
              className="analysis-fill"
              style={{ 
                width: `${Math.min(Math.max((poolBalances.vaultABalance / Math.max(poolBalances.vaultBBalance, 1)) / 3 * 100, 0), 100)}%`,
                backgroundColor: '#3b82f6'
              }}
            />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="ai-insights">
        <h4 className="section-title">AI-Generated Insights</h4>
        
        {isLoading ? (
          <div className="loading-insights">
            <p>Analyzing market conditions...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="no-insights">
            <p>No insights available</p>
          </div>
        ) : (
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-item ${getInsightColor(insight.type)}`}>
                <div className="insight-header">
                  <div className="insight-icon">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="insight-title">
                    <h5>{insight.title}</h5>
                    <span className={`confidence ${getConfidenceColor(insight.confidence)}`}>
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                
                <div className="insight-content">
                  <p className="insight-description">{insight.description}</p>
                  <div className="insight-recommendation">
                    <strong>Recommendation:</strong> {insight.recommendation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="insights-disclaimer">
        <p className="disclaimer-text">
          <strong>Disclaimer:</strong> These insights are generated using rule-based analysis and 
          should not be considered financial advice. Always do your own research and consider 
          consulting with a financial advisor.
        </p>
      </div>
    </div>
  );
}
