import React, { useState, useEffect } from 'react';
import './ProTerminal.css';
import LendingSection from '../components/LendingSection';
import BorrowPanel from '../components/borrow/BorrowPanel';

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
  const [typedTitle, setTypedTitle] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  // Lending & Borrowing State
  const [depositAmount, setDepositAmount] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);
  const [userPosition, setUserPosition] = useState({
    collateral: 0,
    debt: 0,
    available: 10 // Mock available SOL
  });
  const [lendingHealth, setLendingHealth] = useState({
    ltv: 0,
    healthFactor: 2.0,
    apr: 0.08
  });
  const [walletConnected, setWalletConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Typing effect for title
  useEffect(() => {
    const title = 'Cyphr Terminal';
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < title.length) {
        setTypedTitle(title.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 150); // Type each character every 150ms

    return () => clearInterval(typeInterval);
  }, []);

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
        const topCoins = data.coins.slice(0, 8); // Increased to 8 for better selection
        const coinIds = topCoins.map((coin: any) => coin.id).join(',');
        
        const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
        const priceData = await priceResponse.json();
        
        // Combine search and price data
        const enrichedResults = topCoins.map((coin: any) => {
          const priceInfo = priceData[coin.id];
          return {
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            change24h: priceInfo ? priceInfo.usd_24h_change || 0 : 0,
            price: priceInfo ? priceInfo.usd || 0 : 0,
            volume24h: priceInfo ? priceInfo.usd_24h_vol || 0 : 0,
            marketCap: priceInfo ? priceInfo.usd_market_cap || 0 : 0
          };
        });
        
        setSearchResults(enrichedResults);
        return enrichedResults;
      }
      
      return [];
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Real-time market data for popular pairs
  const [marketData, setMarketData] = useState<any[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);

  // Initialize with default market data to ensure something shows
  useEffect(() => {
    if (!marketData || marketData.length === 0) {
      // Set default market data immediately
      setMarketData([
        { pair: 'ETH/USDC', price: 2845.67, change24h: 2.34, symbol: 'ETH' },
        { pair: 'BTC/USDT', price: 67234, change24h: 1.89, symbol: 'BTC' },
        { pair: 'MATIC/ETH', price: 0.000456, change24h: -0.87, symbol: 'MATIC' },
        { pair: 'LINK/USD', price: 14.23, change24h: 3.45, symbol: 'LINK' },
        { pair: 'UNI/ETH', price: 0.002890, change24h: -1.23, symbol: 'UNI' },
        { pair: 'AAVE/USD', price: 89.45, change24h: 0.56, symbol: 'AAVE' }
      ]);
    }
  }, [marketData]);

  // Fetch real-time market data for popular pairs
  const fetchMarketData = async () => {
    setIsLoadingMarketData(true);
    try {
      // Popular trading pairs
      const popularPairs = [
        'ethereum', 'bitcoin', 'matic-network', 'chainlink', 'uniswap', 'aave'
      ];
      
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${popularPairs.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
      const data = await response.json();
      
      const marketPairs = [
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', pair: 'ETH/USDC' },
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', pair: 'BTC/USDT' },
        { id: 'matic-network', symbol: 'MATIC', name: 'Polygon', pair: 'MATIC/ETH' },
        { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', pair: 'LINK/USD' },
        { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', pair: 'UNI/ETH' },
        { id: 'aave', symbol: 'AAVE', name: 'Aave', pair: 'AAVE/USD' }
      ];
      
      const enrichedMarketData = marketPairs.map(pair => {
        const priceInfo = data[pair.id];
        if (priceInfo) {
          return {
            ...pair,
            price: priceInfo.usd,
            change24h: priceInfo.usd_24h_change || 0,
            volume24h: priceInfo.usd_24h_vol || 0,
            marketCap: priceInfo.usd_market_cap || 0
          };
        }
        return pair;
      });
      
      console.log('Setting market data:', enrichedMarketData);
      setMarketData(enrichedMarketData);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      // Fallback to mock data with correct structure
      const fallbackData = [
        { pair: 'ETH/USDC', price: 2845.67, change24h: 2.34, symbol: 'ETH' },
        { pair: 'BTC/USDT', price: 67234, change24h: 1.89, symbol: 'BTC' },
        { pair: 'MATIC/ETH', price: 0.000456, change24h: -0.87, symbol: 'MATIC' },
        { pair: 'LINK/USD', price: 14.23, change24h: 3.45, symbol: 'LINK' },
        { pair: 'UNI/ETH', price: 0.002890, change24h: -1.23, symbol: 'UNI' },
        { pair: 'AAVE/USD', price: 89.45, change24h: 0.56, symbol: 'AAVE' }
      ];
      console.log('Setting fallback market data:', fallbackData);
      setMarketData(fallbackData);
    } finally {
      setIsLoadingMarketData(false);
    }
  };

  // Update market data every 30 seconds
  useEffect(() => {
    fetchMarketData(); // Initial fetch
    
    const interval = setInterval(() => {
      fetchMarketData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Add visual feedback for real-time updates
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  
  const updateMarketDataWithFeedback = async () => {
    await fetchMarketData();
    setLastUpdateTime(new Date());
  };
  
  // Calculate max borrow amount based on collateral and LTV
  const maxBorrowAmount = userPosition.collateral * 150 * 0.75; // SOL price * max LTV
  
  // Lending & Borrowing Functions
  const handleDepositCollateral = async () => {
    if (!walletConnected || depositAmount <= 0) return;
    
    setIsProcessing(true);
    try {
      // For now, simulate the transaction
      console.log(`Depositing ${depositAmount} SOL as collateral`);
      
      // Update local state
      setUserPosition(prev => ({
        ...prev,
        collateral: prev.collateral + depositAmount,
        available: prev.available - depositAmount
      }));
      
      // Reset input
      setDepositAmount(0);
      
      // Update health metrics
      updateLendingHealth();
      
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBorrowUSDC = async () => {
    if (!walletConnected || borrowAmount <= 0 || borrowAmount > maxBorrowAmount) return;
    
    setIsProcessing(true);
    try {
      console.log(`Borrowing ${borrowAmount} USDC`);
      
      // Update local state
      setUserPosition(prev => ({
        ...prev,
        debt: prev.debt + borrowAmount
      }));
      
      // Reset input
      setBorrowAmount(0);
      
      // Update health metrics
      updateLendingHealth();
      
    } catch (error) {
      console.error('Borrow failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleWithdrawCollateral = async () => {
    if (!walletConnected || !userPosition.collateral) return;
    
    setIsProcessing(true);
    try {
      const withdrawAmount = userPosition.collateral;
      console.log(`Withdrawing ${withdrawAmount} SOL collateral`);
      
      // Update local state
      setUserPosition(prev => ({
        ...prev,
        collateral: 0,
        available: prev.available + withdrawAmount
      }));
      
      // Update health metrics
      updateLendingHealth();
      
    } catch (error) {
      console.error('Withdraw failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRepayUSDC = async () => {
    if (!walletConnected || !userPosition.debt) return;
    
    setIsProcessing(true);
    try {
      const repayAmount = userPosition.debt;
      console.log(`Repaying ${repayAmount} USDC debt`);
      
      // Update local state
      setUserPosition(prev => ({
        ...prev,
        debt: 0
      }));
      
      // Update health metrics
      updateLendingHealth();
      
    } catch (error) {
      console.error('Repay failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const updateLendingHealth = () => {
    const collateralValue = userPosition.collateral * 150; // SOL price
    const debtValue = userPosition.debt; // USDC price = $1
    
    const ltv = debtValue / Math.max(collateralValue, 1);
    const healthFactor = (collateralValue * 0.8) / Math.max(debtValue, 1); // 80% liquidation threshold
    
    setLendingHealth({
      ltv: Math.min(ltv, 1),
      healthFactor: Math.max(healthFactor, 0),
      apr: 0.08
    });
  };
  
  // Update health metrics when position changes
  useEffect(() => {
    updateLendingHealth();
  }, [userPosition.collateral, userPosition.debt]);
  
  // Simulate wallet connection for demo purposes
  useEffect(() => {
    // For demo, simulate wallet connected
    setWalletConnected(true);
  }, []);

  // Auto-refresh market data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateMarketDataWithFeedback();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Enhanced search with real-time updates
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchTokens(searchQuery);
      }, 300); // Debounce search
      
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

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
            <p>Loading terminal data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pro-terminal-container">
      {/* Top Header Bar - Bloomberg Terminal Style */}
      <div className="terminal-header-bar">
        <div className="header-left">
          <span className="terminal-prompt">&gt; PRO TERMINAL</span>
        </div>
        
        <div className="header-center">
          <div className="token-search-container">
            <input
              type="text"
              placeholder="Enter token address (8x...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="token-search-input"
            />
            <div className="search-icon">🔍</div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="global-market-data">
            <span className="market-ticker">ETH: $2,845.67</span>
            <span className="market-ticker">BTC: $67,234.12</span>
            <span className="market-ticker">GAS: 23</span>
            <div className="status-indicator-green"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Three Column Layout */}
      <div className="terminal-main-content">
        {/* Left Column - Price Chart */}
        <div className="terminal-column chart-column">
          <div className="chart-panel">
            <div className="panel-header">
              <div className="panel-title">
                <span className="token-pair">WETH/USDC</span>
                <span className="token-price">$2,845.67</span>
                <span className="price-change positive">+2.34%</span>
              </div>
              <div className="timeframe-selector">
                {['1H', '4H', '1D', '1W'].map((tf) => (
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
            
            <div className="chart-container">
              <SimpleChart data={chartData} />
            </div>
            
            <div className="chart-metrics">
              <div className="metric">
                <span className="metric-label">H:</span>
                <span className="metric-value">$2,892.45</span>
              </div>
              <div className="metric">
                <span className="metric-label">L:</span>
                <span className="metric-value">$2,801.23</span>
              </div>
              <div className="metric">
                <span className="metric-label">V:</span>
                <span className="metric-value">1.2M</span>
              </div>
            </div>
          </div>
          
          {/* AI Insights Panel - Below Chart */}
          <div className="ai-insights-panel">
            <div className="panel-header">
              <span className="panel-title">AI INSIGHTS</span>
              <div className="insight-status">
                <div className="status-dot green"></div>
                <span className="status-text">Last updated: 2s ago</span>
              </div>
            </div>
            
            <div className="insight-content">
              <div className="insight-signal">
                <span className="signal-type bullish">BULLISH SIGNAL</span>
                <span className="signal-confidence">Confidence: 87%</span>
              </div>
              
              <div className="insight-details">
                <p>High liquidity detected. Trading volume increased 45% in last 2h. Whale accumulation pattern identified.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Market Overview */}
        <div className="terminal-column market-column">
          <div className="market-overview-panel">
            <div className="panel-header">
              <span className="panel-title">MARKET OVERVIEW</span>
              <div className="panel-header-right">
                <div className="panel-icon">📊</div>
                <div className="last-updated">
                  <span className="update-indicator"></span>
                  <span className="update-text">
                    {lastUpdateTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="market-pairs">
              {isLoadingMarketData ? (
                <div className="market-pair-card">Loading...</div>
              ) : marketData && marketData.length > 0 ? (
                marketData.map((market, index) => (
                  <div key={index} className="market-pair-card">
                    <span className="pair-name">{market.pair || 'Unknown'}</span>
                    <span className="pair-price">${(market.price || 0).toLocaleString()}</span>
                    <span className={`pair-change ${(market.change24h || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {(market.change24h || 0) >= 0 ? '+' : ''}{(market.change24h || 0).toFixed(2)}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="market-pair-card">No market data available</div>
              )}
            </div>
          </div>
          
          {/* Trading Insights Panel */}
          <div className="trading-insights-panel">
            <div className="panel-header">
              <span className="panel-title">TRADING INSIGHTS</span>
              <div className="panel-icon">📡</div>
            </div>
            
            <div className="insights-list">
              <div className="insight-item">
                <span className="insight-time">2 min ago</span>
                <span className="insight-text">Large ETH transfer detected: 15,000 ETH moved to exchange</span>
              </div>
              <div className="insight-item">
                <span className="insight-time">5 min ago</span>
                <span className="insight-text">Unusual trading volume spike in MATIC (+348%)</span>
              </div>
              <div className="insight-item">
                <span className="insight-time">8 min ago</span>
                <span className="insight-text">Flash loan attack detected on DeFi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Lending & Borrowing */}
        <div className="terminal-column lending-column">
          <div className="lending-borrowing-panel">
            <div className="panel-header">
              <span className="panel-title">LENDING & BORROWING</span>
              <div className="panel-icon">💰</div>
            </div>
            
            {/* Current Position Status */}
            <div className="position-status">
              <div className="status-header">
                <span className="status-title">POSITION STATUS</span>
                <div className="health-indicator">
                  <div className={`health-dot ${lendingHealth.healthFactor > 1.5 ? 'green' : lendingHealth.healthFactor > 1.0 ? 'yellow' : 'red'}`}></div>
                  <span className="health-text">
                    {lendingHealth.healthFactor > 1.5 ? 'SAFE' : lendingHealth.healthFactor > 1.0 ? 'WARNING' : 'DANGER'}
                  </span>
                </div>
              </div>
              
              <div className="position-metrics">
                <div className="metric-row">
                  <span className="metric-label">Collateral (SOL)</span>
                  <span className="metric-value">{userPosition.collateral || 0} SOL</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Borrowed (USDC)</span>
                  <span className="metric-value">{userPosition.debt || 0} USDC</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">LTV Ratio</span>
                  <span className="metric-value">{(lendingHealth.ltv * 100).toFixed(1)}%</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Health Factor</span>
                  <span className="metric-value">{lendingHealth.healthFactor.toFixed(2)}x</span>
                </div>
              </div>
            </div>
            
            {/* Deposit Collateral Section */}
            <div className="lending-section">
              <h4>DEPOSIT COLLATERAL</h4>
              <div className="input-group">
                <input
                  type="number"
                  placeholder="SOL Amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  className="amount-input"
                />
                <button 
                  className="max-btn"
                  onClick={() => setDepositAmount(userPosition.available || 0)}
                >
                  MAX
                </button>
              </div>
              <div className="input-info">
                <span>Available: {userPosition.available || 0} SOL</span>
                <span>Max LTV: 75%</span>
              </div>
              <button 
                className="action-btn deposit"
                onClick={handleDepositCollateral}
                disabled={!walletConnected || depositAmount <= 0}
              >
                DEPOSIT SOL
              </button>
            </div>
            
            {/* Borrow Section */}
            <div className="lending-section">
              <h4>BORROW USDC</h4>
              <div className="input-group">
                <input
                  type="number"
                  placeholder="USDC Amount"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(parseFloat(e.target.value) || 0)}
                  className="amount-input"
                />
                <button 
                  className="max-btn"
                  onClick={() => setBorrowAmount(maxBorrowAmount)}
                >
                  MAX
                </button>
              </div>
              <div className="input-info">
                <span>Available to borrow: {maxBorrowAmount.toFixed(2)} USDC</span>
                <span>Rate: 8% APR</span>
              </div>
              <button 
                className="action-btn borrow"
                onClick={handleBorrowUSDC}
                disabled={!walletConnected || borrowAmount <= 0 || borrowAmount > maxBorrowAmount}
              >
                BORROW USDC
              </button>
            </div>
            
            {/* Position Management */}
            <div className="lending-section">
              <h4>MANAGE POSITION</h4>
              <div className="position-actions">
                <button 
                  className="action-btn withdraw"
                  onClick={handleWithdrawCollateral}
                  disabled={!walletConnected || !userPosition.collateral}
                >
                  WITHDRAW SOL
                </button>
                <button 
                  className="action-btn repay"
                  onClick={handleRepayUSDC}
                  disabled={!walletConnected || !userPosition.debt}
                >
                  REPAY USDC
                </button>
              </div>
            </div>
            
            {/* Lending Rates Display */}
            <div className="lending-rates">
              <h4>Current Rates</h4>
              <div className="rate-item">
                <span className="asset">Supply APY</span>
                <span className="rate">6.0%</span>
              </div>
              <div className="rate-item">
                <span className="asset">Borrow APR</span>
                <span className="rate">8.0%</span>
              </div>
            </div>
          </div>
          
          {/* Portfolio Panel - Below Lending */}
          <div className="portfolio-panel">
            <div className="panel-header">
              <span className="panel-title">PORTFOLIO</span>
              <div className="panel-icon">📁</div>
            </div>
            
            <div className="portfolio-metrics">
              <div className="portfolio-metric">
                <span className="metric-label">Total Value</span>
                <span className="metric-value">$127,845.67</span>
              </div>
              <div className="portfolio-metric">
                <span className="metric-label">24h Change</span>
                <span className="metric-value positive">+$2,341.23 (+1.87%)</span>
              </div>
              <div className="portfolio-metric">
                <span className="metric-label">Available</span>
                <span className="metric-value">$8,234.56</span>
              </div>
              <div className="portfolio-metric">
                <span className="metric-label">Lent</span>
                <span className="metric-value">$15,000.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker Bar */}
      <div className="terminal-ticker-bar">
        <div className="ticker-content">
          <span className="ticker-item">234.12 +1.89%</span>
          <span className="ticker-item">ETH $2,845.67 +2.34%</span>
          <span className="ticker-item">MATIC $0.89 -0.87%</span>
          <span className="ticker-item">LINK $14.23 +3.45%</span>
          <span className="ticker-item">UNI $8.23 -1.23%</span>
          <span className="ticker-item">AAVE $89.45 +0.56%</span>
        </div>
      </div>

      {/* Search Results Dropdown - Overlay */}
      {showSearchDropdown && searchResults.length > 0 && (
        <div className="search-results-overlay">
          {searchResults.map((token) => (
            <div
              key={token.id}
              className="search-result-item"
              onClick={() => handleTokenSelect(token)}
            >
              <div className="result-info">
                <div className="result-symbol">{token.symbol}</div>
                <div className="result-name">{token.name}</div>
              </div>
              <div className="result-price">${token.price?.toLocaleString() || '0.00'}</div>
              <div className={`result-change ${token.change24h >= 0 ? 'positive' : 'negative'}`}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProTerminal; 