import React, { useState } from 'react';

const Spot: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [activeTimeframe, setActiveTimeframe] = useState('max');

  const timeframes = ['1d', '7d', '30d', 'max'];

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cyphr-white mb-2 font-nulshock">Spot Trading</h1>
        <p className="text-cyphr-gray">Manage your spot positions and trading history</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Tabs */}
        <div className="flex rounded-2xl p-2 border border-cyphr-gray/30 premium-nav">
          {['spot', 'wallets', 'perpetuals'].map((tab) => (
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
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 premium-nav-button ${
                activeTimeframe === tf
                  ? 'text-cyphr-black active'
                  : 'text-cyphr-gray hover:text-cyphr-white'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="elite-button px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 text-cyphr-gray flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            Search
          </button>
          <button className="elite-button px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 text-cyphr-gray flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-6.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Left Panel - Balance Overview */}
        <div className="elite-glass-card p-4 rounded-xl shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-bold text-cyphr-white text-base mb-1">Axiom Main</div>
              <div className="text-cyphr-gray text-sm">2.47</div>
            </div>
            <span className="text-cyphr-gray">▼</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-cyphr-gray text-sm mb-1 font-semibold">Balance</div>
              <div className="text-cyphr-white font-bold text-base">Total Value: <span className="text-cyphr-teal">$89.47</span></div>
            </div>
            <div>
              <div className="text-cyphr-white font-bold text-base">Unrealized PNL: <span className="text-cyphr-teal">+$12.34</span></div>
            </div>
            <div>
              <div className="text-cyphr-white font-bold text-base">Available Balance: <span className="text-cyphr-teal">$77.13</span></div>
            </div>
          </div>
        </div>

        {/* Middle Panel - Realized PNL Chart */}
        <div className="elite-glass-card p-4 rounded-xl shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Realized PNL</h3>
          </div>
          <div className="h-40 bg-gradient-to-br from-cyphr-pink/5 to-cyphr-teal/5 rounded-lg flex items-center justify-center relative border border-cyphr-gray/20">
            {/* Triangular chart area with gradient fill */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-cyphr-pink/20 via-cyphr-pink/10 to-transparent transform rotate-12 rounded-lg"></div>
            </div>
            {/* Pink diagonal line */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyphr-pink to-transparent transform rotate-12"></div>
            </div>
            <div className="absolute bottom-3 left-3 text-cyphr-gray text-xl">📊</div>
          </div>
        </div>

        {/* Right Panel - Performance Summary */}
        <div className="elite-glass-card p-4 rounded-xl shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Performance</h3>
            <button className="text-cyphr-gray hover:text-cyphr-teal transition-colors p-1 rounded hover:bg-cyphr-black/30">📤</button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-cyphr-white font-bold text-base">Total PNL: <span className="text-cyphr-teal">+$23.67</span></div>
            </div>
            <div>
              <div className="text-cyphr-white font-bold text-base">Total TXNS: <span className="text-cyphr-teal">47 / 23</span></div>
            </div>

            <div className="space-y-2">
              <div className="text-cyphr-gray text-sm font-semibold">PNL Distribution</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-cyphr-gray">🟢 &gt;500%</span>
                  <span className="text-cyphr-white font-semibold">3</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cyphr-gray">🟢 200% ~ 500%</span>
                  <span className="text-cyphr-white font-semibold">8</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cyphr-gray">🟢 0% ~ 200%</span>
                  <span className="text-cyphr-white font-semibold">12</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cyphr-gray">🔴 0% ~ -50%</span>
                  <span className="text-cyphr-white font-semibold">4</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cyphr-gray">🔴 &lt; -50%</span>
                  <span className="text-cyphr-white font-semibold">2</span>
                </div>
              </div>
              {/* Performance bar representing the distribution */}
              <div className="w-full h-1 bg-cyphr-black/30 rounded-full mt-2 border border-cyphr-gray/20">
                <div className="w-4/5 h-1 bg-gradient-to-r from-cyphr-teal to-cyphr-pink rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Positions and Activity */}
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex rounded-2xl p-2 border border-cyphr-gray/30 premium-nav">
          {['active positions', 'history', 'top 100'].map((tab) => (
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

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search by name or address"
            className="elite-input px-3 py-2 rounded-lg border border-cyphr-gray/30 focus:border-cyphr-teal text-cyphr-white placeholder-cyphr-gray"
          />
          <button className="elite-button px-3 py-2 rounded-lg text-xs font-semibold text-cyphr-gray hover:text-cyphr-white transition-all duration-200">
            Show Hidden
          </button>
          <button className="elite-button px-3 py-2 rounded-lg text-xs font-semibold text-cyphr-gray hover:text-cyphr-white transition-all duration-200">
            ↑↓ USD
          </button>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Active Positions Table */}
          <div className="elite-glass-card p-4 rounded-xl shadow-elite">
            <div className="overflow-hidden rounded-lg border border-cyphr-gray/20">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyphr-gray/20 bg-cyphr-black/30">
                    <th className="px-3 py-2 text-left text-cyphr-teal font-bold text-xs tracking-wide">Token</th>
                    <th className="px-3 py-2 text-left text-cyphr-teal font-bold text-xs tracking-wide">Bought</th>
                    <th className="px-3 py-2 text-left text-cyphr-teal font-bold text-xs tracking-wide">Sold</th>
                    <th className="px-3 py-2 text-left text-cyphr-teal font-bold text-xs tracking-wide">Remaining ↓</th>
                    <th className="px-3 py-2 text-left text-cyphr-teal font-bold text-xs tracking-wide">PNL</th>
                    <th className="px-3 py-2 text-left text-cyphr-teal font-bold text-xs tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-cyphr-gray/10">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-cyphr-teal to-cyphr-pink rounded-md flex items-center justify-center text-cyphr-black font-bold text-xs">S</div>
                        <div>
                          <div className="font-bold text-cyphr-white text-xs">SOL</div>
                          <div className="text-cyphr-gray text-xs">Solana</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">$45.20</td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">$23.10</td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">$22.10</td>
                    <td className="px-3 py-2 text-cyphr-teal text-xs font-semibold">+$12.34</td>
                    <td className="px-3 py-2">
                      <button className="px-2 py-1 rounded text-xs font-semibold bg-cyphr-teal text-cyphr-black">Close</button>
                    </td>
                  </tr>
                  <tr className="border-b border-cyphr-gray/10">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-cyphr-pink to-cyphr-teal rounded-md flex items-center justify-center text-cyphr-black font-bold text-xs">B</div>
                        <div>
                          <div className="font-bold text-cyphr-white text-xs">BONK</div>
                          <div className="text-cyphr-gray text-xs">Bonk</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">$12.50</td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">$0</td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">$12.50</td>
                    <td className="px-3 py-2 text-cyphr-teal text-xs font-semibold">+$8.90</td>
                    <td className="px-3 py-2">
                      <button className="px-2 py-1 rounded text-xs font-semibold bg-cyphr-teal text-cyphr-black">Close</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Table */}
          <div className="elite-glass-card p-4 rounded-xl shadow-elite">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyphr-teal font-nulshock text-base font-semibold">Activity</h3>
            </div>
            <div className="overflow-hidden rounded-lg border border-cyphr-gray/20">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyphr-gray/20 bg-cyphr-black/30">
                    <th className="px-3 py-2 text-left text-cyphr-teal font-bold text-xs tracking-wide">Type</th>
                    <th className="px-3 py-2 text-left text-cyphr-teal font-bold text-xs tracking-wide">Token</th>
                    <th className="px-3 py-2 text-left text-cyphr-teal font-bold text-xs tracking-wide">Amount ⓘ</th>
                    <th className="px-3 py-2 text-left text-cyphr-teal font-bold text-xs tracking-wide">Market Cap ⓘ</th>
                    <th className="px-3 py-2 text-left text-cyphr-teal font-bold text-xs tracking-wide">Age</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-cyphr-gray/10">
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-cyphr-teal/20 text-cyphr-teal">BUY</span>
                    </td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">SOL</td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">$45.20</td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">$12.5B</td>
                    <td className="px-3 py-2 text-cyphr-gray text-xs">2h ago</td>
                  </tr>
                  <tr className="border-b border-cyphr-gray/10">
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-cyphr-pink/20 text-cyphr-pink">SELL</span>
                    </td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">BONK</td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">$23.10</td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">$890M</td>
                    <td className="px-3 py-2 text-cyphr-gray text-xs">4h ago</td>
                  </tr>
                  <tr className="border-b border-cyphr-gray/10">
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-cyphr-teal/20 text-cyphr-teal">BUY</span>
                    </td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">BONK</td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">$12.50</td>
                    <td className="px-3 py-2 text-cyphr-white text-xs">$890M</td>
                    <td className="px-3 py-2 text-cyphr-gray text-xs">6h ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spot; 