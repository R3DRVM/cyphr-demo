import React, { useState } from 'react';

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
    <div className="max-w-7xl mx-auto p-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cyphr-white mb-2 font-nulshock">Dashboard</h1>
        <p className="text-cyphr-gray font-sf-pro text-sm">Your trading overview and portfolio</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Portfolio Value */}
        <div className="cyphr-card p-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
            border: '1px solid rgba(45,186,161,0.2)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-cyphr-gray font-sf-pro text-sm font-semibold tracking-wide">TOTAL PORTFOLIO</h3>
            <span className="text-cyphr-teal text-base">💰</span>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-cyphr-white font-nulshock">{portfolioData.totalValue}</div>
            <div className="text-cyphr-teal font-semibold text-base">{portfolioData.change24h}</div>
          </div>
          <div className="text-cyphr-teal font-sf-pro text-sm font-semibold">{portfolioData.changePercent} today</div>
        </div>

        {/* Portfolio Chart Placeholder */}
        <div className="elite-glass-card p-4 rounded-xl lg:col-span-2 shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Portfolio Performance</h3>
            <div className="flex gap-2">
              {['1D', '1W', '1M', '3M', '1Y'].map((period) => (
                <button key={period} className="px-2 py-1 rounded-md text-xs font-semibold bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray transition-all duration-200">
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-32 bg-gradient-to-br from-cyphr-teal/20 to-cyphr-pink/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-cyphr-gray text-base mb-1">📈</div>
              <div className="text-cyphr-gray font-sf-pro text-sm">Chart Component</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Signals */}
        <div className="elite-glass-card p-4 rounded-xl shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Live Signals</h3>
            <span className="text-cyphr-teal text-base">⚡</span>
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

        {/* Quick Trade */}
        <div className="elite-glass-card p-4 rounded-xl shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Quick Trade</h3>
            <span className="text-cyphr-teal text-base">⚡</span>
          </div>
          
          {/* Token Selection */}
          <div className="mb-4">
            <label className="block text-cyphr-gray text-xs font-semibold mb-2">Select Token</label>
            <select 
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-cyphr-gray/30 focus:border-cyphr-teal bg-cyphr-black/30 text-cyphr-white text-sm"
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
              className="w-full px-3 py-2 rounded-lg border border-cyphr-gray/30 focus:border-cyphr-teal bg-cyphr-black/30 text-cyphr-white text-sm"
              placeholder="Enter amount"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['100', '500', '1000'].map((amount) => (
              <button
                key={amount}
                onClick={() => setTradeAmount(amount)}
                className="px-2 py-1 rounded-md text-xs font-semibold bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray transition-all duration-200 border border-cyphr-gray/30"
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

        {/* Token Holdings */}
        <div className="elite-glass-card p-4 rounded-xl shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Token Holdings</h3>
            <span className="text-cyphr-teal text-base">💼</span>
          </div>
          <div className="space-y-3">
            {portfolioData.tokens.map((token, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-cyphr-black/30 border border-cyphr-gray/20">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-cyphr-black font-bold text-sm shadow-lg"
                    style={{ backgroundColor: token.color }}
                  >
                    {token.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-cyphr-white text-sm">{token.name}</div>
                    <div className="text-cyphr-gray text-xs">{token.amount} tokens</div>
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