import React, { useState } from 'react';

const Spot: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [activeTimeframe, setActiveTimeframe] = useState('max');

  const timeframes = ['1d', '7d', '30d', 'max'];

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Page Header with Sub-Navigation */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex bg-cyphr-dark-gray rounded-lg p-1 border border-cyphr-gray/30"
            style={{
              background: 'linear-gradient(135deg, rgba(45,186,161,0.06) 0%, rgba(189,73,111,0.06) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {['spot', 'wallets', 'perpetuals'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-cyphr-teal text-cyphr-black shadow-lg'
                    : 'text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray/20'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search for other wallets..."
              className="px-3 py-2 rounded-lg border border-cyphr-gray/30 focus:border-cyphr-teal transition-all duration-200 bg-cyphr-black/30 text-cyphr-white placeholder-cyphr-gray"
              style={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            />
            <button className="text-cyphr-gray hover:text-cyphr-white transition-colors p-1 rounded hover:bg-cyphr-black/30">
              ⤢
            </button>
            <button className="text-cyphr-gray hover:text-cyphr-white transition-colors p-1 rounded hover:bg-cyphr-black/30">
              🔍+
            </button>
            <button className="text-cyphr-gray hover:text-cyphr-white transition-colors p-1 rounded hover:bg-cyphr-black/30">
              🔍-
            </button>
            <div className="flex gap-1">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all duration-200 ${
                    activeTimeframe === tf
                      ? 'bg-cyphr-teal text-cyphr-black shadow-lg'
                      : 'bg-cyphr-black/30 text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray/20 border border-cyphr-gray/20'
                  }`}
                  style={{
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Left Panel - Balance Overview */}
        <div className="cyphr-card p-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
            border: '1px solid rgba(45,186,161,0.2)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
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
        <div className="cyphr-card p-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
            border: '1px solid rgba(45,186,161,0.2)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
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
        <div className="cyphr-card p-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
            border: '1px solid rgba(45,186,161,0.2)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
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
        <div className="flex bg-cyphr-dark-gray rounded-lg p-1 border border-cyphr-gray/30"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.06) 0%, rgba(189,73,111,0.06) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {['active positions', 'history', 'top 100'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-cyphr-teal text-cyphr-black shadow-lg'
                  : 'text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray/20'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search by name or address"
            className="px-3 py-2 rounded-lg border border-cyphr-gray/30 focus:border-cyphr-teal transition-all duration-200 bg-cyphr-black/30 text-cyphr-white placeholder-cyphr-gray"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
          <button className="px-3 py-2 rounded-md text-xs font-semibold bg-cyphr-black/30 text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray/20 border border-cyphr-gray/20 transition-all duration-200"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            Show Hidden
          </button>
          <button className="px-3 py-2 rounded-md text-xs font-semibold bg-cyphr-black/30 text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray/20 border border-cyphr-gray/20 transition-all duration-200"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            ↑↓ USD
          </button>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Active Positions Table */}
          <div className="cyphr-card p-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
              border: '1px solid rgba(45,186,161,0.2)',
              boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
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
          <div className="cyphr-card p-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
              border: '1px solid rgba(45,186,161,0.2)',
              boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
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