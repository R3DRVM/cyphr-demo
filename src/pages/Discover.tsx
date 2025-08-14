import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Twitter, Fish, Users, AlertTriangle, Search, ArrowUp } from 'lucide-react';
import './Discover.css';

const Discover: React.FC = () => {
  const [searchToken, setSearchToken] = useState('');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  // Real data state
  const [topGainers, setTopGainers] = useState([
    { name: 'Loading...', symbol: '---', address: '---', gain: '---', price: '---' }
  ]);
  const [volumeLeaders, setVolumeLeaders] = useState([
    { name: 'Loading...', symbol: '---', address: '---', volume: '---' }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data on component mount
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch top gainers and volume data from CoinGecko
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h');
        const data = await response.json();
        
        // Process top gainers
        const gainers = data.slice(0, 5).map((coin: any) => ({
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          address: coin.id,
          gain: `${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%`,
          price: `$${coin.current_price.toLocaleString()}`
        }));
        
        // Process volume leaders
        const volumeData = data.sort((a: any, b: any) => b.total_volume - a.total_volume).slice(0, 5);
        const leaders = volumeData.map((coin: any) => ({
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          address: coin.id,
          volume: `$${(coin.total_volume / 1000000).toFixed(1)}M`
        }));
        
        setTopGainers(gainers);
        setVolumeLeaders(leaders);
      } catch (error) {
        console.error('Failed to fetch real data:', error);
        // Fallback to mock data if API fails
        setTopGainers([
          { name: 'Pepe Token', symbol: 'PEPE', address: '0x6982...f4b2', gain: '+47.8%', price: '$0.000012' },
          { name: 'Shiba Inu', symbol: 'SHIB', address: '0x95ad...2a8c', gain: '+23.4%', price: '$0.000009' },
          { name: 'Dogecoin', symbol: 'DOGE', address: '0x4f96...8b3d', gain: '+18.7%', price: '$0.085' }
        ]);
        setVolumeLeaders([
          { name: 'Tether', symbol: 'USDT', address: '0xa0b8...4c7f', volume: '$2.8B' },
          { name: 'Bitcoin', symbol: 'BTC', address: '0x2260...628f', volume: '$1.9B' },
          { name: 'Ethereum', symbol: 'ETH', address: 'Native', volume: '$1.4B' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealData();
    
    // Update data every 5 minutes
    const interval = setInterval(fetchRealData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const socialTrending = [
    { name: 'Arbitrum', symbol: 'ARB', rank: 'Trending #1', sentiment: 'Bullish', mentions: '12.4K mentions' },
    { name: 'Optimism', symbol: 'OP', rank: 'Trending #2', sentiment: 'Bullish', mentions: '8.9K mentions' },
    { name: 'Avalanche', symbol: 'AVAX', rank: 'Trending #3', sentiment: 'Bearish', mentions: '6.7K mentions' }
  ];

  const whaleTracker = [
    { type: 'BUY', asset: 'WETH', time: '2 mins ago', address: '0x742d35Cc6634C0532925a3b8D47d3BDE9123c456', known: 'Alameda Research Wallet', usdAmount: '$2.8M', tokenAmount: '1,045 WETH' },
    { type: 'SELL', asset: 'USDC', time: '8 mins ago', address: '0x8b5d62f396Ca3C6cF19803234685e693733a9C2d', known: 'Jump Trading Wallet', usdAmount: '$5.2M', tokenAmount: '5,200,000 USDC' },
    { type: 'BUY', asset: 'LINK', time: '15 mins ago', address: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', known: 'Unknown Whale Wallet', usdAmount: '$1.4M', tokenAmount: '94,595 LINK' }
  ];

  const handleTokenSearch = (token: string) => {
    setSelectedToken(token);
    setSearchToken(token);
  };

  return (
    <div className="discover-page">
      {/* Header */}
      <div className="discover-header">
        <div className="header-left">
          <h1>DISCOVER</h1>
          <p>Explore trending tokens, market movements, and whale activities</p>
        </div>
        <div className="header-right">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="discover-main-content">
        {/* Top Row - Top Gainers and Volume Leaders */}
        <div className="discover-top-row">
          {/* Top Gainers Module */}
          <div className="discover-module top-gainers-module">
            <div className="module-header">
              <div className="header-left">
                <h3>Top Gainers (24h)</h3>
              </div>
              <div className="header-right">
                <ArrowUp className="trending-icon" />
              </div>
            </div>
            <div className="module-content">
              {topGainers.map((token, index) => (
                <div key={index} className="token-entry" onClick={() => handleTokenSearch(token.symbol)}>
                  <div className="token-info">
                    <div className="token-icon">
                      <span>{token.symbol}</span>
                    </div>
                    <div className="token-details">
                      <div className="token-name">{token.name}</div>
                      <div className="token-address">{token.address}</div>
                    </div>
                  </div>
                  <div className="token-stats">
                    <div className="token-gain">{token.gain}</div>
                    <div className="token-price">{token.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volume Leaders Module */}
          <div className="discover-module volume-leaders-module">
            <div className="module-header">
              <div className="header-left">
                <h3>Volume Leaders</h3>
              </div>
              <div className="header-right">
                <div className="volume-dot"></div>
              </div>
            </div>
            <div className="module-content">
              {volumeLeaders.map((token, index) => (
                <div key={index} className="token-entry" onClick={() => handleTokenSearch(token.symbol)}>
                  <div className="token-info">
                    <div className="token-icon volume-icon">
                      <span>{token.symbol}</span>
                    </div>
                    <div className="token-details">
                      <div className="token-name">{token.name}</div>
                      <div className="token-address">{token.address}</div>
                    </div>
                  </div>
                  <div className="token-stats">
                    <div className="token-volume">{token.volume}</div>
                    <div className="volume-label">24h Volume</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Row - Social Trending and Whale Tracker */}
        <div className="discover-middle-row">
          {/* Social Trending Module */}
          <div className="discover-module social-trending-module">
            <div className="module-header">
              <div className="header-left">
                <h3>Trending on X</h3>
              </div>
              <div className="header-right">
                <Twitter className="social-icon" />
              </div>
            </div>
            <div className="module-content">
              {socialTrending.map((token, index) => (
                <div key={index} className="token-entry" onClick={() => handleTokenSearch(token.symbol)}>
                  <div className="token-info">
                    <div className="token-icon social-icon">
                      <span>{token.symbol}</span>
                    </div>
                    <div className="token-details">
                      <div className="token-name">{token.name}</div>
                      <div className="token-rank">{token.rank}</div>
                    </div>
                  </div>
                  <div className="token-stats">
                    <div className={`sentiment ${token.sentiment.toLowerCase()}`}>
                      <div className="sentiment-dot"></div>
                      {token.sentiment}
                    </div>
                    <div className="mentions">{token.mentions}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Whale Tracker Module */}
          <div className="discover-module whale-tracker-module">
            <div className="module-header">
              <div className="header-left">
                <h3>Whale Tracker</h3>
              </div>
              <div className="header-right">
                <Fish className="whale-icon" />
              </div>
            </div>
            <div className="module-content">
              {whaleTracker.map((transaction, index) => (
                <div key={index} className={`transaction-entry ${transaction.type.toLowerCase()}`}>
                  <div className="transaction-type">
                    <div className={`type-badge ${transaction.type.toLowerCase()}`}>
                      {transaction.type}
                    </div>
                    <div className="transaction-time">{transaction.asset} {transaction.time}</div>
                  </div>
                  <div className="transaction-details">
                    <div className="wallet-address">{transaction.address}</div>
                    <div className="known-wallet">Known: {transaction.known}</div>
                  </div>
                  <div className="transaction-amounts">
                    <div className={`usd-amount ${transaction.type.toLowerCase()}`}>
                      {transaction.usdAmount}
                    </div>
                    <div className="token-amount">{transaction.tokenAmount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row - Holder Analytics and Risk Analysis */}
        <div className="discover-bottom-row">
          {/* Holder Analytics Module */}
          <div className="discover-module holder-analytics-module">
            <div className="module-header">
              <div className="header-left">
                <h3>Holder Analytics</h3>
              </div>
              <div className="header-right">
                <Users className="analytics-icon" />
              </div>
            </div>
            <div className="module-content">
              {selectedToken ? (
                <div className="analytics-content">
                  <div className="selected-token">
                    <h4>Token: {selectedToken}</h4>
                    <p>Click on a token from above to view detailed holder analytics</p>
                  </div>
                  <div className="analytics-placeholder">
                    <div className="placeholder-text">
                      <BarChart3 className="placeholder-icon" />
                      <p>Holder distribution data will appear here</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="analytics-placeholder">
                  <div className="placeholder-text">
                    <Users className="placeholder-icon" />
                    <p>Select a token to view holder analytics</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Risk Analysis Module */}
          <div className="discover-module risk-analysis-module">
            <div className="module-header">
              <div className="header-left">
                <h3>Risk Analysis</h3>
              </div>
              <div className="header-right">
                <AlertTriangle className="risk-icon" />
              </div>
            </div>
            <div className="module-content">
              {selectedToken ? (
                <div className="risk-content">
                  <div className="selected-token">
                    <h4>Token: {selectedToken}</h4>
                    <p>Risk assessment based on holder analytics</p>
                  </div>
                  <div className="risk-metrics">
                    <div className="risk-metric">
                      <span className="metric-label">Liquidity Risk:</span>
                      <span className="metric-value low">Low</span>
                    </div>
                    <div className="risk-metric">
                      <span className="metric-label">Concentration Risk:</span>
                      <span className="metric-value medium">Medium</span>
                    </div>
                    <div className="risk-metric">
                      <span className="metric-label">Volatility Risk:</span>
                      <span className="metric-value high">High</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="risk-placeholder">
                  <div className="placeholder-text">
                    <AlertTriangle className="placeholder-icon" />
                    <p>Select a token to view risk analysis</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover; 