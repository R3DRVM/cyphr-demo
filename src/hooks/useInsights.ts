import { useState, useEffect, useCallback } from 'react';
import { createPoolPriceService } from '../services/poolPrice';

export interface PoolInsight {
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  priority: number;
}

export interface PoolAnalysis {
  ratio: number;
  ratioDirection: 'increasing' | 'decreasing' | 'stable';
  volatility: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  opportunities: string[];
  warnings: string[];
  lastUpdate: number;
}

export function useInsights(): [PoolAnalysis | null, PoolInsight[], () => Promise<void>] {
  const [analysis, setAnalysis] = useState<PoolAnalysis | null>(null);
  const [insights, setInsights] = useState<PoolInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate insights based on pool analysis
  const generateInsights = useCallback((analysis: PoolAnalysis): PoolInsight[] => {
    const newInsights: PoolInsight[] = [];

    // Ratio analysis
    if (analysis.ratioDirection === 'increasing') {
      newInsights.push({
        type: 'success',
        message: `Pool ratio is trending upward (+${analysis.ratio.toFixed(4)})`,
        priority: 1
      });
    } else if (analysis.ratioDirection === 'decreasing') {
      newInsights.push({
        type: 'warning',
        message: `Pool ratio is trending downward (${analysis.ratio.toFixed(4)})`,
        priority: 2
      });
    }

    // Volatility analysis
    if (analysis.volatility === 'high') {
      newInsights.push({
        type: 'warning',
        message: 'High volatility detected - consider reducing position sizes',
        priority: 3
      });
    } else if (analysis.volatility === 'low') {
      newInsights.push({
        type: 'info',
        message: 'Low volatility - good conditions for stable strategies',
        priority: 1
      });
    }

    // Risk assessment
    if (analysis.risk === 'high') {
      newInsights.push({
        type: 'error',
        message: 'High risk conditions - review risk management',
        priority: 4
      });
    } else if (analysis.risk === 'low') {
      newInsights.push({
        type: 'success',
        message: 'Low risk conditions - favorable for new positions',
        priority: 1
      });
    }

    // Opportunities
    if (analysis.opportunities.length > 0) {
      analysis.opportunities.forEach((opp, index) => {
        newInsights.push({
          type: 'info',
          message: `Opportunity: ${opp}`,
          priority: 2
        });
      });
    }

    // Warnings
    if (analysis.warnings.length > 0) {
      analysis.warnings.forEach((warning, index) => {
        newInsights.push({
          type: 'warning',
          message: `Warning: ${warning}`,
          priority: 3
        });
      });
    }

    // Sort by priority (higher priority first)
    return newInsights.sort((a, b) => b.priority - a.priority);
  }, []);

  // Analyze pool data
  const analyzePool = useCallback(async (): Promise<PoolAnalysis | null> => {
    try {
      const poolPriceService = createPoolPriceService();
      const currentPrice = await poolPriceService.getPrice();
      
      // Get historical data for trend analysis (simplified)
      // In a real implementation, you'd store historical prices
      const ratio = currentPrice.aPerB;
      
      // Determine ratio direction (simplified - in real app, compare with previous)
      let ratioDirection: 'increasing' | 'decreasing' | 'stable' = 'stable';
      const storedRatio = localStorage.getItem('last_pool_ratio');
      if (storedRatio) {
        const lastRatio = parseFloat(storedRatio);
        if (ratio > lastRatio * 1.01) ratioDirection = 'increasing';
        else if (ratio < lastRatio * 0.99) ratioDirection = 'decreasing';
      }
      localStorage.setItem('last_pool_ratio', ratio.toString());

      // Calculate volatility (simplified)
      let volatility: 'low' | 'medium' | 'high' = 'low';
      const volatilityData = JSON.parse(localStorage.getItem('volatility_data') || '[]');
      volatilityData.push(ratio);
      if (volatilityData.length > 10) volatilityData.shift();
      
      if (volatilityData.length > 1) {
        const changes = volatilityData.slice(1).map((val: number, i: number) => 
          Math.abs((val - volatilityData[i]) / volatilityData[i])
        );
        const avgChange = changes.reduce((a: number, b: number) => a + b, 0) / changes.length;
        
        if (avgChange > 0.05) volatility = 'high';
        else if (avgChange > 0.02) volatility = 'medium';
        else volatility = 'low';
      }
      localStorage.setItem('volatility_data', JSON.stringify(volatilityData));

      // Risk assessment
      let risk: 'low' | 'medium' | 'high' = 'low';
      if (volatility === 'high' || ratioDirection === 'decreasing') risk = 'high';
      else if (volatility === 'medium') risk = 'medium';
      else risk = 'low';

      // Generate opportunities and warnings
      const opportunities: string[] = [];
      const warnings: string[] = [];

      if (ratioDirection === 'increasing' && volatility === 'low') {
        opportunities.push('Favorable trend with low volatility - good entry point');
      }

      if (volatility === 'high') {
        warnings.push('High volatility may lead to increased slippage');
      }

      if (ratioDirection === 'decreasing') {
        warnings.push('Downward trend - consider defensive positions');
      }

      const analysis: PoolAnalysis = {
        ratio,
        ratioDirection,
        volatility,
        risk,
        opportunities,
        warnings,
        lastUpdate: Date.now()
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing pool:', error);
      return null;
    }
  }, []);

  // Refresh insights
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const newAnalysis = await analyzePool();
      if (newAnalysis) {
        setAnalysis(newAnalysis);
        const newInsights = generateInsights(newAnalysis);
        setInsights(newInsights);
      }
    } catch (error) {
      console.error('Error refreshing insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, [analyzePool, generateInsights]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return [analysis, insights, refresh];
}
