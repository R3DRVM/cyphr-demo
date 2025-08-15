import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, Copy, Wallet, Activity, Zap, TrendingUp, Bot, MessageCircle, ArrowRight } from 'lucide-react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { useNavigate } from 'react-router-dom';
import { useStrategyStore } from '../state/strategyStore';
import { fromPromptToConfig } from '../services/aiStrategyMapper';
import { getConnection } from '../services/connection';
import { useEventBus } from '../state/eventBus';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import './CyphrBot.css';

interface WalletInfo {
  network: string;
  address: string;
  balance: string;
  balanceUSD: string;
  assets: Array<{
    symbol: string;
    amount: string;
    valueUSD: string;
  }>;
}

interface ActivityItem {
  id: string;
  type: 'deposit' | 'withdraw' | 'trade' | 'strategy';
  description: string;
  timestamp: string;
  amount?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface AutomationItem {
  id: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  nextExecution?: string;
}

interface PositionItem {
  id: string;
  strategy: string;
  collateral: string;
  debt: string;
  health: number;
  apy: string;
  status: 'active' | 'liquidated' | 'closed';
}

const CyphrBot: React.FC = () => {
  const { wallet, connected } = useSolanaWallet();
  const navigate = useNavigate();
  const { setCfg } = useStrategyStore();
  
  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    activity: true,
    automation: true,
    positions: true,
    wallet: true,
    nfts: false,
    assets: true
  });

  // State for wallet mode toggle
  const [walletMode, setWalletMode] = useState(true);

  // Strategy intent state
  const [strategyIntent, setStrategyIntent] = useState<any>(null);

  // Real wallet data from connected wallet
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  // Event bus for real activity and positions
  const { events: eventBusEvents, getRecentEvents } = useEventBus();
  const { lastResult } = useStrategyStore();

  // Convert event bus events to activity items
  const activities = useMemo(() => {
    return getRecentEvents(10).map((event, index) => ({
      id: (index + 1).toString(),
      type: event.kind === 'deposit' ? 'deposit' : 
            event.kind === 'borrow' ? 'trade' : 
            event.kind === 'swap' ? 'trade' : 
            event.kind === 'create' ? 'strategy' : 
            event.kind === 'execute' ? 'strategy' : 'trade',
      description: `${event.kind.charAt(0).toUpperCase() + event.kind.slice(1)} ${event.meta?.mint || event.meta?.inputToken || 'tokens'}`,
      timestamp: new Date(event.ts).toLocaleString(),
      amount: event.meta?.amount ? `${event.meta.amount} ${event.meta.mint || event.meta.inputToken}` : '',
      status: 'completed' as const,
      signature: event.sig
    }));
  }, [eventBusEvents]);

  // Convert strategy store data to position items
  const positions = useMemo(() => {
    if (!lastResult || lastResult.type !== 'create') return [];
    
    return [{
      id: '1',
      strategy: `${lastResult.data.config?.token || 'SOL'} Strategy`,
      collateral: lastResult.data.config?.collateral || '0 SOL',
      debt: lastResult.data.config?.debt || '0 USDC',
      health: 85,
      apy: '12.5%',
      status: 'active' as const,
      strategyId: lastResult.data.strategyId
    }];
  }, [lastResult]);

  // Update wallets when wallet connection changes
  useEffect(() => {
    const fetchWalletBalances = async () => {
      if (connected && wallet?.publicKey) {
        try {
          const connection = getConnection();
          const publicKey = wallet.publicKey;
          
          // Get SOL balance
          const solBalance = await connection.getBalance(publicKey);
          const solBalanceSOL = solBalance / 1e9; // Convert lamports to SOL
          
          // Get USDC balance (assuming USDC mint from config)
          let usdcBalance = 0;
          try {
            const usdcMint = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'); // Devnet USDC
            const usdcATA = await getAssociatedTokenAddress(usdcMint, publicKey);
            const usdcAccount = await connection.getTokenAccountBalance(usdcATA);
            usdcBalance = usdcAccount.value.uiAmount || 0;
          } catch (error) {
            console.warn('Could not fetch USDC balance:', error);
          }
          
          // Mock USD values (in real app, use price feeds)
          const solPriceUSD = 150; // Mock SOL price
          const usdcPriceUSD = 1; // USDC is stable
          
          const walletInfo: WalletInfo = {
            network: 'Solana',
            address: `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`,
            balance: solBalanceSOL.toFixed(4),
            balanceUSD: `$${(solBalanceSOL * solPriceUSD).toFixed(2)}`,
            assets: [
              { symbol: 'SOL', amount: solBalanceSOL.toFixed(4), valueUSD: `$${(solBalanceSOL * solPriceUSD).toFixed(2)}` },
              { symbol: 'USDC', amount: usdcBalance.toFixed(2), valueUSD: `$${(usdcBalance * usdcPriceUSD).toFixed(2)}` }
            ]
          };
          
          setWallets([walletInfo]);
        } catch (error) {
          console.error('Failed to fetch wallet balances:', error);
          // Fallback to mock data
          const walletInfo: WalletInfo = {
            network: 'Solana',
            address: `${wallet.publicKey.toString().slice(0, 4)}...${wallet.publicKey.toString().slice(-4)}`,
            balance: '0.0000',
            balanceUSD: '$0.00',
            assets: [
              { symbol: 'SOL', amount: '0.0000', valueUSD: '$0.00' },
              { symbol: 'USDC', amount: '0.00', valueUSD: '$0.00' }
            ]
          };
          setWallets([walletInfo]);
        }
      } else {
        setWallets([]);
      }
    };
    
    fetchWalletBalances();
  }, [connected, wallet]);

  const [automations] = useState<AutomationItem[]>([
    {
      id: '1',
      description: 'Rebalance portfolio every 24h',
      status: 'active',
      nextExecution: 'Next: 6h 23m'
    }
  ]);

  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      type: 'bot',
      content: "gm, how can I help you?",
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');

  const suggestedPrompts = [
    "Find me a yield strategy with 15% APY",
    "Analyze my portfolio risk",
    "Set up automated rebalancing",
    "Show me the best lending rates",
    "Create a hedge strategy for SOL",
    "Optimize my yield farming positions"
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Check if message contains strategy intent
    const strategyConfig = fromPromptToConfig(inputMessage);
    const hasStrategyIntent = strategyConfig.token && strategyConfig.logicType;
    
    if (hasStrategyIntent) {
      setStrategyIntent(strategyConfig);
      
      // Bot response with strategy suggestion
      setTimeout(() => {
        const botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot' as const,
          content: `I've identified a strategy intent: ${strategyConfig.token} ${strategyConfig.logicType} strategy targeting ${strategyConfig.profitTargetPct}% profit over ${strategyConfig.durationDays} days.`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botResponse]);
      }, 1000);
    } else {
      // Regular bot response
      setTimeout(() => {
        const botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot' as const,
          content: "I'm analyzing your request. This would integrate with our strategy builder and yield protocols to provide real-time recommendations.",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const handleApplyToBuilder = () => {
    if (strategyIntent) {
      setCfg(strategyIntent);
      navigate('/strategy');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const handleActivityClick = (activity: any) => {
    if (activity.signature) {
      const explorerUrl = `https://explorer.solana.com/tx/${activity.signature}?cluster=devnet`;
      window.open(explorerUrl, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return '#00ff88';
      case 'pending':
        return '#ffaa00';
      case 'failed':
      case 'liquidated':
        return '#ff4444';
      default:
        return '#888888';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return '✓';
      case 'pending':
        return '⏳';
      case 'failed':
      case 'liquidated':
        return '✗';
      default:
        return '•';
    }
  };

  return (
    <div className="cyphr-bot-page">
      <div className="cyphr-bot-header">
        <div className="cyphr-bot-title">
          <Bot className="cyphr-bot-icon" />
          <h1>Cyphr Bot</h1>
          <span className="cyphr-bot-version">v1.0.0-beta</span>
        </div>
        <div className="cyphr-bot-subtitle">
          Your AI-powered trading and strategy assistant
        </div>
      </div>

      <div className="cyphr-bot-main">
        {/* Left Sidebar */}
        <div className="cyphr-bot-left-panel">
          {/* Activity Section */}
          <div className="cyphr-bot-section">
            <div 
              className="cyphr-bot-section-header"
              onClick={() => toggleSection('activity')}
            >
              <Activity className="section-icon" />
              <span>Activity</span>
              {expandedSections.activity ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            {expandedSections.activity && (
              <div className="cyphr-bot-section-content">
                {activities.length > 0 ? (
                  activities.map(activity => (
                    <div 
                      key={activity.id} 
                      className="activity-item"
                      onClick={() => handleActivityClick(activity)}
                      style={{ cursor: activity.signature ? 'pointer' : 'default' }}
                    >
                      <div className="activity-header">
                        <span className="activity-type">{activity.type}</span>
                        <span className="activity-status" style={{ color: getStatusColor(activity.status) }}>
                          {getStatusIcon(activity.status)}
                        </span>
                      </div>
                      <div className="activity-description">{activity.description}</div>
                      <div className="activity-footer">
                        <span className="activity-amount">{activity.amount}</span>
                        <span className="activity-timestamp">{activity.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <span>No recent activity</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Automation Section */}
          <div className="cyphr-bot-section">
            <div 
              className="cyphr-bot-section-header"
              onClick={() => toggleSection('automation')}
            >
              <Zap className="section-icon" />
              <span>Automation</span>
              {expandedSections.automation ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            {expandedSections.automation && (
              <div className="cyphr-bot-section-content">
                {automations.length > 0 ? (
                  automations.map(automation => (
                    <div key={automation.id} className="automation-item">
                      <div className="automation-header">
                        <span className="automation-status" style={{ color: getStatusColor(automation.status) }}>
                          {getStatusIcon(automation.status)}
                        </span>
                      </div>
                      <div className="automation-description">{automation.description}</div>
                      {automation.nextExecution && (
                        <div className="automation-next">{automation.nextExecution}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <span>No automations yet.</span>
                    <span className="suggestion">Try saying: "Set up automated rebalancing every 24h"</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Positions Section */}
          <div className="cyphr-bot-section">
            <div 
              className="cyphr-bot-section-header"
              onClick={() => toggleSection('positions')}
            >
              <TrendingUp className="section-icon" />
              <span>Active Positions</span>
              {expandedSections.positions ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            {expandedSections.positions && (
              <div className="cyphr-bot-section-content">
                {positions.length > 0 ? (
                  positions.map(position => (
                    <div key={position.id} className="position-item">
                      <div className="position-header">
                        <span className="position-strategy">{position.strategy}</span>
                        <span className="position-status" style={{ color: getStatusColor(position.status) }}>
                          {getStatusIcon(position.status)}
                        </span>
                      </div>
                      <div className="position-details">
                        <div className="position-metric">
                          <span className="label">Collateral:</span>
                          <span className="value">{position.collateral}</span>
                        </div>
                        <div className="position-metric">
                          <span className="label">Debt:</span>
                          <span className="value">{position.debt}</span>
                        </div>
                        <div className="position-metric">
                          <span className="label">Health:</span>
                          <span className="value">{position.health}%</span>
                        </div>
                        <div className="position-metric">
                          <span className="label">APY:</span>
                          <span className="value">{position.apy}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <span>No open positions found.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Chat Panel */}
        <div className="cyphr-bot-center-panel">
          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.map(message => (
                <div key={message.id} className={`chat-message ${message.type}`}>
                  {message.type === 'bot' && (
                    <div className="bot-avatar">
                      <Bot size={20} />
                    </div>
                  )}
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-timestamp">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              
              {/* Strategy Intent Action */}
              {strategyIntent && (
                <div className="strategy-intent-action">
                  <div className="intent-preview">
                    <strong>Strategy Detected:</strong> {strategyIntent.token} {strategyIntent.logicType} 
                    targeting {strategyIntent.profitTargetPct}% profit over {strategyIntent.durationDays} days
                  </div>
                  <button 
                    className="apply-to-builder-btn"
                    onClick={handleApplyToBuilder}
                  >
                    <ArrowRight className="w-4 h-4 inline mr-2" />
                    Apply to Builder
                  </button>
                </div>
              )}
            </div>

            <div className="suggested-prompts">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="suggested-prompt"
                  onClick={() => setInputMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder="// what's up?"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="send-button" onClick={handleSendMessage}>
                <MessageCircle size={16} />
              </button>
            </div>

            <div className="chat-footer">
              <span className="usage-tracker">0 / 10 free daily messages used</span>
              <span className="usage-percentage">0.00%</span>
            </div>
          </div>
        </div>

        {/* Right Wallet Panel */}
        <div className="cyphr-bot-right-panel">
          <div className="wallet-header">
            <button className="deposit-button">Deposit</button>
            <div className="wallet-mode-toggle">
              <span>Wallet mode</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={walletMode}
                  onChange={(e) => setWalletMode(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {walletMode && (
            <div className="wallet-section">
              <div className="wallet-title">
                <Wallet className="wallet-icon" />
                <span>Wallet</span>
              </div>
              
              {!connected ? (
                <div className="wallet-connect-prompt">
                  <div className="connect-icon">🔗</div>
                  <span className="connect-text">Connect your wallet to view balances</span>
                  <button className="connect-wallet-btn">
                    Connect Wallet
                  </button>
                </div>
              ) : wallets.length > 0 ? (
                wallets.map((wallet, index) => (
                  <div key={index} className="wallet-item">
                    <div className="wallet-network">
                      <span className="network-name">{wallet.network}</span>
                      <div className="wallet-address-container">
                        <span className="wallet-address">{wallet.address}</span>
                        <button 
                          className="copy-button"
                          onClick={() => copyToClipboard(wallet.address)}
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="wallet-balance">
                      <span className="balance-amount">{wallet.balance}</span>
                      <span className="balance-usd">{wallet.balanceUSD}</span>
                    </div>

                                      <div className="wallet-assets">
                    <div 
                      className="assets-header"
                      onClick={() => toggleSection('assets')}
                    >
                      <span>↳ Assets</span>
                      {expandedSections.assets ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                    {expandedSections.assets && (
                      <div className="assets-list">
                        {wallet.assets.map((asset, assetIndex) => (
                          <div key={assetIndex} className="asset-item">
                            <span className="asset-symbol">{asset.symbol}</span>
                            <span className="asset-amount">{asset.amount}</span>
                            <span className="asset-value">{asset.valueUSD}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  </div>
                ))
              ) : (
                <div className="wallet-loading">
                  <span>Loading wallet data...</span>
                </div>
              )}
            </div>
          )}

          <div className="nfts-section">
            <div 
              className="cyphr-bot-section-header"
              onClick={() => toggleSection('nfts')}
            >
              <span>NFTs</span>
              {expandedSections.nfts ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            {expandedSections.nfts && (
              <div className="cyphr-bot-section-content">
                <div className="empty-state">
                  <span>No NFTs found</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyphrBot;
