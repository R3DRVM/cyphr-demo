import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TokenIcon from '../components/TokenIcon';
import TokenAddress from '../components/TokenAddress';

const TokenPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [tradeAmount, setTradeAmount] = useState('100');
  const [tradeSide, setTradeSide] = useState('buy');

  // Mock token data
  const tokenData = {
    name: 'PEPE',
    symbol: 'PEPE',
    address: '0x6982508145454ce325ddbe47a25d4ec3d2311933',
    price: '$0.00001234',
    change24h: '+23.4%',
    marketCap: '$1.2B',
    volume24h: '$45.2M',
    liquidity: '$23.1M',
    holders: '125,432',
    totalSupply: '420,690,000,000,000',
    circulatingSupply: '420,690,000,000,000',
    buyTax: '2%',
    sellTax: '3%',
    description: 'PEPE is a meme token inspired by the popular internet frog character. It has gained significant traction in the crypto community and continues to show strong momentum.',
    socialLinks: {
      website: 'https://pepe.vip',
      telegram: 'https://t.me/pepecoin',
      twitter: 'https://twitter.com/pepecoineth',
      discord: 'https://discord.gg/pepe'
    }
  };

  const chartTimeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
  const tradingHistory = [
    { time: '12:34:56', price: '0.00001234', amount: '1,234,567', side: 'buy' },
    { time: '12:34:52', price: '0.00001233', amount: '2,345,678', side: 'sell' },
    { time: '12:34:48', price: '0.00001235', amount: '3,456,789', side: 'buy' },
    { time: '12:34:44', price: '0.00001232', amount: '4,567,890', side: 'sell' },
    { time: '12:34:40', price: '0.00001236', amount: '5,678,901', side: 'buy' }
  ];

  const holderDistribution = [
    { range: '0-1K', count: '45,234', percentage: '36.1%' },
    { range: '1K-10K', count: '32,156', percentage: '25.7%' },
    { range: '10K-100K', count: '28,945', percentage: '23.1%' },
    { range: '100K-1M', count: '15,678', percentage: '12.5%' },
    { range: '1M+', count: '3,419', percentage: '2.7%' }
  ];

  console.log('Token ID:', id); // To satisfy linter

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Token Header */}
      <div className="mb-8">
        <div className="flex items-center gap-6 mb-6">
          <TokenIcon 
            token={{
              name: tokenData.name,
              symbol: tokenData.symbol
            }}
            size="lg"
          />
          <div>
            <h1 className="text-4xl font-bold text-cyphr-white mb-2 font-nulshock">{tokenData.name}</h1>
            <div className="flex items-center gap-2">
              <span className="text-cyphr-gray font-sf-pro">{tokenData.symbol} •</span>
              <TokenAddress address={tokenData.address} className="text-sm" />
            </div>
          </div>
        </div>
        
        {/* Price Info */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="cyphr-card p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(45,186,161,0.15) 0%, rgba(189,73,111,0.15) 100%)',
              border: '2px solid rgba(45,186,161,0.3)',
              boxShadow: '0 8px 32px 0 rgba(45,186,161,0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div className="text-cyphr-gray text-sm font-semibold mb-2">Price</div>
            <div className="text-2xl font-bold text-cyphr-white mb-1">{tokenData.price}</div>
            <div className="text-cyphr-teal font-semibold">{tokenData.change24h}</div>
          </div>
          
          <div className="cyphr-card p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(45,186,161,0.12) 0%, rgba(189,73,111,0.12) 100%)',
              border: '2px solid rgba(45,186,161,0.25)',
              boxShadow: '0 8px 32px 0 rgba(45,186,161,0.10)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div className="text-cyphr-gray text-sm font-semibold mb-2">Market Cap</div>
            <div className="text-xl font-bold text-cyphr-white">{tokenData.marketCap}</div>
          </div>
          
          <div className="cyphr-card p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(45,186,161,0.12) 0%, rgba(189,73,111,0.12) 100%)',
              border: '2px solid rgba(45,186,161,0.25)',
              boxShadow: '0 8px 32px 0 rgba(45,186,161,0.10)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div className="text-cyphr-gray text-sm font-semibold mb-2">Volume 24h</div>
            <div className="text-xl font-bold text-cyphr-white">{tokenData.volume24h}</div>
          </div>
          
          <div className="cyphr-card p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(45,186,161,0.12) 0%, rgba(189,73,111,0.12) 100%)',
              border: '2px solid rgba(45,186,161,0.25)',
              boxShadow: '0 8px 32px 0 rgba(45,186,161,0.10)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div className="text-cyphr-gray text-sm font-semibold mb-2">Holders</div>
            <div className="text-xl font-bold text-cyphr-white">{tokenData.holders}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex bg-cyphr-dark-gray rounded-2xl p-2 border border-cyphr-gray">
          {['overview', 'chart', 'trading', 'holders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-cyphr-teal text-cyphr-black shadow-lg'
                  : 'text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content Based on Active Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Token Info */}
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
              <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">Token Information</h3>
              <span className="text-cyphr-teal text-lg">ℹ️</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-cyphr-black/50 border border-cyphr-gray/30">
                <span className="text-cyphr-gray">Total Supply</span>
                <span className="text-cyphr-white font-mono">{tokenData.totalSupply}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-cyphr-black/50 border border-cyphr-gray/30">
                <span className="text-cyphr-gray">Circulating Supply</span>
                <span className="text-cyphr-white font-mono">{tokenData.circulatingSupply}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-cyphr-black/50 border border-cyphr-gray/30">
                <span className="text-cyphr-gray">Buy Tax</span>
                <span className="text-cyphr-teal font-semibold">{tokenData.buyTax}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-cyphr-black/50 border border-cyphr-gray/30">
                <span className="text-cyphr-gray">Sell Tax</span>
                <span className="text-cyphr-pink font-semibold">{tokenData.sellTax}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-cyphr-black/50 border border-cyphr-gray/30">
                <span className="text-cyphr-gray">Liquidity</span>
                <span className="text-cyphr-white font-semibold">{tokenData.liquidity}</span>
              </div>
            </div>
          </div>

          {/* Description */}
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
              <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">About {tokenData.name}</h3>
              <span className="text-cyphr-teal text-lg">📝</span>
            </div>
            <p className="text-cyphr-gray leading-relaxed mb-6">{tokenData.description}</p>
            
            {/* Social Links */}
            <div className="space-y-3">
              <h4 className="text-cyphr-white font-semibold mb-3">Social Links</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(tokenData.socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-cyphr-black/50 border border-cyphr-gray/30 hover:border-cyphr-teal transition-all duration-200"
                  >
                    <span className="text-cyphr-teal">
                      {platform === 'website' ? '🌐' : platform === 'telegram' ? '📱' : platform === 'twitter' ? '🐦' : '💬'}
                    </span>
                    <span className="text-cyphr-white capitalize">{platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chart' && (
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
            <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">{tokenData.name} Price Chart</h3>
            <div className="flex gap-2">
              {chartTimeframes.map((timeframe) => (
                <button key={timeframe} className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray transition-all duration-200">
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
          <div className="h-96 bg-gradient-to-br from-cyphr-teal/10 to-cyphr-pink/10 rounded-xl flex items-center justify-center border border-cyphr-gray/30">
            <div className="text-center">
              <div className="text-cyphr-gray text-6xl mb-4">📈</div>
              <div className="text-cyphr-gray font-sf-pro text-xl">Price Chart</div>
              <div className="text-cyphr-gray text-sm">Interactive trading chart</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trading' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trading Interface */}
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
              <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">Trade {tokenData.name}</h3>
              <span className="text-cyphr-teal text-lg">⚡</span>
            </div>

            {/* Buy/Sell Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {['buy', 'sell'].map((side) => (
                <button
                  key={side}
                  onClick={() => setTradeSide(side)}
                  className={`px-4 py-3 rounded-xl font-bold text-lg transition-all duration-200 ${
                    tradeSide === side
                      ? side === 'buy' 
                        ? 'bg-cyphr-teal text-cyphr-black shadow-lg'
                        : 'bg-cyphr-pink text-cyphr-white shadow-lg'
                      : 'bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray border border-cyphr-gray/30'
                  }`}
                >
                  {side.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-cyphr-gray text-sm font-semibold mb-2">Amount (USD)</label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className="w-full cyphr-input px-4 py-3 rounded-xl border-2 focus:border-cyphr-teal bg-cyphr-black/50"
                placeholder="Enter amount"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {['100', '500', '1000'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTradeAmount(amount)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray transition-all duration-200 border border-cyphr-gray/30"
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Execute Button */}
            <button className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
              tradeSide === 'buy' 
                ? 'bg-cyphr-teal text-cyphr-black hover:bg-cyphr-teal/90' 
                : 'bg-cyphr-pink text-cyphr-white hover:bg-cyphr-pink/90'
            }`}>
              {tradeSide.toUpperCase()} {tokenData.name}
            </button>
          </div>

          {/* Trading History */}
          <div className="lg:col-span-2 cyphr-card p-6 rounded-2xl"
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
              {tradingHistory.map((trade, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-cyphr-black/50 border border-cyphr-gray/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${trade.side === 'buy' ? 'bg-cyphr-teal' : 'bg-cyphr-pink'}`}></div>
                    <span className={`font-mono font-semibold ${trade.side === 'buy' ? 'text-cyphr-teal' : 'text-cyphr-pink'}`}>
                      {trade.price}
                    </span>
                  </div>
                  <span className="text-cyphr-gray font-mono text-sm">{trade.amount}</span>
                  <span className="text-cyphr-gray font-mono text-sm">{trade.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'holders' && (
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
            <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">Holder Distribution</h3>
            <span className="text-cyphr-teal text-lg">👥</span>
          </div>
          <div className="space-y-4">
            {holderDistribution.map((holder, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-cyphr-black/50 border border-cyphr-gray/30">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}></div>
                  <span className="text-cyphr-white font-semibold">{holder.range}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cyphr-white">{holder.count}</div>
                  <div className="text-cyphr-gray text-sm">{holder.percentage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenPage; 