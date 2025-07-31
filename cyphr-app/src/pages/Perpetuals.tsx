import React, { useState, useEffect } from 'react';

// Enhanced Candlestick Chart Component with Volume
const CandlestickChart: React.FC<{ pair: string; timeframe: string }> = ({ pair, timeframe }) => {
  const [chartData, setChartData] = useState<Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>>([]);

  // Generate realistic candlestick data with volume
  const generateCandlestickData = (basePrice: number, volatility: number) => {
    const data = [];
    const now = Date.now();
    const interval = timeframe === '1m' ? 60000 : 
                    timeframe === '5m' ? 300000 : 
                    timeframe === '15m' ? 900000 : 
                    timeframe === '1h' ? 3600000 : 
                    timeframe === '4h' ? 14400000 : 86400000; // 1d
    
    let currentPrice = basePrice;
    
    for (let i = 50; i >= 0; i--) {
      const time = now - (i * interval);
      
      // Generate OHLC data
      const open = currentPrice;
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      const close = Math.max(open + change, basePrice * 0.8);
      
      // Generate high and low based on open and close
      const range = Math.abs(close - open) * (1 + Math.random() * 2);
      const high = Math.max(open, close) + range * Math.random();
      const low = Math.min(open, close) - range * Math.random();
      
      // Generate volume
      const volume = Math.random() * 1000000 + 100000;
      
      data.push({ time, open, high, low, close, volume });
      currentPrice = close;
    }
    
    return data;
  };

  useEffect(() => {
    // Base prices and volatility for each pair
    const pairConfig = {
      'SOL/USD': { basePrice: 187.23, volatility: 0.02 },
      'ETH/USD': { basePrice: 1540.00, volatility: 0.015 },
      'BTC/USD': { basePrice: 9641.67, volatility: 0.012 },
      'PEPE/USD': { basePrice: 0.00001234, volatility: 0.08 }
    };

    const config = pairConfig[pair as keyof typeof pairConfig];
    if (config) {
      setChartData(generateCandlestickData(config.basePrice, config.volatility));
    }
  }, [pair, timeframe]);

  const width = 800;
  const height = 500; // Increased height for volume bars
  const padding = 60;
  const volumeHeight = 80; // Height for volume bars

  if (chartData.length === 0) return null;

  // Calculate chart dimensions
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2) - volumeHeight;

  // Find min and max values for scaling
  const allPrices = chartData.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;

  // Volume scaling
  const maxVolume = Math.max(...chartData.map(d => d.volume));
  const minVolume = Math.min(...chartData.map(d => d.volume));

  // Candle width and spacing
  const candleWidth = chartWidth / chartData.length * 0.8;
  const candleSpacing = chartWidth / chartData.length;

  // Get current price and change
  const currentCandle = chartData[chartData.length - 1];
  const previousCandle = chartData[chartData.length - 2];
  const priceChange = currentCandle.close - (previousCandle?.close || currentCandle.open);
  const priceChangePercent = (priceChange / (previousCandle?.close || currentCandle.open)) * 100;

  // Calculate moving averages
  const sma20 = chartData.slice(-20).reduce((sum, d) => sum + d.close, 0) / Math.min(20, chartData.length);
  const sma50 = chartData.slice(-50).reduce((sum, d) => sum + d.close, 0) / Math.min(50, chartData.length);

  return (
    <div className="w-full">
      <svg width={width} height={height} className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Gradient definitions */}
        <defs>
          <linearGradient id={`candleGradient-${pair}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6D8FC7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6D8FC7" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id={`volumeGradient-${pair}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6D8FC7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6D8FC7" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`grid-${i}`}
            x1={padding}
            y1={padding + (i * chartHeight / 4)}
            x2={width - padding}
            y2={padding + (i * chartHeight / 4)}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Price labels on Y-axis */}
        {[0, 1, 2, 3, 4].map((i) => {
          const price = maxPrice - (i * priceRange / 4);
          return (
            <text
              key={`price-${i}`}
              x={padding - 10}
              y={padding + (i * chartHeight / 4) + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.6)"
              fontSize="10"
              fontFamily="system-ui"
            >
              ${price.toFixed(pair === 'PEPE/USD' ? 8 : 2)}
            </text>
          );
        })}

        {/* Moving Averages */}
        {chartData.map((candle, index) => {
          if (index < 19) return null; // Need at least 20 points for SMA
          
          const x = padding + (index * candleSpacing) + candleSpacing / 2;
          const y = padding + chartHeight - ((sma20 - minPrice) / priceRange) * chartHeight;
          
          return (
            <circle
              key={`sma20-${index}`}
              cx={x}
              cy={y}
              r="1"
              fill="#FFD700"
              opacity="0.8"
            />
          );
        })}

        {/* Candlesticks */}
        {chartData.map((candle, index) => {
          const x = padding + (index * candleSpacing) + (candleSpacing - candleWidth) / 2;
          const isGreen = candle.close >= candle.open;
          const bodyTop = padding + chartHeight - ((Math.max(candle.open, candle.close) - minPrice) / priceRange) * chartHeight;
          const bodyBottom = padding + chartHeight - ((Math.min(candle.open, candle.close) - minPrice) / priceRange) * chartHeight;
          const bodyHeight = bodyBottom - bodyTop;
          const wickTop = padding + chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
          const wickBottom = padding + chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;

          return (
            <g key={index}>
              {/* Wick */}
              <line
                x1={x + candleWidth / 2}
                y1={wickTop}
                x2={x + candleWidth / 2}
                y2={wickBottom}
                stroke={isGreen ? "#6D8FC7" : "#BD496F"}
                strokeWidth="1"
              />
              
              {/* Candle body */}
              <rect
                x={x}
                y={bodyTop}
                width={candleWidth}
                height={Math.max(bodyHeight, 1)}
                fill={isGreen ? "#6D8FC7" : "#BD496F"}
                stroke={isGreen ? "#6D8FC7" : "#BD496F"}
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Volume Bars */}
        {chartData.map((candle, index) => {
          const x = padding + (index * candleSpacing) + (candleSpacing - candleWidth) / 2;
          const volumeHeight = (candle.volume / maxVolume) * 60;
          const volumeY = height - padding - volumeHeight;
          const isGreen = candle.close >= candle.open;

          return (
            <rect
              key={`volume-${index}`}
              x={x}
              y={volumeY}
              width={candleWidth}
              height={volumeHeight}
              fill={isGreen ? "#6D8FC7" : "#BD496F"}
              opacity="0.3"
            />
          );
        })}

        {/* Current price line */}
        <line
          x1={padding}
          y1={padding + chartHeight - ((currentCandle.close - minPrice) / priceRange) * chartHeight}
          x2={width - padding}
          y2={padding + chartHeight - ((currentCandle.close - minPrice) / priceRange) * chartHeight}
          stroke="rgba(109, 146, 203, 0.5)"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Current price indicator */}
        <circle
          cx={width - padding}
          cy={padding + chartHeight - ((currentCandle.close - minPrice) / priceRange) * chartHeight}
          r="4"
          fill="#6D8FC7"
          stroke="#1a1a1a"
          strokeWidth="2"
        />

        {/* Price labels */}
        <text
          x={width - padding + 10}
          y={padding + chartHeight - ((currentCandle.close - minPrice) / priceRange) * chartHeight}
          textAnchor="start"
          fill="#6D8FC7"
          fontSize="14"
          fontWeight="600"
          fontFamily="system-ui"
        >
          ${currentCandle.close.toFixed(pair === 'PEPE/USD' ? 8 : 2)}
        </text>

        {/* Change indicator */}
        <text
          x={width - padding + 10}
          y={padding + chartHeight - ((currentCandle.close - minPrice) / priceRange) * chartHeight + 20}
          textAnchor="start"
          fill={priceChange >= 0 ? "#6D8FC7" : "#BD496F"}
          fontSize="12"
          fontWeight="500"
          fontFamily="system-ui"
        >
          {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
        </text>

        {/* Volume label */}
        <text
          x={width - padding + 10}
          y={height - padding - 40}
          textAnchor="start"
          fill="rgba(255,255,255,0.6)"
          fontSize="10"
          fontFamily="system-ui"
        >
          Vol: {currentCandle.volume.toLocaleString()}
        </text>

        {/* Time labels on X-axis */}
        {[0, 12, 25, 37, 50].map((index) => {
          const time = new Date(chartData[index]?.time || Date.now());
          const timeStr = time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
          
          return (
            <text
              key={`time-${index}`}
              x={padding + (index * candleSpacing) + candleSpacing / 2}
              y={height - padding + 15}
              textAnchor="middle"
              fill="rgba(255,255,255,0.6)"
              fontSize="10"
              fontFamily="system-ui"
            >
              {timeStr}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const Perpetuals: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState('SOL/USD');
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState('10x');
  const [activeTimeframe, setActiveTimeframe] = useState('1m');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const tradingPairs = [
    { pair: 'SOL/USD', price: '$187.23', change: '+2.4%', volume: '$45.2M' },
    { pair: 'ETH/USD', price: '$1,540.00', change: '+1.8%', volume: '$23.1M' },
    { pair: 'BTC/USD', price: '$9,641.67', change: '+0.9%', volume: '$67.8M' },
    { pair: 'PEPE/USD', price: '$0.00001234', change: '+23.4%', volume: '$12.8M' }
  ];

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

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
    <div className="max-w-7xl mx-auto p-6 pb-24 animate-fade-in min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cyphr-white mb-2 font-nulshock">Perpetuals</h1>
        <p className="text-cyphr-gray">Trade with leverage and advanced order types</p>
      </div>

      {/* Enhanced Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Trading Pair Tabs */}
        <div className="flex rounded-2xl p-2 border border-cyphr-gray/30 premium-nav">
          {tradingPairs.map((pair) => (
            <button
              key={pair.pair}
              onClick={() => setSelectedPair(pair.pair)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 premium-nav-button ${
                selectedPair === pair.pair
                  ? 'text-cyphr-black active'
                  : 'text-cyphr-gray hover:text-cyphr-white'
              }`}
            >
              <div className="text-left">
                <div className="font-bold">{pair.pair}</div>
                <div className="text-xs">{pair.price}</div>
                <div className={`text-xs ${pair.change.startsWith('+') ? 'text-cyphr-teal' : 'text-cyphr-pink'}`}>
                  {pair.change}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Enhanced Timeframes with Indicators */}
        <div className="flex gap-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setActiveTimeframe(timeframe)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 premium-nav-button ${
                activeTimeframe === timeframe
                  ? 'text-cyphr-black active'
                  : 'text-cyphr-gray hover:text-cyphr-white'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
        
        {/* Professional Action Buttons */}
        <div className="flex gap-2">
          <button className="elite-button px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 text-cyphr-gray flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-6.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
            </svg>
            Indicators
          </button>
          <button className="elite-button px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 text-cyphr-gray flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            Settings
          </button>
        </div>
      </div>

      {/* Main Chart and Order Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Enhanced Candlestick Chart - Ultra Premium Glass */}
        <div className="ultra-premium-glass p-4 rounded-xl lg:col-span-3 shadow-elite-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">{selectedPair} Chart</h3>
              <div className="flex items-center gap-2 text-xs text-cyphr-gray">
                <span>MA20</span>
                <div className="w-3 h-0.5 bg-yellow-400"></div>
                <span>Volume</span>
                <div className="w-3 h-0.5 bg-cyphr-teal opacity-30"></div>
              </div>
            </div>
            <div className="flex gap-2">
              {['1m', '5m', '15m', '1h', '4h', '1d'].map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setActiveTimeframe(timeframe)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-300 premium-nav-button ${
                    activeTimeframe === timeframe
                      ? 'text-cyphr-black active'
                      : 'text-cyphr-gray hover:text-cyphr-white'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
          
          {/* Enhanced Candlestick Chart */}
          <div className="flex items-center justify-center">
            <CandlestickChart pair={selectedPair} timeframe={activeTimeframe} />
          </div>
        </div>

        {/* Enhanced Order Form - Ultra Premium Glass */}
        <div className="ultra-premium-glass p-4 rounded-xl shadow-elite-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">Order Form</h3>
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs"
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </button>
          </div>
          
          {/* Order Type Selection */}
          <div className="mb-4">
            <label className="block text-cyphr-gray text-xs font-semibold mb-2">Order Type</label>
            <div className="flex gap-2">
              {['market', 'limit', 'stop'].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 premium-nav-button ${
                    orderType === type
                      ? 'text-cyphr-black active'
                      : 'text-cyphr-gray hover:text-cyphr-white'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Buy/Sell Selection */}
          <div className="mb-4">
            <label className="block text-cyphr-gray text-xs font-semibold mb-2">Side</label>
            <div className="flex gap-2">
              {['buy', 'sell'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    side === s
                      ? s === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      : 'premium-nav-button text-cyphr-gray hover:text-cyphr-white'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-cyphr-gray text-xs font-semibold mb-2">Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full elite-input px-3 py-2 rounded-lg border border-cyphr-gray/30 focus:border-cyphr-teal text-cyphr-white text-sm"
              placeholder="Enter amount"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['100', '500', '1000'].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount)}
                className="px-2 py-1 rounded-md text-xs font-semibold premium-nav-button text-cyphr-gray hover:text-cyphr-white transition-all duration-200"
              >
                ${quickAmount}
              </button>
            ))}
          </div>

          {/* Leverage Selection */}
          <div className="mb-4">
            <label className="block text-cyphr-gray text-xs font-semibold mb-2">Leverage</label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full elite-input px-3 py-2 rounded-lg border border-cyphr-gray/30 focus:border-cyphr-teal text-cyphr-white text-sm"
            >
              {['1x', '2x', '5x', '10x', '20x', '50x', '100x'].map((lev) => (
                <option key={lev} value={lev}>{lev}</option>
              ))}
            </select>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="mb-4 space-y-3 p-3 rounded-lg bg-cyphr-black/20 border border-cyphr-gray/20">
              <div>
                <label className="block text-cyphr-gray text-xs font-semibold mb-1">Stop Loss</label>
                <input
                  type="number"
                  className="w-full elite-input px-2 py-1 rounded text-xs border border-cyphr-gray/30 focus:border-cyphr-teal text-cyphr-white"
                  placeholder="Stop loss price"
                />
              </div>
              <div>
                <label className="block text-cyphr-gray text-xs font-semibold mb-1">Take Profit</label>
                <input
                  type="number"
                  className="w-full elite-input px-2 py-1 rounded text-xs border border-cyphr-gray/30 focus:border-cyphr-teal text-cyphr-white"
                  placeholder="Take profit price"
                />
              </div>
            </div>
          )}

          {/* Execute Button */}
          <button className="w-full elite-button px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 text-cyphr-white bg-gradient-to-r from-cyphr-teal to-cyphr-pink">
            Execute {side.charAt(0).toUpperCase() + side.slice(1)} Order
          </button>
        </div>
      </div>

      {/* Enhanced Market Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Market Stats - Crystal Glass */}
        <div className="crystal-glass p-4 rounded-xl shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Market Stats</h3>
            <span className="text-cyphr-teal text-base">📊</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-cyphr-gray text-sm">24h High</span>
              <span className="text-cyphr-white font-semibold">$192.45</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyphr-gray text-sm">24h Low</span>
              <span className="text-cyphr-white font-semibold">$181.20</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyphr-gray text-sm">24h Volume</span>
              <span className="text-cyphr-white font-semibold">$45.2M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyphr-gray text-sm">Open Interest</span>
              <span className="text-cyphr-white font-semibold">$12.8M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyphr-gray text-sm">Funding Rate</span>
              <span className="text-cyphr-teal font-semibold">+0.0125%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Order Book & Trades - Crystal Glass */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Book */}
        <div className="crystal-glass p-4 rounded-xl shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Order Book</h3>
            <span className="text-cyphr-teal text-base">📋</span>
          </div>
          
          <div className="space-y-1">
            {orderBook.map((order, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className={`font-mono ${order.side === 'sell' ? 'text-red-400' : 'text-green-400'}`}>
                  {order.price}
                </span>
                <span className="text-cyphr-white">{order.size}</span>
                <span className="text-cyphr-gray">{order.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="crystal-glass p-4 rounded-xl shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Recent Trades</h3>
            <span className="text-cyphr-teal text-base">🔄</span>
          </div>
          
          <div className="space-y-1">
            {recentTrades.map((trade, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className={`font-mono ${trade.side === 'sell' ? 'text-red-400' : 'text-green-400'}`}>
                  {trade.price}
                </span>
                <span className="text-cyphr-white">{trade.size}</span>
                <span className="text-cyphr-gray">{trade.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perpetuals; 