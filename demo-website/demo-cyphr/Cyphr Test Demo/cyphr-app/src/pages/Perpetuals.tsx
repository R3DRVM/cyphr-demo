import React, { useState } from 'react';

const Perpetuals: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState('SOL/USD');
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState('10x');

  const tradingPairs = [
    { pair: 'SOL/USD', price: '$187.23', change: '+2.4%', volume: '$45.2M' },
    { pair: 'ETH/USD', price: '$1,540.00', change: '+1.8%', volume: '$23.1M' },
    { pair: 'BTC/USD', price: '$9,641.67', change: '+0.9%', volume: '$67.8M' },
    { pair: 'PEPE/USD', price: '$0.00001234', change: '+23.4%', volume: '$12.8M' }
  ];

  const orderBook = [
    { price: '187.25', size: '1,234', total: '1,234', side: 'sell' },
    { price: '187.24', size: '2,156', total: '3,390', side: 'sell' },
    { price: '187.23', size: '3,421', total: '6,811', side: 'sell' },
    { price: '187.22', size: '892', total: '7,703', side: 'sell' },
    { price: '187.21', size: '1,567', total: '9,270', side: 'sell' },
    { price: '187.20', size: '2,345', total: '11,615', side: 'buy' },
    { price: '187.19', size: '1,789', total: '13,404', side: 'buy' },
    { price: '187.18', size: '3,156', total: '16,560', side: 'buy' },
    { price: '187.17', size: '2,234', total: '18,794', side: 'buy' },
    { price: '187.16', size: '1,567', total: '20,361', side: 'buy' }
  ];

  const recentTrades = [
    { price: '187.23', size: '45.2', side: 'buy', time: '12:34:56' },
    { price: '187.22', size: '23.1', side: 'sell', time: '12:34:52' },
    { price: '187.24', size: '67.8', side: 'buy', time: '12:34:48' },
    { price: '187.21', size: '12.8', side: 'sell', time: '12:34:44' },
    { price: '187.25', size: '34.5', side: 'buy', time: '12:34:40' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-cyphr-white mb-2 font-nulshock">Perpetuals</h1>
        <p className="text-cyphr-gray font-sf-pro">Trade with leverage and advanced order types</p>
      </div>

      {/* Trading Pair Selection */}
      <div className="mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          {tradingPairs.map((pair) => (
            <button
              key={pair.pair}
              onClick={() => setSelectedPair(pair.pair)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                selectedPair === pair.pair
                  ? 'bg-cyphr-teal text-cyphr-black shadow-lg'
                  : 'bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray border border-cyphr-gray'
              }`}
            >
              <div className="text-left">
                <div className="font-bold">{pair.pair}</div>
                <div className="text-sm">{pair.price}</div>
                <div className={`text-xs ${pair.change.startsWith('+') ? 'text-cyphr-teal' : 'text-cyphr-pink'}`}>
                  {pair.change}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Chart Area */}
        <div className="xl:col-span-2">
          <div className="cyphr-card p-6 rounded-2xl h-96"
            style={{
              background: 'linear-gradient(135deg, rgba(45,186,161,0.12) 0%, rgba(189,73,111,0.12) 100%)',
              border: '2px solid rgba(45,186,161,0.25)',
              boxShadow: '0 8px 32px 0 rgba(45,186,161,0.10)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">{selectedPair} Chart</h3>
              <div className="flex gap-2">
                {['1m', '5m', '15m', '1h', '4h', '1d'].map((timeframe) => (
                  <button key={timeframe} className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray transition-all duration-200">
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80 bg-gradient-to-br from-cyphr-teal/10 to-cyphr-pink/10 rounded-xl flex items-center justify-center border border-cyphr-gray/30">
              <div className="text-center">
                <div className="text-cyphr-gray text-4xl mb-4">📈</div>
                <div className="text-cyphr-gray font-sf-pro text-lg">Trading Chart</div>
                <div className="text-cyphr-gray text-sm">Price action visualization</div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Book */}
        <div className="cyphr-card p-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.12) 0%, rgba(189,73,111,0.12) 100%)',
            border: '2px solid rgba(45,186,161,0.25)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">Order Book</h3>
            <span className="text-cyphr-teal text-lg">📊</span>
          </div>
          <div className="space-y-1">
            {orderBook.slice(0, 5).map((order, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-cyphr-pink font-mono">{order.price}</span>
                <span className="text-cyphr-gray font-mono">{order.size}</span>
                <span className="text-cyphr-gray font-mono">{order.total}</span>
              </div>
            ))}
            <div className="border-t border-cyphr-gray/30 my-2"></div>
            {orderBook.slice(5).map((order, index) => (
              <div key={index + 5} className="flex justify-between text-sm">
                <span className="text-cyphr-teal font-mono">{order.price}</span>
                <span className="text-cyphr-gray font-mono">{order.size}</span>
                <span className="text-cyphr-gray font-mono">{order.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Panel */}
        <div className="cyphr-card p-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.12) 0%, rgba(189,73,111,0.12) 100%)',
            border: '2px solid rgba(45,186,161,0.25)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">Trade</h3>
            <span className="text-cyphr-teal text-lg">⚡</span>
          </div>

          {/* Order Type */}
          <div className="mb-6">
            <label className="block text-cyphr-gray text-sm font-semibold mb-2">Order Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['market', 'limit'].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    orderType === type
                      ? 'bg-cyphr-teal text-cyphr-black'
                      : 'bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray border border-cyphr-gray/30'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Buy/Sell Toggle */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2">
              {['buy', 'sell'].map((tradeSide) => (
                <button
                  key={tradeSide}
                  onClick={() => setSide(tradeSide)}
                  className={`px-4 py-3 rounded-xl font-bold text-lg transition-all duration-200 ${
                    side === tradeSide
                      ? tradeSide === 'buy' 
                        ? 'bg-cyphr-teal text-cyphr-black shadow-lg'
                        : 'bg-cyphr-pink text-cyphr-white shadow-lg'
                      : 'bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray border border-cyphr-gray/30'
                  }`}
                >
                  {tradeSide.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-cyphr-gray text-sm font-semibold mb-2">Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full cyphr-input px-4 py-3 rounded-xl border-2 focus:border-cyphr-teal bg-cyphr-black/50"
              placeholder="Enter amount"
            />
          </div>

          {/* Leverage */}
          <div className="mb-6">
            <label className="block text-cyphr-gray text-sm font-semibold mb-2">Leverage</label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full cyphr-input px-4 py-3 rounded-xl border-2 focus:border-cyphr-teal bg-cyphr-black/50"
            >
              {['1x', '2x', '5x', '10x', '20x', '50x', '100x'].map((lev) => (
                <option key={lev} value={lev}>{lev}</option>
              ))}
            </select>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {['100', '500', '1000'].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount)}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray transition-all duration-200 border border-cyphr-gray/30"
              >
                ${quickAmount}
              </button>
            ))}
          </div>

          {/* Execute Button */}
          <button className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
            side === 'buy' 
              ? 'bg-cyphr-teal text-cyphr-black hover:bg-cyphr-teal/90' 
              : 'bg-cyphr-pink text-cyphr-white hover:bg-cyphr-pink/90'
          }`}>
            {side.toUpperCase()} {selectedPair}
          </button>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="mt-8">
        <div className="cyphr-card p-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.12) 0%, rgba(189,73,111,0.12) 100%)',
            border: '2px solid rgba(45,186,161,0.25)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">Recent Trades</h3>
            <span className="text-cyphr-teal text-lg">📋</span>
          </div>
          <div className="space-y-2">
            {recentTrades.map((trade, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-cyphr-black/50 border border-cyphr-gray/30">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${trade.side === 'buy' ? 'bg-cyphr-teal' : 'bg-cyphr-pink'}`}></div>
                  <span className={`font-mono font-semibold ${trade.side === 'buy' ? 'text-cyphr-teal' : 'text-cyphr-pink'}`}>
                    {trade.price}
                  </span>
                </div>
                <span className="text-cyphr-gray font-mono text-sm">{trade.size}</span>
                <span className="text-cyphr-gray font-mono text-sm">{trade.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perpetuals; 