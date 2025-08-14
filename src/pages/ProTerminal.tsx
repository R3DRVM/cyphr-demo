import React, { useState, useEffect } from 'react';
import { Search, BarChart3, Satellite, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { configService } from '../services/config';
import { usePosition } from '../hooks/usePosition';
import { useTxToasts } from '../hooks/useTxToasts';
import { PreflightBanner } from '../components/Preflight';
import { QuickStart } from '../components/QuickStart';
import { BorrowTradePanel } from '../components/BorrowTradePanel';
import { SummaryPanel } from '../components/SummaryPanel';
import { InsightsPanel } from '../components/InsightsPanel';
import { StrategyExecCard } from '../components/StrategyExecCard';
import { useToast } from '../hooks/useToast';
import './ProTerminal.css';

interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
}

interface MarketData {
  pair: string;
  price: number;
  change24h: number;
}

interface LendingHealth {
  healthFactor: number;
  ltv: number;
  collateralValue: number;
  debtValue: number;
}

interface UserPosition {
  collateral: number;
  debt: number;
}

const ProTerminal: React.FC = () => {
  const { wallet, connected: walletConnected } = useSolanaWallet();
  const { position: userPosition } = usePosition();
  const { withTxToasts } = useTxToasts();
  const { showToast } = useToast();
  
  // Feature flag for V2 lending panels
  const isLendingV2 = configService.getLendingV2();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>({
    id: 'ethereum',
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    price: 2845.67,
    change24h: 2.34,
    volume24h: 1500000000
  });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [timeframe, setTimeframe] = useState('1H');
  const [chartData, setChartData] = useState<Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    isGreen: boolean;
  }>>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);
  const [lastUpdateTime] = useState(new Date());

  const [lendingHealth] = useState<LendingHealth>({
    healthFactor: 2.1,
    ltv: 0.45,
    collateralValue: 15000,
    debtValue: 6750
  });

  const [depositAmount, setDepositAmount] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);

  // DexScreener chart URLs for different tokens with custom theme
  const getDexScreenerUrl = (token: string) => {
    const tokenMap: { [key: string]: string } = {
      'WETH': 'ethereum/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
      'SOL': 'solana/9wzCQqDNN9x3K2CfMKxoAS1o3RdQe5QTfK4m3MdyEf3K',
      'BTC': 'ethereum/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      'MATIC': 'polygon/0x0000000000000000000000000000000000001010',
      'LINK': 'ethereum/0x514910771af9ca656af840dff83e8264ecf986ca',
      'UNI': 'ethereum/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
    };
    
    const tokenPath = tokenMap[token] || 'ethereum/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640';
    // Custom theme parameters to match your Bloomberg terminal aesthetic
    return `https://dexscreener.com/${tokenPath}?embed=1&theme=dark&trades=0&info=0&chartStyle=1&backgroundColor=000000&gridColor=00ff88&textColor=ffffff&candleUpColor=00ff88&candleDownColor=ff4444&volumeUpColor=00ff88&volumeDownColor=ff4444`;
  };

  // Real-time market data from CoinGecko API
  useEffect(() => {
    const fetchRealMarketData = async () => {
      try {
        setIsLoadingMarketData(true);
        
        // Fetch real-time data for multiple tokens
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana,bitcoin,matic-network,chainlink,uniswap&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true');
        const data = await response.json();
        
        const realMarketData: MarketData[] = [
          { pair: 'WETH/USDC', price: data.ethereum?.usd || 2845.67, change24h: data.ethereum?.usd_24h_change || 2.34 },
          { pair: 'SOL/USDC', price: data.solana?.usd || 177.45, change24h: data.solana?.usd_24h_change || 5.67 },
          { pair: 'BTC/USDC', price: data.bitcoin?.usd || 9641.67, change24h: data.bitcoin?.usd_24h_change || 0.89 },
          { pair: 'MATIC/USDC', price: data['matic-network']?.usd || 0.89, change24h: data['matic-network']?.usd_24h_change || -0.87 },
          { pair: 'LINK/USDC', price: data.chainlink?.usd || 14.23, change24h: data.chainlink?.usd_24h_change || 3.45 },
          { pair: 'UNI/USDC', price: data.uniswap?.usd || 8.23, change24h: data.uniswap?.usd_24h_change || -1.23 }
        ];
        
        setMarketData(realMarketData);
      } catch (error) {
        console.error('Failed to fetch real market data:', error);
        // Fallback to mock data if API fails
        const mockMarketData: MarketData[] = [
          { pair: 'WETH/USDC', price: 2845.67, change24h: 2.34 },
          { pair: 'SOL/USDC', price: 177.45, change24h: 5.67 },
          { pair: 'BTC/USDC', price: 9641.67, change24h: 0.89 },
          { pair: 'MATIC/USDC', price: 0.89, change24h: -0.87 },
          { pair: 'LINK/USDC', price: 14.23, change24h: 3.45 },
          { pair: 'UNI/USDC', price: 8.23, change24h: -1.23 }
        ];
        setMarketData(mockMarketData);
      } finally {
        setIsLoadingMarketData(false);
      }
    };

    fetchRealMarketData();
    
    // Update market data every 30 seconds
    const interval = setInterval(fetchRealMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTokenSearch = async (query: string) => {
    if (query.length < 2) {
      setShowSearchDropdown(false);
      return;
    }

    try {
      // Real search from CoinGecko API
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.coins && data.coins.length > 0) {
        // Get detailed data for top results
        const topCoins = data.coins.slice(0, 5);
        const coinIds = topCoins.map((coin: any) => coin.id).join(',');
        
        const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`);
        const priceData = await priceResponse.json();
        
        // Combine search and price data
        const realResults: Token[] = topCoins.map((coin: any) => {
          const priceInfo = priceData[coin.id];
          return {
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: priceInfo ? priceInfo.usd || 0 : 0,
            change24h: priceInfo ? priceInfo.usd_24h_change || 0 : 0,
            volume24h: priceInfo ? priceInfo.usd_24h_vol || 0 : 0
          };
        });
        
        setSearchResults(realResults);
        setShowSearchDropdown(true);
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to mock data if API fails
      const mockResults: Token[] = [
        { id: '1', symbol: 'WETH', name: 'Wrapped Ethereum', price: 2845.67, change24h: 2.34, volume24h: 1500000000 },
        { id: '2', symbol: 'SOL', name: 'Solana', price: 177.45, change24h: 5.67, volume24h: 890000000 },
        { id: '3', symbol: 'BTC', name: 'Bitcoin', price: 9641.67, change24h: 0.89, volume24h: 2300000000 }
      ];
      setSearchResults(mockResults);
      setShowSearchDropdown(true);
    }
  };

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setSearchQuery(token.symbol);
    setShowSearchDropdown(false);
  };

  const handleDepositSOL = () => {
    if (!walletConnected) {
      console.log('Please connect your wallet first');
      return;
    }
    console.log('Deposit SOL functionality coming soon');
  };

  const handleBorrowUSDC = () => {
    if (!walletConnected) {
      console.log('Please connect your wallet first');
      return;
    }
    console.log('Borrow USDC functionality coming soon');
  };

  const handleWithdrawCollateral = () => {
    if (!walletConnected) {
      console.log('Please connect your wallet first');
      return;
    }
    console.log('Withdraw collateral functionality coming soon');
  };

  const handleRepayUSDC = () => {
    if (!walletConnected) {
      console.log('Please connect your wallet first');
      return;
    }
    console.log('Repay USDC functionality coming soon');
  };

  // Position update handler for the new components
  const handlePositionUpdate = () => {
    // This would trigger a refresh of position data
    console.log('Position updated, refreshing data...');
    // In a real implementation, you would refresh the position data here
  };

  return (
    <div className="pro-terminal-page">
      {/* Header */}
      <div className="terminal-header">
        <div className="header-left">
          <h1 className="terminal-title">ProTerminal</h1>
          <div className="terminal-subtitle">Professional DeFi Trading Interface</div>
        </div>
        <div className="header-right">
          <div className="network-indicator">
            <span className="network-label">Network:</span>
            <span className="network-value">Devnet</span>
          </div>
        </div>
      </div>

      {/* QuickStart Strip */}
      <QuickStart />

      {/* Preflight Banner */}
      <PreflightBanner />
      
      {/* Search Bar */}
      <div className="pro-terminal-search">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            className="pro-search-input"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleTokenSearch(e.target.value);
            }}
            onFocus={() => setShowSearchDropdown(true)}
          />
        </div>
        
        {selectedToken && (
          <div className="current-token-display">
            <span className="token-symbol-display">{selectedToken.symbol}/USD</span>
            <span className="token-price-display">${selectedToken.price.toLocaleString()}</span>
            <span className={`price-change ${selectedToken.change24h >= 0 ? 'positive' : 'negative'}`}>
              {selectedToken.change24h >= 0 ? '+' : ''}{selectedToken.change24h.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Main Terminal Content */}
      <div className="terminal-main-content">
        {/* Left Column - Price Chart */}
        <div className="terminal-column chart-column">
          <div className="chart-panel">
            <div className="panel-header">
              <div className="panel-title">
                <span className="token-pair">{selectedToken ? `${selectedToken.symbol}/USDC` : 'WETH/USDC'}</span>
                <span className="token-price">${selectedToken ? selectedToken.price.toLocaleString() : '2,845.67'}</span>
                <span className={`price-change ${selectedToken ? (selectedToken.change24h >= 0 ? 'positive' : 'negative') : 'positive'}`}>
                  {selectedToken ? (selectedToken.change24h >= 0 ? '+' : '') + selectedToken.change24h.toFixed(2) : '+2.34'}%
                </span>
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
              {/* DexScreener Chart Embed */}
              <div className="chart-main-area">
                <iframe
                  src={getDexScreenerUrl(selectedToken?.symbol || 'WETH')}
                  title="DexScreener Chart"
                  className="dexscreener-chart"
                  frameBorder="0"
                  allowFullScreen
                />
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
            </div>
            
            <div className="market-pairs">
              {isLoadingMarketData ? (
                <div className="market-pair-card">Loading...</div>
              ) : marketData && marketData.length > 0 ? (
                marketData.map((market, index) => (
                  <div 
                    key={index} 
                    className={`market-pair-card ${selectedToken?.symbol === market.pair?.split('/')[0] ? 'selected' : ''}`}
                    onClick={() => handleTokenSelect({
                      id: market.pair?.split('/')[0]?.toLowerCase() || '',
                      symbol: market.pair?.split('/')[0] || '',
                      name: market.pair?.split('/')[0] || '',
                      price: market.price || 0,
                      change24h: market.change24h || 0,
                      volume24h: 0
                    })}
                    style={{ cursor: 'pointer' }}
                  >
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

        {/* Right Column - Conditional Rendering */}
        {isLendingV2 ? (
          // V2 Layout: New Lending Panels
          <div className="terminal-column right-column">
            {/* Borrow & Trade Panel */}
            <BorrowTradePanel onPositionUpdate={handlePositionUpdate} />
            
            {/* Summary Panel */}
            <SummaryPanel onRefresh={handlePositionUpdate} />
          </div>
        ) : (
          // Legacy Layout: Original Lending Section
          <div className="terminal-column lending-column">
            <div className="lending-borrowing-panel">
              <div className="panel-header">
                <span className="panel-title">LENDING & BORROWING</span>
                <DollarSign className="w-4 h-4" />
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
                    <span className="metric-value">{userPosition?.collateral?.amount || 0} SOL</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Borrowed (USDC)</span>
                    <span className="metric-value">{userPosition?.debt?.amount || 0} USDC</span>
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
              <div className="deposit-section">
                <div className="section-header">
                  <span className="section-title">DEPOSIT COLLATERAL</span>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    className="amount-input"
                    placeholder="0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                    disabled={!walletConnected}
                  />
                  <button 
                    className="max-btn"
                    onClick={() => setDepositAmount(10)} // Assuming 10 SOL available
                    disabled={!walletConnected}
                  >
                    MAX
                  </button>
                </div>
                <div className="input-info">
                  <span className="info-text">Available: 10 SOL</span>
                  <span className="info-text">Max LTV: 75%</span>
                </div>
                <button 
                  className="action-btn deposit"
                  onClick={handleDepositSOL}
                  disabled={!walletConnected || depositAmount <= 0}
                >
                  DEPOSIT SOL
                </button>
              </div>
              
              {/* Borrow USDC Section */}
              <div className="borrow-section">
                <div className="section-header">
                  <span className="section-title">BORROW USDC</span>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    className="amount-input"
                    placeholder="0"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(parseFloat(e.target.value) || 0)}
                    disabled={!walletConnected}
                  />
                  <button 
                    className="max-btn"
                    onClick={() => setBorrowAmount(7500)} // Assuming 7500 USDC max borrow based on 10 SOL collateral
                    disabled={!walletConnected}
                  >
                    MAX
                  </button>
                </div>
                <div className="input-info">
                  <span className="info-text">Borrow Limit: 7,500 USDC</span>
                  <span className="info-text">Interest Rate: 8.0% APR</span>
                </div>
                <button 
                  className="action-btn borrow"
                  onClick={handleBorrowUSDC}
                  disabled={!walletConnected || borrowAmount <= 0}
                >
                  BORROW USDC
                </button>
              </div>
              
              {/* Additional Action Buttons (Withdraw/Repay) */}
              <div className="position-actions">
                <button 
                  className="action-btn withdraw"
                  onClick={handleWithdrawCollateral}
                  disabled={!walletConnected || !userPosition?.collateral?.amount}
                >
                  WITHDRAW SOL
                </button>
                <button 
                  className="action-btn repay"
                  onClick={handleRepayUSDC}
                  disabled={!walletConnected || !userPosition?.debt?.amount}
                >
                  REPAY USDC
                </button>
              </div>
            </div>
            
            {/* Portfolio Panel - Below Lending */}
            <div className="portfolio-panel">
              <div className="panel-header">
                <span className="panel-title">PORTFOLIO</span>
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
        )}
      </div>

      {/* V2 Insights Panel - Only show when V2 is enabled */}
      {isLendingV2 && (
        <div className="terminal-insights-section">
          <InsightsPanel />
          
          {/* Strategy Execution Card */}
          <div className="strategy-exec-section">
            <StrategyExecCard />
          </div>
        </div>
      )}

      {/* Bottom Ticker Bar */}
      <div className="terminal-ticker-bar">
        <div className="ticker-content">
          <span className="ticker-item">SOL $177.45 +5.67%</span>
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