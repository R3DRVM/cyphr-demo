import React, { useState, useEffect } from 'react';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  type: 'central' | 'connected' | 'scattered';
  isCentral: boolean;
}

const Tracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ai-insights');
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const navItems = [
    { name: 'Trades', icon: '☰', path: 'trades' },
    { name: 'My Holdings', icon: '💰', path: 'holdings' },
    { name: 'Token Details', icon: '⭐', path: 'details' },
    { name: 'AI Insights', icon: '🤖', path: 'ai-insights' },
    { name: 'Bubble Map', icon: '🌐', path: 'bubble' }
  ];

  // Token database with different bubble configurations for each token
  const tokenDatabase = {
    USDC: {
      name: 'USD Coin',
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDtlv',
      bubbleConfig: {
        centralSize: 80,
        clusters: {
          yellow: { count: 8, sizeRange: [20, 45], position: { x: [20, 80], y: [30, 70] } },
          purple: { count: 6, sizeRange: [18, 40], position: { x: [60, 90], y: [10, 50] } },
          pink: { count: 4, sizeRange: [15, 35], position: { x: [10, 40], y: [60, 90] } },
          blue: { count: 5, sizeRange: [16, 38], position: { x: [70, 95], y: [60, 90] } }
        },
        scattered: { count: 35, sizeRange: [6, 18] }
      }
    },
    SOL: {
      name: 'Solana',
      address: 'So11111111111111111111111111111111111111112',
      bubbleConfig: {
        centralSize: 85,
        clusters: {
          yellow: { count: 10, sizeRange: [22, 48], position: { x: [15, 85], y: [25, 75] } },
          purple: { count: 7, sizeRange: [20, 42], position: { x: [55, 95], y: [5, 55] } },
          pink: { count: 6, sizeRange: [18, 38], position: { x: [5, 45], y: [55, 95] } },
          blue: { count: 6, sizeRange: [19, 40], position: { x: [65, 95], y: [55, 95] } }
        },
        scattered: { count: 40, sizeRange: [6, 20] }
      }
    },
    ETH: {
      name: 'Ethereum',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      bubbleConfig: {
        centralSize: 90,
        clusters: {
          yellow: { count: 12, sizeRange: [25, 50], position: { x: [10, 90], y: [20, 80] } },
          purple: { count: 8, sizeRange: [22, 45], position: { x: [50, 95], y: [5, 60] } },
          pink: { count: 7, sizeRange: [20, 42], position: { x: [5, 50], y: [50, 95] } },
          blue: { count: 8, sizeRange: [21, 44], position: { x: [55, 95], y: [50, 95] } }
        },
        scattered: { count: 45, sizeRange: [6, 22] }
      }
    },
    BONK: {
      name: 'Bonk',
      address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      bubbleConfig: {
        centralSize: 70,
        clusters: {
          yellow: { count: 6, sizeRange: [18, 38], position: { x: [30, 70], y: [35, 65] } },
          purple: { count: 4, sizeRange: [16, 32], position: { x: [65, 85], y: [20, 50] } },
          pink: { count: 3, sizeRange: [14, 30], position: { x: [20, 50], y: [65, 85] } },
          blue: { count: 4, sizeRange: [15, 34], position: { x: [65, 85], y: [65, 85] } }
        },
        scattered: { count: 25, sizeRange: [6, 16] }
      }
    },
    PEPE: {
      name: 'Pepe',
      address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
      bubbleConfig: {
        centralSize: 75,
        clusters: {
          yellow: { count: 7, sizeRange: [20, 40], position: { x: [25, 75], y: [30, 70] } },
          purple: { count: 5, sizeRange: [18, 35], position: { x: [60, 90], y: [15, 55] } },
          pink: { count: 4, sizeRange: [16, 32], position: { x: [15, 50], y: [60, 90] } },
          blue: { count: 5, sizeRange: [17, 36], position: { x: [65, 90], y: [60, 90] } }
        },
        scattered: { count: 30, sizeRange: [6, 18] }
      }
    },
    DOGE: {
      name: 'Dogecoin',
      address: '0x3832d2F059E559F2088cd4e4d0d24290818Bbe3B',
      bubbleConfig: {
        centralSize: 65,
        clusters: {
          yellow: { count: 5, sizeRange: [16, 32], position: { x: [35, 65], y: [40, 60] } },
          purple: { count: 3, sizeRange: [14, 28], position: { x: [65, 85], y: [25, 55] } },
          pink: { count: 3, sizeRange: [12, 26], position: { x: [25, 55], y: [65, 85] } },
          blue: { count: 3, sizeRange: [15, 30], position: { x: [65, 85], y: [65, 85] } }
        },
        scattered: { count: 20, sizeRange: [6, 14] }
      }
    }
  };

  const handleTokenSelect = (token: string) => {
    setSelectedToken(token);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const generateBubbles = (token: string): Bubble[] => {
    const bubbles: Bubble[] = [];
    let id = 1;

    // Central hub
    bubbles.push({
      id: id++,
      x: 50,
      y: 50,
      size: 100,
      color: '#6D8FC7',
      type: 'central',
      isCentral: true
    });

    // Generate connected nodes in clusters - Simplified for visibility
    const clusterTypes = ['yellow', 'purple', 'pink', 'blue'];
    clusterTypes.forEach((clusterType, clusterIndex) => {
      const clusterCount = 3; // Fixed number for testing
      const clusterAngle = (clusterIndex * 90) + 15; // Fixed angles
      const clusterRadius = 120; // Fixed radius
      
      for (let i = 0; i < clusterCount; i++) {
        const angle = clusterAngle + (i - 1) * 20;
        const radius = clusterRadius;
        
        const x = 50 + Math.cos(angle * Math.PI / 180) * radius;
        const y = 50 + Math.sin(angle * Math.PI / 180) * radius;
        
        const size = 40; // Fixed size for testing
        const color = getColorForCluster(clusterType);
        
        bubbles.push({
          id: id++,
          x: Math.max(10, Math.min(90, x)),
          y: Math.max(10, Math.min(90, y)),
          size,
          color,
          type: 'connected',
          isCentral: false
        });
      }
    });

    // Add some scattered nodes
    for (let i = 0; i < 6; i++) {
      let x: number, y: number;
      let attempts = 0;
      const maxAttempts = 15;
      
      do {
        x = Math.random() * 84 + 8; // 8-92%
        y = Math.random() * 84 + 8; // 8-92%
        attempts++;
      } while (attempts < maxAttempts && bubbles.some(b => 
        Math.sqrt(Math.pow(b.x - x, 2) + Math.pow(b.y - y, 2)) < 35
      ));
      
      const size = 20 + Math.random() * 25; // Larger scattered bubbles
      const isWhite = Math.random() > 0.7;
      
      bubbles.push({
        id: id++,
        x,
        y,
        size,
        color: isWhite ? '#FFFFFF' : '#E5E7EB',
        type: 'scattered',
        isCentral: false
      });
    }

    return bubbles;
  };

  const getColorForCluster = (clusterType: string) => {
    const colors = {
      yellow: ['#facc15', '#fde047', '#fef08a'],
      purple: ['#c084fc', '#d8b4fe', '#e9d5ff'],
      pink: ['#f472b6', '#f9a8d4', '#fbcfe8'],
      blue: ['#60a5fa', '#93c5fd', '#bfdbfe']
    };
    return colors[clusterType as keyof typeof colors]?.[Math.floor(Math.random() * 3)] || '#ffffff';
  };

  useEffect(() => {
    setSelectedToken('USDC');
  }, []);

  const currentBubbles = generateBubbles(selectedToken);
  
  // Debug: Log bubble data
  console.log('Generated bubbles:', currentBubbles);
  console.log('Bubble count:', currentBubbles.length);
  console.log('Connected bubbles:', currentBubbles.filter(b => b.type === 'connected').length);

  return (
    <div className="max-w-7xl mx-auto p-8 animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="flex rounded-lg p-1 border border-cyphr-gray/30 mb-6 cyphr-nav"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)',
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => setActiveTab(item.path)}
            className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-semibold transition-all duration-300 ${
              activeTab === item.path
                ? 'text-cyphr-black shadow-lg'
                : 'text-cyphr-gray hover:text-cyphr-white'
            }`}
            style={{
              background: activeTab === item.path 
                ? 'linear-gradient(135deg, rgba(109,143,199,1) 0%, rgba(109,143,199,0.9) 100%)'
                : 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(20,20,20,0.7) 100%)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(109,143,199,0.2)',
            }}
          >
            <span className="transition-transform duration-300 hover:scale-105">{item.name}</span>
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="space-y-8">
        {/* Top Row - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - AI Insights + Liquidity Events */}
          <div className="space-y-5">
            {/* AI Summary Card */}
            <div className="cyphr-card p-6 rounded-lg mb-6 animate-slide-up"
              style={{
                background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
                border: '1px solid rgba(45,186,161,0.2)',
                boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                minHeight: '120px',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyphr-teal font-sf-pro text-sm font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                  AI Summary
                </h3>
                <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
              <p className="text-cyphr-white text-xs leading-relaxed">
                This token shows <span className="text-cyphr-teal font-medium">medium risk</span>. Liquidity is mostly unlocked, and deployer has a 60% migration rate. 40% of supply is held by 3 wallets, 2 of which are new.
              </p>
            </div>

            {/* Risk Level Card - Much Smaller */}
            <div className="cyphr-card p-4 rounded-lg mb-6 flex items-center gap-3 animate-slide-up"
              style={{
                background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
                border: '1px solid rgba(45,186,161,0.2)',
                boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                minHeight: '60px',
              }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-cyphr-teal" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span className="text-cyphr-teal font-sf-pro text-sm font-semibold">Risk Level:</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyphr-teal rounded-full animate-pulse"></div>
                <span className="text-cyphr-white text-sm font-medium">Medium</span>
              </div>
            </div>

            {/* Pool Overview Card */}
            <div className="cyphr-card p-6 rounded-lg mb-6 animate-slide-up"
              style={{
                background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
                border: '1px solid rgba(45,186,161,0.2)',
                boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                minHeight: '120px',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyphr-teal font-sf-pro text-sm font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  Pool Overview
                </h3>
                <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-cyphr-gray">Liquidity:</span>
                  <span className="text-cyphr-white">$2.4M</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cyphr-gray">Volume 24h:</span>
                  <span className="text-cyphr-white">$890K</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cyphr-gray">Holders:</span>
                  <span className="text-cyphr-white">1,247</span>
                </div>
              </div>
            </div>

            {/* Liquidity Events Card */}
            <div className="cyphr-card p-6 rounded-lg mb-6 animate-slide-up"
              style={{
                background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
                border: '1px solid rgba(45,186,161,0.2)',
                boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                minHeight: '160px',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyphr-teal font-sf-pro text-sm font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                  </svg>
                  Liquidity Events
                </h3>
                <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyphr-gray">Recent Add:</span>
                  <span className="text-green-500">+$450K</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyphr-gray">Recent Remove:</span>
                  <span className="text-red-500">-$120K</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyphr-gray">Net Change:</span>
                  <span className="text-cyphr-teal">+$330K</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Who's In Card */}
            <div className="cyphr-card p-6 rounded-lg mb-6 animate-slide-up"
              style={{
                background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
                border: '1px solid rgba(45,186,161,0.2)',
                boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                minHeight: '140px',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyphr-teal font-sf-pro text-sm font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 00-8 8c0 1.5.4 2.9 1.1 4.1a1 1 0 00.8.3h13.4a1 1 0 00.8-.3C17.6 13.9 18 12.5 18 11a8 8 0 00-8-8zm0 14a6 6 0 100-12 6 6 0 000 12zm-3-5a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                  </svg>
                  Who's In
                </h3>
                <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyphr-gray">Top Holder:</span>
                  <span className="text-cyphr-white">15.2%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyphr-gray">Top 10:</span>
                  <span className="text-cyphr-white">42.8%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyphr-gray">New Wallets:</span>
                  <span className="text-cyphr-teal">67%</span>
                </div>
              </div>
            </div>

            {/* Deployer Insights Card */}
            <div className="cyphr-card p-6 rounded-lg mb-6 animate-slide-up"
              style={{
                background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
                border: '1px solid rgba(45,186,161,0.2)',
                boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                minHeight: '140px',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyphr-teal font-sf-pro text-sm font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 00-8 8c0 1.5.4 2.9 1.1 4.1a1 1 0 00.8.3h13.4a1 1 0 00.8-.3C17.6 13.9 18 12.5 18 11a8 8 0 00-8-8zm0 14a6 6 0 100-12 6 6 0 000 12zm-3-5a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                  </svg>
                  Deployer Insights
                </h3>
                <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyphr-gray">Migration Rate:</span>
                  <span className="text-cyphr-white">60%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyphr-gray">Success Rate:</span>
                  <span className="text-green-500">78%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyphr-gray">Avg Hold Time:</span>
                  <span className="text-cyphr-white">3.2 days</span>
                </div>
              </div>
            </div>

            {/* Historical Liquidity Events Card */}
            <div className="cyphr-card p-6 rounded-lg mb-6 animate-slide-up"
              style={{
                background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
                border: '1px solid rgba(45,186,161,0.2)',
                boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                minHeight: '180px',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyphr-teal font-sf-pro text-sm font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 00-8 8c0 1.5.4 2.9 1.1 4.1a1 1 0 00.8.3h13.4a1 1 0 00.8-.3C17.6 13.9 18 12.5 18 11a8 8 0 00-8-8zm0 14a6 6 0 100-12 6 6 0 000 12zm-3-5a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                  </svg>
                  Historical Liquidity Events
                </h3>
                <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-cyphr-gray">2h ago:</span>
                  <span className="text-green-500">+$120K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyphr-gray">4h ago:</span>
                  <span className="text-red-500">-$80K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyphr-gray">6h ago:</span>
                  <span className="text-green-500">+$200K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyphr-gray">8h ago:</span>
                  <span className="text-red-500">-$150K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyphr-gray">12h ago:</span>
                  <span className="text-green-500">+$300K</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bubble Map Section */}
        <div className="cyphr-card p-6 rounded-lg animate-slide-up"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.08) 0%, rgba(189,73,111,0.08) 100%)',
            border: '1px solid rgba(45,186,161,0.2)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-sf-pro text-sm font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 00-8 8c0 1.5.4 2.9 1.1 4.1a1 1 0 00.8.3h13.4a1 1 0 00.8-.3C17.6 13.9 18 12.5 18 11a8 8 0 00-8-8zm0 14a6 6 0 100-12 6 6 0 000 12zm-3-5a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
              </svg>
              Bubble Map
            </h3>
            <div className="flex items-center gap-2">
              <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs hover:scale-110">1H</button>
              <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs hover:scale-110">24H</button>
              <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs hover:scale-110">7D</button>
            </div>
          </div>

          {/* Token Selection */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cyphr-input w-64 text-sm"
              />
              {showDropdown && (
                <div className="absolute top-full left-0 w-64 bg-cyphr-black/90 border border-cyphr-gray/30 rounded-lg mt-1 z-10 backdrop-blur-md">
                  {Object.keys(tokenDatabase).map((token) => (
                    <button
                      key={token}
                      onClick={() => handleTokenSelect(token)}
                      className="w-full text-left px-4 py-2 text-sm text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray/20 transition-colors"
                    >
                      {token} - {tokenDatabase[token as keyof typeof tokenDatabase].name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {Object.keys(tokenDatabase).slice(0, 6).map((token) => (
                <button
                  key={token}
                  onClick={() => handleTokenSelect(token)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                    selectedToken === token
                      ? 'bg-cyphr-teal text-cyphr-black'
                      : 'bg-cyphr-gray/20 text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray/30'
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* Bubble Map Container */}
          <div className="relative w-full h-96 rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(109,143,199,0.08) 0%, rgba(189,73,111,0.08) 100%)',
              border: '1px solid rgba(109,143,199,0.3)',
              boxShadow: '0 8px 32px 0 rgba(109,143,199,0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {/* Token Info Overlay */}
            <div className="absolute top-4 left-4 z-20 bg-cyphr-black/80 backdrop-blur-md rounded-lg p-3 border border-cyphr-gray/30">
              <div className="text-cyphr-white text-sm font-semibold">{selectedToken}</div>
              <div className="text-cyphr-gray text-xs">{tokenDatabase[selectedToken as keyof typeof tokenDatabase]?.name}</div>
            </div>

            {/* Time Range Buttons */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button className="px-3 py-1 bg-cyphr-black/80 backdrop-blur-md rounded-lg text-xs text-cyphr-white border border-cyphr-gray/30 hover:bg-cyphr-gray/20 transition-all duration-300">1H</button>
              <button className="px-3 py-1 bg-cyphr-black/80 backdrop-blur-md rounded-lg text-xs text-cyphr-white border border-cyphr-gray/30 hover:bg-cyphr-gray/20 transition-all duration-300">24H</button>
              <button className="px-3 py-1 bg-cyphr-black/80 backdrop-blur-md rounded-lg text-xs text-cyphr-white border border-cyphr-gray/30 hover:bg-cyphr-gray/20 transition-all duration-300">7D</button>
            </div>

            {/* SVG for Network Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(109,143,199,0.9)" />
                  <stop offset="50%" stopColor="rgba(109,143,199,0.5)" />
                  <stop offset="100%" stopColor="rgba(109,143,199,0.1)" />
                </linearGradient>
                <radialGradient id="bubbleGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(109,143,199,0.4)" />
                  <stop offset="100%" stopColor="rgba(109,143,199,0)" />
                </radialGradient>
              </defs>
              
              {/* Central hub glow effect */}
              <circle
                cx="50%"
                cy="50%"
                r="80"
                fill="url(#bubbleGlow)"
                opacity="0.7"
              />
              
              {/* Main network connections */}
              {currentBubbles.filter(b => b.type === 'connected').slice(0, 6).map((bubble, index) => (
                <g key={`main-connection-${index}`}>
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`${bubble.x}%`}
                    y2={`${bubble.y}%`}
                    stroke="url(#connectionGradient)"
                    strokeWidth="4"
                    opacity="0.6"
                    filter="url(#glow)"
                  />
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`${bubble.x}%`}
                    y2={`${bubble.y}%`}
                    stroke="rgba(45,186,161,1)"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                </g>
              ))}
              
              {/* Secondary connections between clusters */}
              {currentBubbles.filter(b => b.type === 'connected').slice(0, 10).map((bubble1, index1) => 
                currentBubbles.filter(b => b.type === 'connected').slice(index1 + 1, index1 + 4).map((bubble2, index2) => {
                  const distance = Math.sqrt(
                    Math.pow(bubble1.x - bubble2.x, 2) + Math.pow(bubble1.y - bubble2.y, 2)
                  );
                  if (distance < 40 && distance > 20) {
                    return (
                      <line
                        key={`cluster-connection-${index1}-${index2}`}
                        x1={`${bubble1.x}%`}
                        y1={`${bubble1.y}%`}
                        x2={`${bubble2.x}%`}
                        y2={`${bubble2.y}%`}
                        stroke="rgba(45,186,161,0.4)"
                        strokeWidth="1.5"
                        opacity="0.5"
                      />
                    );
                  }
                  return null;
                })
              )}
            </svg>

            {/* Enhanced Bubbles - Fixed Positioning */}
            {currentBubbles.map((bubble, index) => (
              <div
                key={bubble.id}
                className="absolute rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-700 hover:scale-125 cursor-pointer"
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  background: bubble.type === 'central' 
                    ? 'radial-gradient(circle, rgba(45,186,161,1) 0%, rgba(45,186,161,0.9) 40%, rgba(45,186,161,0.6) 70%, rgba(45,186,161,0.2) 100%)'
                    : bubble.type === 'connected'
                    ? `radial-gradient(circle, ${bubble.color} 0%, ${bubble.color}90 40%, ${bubble.color}60 70%, ${bubble.color}20 100%)`
                    : `radial-gradient(circle, ${bubble.color} 0%, ${bubble.color}80 50%, ${bubble.color}40 80%, ${bubble.color}10 100%)`,
                  transform: `translate(-50%, -50%)`,
                  boxShadow: bubble.type === 'central'
                    ? '0 0 60px rgba(45,186,161,0.8), 0 0 120px rgba(45,186,161,0.4), 0 0 180px rgba(45,186,161,0.2)'
                    : bubble.type === 'connected'
                    ? `0 0 ${bubble.size * 1.5}px ${bubble.color}60, 0 0 ${bubble.size * 2.2}px ${bubble.color}40`
                    : `0 0 ${bubble.size * 0.8}px ${bubble.color}40`,
                  opacity: bubble.type === 'scattered' ? 0.85 : 1,
                  zIndex: bubble.type === 'central' ? 50 : bubble.type === 'connected' ? 25 : 10,
                  animation: `fadeInUp ${0.3 + index * 0.05}s ease-out forwards`,
                  position: 'absolute',
                  pointerEvents: 'auto',
                }}
              >
                {/* Central hub with enhanced effects */}
                {bubble.type === 'central' && (
                  <div className="absolute inset-0 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full opacity-95 shadow-lg"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-full border border-white/30 animate-ping" style={{animationDelay: '0.5s'}}></div>
                  </div>
                )}
                
                {/* Connected nodes with pulse effects */}
                {bubble.type === 'connected' && (
                  <>
                    <div className="absolute inset-0 rounded-full border border-white/40 animate-ping" style={{animationDelay: `${index * 0.3}s`}}></div>
                    <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse" style={{animationDelay: `${index * 0.2}s`}}></div>
                  </>
                )}
                
                {/* Scattered nodes with subtle glow */}
                {bubble.type === 'scattered' && (
                  <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse" style={{animationDelay: `${index * 0.4}s`}}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracker; 