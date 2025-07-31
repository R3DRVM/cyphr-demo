import React, { useState, useEffect } from 'react';
import './ProTerminal.css';

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  liquidityEvents: Array<{
    type: string;
    amount: number;
    timestamp: string;
    impact: 'Positive' | 'Negative' | 'Neutral';
  }>;
  aiInsights: Array<{
    type: 'Bullish' | 'Bearish' | 'Neutral';
    confidence: number;
    analysis: string;
    recommendation: string;
  }>;
}

const ProTerminal: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('1D');
  const [chartData, setChartData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Mock token data for fallback
  const mockTokens: TokenData[] = [
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 177.45,
      change24h: 5.67,
      volume24h: 2840000000,
      marketCap: 45000000000,
      holders: 1250000,
      riskLevel: 'Medium',
      liquidityEvents: [
        { type: 'Large Buy', amount: 500000, timestamp: '2h ago', impact: 'Positive' },
        { type: 'Whale Movement', amount: 1200000, timestamp: '6h ago', impact: 'Neutral' },
        { type: 'Liquidity Added', amount: 800000, timestamp: '12h ago', impact: 'Positive' },
        { type: 'Institutional Inflow', amount: 2500000, timestamp: '1h ago', impact: 'Positive' }
      ],
      aiInsights: [
        { type: 'Bullish', confidence: 78, analysis: 'Strong momentum with increasing volume and institutional buying pressure. RSI showing bullish divergence.', recommendation: 'Consider long position with tight stop loss at $95.20' },
        { type: 'Neutral', confidence: 65, analysis: 'Technical indicators show consolidation near resistance. MACD histogram flattening.', recommendation: 'Wait for breakout confirmation above $100 resistance' },
        { type: 'Bullish', confidence: 82, analysis: 'On-chain metrics show strong accumulation by smart money. Network activity increasing.', recommendation: 'Accumulate on dips, target $110-115 range' }
      ]
    }
  ];

  // Real-time search functionality
  const searchTokens = async (query: string) => {
    if (!query.trim()) return [];
    
    setIsSearching(true);
    try {
      // Try CoinGecko API first (free, no API key required)
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.coins && data.coins.length > 0) {
        // Get detailed data for top results
        const topCoins = data.coins.slice(0, 5);
        const coinIds = topCoins.map((coin: any) => coin.id).join(',');
        
        const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
        const priceData = await priceResponse.json();
        
        const results = topCoins.map((coin: any) => {
          const priceInfo = priceData[coin.id];
          return {
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: priceInfo?.usd || 0,
            change24h: priceInfo?.usd_24h_change || 0,
            volume24h: priceInfo?.usd_24h_vol || 0,
            marketCap: priceInfo?.usd_market_cap || 0,
            image: coin.large,
            contractAddress: coin.contract_address || null
          };
        });
        
        return results;
      }
    } catch (error) {
      console.log('API error, using mock data:', error);
    }
    
    setIsSearching(false);
    return [];
  };

  // Handle search input
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length >= 2) {
      setShowSearchDropdown(true);
      const results = await searchTokens(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
    setIsSearching(false);
  };

  // Clear search and reset state
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  // Handle token selection
  const handleTokenSelect = async (token: any) => {
    setIsSearching(true);
    try {
      // Create TokenData object from API result
      const selectedTokenData: TokenData = {
        symbol: token.symbol,
        name: token.name,
        price: token.price,
        change24h: token.change24h,
        volume24h: token.volume24h,
        marketCap: token.marketCap,
        holders: Math.floor(Math.random() * 1000000) + 100000, // Mock holders
        riskLevel: token.change24h > 10 ? 'High' : token.change24h > 5 ? 'Medium' : 'Low',
        liquidityEvents: [
          { type: 'Recent Trade', amount: token.volume24h * 0.01, timestamp: '5m ago', impact: 'Positive' },
          { type: 'Volume Spike', amount: token.volume24h * 0.02, timestamp: '15m ago', impact: 'Neutral' }
        ],
        aiInsights: [
          { 
            type: token.change24h > 0 ? 'Bullish' : 'Bearish', 
            confidence: Math.abs(token.change24h) > 10 ? 85 : 65, 
            analysis: `Price showing ${token.change24h > 0 ? 'strong upward' : 'downward'} momentum with ${token.volume24h > 1000000 ? 'high' : 'moderate'} volume.`, 
            recommendation: token.change24h > 0 ? 'Consider long position with stop loss' : 'Monitor for reversal signals'
          }
        ]
      };
      
      setSelectedToken(selectedTokenData);
      setChartData(generateChartData(token.symbol, timeframe));
      setSearchQuery(token.symbol);
      setSearchResults([]);
      setShowSearchDropdown(false);
      
      // Force re-render of chart
      setTimeout(() => {
        setChartData(generateChartData(token.symbol, timeframe));
      }, 100);
    } catch (error) {
      console.log('Error selecting token:', error);
    }
    setIsSearching(false);
  };

  // Generate chart data
  const generateChartData = (symbol: string, selectedTimeframe: string) => {
    const data = [];
    const basePrice = 98;
    const volatility = 0.05;
    
    let dataPoints = 100;
    let timeInterval = 15 * 60 * 1000;
    
    switch (selectedTimeframe) {
      case '1H':
        dataPoints = 60;
        timeInterval = 1 * 60 * 1000;
        break;
      case '4H':
        dataPoints = 240;
        timeInterval = 1 * 60 * 1000;
        break;
      case '1D':
        dataPoints = 144;
        timeInterval = 10 * 60 * 1000;
        break;
      case '1W':
        dataPoints = 168;
        timeInterval = 1 * 60 * 60 * 1000;
        break;
      case '1M':
        dataPoints = 30;
        timeInterval = 24 * 60 * 60 * 1000;
        break;
    }
    
    let currentPrice = basePrice;
    const now = Date.now();
    
    for (let i = 0; i < dataPoints; i++) {
      const timestamp = now - (dataPoints - i) * timeInterval;
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;
      const volume = Math.random() * 1000000 + 500000;
      
      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });
      
      currentPrice = close;
    }
    
    return data;
  };

  // Load SOL as default token
  useEffect(() => {
    const defaultToken = mockTokens.find(token => token.symbol === 'SOL');
    if (defaultToken) {
      setSelectedToken(defaultToken);
      setChartData(generateChartData('SOL', timeframe));
    }
  }, []);

  // Update chart data when timeframe changes
  useEffect(() => {
    if (selectedToken) {
      setChartData(generateChartData(selectedToken.symbol, timeframe));
    }
  }, [timeframe, selectedToken]);

  // Handle search when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && searchQuery !== selectedToken?.symbol && searchQuery.trim().length >= 2) {
        handleSearch(searchQuery);
      }
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'Bullish': return 'text-green-400';
      case 'Bearish': return 'text-red-400';
      case 'Neutral': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  // Interactive Chart Component with Controls
  const SimpleChart: React.FC<{ data: any[] }> = ({ data }) => {
    const [zoom, setZoom] = React.useState(1);
    const [showLargeBuys, setShowLargeBuys] = React.useState(false);
    const [showZoomPopup, setShowZoomPopup] = React.useState(false);

    if (!data || data.length === 0) {
      return <div className="chart-placeholder">Loading chart...</div>;
    }

    const width = 800;
    const height = 400;
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const prices = data.map(d => [d.low, d.high, d.open, d.close]).flat();
    const minPrice = Math.min(...prices) * 0.995;
    const maxPrice = Math.max(...prices) * 1.005;

    const xScale = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
    const yScale = (price: number) => padding.top + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;

    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
    };

    const formatVolume = (volume: number) => {
      if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
      if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
      if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
      return volume.toFixed(0);
    };

    // Calculate large buy threshold (top 20% of volumes)
    const volumes = data.map(d => d.volume);
    const sortedVolumes = [...volumes].sort((a, b) => b - a);
    const largeBuyThreshold = sortedVolumes[Math.floor(sortedVolumes.length * 0.2)];

    return (
      <div className="interactive-chart-container" onWheel={handleWheel}>
        {/* Chart Controls */}
        <div className="chart-controls">
          <div className="chart-control-group">
            <button 
              className={`chart-control-btn ${showLargeBuys ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowLargeBuys(!showLargeBuys);
              }}
              title="Highlight Large Buys"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
            <button 
              className="chart-control-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowZoomPopup(true);
              }}
              title="Zoom Chart"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 3l6 6-6 6M9 21l-6-6 6-6"/>
              </svg>
            </button>
          </div>
          
          <div className="chart-control-divider"></div>
          
          <div className="chart-control-group">
            <button 
              className="chart-control-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setZoom(prev => Math.min(5, prev * 1.2));
              }}
              title="Zoom In"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4v16m8-8H4"/>
              </svg>
            </button>
            <button 
              className="chart-control-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setZoom(prev => Math.max(0.5, prev * 0.8));
              }}
              title="Zoom Out"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 12h16"/>
              </svg>
            </button>
            <button 
              className="chart-control-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setZoom(1);
              }}
              title="Reset Zoom"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16M8 12h8"/>
              </svg>
            </button>
          </div>
        </div>

        <svg width={width} height={height} className="candlestick-chart">
          <defs>
            <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0, 212, 255, 0.6)" />
              <stop offset="100%" stopColor="rgba(0, 212, 255, 0.1)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <g key={`grid-h-${i}`}>
              <line
                x1={padding.left}
                y1={padding.top + (i * chartHeight) / 5}
                x2={width - padding.right}
                y2={padding.top + (i * chartHeight) / 5}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            </g>
          ))}
          
          {/* Vertical grid lines */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <g key={`grid-v-${i}`}>
              <line
                x1={padding.left + (i * chartWidth) / 8}
                y1={padding.top}
                x2={padding.left + (i * chartWidth) / 8}
                y2={height - padding.bottom}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            </g>
          ))}
          
          {/* Price labels on Y-axis */}
          {[0, 1, 2, 3, 4, 5].map(i => {
            const price = maxPrice - (i * (maxPrice - minPrice) / 5);
            return (
              <text
                key={`price-${i}`}
                x={padding.left - 10}
                y={padding.top + (i * chartHeight) / 5 + 4}
                textAnchor="end"
                fill="rgba(255, 255, 255, 0.6)"
                fontSize="10"
                fontFamily="Courier New"
              >
                ${price.toFixed(2)}
              </text>
            );
          })}
          
          {/* Time labels on X-axis */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <text
              key={`time-${i}`}
              x={padding.left + (i * chartWidth) / 8}
              y={height - padding.bottom + 15}
              textAnchor="middle"
              fill="rgba(255, 255, 255, 0.6)"
              fontSize="10"
              fontFamily="Courier New"
            >
              {i === 0 ? '9:30' : i === 8 ? '16:00' : `${10 + i}:00`}
            </text>
          ))}
          
          {/* Candlesticks */}
          {data.map((candle, i) => {
            const x = xScale(i);
            const openY = yScale(candle.open);
            const closeY = yScale(candle.close);
            const highY = yScale(candle.high);
            const lowY = yScale(candle.low);
            const isGreen = candle.close >= candle.open;
            const candleHeight = Math.abs(closeY - openY) || 1;
            const isLargeBuy = showLargeBuys && candle.volume >= largeBuyThreshold;

            return (
              <g key={i}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={isGreen ? "#10b981" : "#ef4444"}
                  strokeWidth={isLargeBuy ? "3" : "2"}
                  opacity={isLargeBuy ? 1 : 0.9}
                  filter={isLargeBuy ? "url(#glow)" : "none"}
                />
                {/* Candle body */}
                <rect
                  x={x - 2}
                  y={isGreen ? closeY : openY}
                  width="4"
                  height={candleHeight}
                  fill={isGreen ? "#10b981" : "#ef4444"}
                  stroke={isGreen ? "#059669" : "#dc2626"}
                  strokeWidth={isLargeBuy ? "2" : "1"}
                  opacity={isLargeBuy ? 1 : 0.9}
                  filter={isLargeBuy ? "url(#glow)" : "none"}
                />
                
                {/* Large Buy Highlight */}
                {isLargeBuy && (
                  <g>
                    <circle
                      cx={x}
                      cy={yScale(candle.close)}
                      r="8"
                      fill="rgba(34, 197, 94, 0.2)"
                      stroke="rgba(34, 197, 94, 0.8)"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={yScale(candle.close) - 15}
                      textAnchor="middle"
                      fill="rgba(34, 197, 94, 1)"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="Courier New"
                    >
                      ${formatVolume(candle.volume)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Zoom Popup */}
        {showZoomPopup && (
          <div 
            className="zoom-popup-overlay"
            onClick={() => setShowZoomPopup(false)}
          >
            <div 
              className="zoom-popup-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="zoom-popup-header">
                <h3>Chart Zoom View</h3>
                <button 
                  className="zoom-popup-close"
                  onClick={() => setShowZoomPopup(false)}
                >
                  ×
                </button>
              </div>
              <div className="zoom-popup-chart">
                <svg width="1200" height="800" className="candlestick-chart">
                  <defs>
                    <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(0, 212, 255, 0.6)" />
                      <stop offset="100%" stopColor="rgba(0, 212, 255, 0.1)" />
                    </linearGradient>
                  </defs>
                  
                  {/* Background grid */}
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <g key={`grid-${i}`}>
                      <line
                        x1={padding.left}
                        y1={padding.top + (i * chartHeight) / 5}
                        x2={1200 - padding.right}
                        y2={padding.top + (i * chartHeight) / 5}
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth="1"
                      />
                    </g>
                  ))}
                  
                  {/* Candlesticks */}
                  {data.map((candle, i) => {
                    const x = padding.left + (i / (data.length - 1)) * (1200 - padding.left - padding.right);
                    const openY = padding.top + chartHeight - ((candle.open - minPrice) / (maxPrice - minPrice)) * chartHeight;
                    const closeY = padding.top + chartHeight - ((candle.close - minPrice) / (maxPrice - minPrice)) * chartHeight;
                    const highY = padding.top + chartHeight - ((candle.high - minPrice) / (maxPrice - minPrice)) * chartHeight;
                    const lowY = padding.top + chartHeight - ((candle.low - minPrice) / (maxPrice - minPrice)) * chartHeight;
                    const isGreen = candle.close >= candle.open;
                    const candleHeight = Math.abs(closeY - openY) || 1;
                    const isLargeBuy = showLargeBuys && candle.volume >= largeBuyThreshold;

                    return (
                      <g key={i}>
                        {/* Wick */}
                        <line
                          x1={x}
                          y1={highY}
                          x2={x}
                          y2={lowY}
                          stroke={isGreen ? "#10b981" : "#ef4444"}
                          strokeWidth={isLargeBuy ? "4" : "3"}
                          opacity={isLargeBuy ? 1 : 0.9}
                          filter={isLargeBuy ? "url(#glow)" : "none"}
                        />
                        {/* Candle body */}
                        <rect
                          x={x - 4}
                          y={isGreen ? closeY : openY}
                          width="8"
                          height={candleHeight}
                          fill={isGreen ? "#10b981" : "#ef4444"}
                          stroke={isGreen ? "#059669" : "#dc2626"}
                          strokeWidth={isLargeBuy ? "3" : "2"}
                          opacity={isLargeBuy ? 1 : 0.9}
                          filter={isLargeBuy ? "url(#glow)" : "none"}
                        />
                        
                        {/* Large Buy Highlight */}
                        {isLargeBuy && (
                          <g>
                            <circle
                              cx={x}
                              cy={closeY}
                              r="12"
                              fill="rgba(34, 197, 94, 0.2)"
                              stroke="rgba(34, 197, 94, 0.8)"
                              strokeWidth="3"
                            />
                            <text
                              x={x}
                              y={closeY - 20}
                              textAnchor="middle"
                              fill="rgba(34, 197, 94, 1)"
                              fontSize="14"
                              fontWeight="bold"
                              fontFamily="Courier New"
                            >
                              ${formatVolume(candle.volume)}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!selectedToken) {
    return (
      <div className="pro-terminal-container">
        <div className="terminal-loading">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h2>Loading Terminal...</h2>
            <p>Initializing trading intelligence platform</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pro-terminal-container">
      {/* Header */}
      <div className="pro-terminal-header">
        <div className="pro-terminal-title">
          <div className="pro-terminal-status">
            <div className="status-indicator"></div>
            <span className="text-green-400 text-sm">LIVE</span>
          </div>
          <div className="title-section">
            <h1 className="text-2xl font-bold text-white">Cypher Terminal</h1>
            <div className="pro-terminal-subtitle">
              <span className="text-xs text-gray-400">Professional Trading Intelligence Platform</span>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="pro-terminal-search">
          <div className="search-container">
            <div className="current-token-display">
              <span className="token-symbol-display">{selectedToken?.symbol || 'SOL'}</span>
              <span className="token-price-display">${selectedToken?.price?.toLocaleString() || '98.45'}</span>
              <span className={`token-change-display ${selectedToken?.change24h && selectedToken.change24h >= 0 ? 'positive' : 'negative'}`}>
                {selectedToken?.change24h ? (selectedToken.change24h >= 0 ? '+' : '') + selectedToken.change24h.toFixed(2) + '%' : '+5.67%'}
              </span>
            </div>
            <input
              type="text"
              placeholder="Search tokens (BTC, ETH, PEPE...) or contract address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="pro-search-input"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="clear-search-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
            {isSearching && (
              <div className="search-spinner">
                <div className="spinner"></div>
              </div>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((token) => (
                <div
                  key={token.id}
                  className="search-result-item"
                  onClick={() => handleTokenSelect(token)}
                >
                  <div className="result-symbol">{token.symbol}</div>
                  <div className="result-name">{token.name}</div>
                  <div className={`result-change ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeframe Selector */}
        <div className="timeframe-selector">
          {['1H', '4H', '1D', '1W', '1M'].map((tf) => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="pro-terminal-content">
        {/* Token Info Bar */}
        <div className="token-info-bar">
          <div className="token-basic-info">
            <h2 className="token-symbol">{selectedToken.symbol}</h2>
            <span className="token-name">{selectedToken.name}</span>
          </div>
          
          <div className="token-price-info">
            <div className="current-price">${selectedToken.price.toLocaleString()}</div>
            <div className={`price-change ${selectedToken.change24h >= 0 ? 'positive' : 'negative'}`}>
              {selectedToken.change24h >= 0 ? '+' : ''}{selectedToken.change24h.toFixed(2)}%
            </div>
          </div>
          
          <div className="token-stats">
            <div className="stat">
              <span className="stat-label">Volume 24h</span>
              <span className="stat-value">${formatNumber(selectedToken.volume24h)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Market Cap</span>
              <span className="stat-value">${formatNumber(selectedToken.marketCap)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Holders</span>
              <span className="stat-value">{formatNumber(selectedToken.holders)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Risk Level</span>
              <span className={`stat-value ${getRiskColor(selectedToken.riskLevel)}`}>
                {selectedToken.riskLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="pro-tab-navigation">
          {['overview', 'chart', 'insights', 'holders', 'liquidity'].map((tab) => (
            <button
              key={tab}
              className={`pro-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pro-tab-content">
          {activeTab === 'overview' && (
            <div className="overview-grid">
              {/* Chart Section */}
              <div className="chart-section">
                <h3 className="section-title">Price Chart</h3>
                <div className="chart-container">
                  <SimpleChart data={chartData} />
                </div>
              </div>

              {/* AI Insights Section */}
              <div className="insights-section">
                <h3 className="section-title">AI Insights</h3>
                <div className="insights-list">
                  {selectedToken.aiInsights.map((insight, index) => (
                    <div key={index} className="insight-card">
                      <div className="insight-header">
                        <span className={`insight-type ${getInsightColor(insight.type)}`}>
                          {insight.type}
                        </span>
                        <span className="insight-confidence">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                      <p className="insight-analysis">{insight.analysis}</p>
                      <p className="insight-recommendation">{insight.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Overview */}
              <div className="quick-stats">
                <h3 className="section-title">AI Asset Overview</h3>
                <div className="ai-overview-grid">
                  {/* Holder Distribution */}
                  <div className="ai-overview-card">
                    <div className="ai-card-header">
                      <div className="ai-card-icon">📊</div>
                      <div className="ai-card-title">Holder Distribution</div>
                    </div>
                    <div className="ai-card-content">
                      <div className="ai-stat">
                        <span className="ai-stat-label">Top 10%</span>
                        <span className="ai-stat-value">45% of supply</span>
                      </div>
                      <div className="ai-stat">
                        <span className="ai-stat-label">Smart Money</span>
                        <span className="ai-stat-value">32% increase</span>
                      </div>
                    </div>
                  </div>

                  {/* Smart Money Flow */}
                  <div className="ai-overview-card">
                    <div className="ai-card-header">
                      <div className="ai-card-icon">💰</div>
                      <div className="ai-card-title">Smart Money Flow</div>
                    </div>
                    <div className="ai-card-content">
                      <div className="ai-stat">
                        <span className="ai-stat-label">Net Flow</span>
                        <span className="ai-stat-value positive">+$2.4M</span>
                      </div>
                      <div className="ai-stat">
                        <span className="ai-stat-label">Whale Activity</span>
                        <span className="ai-stat-value">High</span>
                      </div>
                    </div>
                  </div>

                  {/* Notorious Wallets */}
                  <div className="ai-overview-card">
                    <div className="ai-card-header">
                      <div className="ai-card-icon">👥</div>
                      <div className="ai-card-title">Notorious Wallets</div>
                    </div>
                    <div className="ai-card-content">
                      <div className="ai-stat">
                        <span className="ai-stat-label">Tracked</span>
                        <span className="ai-stat-value">1,247 wallets</span>
                      </div>
                      <div className="ai-stat">
                        <span className="ai-stat-label">Risk Level</span>
                        <span className="ai-stat-value">Medium</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="ai-overview-card">
                    <div className="ai-card-header">
                      <div className="ai-card-icon">📈</div>
                      <div className="ai-card-title">Key Metrics</div>
                    </div>
                    <div className="ai-card-content">
                      <div className="ai-stat">
                        <span className="ai-stat-label">RSI</span>
                        <span className="ai-stat-value">68.5</span>
                      </div>
                      <div className="ai-stat">
                        <span className="ai-stat-label">MACD</span>
                        <span className="ai-stat-value positive">Bullish</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="chart-section">
              <h3 className="section-title">Advanced Chart</h3>
              <div className="chart-container">
                <SimpleChart data={chartData} />
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="insights-section">
              <h3 className="section-title">Detailed AI Insights</h3>
              <div className="insights-list">
                {selectedToken.aiInsights.map((insight, index) => (
                  <div key={index} className="insight-card">
                    <div className="insight-header">
                      <span className={`insight-type ${getInsightColor(insight.type)}`}>
                        {insight.type}
                      </span>
                      <span className="insight-confidence">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    <p className="insight-analysis">{insight.analysis}</p>
                    <p className="insight-recommendation">{insight.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'holders' && (
            <div className="holders-section">
              <h3 className="section-title">Holder Distribution</h3>
              <div className="holders-content">
                <div className="holder-stat">
                  <span className="holder-label">Total Holders</span>
                  <span className="holder-value">{formatNumber(selectedToken.holders)}</span>
                </div>
                <div className="holder-stat">
                  <span className="holder-label">Average Holding</span>
                  <span className="holder-value">${formatNumber(selectedToken.marketCap / selectedToken.holders)}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'liquidity' && (
            <div className="liquidity-section">
              <h3 className="section-title">Liquidity Events</h3>
              <div className="liquidity-list">
                {selectedToken.liquidityEvents.map((event, index) => (
                  <div key={index} className="liquidity-card">
                    <div className="liquidity-header">
                      <span className="liquidity-type">{event.type}</span>
                      <span className="liquidity-amount">${formatNumber(event.amount)}</span>
                    </div>
                    <div className="liquidity-details">
                      <span className="liquidity-time">{event.timestamp}</span>
                      <span className={`liquidity-impact ${event.impact.toLowerCase()}`}>
                        {event.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProTerminal; 