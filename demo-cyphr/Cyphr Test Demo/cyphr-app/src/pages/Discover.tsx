import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Discover: React.FC = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [activeTimeframe, setActiveTimeframe] = useState('1m');

  const timeframes = ['1m', '5m', '30m', '1h'];
  
  const mockTokens = [
    {
      id: 1,
      name: 'GNOME',
      fullName: 'Gnome Child',
      time: '8s',
      marketCap: '$64.3K',
      marketCapChange: '-2.45%',
      liquidity: '$19.8K',
      volume: '$19.2K',
      txns: '169',
      buyTxns: '100',
      sellTxns: '69',
      buyTax: '22.2%',
      sellTax: '1.53%',
      totalTax: '4.18%',
      paid: false,
      paidAmount: '0.14%',
      holders: '389',
      supply: '214'
    },
    {
      id: 2,
      name: 'johnbubu',
      fullName: 'labubu joh...',
      time: '19h',
      marketCap: '$1.29M',
      marketCapChange: '+2.062%',
      liquidity: '$74.6K',
      volume: '$26K',
      txns: '124',
      buyTxns: '68',
      sellTxns: '56',
      buyTax: '16.3%',
      sellTax: '6.27%',
      totalTax: '4.77%',
      paid: true,
      paidAmount: '0%',
      holders: '3925',
      supply: '833'
    },
    {
      id: 3,
      name: 'Gonk',
      fullName: 'Gonk',
      time: '5m',
      marketCap: '$57.5K',
      marketCapChange: '-24.2%',
      liquidity: '$15.9K',
      volume: '$12.9K',
      txns: '181',
      buyTxns: '91',
      sellTxns: '90',
      buyTax: '28.79%',
      sellTax: '0.07%',
      totalTax: '2.02%',
      paid: false,
      paidAmount: '0%',
      holders: '442',
      supply: '221'
    },
    {
      id: 4,
      name: 'O',
      fullName: 'Odotexchange',
      time: '17s',
      marketCap: '$12.9K',
      marketCapChange: '+7.893%',
      liquidity: '$8.6K',
      volume: '$6.38K',
      txns: '36',
      buyTxns: '28',
      sellTxns: '8',
      buyTax: '27.74%',
      sellTax: '0%',
      totalTax: '23.14%',
      paid: false,
      paidAmount: '23.14%',
      holders: '23',
      supply: '14'
    },
    {
      id: 5,
      name: 'dogshit',
      fullName: 'dogshit',
      time: '11m',
      marketCap: '$34.1K',
      marketCapChange: '+8.368%',
      liquidity: '$13.7K',
      volume: '$1.34K',
      txns: '24',
      buyTxns: '18',
      sellTxns: '6',
      buyTax: '25.74%',
      sellTax: '0%',
      totalTax: '25.74%',
      paid: false,
      paidAmount: '25.74%',
      holders: '89',
      supply: '45'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cyphr-white mb-2 font-nulshock">Discover</h1>
        <p className="text-cyphr-gray">Find the latest trending tokens and opportunities</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Tabs */}
        <div className="flex rounded-2xl p-2 border border-cyphr-gray/30 premium-nav">
          {['trending', 'new', 'top', 'watchlist'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 premium-nav-button ${
                activeTab === tab
                  ? 'text-cyphr-black active'
                  : 'text-cyphr-gray hover:text-cyphr-white'
              }`}
            >
              <span className="capitalize transition-transform duration-300 hover:scale-105">{tab}</span>
            </button>
          ))}
        </div>

        {/* Timeframes */}
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
        
        {/* Filter Button */}
        <div className="flex gap-2 ml-4">
          <button className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 premium-nav-button text-cyphr-gray hover:text-cyphr-white flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-6.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
            </svg>
            <span>Filter</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="elite-button px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 text-cyphr-gray flex items-center">
            <img src="/SearchIcon.png" alt="Search" className="w-4 h-4" style={{ marginRight: '8px' }} />
            Search
          </button>
          <button className="elite-button px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 text-cyphr-gray flex items-center">
            <img src="/WatchlistStar.png" alt="Watchlist" className="w-4 h-4" style={{ marginRight: '8px' }} />
            Watchlist
          </button>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="elite-glass-card overflow-hidden animate-slide-up shadow-elite">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyphr-gray/20">
                <th className="px-6 py-4 text-left text-cyphr-teal font-semibold text-sm">Token</th>
                <th className="px-6 py-4 text-left text-cyphr-teal font-semibold text-sm">Market Cap</th>
                <th className="px-6 py-4 text-left text-cyphr-teal font-semibold text-sm">Liquidity</th>
                <th className="px-6 py-4 text-left text-cyphr-teal font-semibold text-sm">Volume</th>
                <th className="px-6 py-4 text-left text-cyphr-teal font-semibold text-sm">Txns</th>
                <th className="px-6 py-4 text-left text-cyphr-teal font-semibold text-sm">Tax</th>
                <th className="px-6 py-4 text-left text-cyphr-teal font-semibold text-sm">Paid</th>
                <th className="px-6 py-4 text-left text-cyphr-teal font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockTokens.map((token) => (
                <tr key={token.id} className="border-b border-cyphr-gray/10 hover:bg-cyphr-gray/5 transition-colors duration-300">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyphr-teal to-cyphr-pink rounded-full flex items-center justify-center text-cyphr-black font-bold text-sm">
                        {token.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-cyphr-white font-semibold text-sm">{token.name}</div>
                        <div className="text-cyphr-gray text-xs">{token.fullName}</div>
                        <div className="text-cyphr-gray text-xs">{token.time} ago</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-cyphr-white font-semibold text-sm">{token.marketCap}</div>
                    <div className={`text-xs ${token.marketCapChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {token.marketCapChange}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-cyphr-white text-sm">{token.liquidity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-cyphr-white text-sm">{token.volume}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-cyphr-white text-sm">{token.txns}</div>
                    <div className="text-cyphr-gray text-xs">
                      {token.buyTxns} buy / {token.sellTxns} sell
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-cyphr-white text-sm">{token.totalTax}</div>
                    <div className="text-cyphr-gray text-xs">
                      {token.buyTax} / {token.sellTax}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      token.paid 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {token.paid ? '✓' : '✗'} {token.paidAmount}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link 
                        to={`/token/${token.id}`}
                        className="cyphr-button-primary px-3 py-1 text-xs font-semibold transition-all duration-300 hover:scale-105 no-underline"
                      >
                        View
                      </Link>
                      <button className="cyphr-button px-3 py-1 text-xs font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center">
                        <img src="/WatchlistStar.png" alt="Watchlist" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Discover; 