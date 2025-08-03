import React, { useState, useEffect } from 'react';
import TokenIcon from '../components/TokenIcon';

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
  const [searchedToken, setSearchedToken] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{name: string, address: string, symbol: string}>>([]);

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

  // Search function for tokens
  const handleTokenSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API search delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock search results
    const mockResults = [
      { name: `${query.toUpperCase()} Token`, address: `0x${Math.random().toString(16).substr(2, 40)}`, symbol: query.toUpperCase() },
      { name: `${query.toUpperCase()} Protocol`, address: `0x${Math.random().toString(16).substr(2, 40)}`, symbol: `${query.toUpperCase()}P` },
      { name: `${query.toUpperCase()} Finance`, address: `0x${Math.random().toString(16).substr(2, 40)}`, symbol: `${query.toUpperCase()}F` },
    ];
    
    setSearchResults(mockResults);
    setIsSearching(false);
  };

  // Generate dynamic holder distribution for searched token
  const generateDynamicBubbles = (tokenSymbol: string): Bubble[] => {
    const baseConfig = {
      centralSize: 70 + Math.random() * 30,
      clusters: {
        yellow: { count: 5 + Math.floor(Math.random() * 8), sizeRange: [15, 40], position: { x: [20, 80], y: [25, 75] } },
        purple: { count: 4 + Math.floor(Math.random() * 6), sizeRange: [12, 35], position: { x: [60, 90], y: [10, 60] } },
        pink: { count: 3 + Math.floor(Math.random() * 5), sizeRange: [10, 30], position: { x: [10, 50], y: [60, 90] } },
        blue: { count: 4 + Math.floor(Math.random() * 6), sizeRange: [12, 32], position: { x: [65, 95], y: [60, 90] } }
      },
      scattered: { count: 20 + Math.floor(Math.random() * 30), sizeRange: [5, 18] }
    };

    return generateBubblesFromConfig(baseConfig, tokenSymbol);
  };

  const generateBubblesFromConfig = (config: any, tokenSymbol: string): Bubble[] => {
    const bubbles: Bubble[] = [];
    let id = 1;

    // Central hub
    bubbles.push({
      id: id++,
      x: 50,
      y: 50,
      size: config.centralSize,
      color: '#6D8FC7',
      type: 'central',
      isCentral: true
    });

    // Generate clusters
    Object.entries(config.clusters).forEach(([clusterType, clusterConfig]: [string, any]) => {
      for (let i = 0; i < clusterConfig.count; i++) {
        const x = clusterConfig.position.x[0] + Math.random() * (clusterConfig.position.x[1] - clusterConfig.position.x[0]);
        const y = clusterConfig.position.y[0] + Math.random() * (clusterConfig.position.y[1] - clusterConfig.position.y[0]);
        const size = clusterConfig.sizeRange[0] + Math.random() * (clusterConfig.sizeRange[1] - clusterConfig.sizeRange[0]);
        
        bubbles.push({
          id: id++,
          x,
          y,
          size,
          color: getColorForCluster(clusterType),
          type: 'connected',
          isCentral: false
        });
      }
    });

    // Generate scattered bubbles
    for (let i = 0; i < config.scattered.count; i++) {
      bubbles.push({
        id: id++,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: config.scattered.sizeRange[0] + Math.random() * (config.scattered.sizeRange[1] - config.scattered.sizeRange[0]),
        color: getColorForCluster(['yellow', 'purple', 'pink', 'blue'][Math.floor(Math.random() * 4)]),
        type: 'scattered',
        isCentral: false
      });
    }

    return bubbles;
  };

  // Original generateBubbles function for predefined tokens
  const generateBubbles = (token: string): Bubble[] => {
    const tokenConfig = tokenDatabase[token as keyof typeof tokenDatabase];
    if (tokenConfig) {
      return generateBubblesFromConfig(tokenConfig.bubbleConfig, token);
    }
    return generateDynamicBubbles(token);
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
    <div className="max-w-7xl mx-auto p-6 pb-32 animate-fade-in min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cyphr-white mb-2 font-nulshock">Insights</h1>
        <p className="text-cyphr-gray">AI-powered analysis and market insights</p>
      </div>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Tabs */}
        <div className="flex rounded-2xl p-2 border border-cyphr-gray/30 premium-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setActiveTab(item.path)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 premium-nav-button ${
                activeTab === item.path
                  ? 'text-cyphr-black active'
                  : 'text-cyphr-gray hover:text-cyphr-white'
              }`}
            >
              <span className="transition-transform duration-300 hover:scale-105">{item.name}</span>
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
      <div className="space-y-8">
        {/* Top Row - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - AI Insights + Liquidity Events */}
          <div className="space-y-5">
            {/* AI Summary Card */}
            <div className="elite-glass-card p-6 rounded-lg mb-6 animate-slide-up shadow-elite">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyphr-teal font-nulshock text-sm font-semibold flex items-center gap-2">
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
            <div className="elite-glass-card p-4 rounded-lg mb-6 flex items-center gap-3 animate-slide-up shadow-elite">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-cyphr-teal" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span className="text-cyphr-teal font-mono text-sm font-semibold">Risk Level:</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyphr-teal rounded-full animate-pulse"></div>
                <span className="text-cyphr-white text-sm font-medium font-mono">Medium</span>
              </div>
            </div>

            {/* Pool Overview Card */}
            <div className="elite-glass-card p-6 rounded-lg mb-6 animate-slide-up shadow-elite">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyphr-teal font-nulshock text-sm font-semibold flex items-center gap-2">
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
            <div className="elite-glass-card p-6 rounded-lg mb-6 animate-slide-up shadow-elite">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyphr-teal font-nulshock text-sm font-semibold flex items-center gap-2">
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
            <div className="elite-glass-card p-6 rounded-lg mb-6 animate-slide-up shadow-elite">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyphr-teal font-nulshock text-sm font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
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
            <div className="elite-glass-card p-6 rounded-lg mb-6 animate-slide-up shadow-elite">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyphr-teal font-nulshock text-sm font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
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
            <div className="elite-glass-card p-6 rounded-lg mb-6 animate-slide-up shadow-elite">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyphr-teal font-nulshock text-sm font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
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

        {/* Interactive Bubble Map Section */}
        <div className="elite-glass-card p-6 rounded-lg animate-slide-up shadow-elite">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyphr-teal font-nulshock text-sm font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 00-8 8c0 1.5.4 2.9 1.1 4.1a1 1 0 00.8.3h13.4a1 1 0 00.8-.3C17.6 13.9 18 12.5 18 11a8 8 0 00-8-8zm0 14a6 6 0 100-12 6 6 0 000 12zm-3-5a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
              </svg>
              Interactive Bubble Map
            </h3>
            <div className="flex items-center gap-2">
              <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs hover:scale-110">1H</button>
              <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs hover:scale-110">24H</button>
              <button className="text-cyphr-gray hover:text-cyphr-teal transition-all duration-300 text-xs hover:scale-110">7D</button>
            </div>
          </div>

          {/* Interactive Search */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleTokenSearch(e.target.value);
                }}
                placeholder="Search any token for holder distribution..."
                className="w-full elite-input px-4 py-3 rounded-lg border border-cyphr-gray/30 focus:border-cyphr-teal text-cyphr-white text-sm"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyphr-teal"></div>
                </div>
              )}
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-cyphr-black/90 border border-cyphr-gray/30 rounded-lg z-50 max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchedToken(result.symbol);
                        setSearchQuery(result.name);
                        setSearchResults([]);
                        setSelectedToken(result.symbol);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-cyphr-gray/20 transition-colors duration-200 border-b border-cyphr-gray/20 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-cyphr-white font-semibold text-sm">{result.name}</div>
                          <div className="text-cyphr-gray text-xs">{result.symbol}</div>
                        </div>
                        <div className="text-cyphr-gray text-xs font-mono">{result.address.slice(0, 8)}...</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Token Selection */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex gap-2 flex-wrap">
              {Object.keys(tokenDatabase).slice(0, 6).map((token) => (
                <button
                  key={token}
                  onClick={() => handleTokenSelect(token)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-2 ${
                    selectedToken === token
                      ? 'bg-cyphr-teal text-cyphr-black'
                      : 'bg-cyphr-gray/20 text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray/30'
                  }`}
                >
                  <TokenIcon 
                    token={{
                      name: token,
                      symbol: token
                    }}
                    size="md"
                  />
                  {token}
                </button>
              ))}
              {searchedToken && (
                <button
                  onClick={() => setSelectedToken(searchedToken)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-2 ${
                    selectedToken === searchedToken
                      ? 'bg-cyphr-teal text-cyphr-black'
                      : 'bg-cyphr-pink/20 text-cyphr-pink hover:bg-cyphr-pink/30 border border-cyphr-pink/30'
                  }`}
                >
                  <TokenIcon 
                    token={{
                      name: searchedToken,
                      symbol: searchedToken
                    }}
                    size="md"
                  />
                  {searchedToken} 🔍
                </button>
              )}
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
              <div className="flex items-center gap-2">
                <TokenIcon 
                  token={{
                    name: selectedToken,
                    symbol: selectedToken
                  }}
                  size="md"
                />
                <div>
                  <div className="text-cyphr-white text-sm font-semibold">{selectedToken}</div>
                  <div className="text-cyphr-gray text-xs">{tokenDatabase[selectedToken as keyof typeof tokenDatabase]?.name}</div>
                </div>
              </div>
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
              
              {/* Dynamic central hub glow effect */}
              {(() => {
                const centralBubble = currentBubbles.find(b => b.isCentral);
                if (!centralBubble) return null;
                
                return (
                  <circle
                    cx={`${centralBubble.x}%`}
                    cy={`${centralBubble.y}%`}
                    r="80"
                    fill="url(#bubbleGlow)"
                    opacity="0.7"
                  />
                );
              })()}
              
              {/* Subtle connection indicators - positioned to match bubble centers */}
              {(() => {
                const centralBubble = currentBubbles.find(b => b.isCentral);
                const connectedBubbles = currentBubbles.filter(b => b.type === 'connected' && !b.isCentral);
                
                if (!centralBubble) return null;
                
                return connectedBubbles.slice(0, 6).map((bubble, index) => {
                  // Create subtle connection indicators that don't interfere with bubble positioning
                  return (
                    <g key={`connection-indicator-${index}`}>
                      {/* Subtle glow path */}
                      <defs>
                        <linearGradient id={`connection-glow-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgba(45,186,161,0.3)" />
                          <stop offset="50%" stopColor="rgba(45,186,161,0.1)" />
                          <stop offset="100%" stopColor="rgba(45,186,161,0)" />
                        </linearGradient>
                      </defs>
                      
                      {/* Connection glow effect */}
                      <line
                        x1={`${centralBubble.x}%`}
                        y1={`${centralBubble.y}%`}
                        x2={`${bubble.x}%`}
                        y2={`${bubble.y}%`}
                        stroke={`url(#connection-glow-${index})`}
                        strokeWidth="8"
                        opacity="0.4"
                      />
                      
                      {/* Subtle connection line */}
                      <line
                        x1={`${centralBubble.x}%`}
                        y1={`${centralBubble.y}%`}
                        x2={`${bubble.x}%`}
                        y2={`${bubble.y}%`}
                        stroke="rgba(45,186,161,0.2)"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                    </g>
                  );
                });
              })()}
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