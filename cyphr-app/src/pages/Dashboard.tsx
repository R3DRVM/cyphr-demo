import React, { useState } from 'react';
import TokenIcon from '../components/TokenIcon';

// Portfolio Chart Component
const PortfolioChart: React.FC = () => {
  // Sample data showing positive performance with recent gains
  const chartData = [
    { day: 1, value: 10000 },
    { day: 2, value: 10200 },
    { day: 3, value: 10150 },
    { day: 4, value: 10300 },
    { day: 5, value: 10500 },
    { day: 6, value: 10700 },
    { day: 7, value: 11000 },
    { day: 8, value: 11200 },
    { day: 9, value: 11500 },
    { day: 10, value: 11800 },
    { day: 11, value: 12000 },
    { day: 12, value: 12200 },
    { day: 13, value: 12500 },
    { day: 14, value: 12847 }
  ];

  const width = 400;
  const height = 120;
  const padding = 20;

  // Calculate chart dimensions
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  // Find min and max values for scaling
  const minValue = Math.min(...chartData.map(d => d.value));
  const maxValue = Math.max(...chartData.map(d => d.value));
  const valueRange = maxValue - minValue;

  // Create SVG path
  const points = chartData.map((point, index) => {
    const x = padding + (index / (chartData.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  // Create area fill path
  const areaPoints = [
    ...points.split(' ').map(point => point.replace(',', ' ')),
    `${width - padding} ${height - padding}`,
    `${padding} ${height - padding}`
  ].join(' L ');

  return (
    <div className="w-full h-32 relative">
      <svg width={width} height={height} className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6D8FC7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6D8FC7" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6D8FC7" />
            <stop offset="100%" stopColor="#BD496F" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={`M ${areaPoints}`}
          fill="url(#chartGradient)"
          opacity="0.3"
        />

        {/* Main line */}
        <polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {chartData.map((point, index) => {
          const x = padding + (index / (chartData.length - 1)) * chartWidth;
          const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
          
          // Only show points for recent data (last 3 points)
          if (index >= chartData.length - 3) {
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#6D8FC7"
                stroke="#1a1a1a"
                strokeWidth="1"
              />
            );
          }
          return null;
        })}

        {/* Performance indicator */}
        <text
          x={width - padding - 5}
          y={padding + 15}
          textAnchor="end"
          fill="#6D8FC7"
          fontSize="12"
          fontWeight="600"
          fontFamily="system-ui"
        >
          +$2,847
        </text>
      </svg>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState('SOL');
  const [tradeAmount, setTradeAmount] = useState('100');

  const portfolioData = {
    totalValue: '$12,847.32',
    change24h: '+$1,234.56',
    changePercent: '+10.6%',
    tokens: [
      { name: 'SOL', amount: '45.2', value: '$8,456.32', change: '+15.2%', color: '#6D8FC7' },
      { name: 'ETH', amount: '2.1', value: '$3,234.00', change: '+8.7%', color: '#bd496f' },
      { name: 'BTC', amount: '0.12', value: '$1,157.00', change: '+5.4%', color: '#a6a6a6' }
    ]
  };

  const liveSignals = [
    { token: 'PEPE', signal: 'BUY', strength: 'Strong', price: '$0.00001234', change: '+23.4%', time: '2m ago' },
    { token: 'DOGE', signal: 'SELL', strength: 'Medium', price: '$0.0789', change: '-5.2%', time: '5m ago' },
    { token: 'SHIB', signal: 'HOLD', strength: 'Weak', price: '$0.00002345', change: '+1.8%', time: '8m ago' },
    { token: 'BONK', signal: 'BUY', strength: 'Strong', price: '$0.00004567', change: '+45.6%', time: '12m ago' }
  ];

  const quickTradeTokens = [
    { name: 'SOL', price: '$187.23', change: '+2.4%' },
    { name: 'ETH', price: '$1,540.00', change: '+1.8%' },
    { name: 'BTC', price: '$9,641.67', change: '+0.9%' },
    { name: 'PEPE', price: '$0.00001234', change: '+23.4%' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cyphr-white mb-2 font-nulshock">Dashboard</h1>
        <p className="text-cyphr-gray">Your trading overview and portfolio</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Portfolio Value - Ultra Premium */}
        <div className="ultra-premium-glass p-4 rounded-xl shadow-elite-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-cyphr-gray font-sf-pro text-sm font-semibold tracking-wide">TOTAL PORTFOLIO</h3>
            <span className="text-cyphr-teal text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M8 12h4a2 2 0 100-4h-1a2 2 0 110-4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
            </span>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-cyphr-white font-nulshock">{portfolioData.totalValue}</div>
            <div className="text-cyphr-teal font-semibold text-base">{portfolioData.change24h}</div>
          </div>
          <div className="text-cyphr-teal font-sf-pro text-sm font-semibold">{portfolioData.changePercent} today</div>
        </div>

        {/* Portfolio Chart - Ultra Premium */}
        <div className="ultra-premium-glass p-4 rounded-xl lg:col-span-2 shadow-elite-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Portfolio Performance</h3>
            <div className="flex gap-2">
              {['1D', '1W', '1M', '3M', '1Y'].map((period) => (
                <button key={period} className="px-2 py-1 rounded-md text-xs font-semibold premium-nav-button text-cyphr-gray hover:text-cyphr-white transition-all duration-200">
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <PortfolioChart />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Signals - Crystal Glass */}
        <div className="crystal-glass p-4 rounded-xl shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Live Signals</h3>
            <span className="text-cyphr-teal text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="13 2 13 9 20 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="11 22 11 15 4 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="20 9 20 20 4 20 4 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          <div className="space-y-3">
            {liveSignals.map((signal, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-cyphr-black/30 border border-cyphr-gray/20">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${signal.signal === 'BUY' ? 'bg-cyphr-teal' : signal.signal === 'SELL' ? 'bg-cyphr-pink' : 'bg-cyphr-gray'}`}></div>
                  <div>
                    <div className="font-bold text-cyphr-white text-sm">{signal.token}</div>
                    <div className="text-cyphr-gray text-xs">{signal.strength} {signal.signal}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cyphr-white text-xs">{signal.price}</div>
                  <div className={`text-xs font-semibold ${signal.change.startsWith('+') ? 'text-cyphr-teal' : 'text-cyphr-pink'}`}>
                    {signal.change}
                  </div>
                  <div className="text-cyphr-gray text-xs">{signal.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Trade - Crystal Glass */}
        <div className="crystal-glass p-4 rounded-xl shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Quick Trade</h3>
            <span className="text-cyphr-teal text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 2L13 9L20 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 22L11 15L4 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 9L20 20L4 20L4 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          
          {/* Token Selection */}
          <div className="mb-4">
            <label className="block text-cyphr-gray text-xs font-semibold mb-2">Select Token</label>
            <select 
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full elite-input px-3 py-2 rounded-lg border border-cyphr-gray/30 focus:border-cyphr-teal text-cyphr-white text-sm"
            >
              {quickTradeTokens.map((token) => (
                <option key={token.name} value={token.name}>
                  {token.name} - {token.price} ({token.change})
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-cyphr-gray text-xs font-semibold mb-2">Amount (USD)</label>
            <input
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              className="w-full elite-input px-3 py-2 rounded-lg border border-cyphr-gray/30 focus:border-cyphr-teal text-cyphr-white text-sm"
              placeholder="Enter amount"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['100', '500', '1000'].map((amount) => (
              <button
                key={amount}
                onClick={() => setTradeAmount(amount)}
                className="px-2 py-1 rounded-md text-xs font-semibold premium-nav-button text-cyphr-gray hover:text-cyphr-white transition-all duration-200"
              >
                ${amount}
              </button>
            ))}
          </div>

          {/* Trade Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button className="px-4 py-2 bg-cyphr-teal text-cyphr-black rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200">
              Buy
            </button>
            <button className="px-4 py-2 bg-cyphr-pink text-cyphr-white rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200">
              Sell
            </button>
          </div>
        </div>

        {/* Token Holdings - Crystal Glass */}
        <div className="crystal-glass p-4 rounded-xl shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Token Holdings</h3>
            <span className="text-cyphr-teal text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
          </div>
          <div className="space-y-3">
            {portfolioData.tokens.map((token, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-cyphr-black/30 border border-cyphr-gray/20">
                <div className="flex items-start gap-3">
                  <TokenIcon 
                    token={{
                      name: token.name,
                      symbol: token.name
                    }}
                    size="md"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-cyphr-white text-base mb-1">{token.name}</div>
                    <div className="text-cyphr-gray text-sm">{token.amount} tokens</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cyphr-white text-xs">{token.value}</div>
                  <div className="text-cyphr-teal text-xs font-semibold">{token.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 