import React, { useState } from 'react';

const Portfolio: React.FC = () => {
  const [activeTab, setActiveTab] = useState('wallets');
  const [searchQuery, setSearchQuery] = useState('');

  const wallets = [
    {
      id: 1,
      name: 'Axiom Main',
      address: 'TzKG...h4W9',
      balance: '2.47',
      holdings: '12',
      color: '#ff6b35'
    },
    {
      id: 2,
      name: 'Trading Wallet',
      address: 'Ax7K...mN3P',
      balance: '1.23',
      holdings: '8',
      color: '#6D8FC7'
    },
    {
      id: 3,
      name: 'Staking Pool',
      address: 'Bx9L...qR5T',
      balance: '0.89',
      holdings: '5',
      color: '#bd496f'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyphr-white mb-2">Portfolio</h1>
        <p className="text-cyphr-gray">Manage your wallets and track your investments</p>
      </div>

      {/* Navigation and Wallet Info */}
      <div className="flex items-center justify-between mb-8">
        {/* Tabs */}
        <div className="flex rounded-lg p-1 border border-cyphr-gray/30 cyphr-nav"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)',
          }}
        >
          {['spot', 'wallets', 'perpetuals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? 'text-cyphr-black shadow-lg'
                  : 'text-cyphr-gray hover:text-cyphr-white'
              }`}
              style={{
                background: activeTab === tab 
                  ? 'linear-gradient(135deg, rgba(45,186,161,1) 0%, rgba(45,186,161,0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(20,20,20,0.7) 100%)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(45,186,161,0.2)',
              }}
            >
              <span className="capitalize transition-transform duration-300 hover:scale-105">{tab}</span>
            </button>
          ))}
        </div>

        {/* Wallet Info */}
        <div className="flex items-center gap-3">
          <span className="text-cyphr-white font-sf-pro text-base font-semibold">Axiom Main</span>
          <span className="text-cyphr-teal text-lg">💰</span>
          <span className="text-cyphr-white font-sf-pro text-base font-semibold">2.47 SOL</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Panel - Wallet List */}
        <div className="cyphr-card p-6 rounded-xl animate-slide-up"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
            border: '1px solid rgba(45,186,161,0.2)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">👛</span>
              Wallets
            </h3>
            <button className="cyphr-button-primary px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105">
              <span className="mr-2">+</span>
              Add Wallet
            </button>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cyphr-input w-full text-sm"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyphr-gray">🔍</span>
            </div>
          </div>

          {/* Wallet List */}
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center justify-between p-4 rounded-lg border border-cyphr-gray/20 hover:border-cyphr-teal/30 transition-all duration-300 cursor-pointer group"
                style={{
                  background: 'linear-gradient(135deg, rgba(45,186,161,0.05) 0%, rgba(189,73,111,0.05) 100%)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: wallet.color }}
                  >
                    {wallet.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-cyphr-white font-semibold text-sm">{wallet.name}</div>
                    <div className="text-cyphr-gray text-xs">{wallet.address}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-cyphr-white font-semibold text-sm">{wallet.balance} SOL</div>
                  <div className="text-cyphr-gray text-xs">{wallet.holdings} holdings</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Portfolio Overview */}
        <div className="space-y-6">
          {/* Total Value Card */}
          <div className="cyphr-card p-6 rounded-xl animate-slide-up"
            style={{
              background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
              border: '1px solid rgba(45,186,161,0.2)',
              boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">📊</span>
                Total Value
              </h3>
              <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-sm hover:scale-110">▼</button>
            </div>
            <div className="text-3xl font-bold text-cyphr-white mb-2">$4.59</div>
            <div className="text-green-500 text-sm">+12.5% (24h)</div>
          </div>

          {/* Recent Activity */}
          <div className="cyphr-card p-6 rounded-xl animate-slide-up"
            style={{
              background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
              border: '1px solid rgba(45,186,161,0.2)',
              boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">⚡</span>
                Recent Activity
              </h3>
              <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-sm hover:scale-110">▼</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyphr-teal to-cyphr-pink rounded-full flex items-center justify-center text-white text-xs font-bold">
                    B
                  </div>
                  <div>
                    <div className="text-cyphr-white font-medium">Bought BONK</div>
                    <div className="text-cyphr-gray text-xs">2 hours ago</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-cyphr-white font-medium">+$0.23</div>
                  <div className="text-green-500 text-xs">+15.2%</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyphr-pink to-cyphr-teal rounded-full flex items-center justify-center text-white text-xs font-bold">
                    S
                  </div>
                  <div>
                    <div className="text-cyphr-white font-medium">Sold PEPE</div>
                    <div className="text-cyphr-gray text-xs">5 hours ago</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-cyphr-white font-medium">-$0.12</div>
                  <div className="text-red-500 text-xs">-8.7%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="cyphr-card p-6 rounded-xl animate-slide-up"
            style={{
              background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
              border: '1px solid rgba(45,186,161,0.2)',
              boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">📈</span>
                Performance
              </h3>
              <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-sm hover:scale-110">▼</button>
            </div>
            <div className="h-32 bg-gradient-to-r from-cyphr-teal/20 to-cyphr-pink/20 rounded-lg flex items-center justify-center">
              <div className="text-cyphr-gray text-sm">Chart placeholder</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio; 