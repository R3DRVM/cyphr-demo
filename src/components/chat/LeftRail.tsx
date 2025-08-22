import React, { useState } from 'react';
import { useEvents } from '../../state/eventBus';
import { useStrategyStore } from '../../state/strategyStore';
import { ChevronDown, ChevronRight, Activity, Zap, TrendingUp } from 'lucide-react';

export const LeftRail: React.FC = () => {
  const { events } = useEvents();
  const { lastResult } = useStrategyStore();
  
  const [expandedSections, setExpandedSections] = useState({
    activity: true,
    automation: true,
    positions: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Convert events to activity items
  const activities = events.slice(-10).reverse().map((event, index) => ({
    id: (index + 1).toString(),
    type: event.kind === 'deposit' ? 'deposit' : 
          event.kind === 'borrow' ? 'trade' : 
          event.kind === 'swap' ? 'trade' : 
          event.kind === 'create' ? 'strategy' : 
          event.kind === 'execute' ? 'strategy' : 'trade',
    description: `${event.kind.charAt(0).toUpperCase() + event.kind.slice(1)} ${event.meta?.mint || event.meta?.inputToken || 'tokens'}`,
    timestamp: new Date(event.ts).toLocaleString(),
    amount: event.meta?.amount ? `${event.meta.amount} ${event.meta.mint || event.meta.inputToken}` : '',
    status: 'completed' as const,
    signature: event.sig
  }));

  // Mock automations
  const automations = [
    {
      id: '1',
      description: 'Rebalance portfolio every 24h',
      status: 'active' as const,
      nextExecution: 'Next: 6h 23m'
    }
  ];

  // Convert strategy store data to position items
  const positions = lastResult && lastResult.type === 'create' ? [{
    id: '1',
    strategy: `${lastResult.data.config?.token || 'SOL'} Strategy`,
    collateral: lastResult.data.config?.collateral || '0 SOL',
    debt: lastResult.data.config?.debt || '0 USDC',
    health: 85,
    apy: '12.5%',
    status: 'active' as const,
    strategyId: lastResult.data.strategyId
  }] : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return '#00ff88';
      case 'pending':
        return '#ffaa00';
      case 'failed':
      case 'liquidated':
        return '#ff4444';
      default:
        return '#888888';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return '✓';
      case 'pending':
        return '⏳';
      case 'failed':
      case 'liquidated':
        return '✗';
      default:
        return '•';
    }
  };

  const handleActivityClick = (activity: any) => {
    if (activity.signature) {
      const explorerUrl = `https://explorer.solana.com/tx/${activity.signature}?cluster=devnet`;
      window.open(explorerUrl, '_blank');
    }
  };

  return (
    <aside className="left-rail">
      {/* Activity Section */}
      <div className="rail-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('activity')}
        >
          <Activity className="section-icon" size={16} />
          <span>Activity</span>
          {expandedSections.activity ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        {expandedSections.activity && (
          <div className="section-content">
            {activities.length > 0 ? (
              activities.map(activity => (
                <div 
                  key={activity.id} 
                  className="activity-item"
                  onClick={() => handleActivityClick(activity)}
                  style={{ cursor: activity.signature ? 'pointer' : 'default' }}
                >
                  <div className="activity-header">
                    <span className="activity-type">{activity.type}</span>
                    <span className="activity-status" style={{ color: getStatusColor(activity.status) }}>
                      {getStatusIcon(activity.status)}
                    </span>
                  </div>
                  <div className="activity-description">{activity.description}</div>
                  <div className="activity-footer">
                    <span className="activity-amount">{activity.amount}</span>
                    <span className="activity-timestamp">{activity.timestamp}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span>No recent activity</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Automation Section */}
      <div className="rail-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('automation')}
        >
          <Zap className="section-icon" size={16} />
          <span>Automation</span>
          {expandedSections.automation ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        {expandedSections.automation && (
          <div className="section-content">
            {automations.length > 0 ? (
              automations.map(automation => (
                <div key={automation.id} className="automation-item">
                  <div className="automation-header">
                    <span className="automation-status" style={{ color: getStatusColor(automation.status) }}>
                      {getStatusIcon(automation.status)}
                    </span>
                  </div>
                  <div className="automation-description">{automation.description}</div>
                  {automation.nextExecution && (
                    <div className="automation-next">{automation.nextExecution}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span>No automations yet.</span>
                <span className="suggestion">Try saying: "Set up automated rebalancing every 24h"</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Positions Section */}
      <div className="rail-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('positions')}
        >
          <TrendingUp className="section-icon" size={16} />
          <span>Active Positions</span>
          {expandedSections.positions ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        {expandedSections.positions && (
          <div className="section-content">
            {positions.length > 0 ? (
              positions.map(position => (
                <div key={position.id} className="position-item">
                  <div className="position-header">
                    <span className="position-strategy">{position.strategy}</span>
                    <span className="position-status" style={{ color: getStatusColor(position.status) }}>
                      {getStatusIcon(position.status)}
                    </span>
                  </div>
                  <div className="position-details">
                    <div className="position-metric">
                      <span className="label">Collateral:</span>
                      <span className="value">{position.collateral}</span>
                    </div>
                    <div className="position-metric">
                      <span className="label">Debt:</span>
                      <span className="value">{position.debt}</span>
                    </div>
                    <div className="position-metric">
                      <span className="label">Health:</span>
                      <span className="value">{position.health}%</span>
                    </div>
                    <div className="position-metric">
                      <span className="label">APY:</span>
                      <span className="value">{position.apy}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span>No open positions found.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
