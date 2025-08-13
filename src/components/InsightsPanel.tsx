import React from 'react';
import { useInsights } from '../hooks/useInsights';

interface InsightsPanelProps {
  preflightOk: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ preflightOk }) => {
  const [analysis, insights, refresh] = useInsights();

  // Get insight icon based on type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Get risk color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Get volatility color
  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Get ratio direction color
  const getRatioDirectionColor = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return 'text-green-400';
      case 'decreasing':
        return 'text-red-400';
      case 'stable':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="insights-panel bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
      <div className="panel-header mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-white">Pool Insights</h3>
          <button
            onClick={refresh}
            disabled={!preflightOk}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm px-3 py-1 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        <p className="text-gray-400 text-sm">
          {import.meta.env.VITE_AI_INSIGHTS === 'true' 
            ? 'AI-powered analysis and recommendations' 
            : 'Rule-based market analysis and risk assessment'
          }
        </p>
      </div>

      {!preflightOk ? (
        <div className="preflight-warning text-center py-8">
          <div className="text-yellow-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-yellow-400">System not ready</p>
          <p className="text-gray-400 text-sm mt-1">Check preflight banner</p>
        </div>
      ) : !analysis ? (
        <div className="loading-insights text-center py-8">
          <div className="text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-400">Loading insights...</p>
        </div>
      ) : (
        <div className="insights-content space-y-6">
          {/* Pool Overview */}
          <div className="pool-overview bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-3">Pool Overview</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="metric">
                <span className="text-sm text-gray-400">Current Ratio</span>
                <div className="text-xl font-bold text-white">{analysis.ratio.toFixed(4)}</div>
              </div>
              <div className="metric">
                <span className="text-sm text-gray-400">Direction</span>
                <div className={`text-lg font-semibold ${getRatioDirectionColor(analysis.ratioDirection)}`}>
                  {analysis.ratioDirection.charAt(0).toUpperCase() + analysis.ratioDirection.slice(1)}
                </div>
              </div>
              <div className="metric">
                <span className="text-sm text-gray-400">Volatility</span>
                <div className={`text-lg font-semibold ${getVolatilityColor(analysis.volatility)}`}>
                  {analysis.volatility.charAt(0).toUpperCase() + analysis.volatility.slice(1)}
                </div>
              </div>
              <div className="metric">
                <span className="text-sm text-gray-400">Risk Level</span>
                <div className={`text-lg font-semibold ${getRiskColor(analysis.risk)}`}>
                  {analysis.risk.charAt(0).toUpperCase() + analysis.risk.slice(1)}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-3">
              Last updated: {new Date(analysis.lastUpdate).toLocaleTimeString()}
            </div>
          </div>

          {/* Key Insights */}
          <div className="key-insights">
            <h4 className="text-lg font-medium text-white mb-3">Key Insights</h4>
            <div className="insights-list space-y-3">
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`insight-item flex items-start gap-3 p-3 rounded-lg ${
                      insight.type === 'success' ? 'bg-green-900/20 border border-green-700/50' :
                      insight.type === 'warning' ? 'bg-yellow-900/20 border border-yellow-700/50' :
                      insight.type === 'error' ? 'bg-red-900/20 border border-red-700/50' :
                      'bg-blue-900/20 border border-blue-700/50'
                    }`}
                  >
                    <div className="insight-icon flex-shrink-0 mt-0.5">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="insight-content flex-1">
                      <p className="text-sm text-white">{insight.message}</p>
                      <div className="insight-priority mt-1">
                        <span className="text-xs text-gray-400">
                          Priority: {insight.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-insights text-center py-6 text-gray-400">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p>No insights available</p>
                  <p className="text-sm">Pool data is being analyzed...</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Notice */}
          {import.meta.env.VITE_AI_INSIGHTS === 'true' && (
            <div className="ai-insights-notice bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-lg font-medium text-purple-300">AI Insights Active</span>
              </div>
              <p className="text-sm text-purple-200">
                Advanced AI analysis is providing enhanced market insights and predictive recommendations.
              </p>
            </div>
          )}

          {/* Market Conditions */}
          <div className="market-conditions bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-3">Market Conditions</h4>
            <div className="conditions-grid grid grid-cols-1 gap-3">
              <div className="condition-item flex justify-between items-center">
                <span className="text-sm text-gray-400">Trend Direction</span>
                <span className={`text-sm font-medium ${getRatioDirectionColor(analysis.ratioDirection)}`}>
                  {analysis.ratioDirection === 'increasing' ? '↗️ Bullish' :
                   analysis.ratioDirection === 'decreasing' ? '↘️ Bearish' : '→ Sideways'}
                </span>
              </div>
              <div className="condition-item flex justify-between items-center">
                <span className="text-sm text-gray-400">Volatility State</span>
                <span className={`text-sm font-medium ${getVolatilityColor(analysis.volatility)}`}>
                  {analysis.volatility === 'high' ? '⚠️ High' :
                   analysis.volatility === 'medium' ? '⚡ Medium' : '✅ Low'}
                </span>
              </div>
              <div className="condition-item flex justify-between items-center">
                <span className="text-sm text-gray-400">Risk Assessment</span>
                <span className={`text-sm font-medium ${getRiskColor(analysis.risk)}`}>
                  {analysis.risk === 'high' ? '🔴 High Risk' :
                   analysis.risk === 'medium' ? '🟡 Medium Risk' : '🟢 Low Risk'}
                </span>
              </div>
            </div>
          </div>

          {/* Opportunities & Warnings */}
          {(analysis.opportunities.length > 0 || analysis.warnings.length > 0) && (
            <div className="opportunities-warnings space-y-4">
              {analysis.opportunities.length > 0 && (
                <div className="opportunities bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-green-300 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {analysis.opportunities.map((opp, index) => (
                      <li key={index} className="text-sm text-green-200 flex items-start gap-2">
                        <span className="text-green-400">•</span>
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.warnings.length > 0 && (
                <div className="warnings bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-yellow-300 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Warnings
                  </h4>
                  <ul className="space-y-2">
                    {analysis.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-200 flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
