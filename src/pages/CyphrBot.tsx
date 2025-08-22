import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, ChevronRight, Copy, Wallet, Activity, Zap, TrendingUp, Bot, MessageCircle, ArrowRight, X } from 'lucide-react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import ChatChip from '../components/ChatChip';
import { createBrowserTreasuryService } from '../services/browserTreasuryService';

// TypeScript declaration for Phantom wallet
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
    };
  }
}
import { useNavigate } from 'react-router-dom';
import { useStrategyStore } from '../state/strategyStore';
import { fromPromptToConfig } from '../services/aiStrategyMapper';
import { getConnection } from '../services/connection';
import { useEventBus } from '../state/eventBus';
import { PublicKey, Transaction, TransactionInstruction, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

import './CyphrBot.css';

interface WalletInfo {
  network: string;
  address: string;
  balance: string;
  balanceUSD: string;
  vaultPosition?: string;
  yieldEarned?: string;
  totalVaultValue?: string;
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
  const { wallet, connected, publicKey, sendTransaction, connect, disconnect } = useSolanaWallet();
  const navigate = useNavigate();
  const { setCfg } = useStrategyStore();
  
  // Only create vault service when wallet is connected
  const vaultService = useMemo(() => {
    if (connected && wallet) {
      try {
        // Create a wallet adapter that matches what the vault service expects
        const walletAdapter = {
          publicKey: wallet.publicKey,
          signTransaction: (tx: any) => wallet.signTransaction(tx),
          signAllTransactions: (txs: any[]) => wallet.signAllTransactions(txs),
          sendTransaction: async (transaction: any, connection: any, options: any) => {
            // Use the provider's sendTransaction method
            return await wallet.sendTransaction(transaction);
          }
        };
        return new (require('../services/cyphrVaultService').CyphrVaultService)(walletAdapter);
      } catch (error) {
        console.warn('Failed to create vault service:', error);
        return null;
      }
    }
    return null;
  }, [connected, wallet]);
  
  // ALL STATE DECLARATIONS AT THE TOP
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    type: 'bot' | 'user';
    content: string;
    timestamp: Date;
  }>>([
    {
      id: '1',
      type: 'bot',
      content: "gm, how can I help you?",
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  
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
  
  // State for transaction mode (demo vs devnet)
  const [transactionMode, setTransactionMode] = useState<'demo' | 'devnet'>('demo');
  
  // Config snapshot logging
  useEffect(() => {
    const configSnapshot = {
      real: transactionMode === 'devnet',
      cluster: 'devnet',
      vault: 'H24...' // Short vault pubkey for demo
    };
    console.log('[cfg]', configSnapshot);
  }, [transactionMode]);
  
  // Strategy intent state
  const [strategyIntent, setStrategyIntent] = useState<any>(null);

  // Real wallet data from connected wallet
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  // Scroll tracking for chat
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

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
          // publicKey is already available from useWallet hook
          
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
            address: `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`,
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

  // Scroll tracking for chat
  const handleChatScroll = () => {
    if (chatMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
      const threshold = 50;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold);
    }
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  };

  // Auto-scroll to bottom on new messages if user is at bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [chatMessages]);

  // Fetch real wallet balances when connected
  useEffect(() => {
    if (connected && publicKey) {
      const fetchBalances = async () => {
        try {
          const connection = getConnection();
          const solBalance = await connection.getBalance(publicKey);
          const solBalanceSOL = (solBalance / 1e9).toFixed(4);
          
          // Update wallets state with real data
          setWallets([{
            network: 'Solana',
            address: `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`,
            balance: `${solBalanceSOL} SOL`,
            balanceUSD: `$${(parseFloat(solBalanceSOL) * 100).toFixed(2)}`, // Demo USD value
            assets: [
              {
                symbol: 'SOL',
                amount: solBalanceSOL,
                valueUSD: `$${(parseFloat(solBalanceSOL) * 100).toFixed(2)}`
              }
            ]
          }]);
        } catch (error) {
          console.error('Error fetching balances:', error);
        }
      };
      
      fetchBalances();
      
      // Set up balance subscription
      const connection = getConnection();
      const subscriptionId = connection.onAccountChange(publicKey, () => {
        fetchBalances();
      });
      
      return () => {
        connection.removeAccountChangeListener(subscriptionId);
      };
    }
  }, [connected, publicKey]);

  // Debug wallet state
  useEffect(() => {
    console.log('Wallet State Debug:', { 
      connected, 
      publicKey: publicKey?.toString(), 
      walletsLength: wallets.length,
      walletMode 
    });
  }, [connected, publicKey, wallets.length, walletMode]);

  const suggestedPrompts = [
    "Find me a yield strategy that earns me 25% APY",
    "Find me a yield strategy that earns me 50% APY",
    "Find me a yield strategy that earns me a solid 25% in my original asset and stables combined",
    "I want to deposit collateral and borrow against it to yield farm (25% or 50%)",
    "I want to deposit collateral and borrow against it to trade",
    "Rebalance my portfolio automatically for more stable returns",
    "Optimize my yield farming positions based on your input",
    "Analyze my current yield farming risk"
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

    // Handle specific MVP flows
    if (inputMessage.toLowerCase().includes('withdraw now') || inputMessage.toLowerCase().includes('withdraw')) {
      handleWithdrawRequest(inputMessage);
    } else if (inputMessage.includes('25% APY') || inputMessage.includes('50% APY')) {
      handleYieldStrategyRequest(inputMessage);
    } else if (inputMessage.includes('borrow against it to yield farm')) {
      handleBorrowYieldRequest(inputMessage);
    } else if (inputMessage.includes('borrow against it to trade')) {
      handleBorrowTradeRequest(inputMessage);
    } else if (inputMessage.includes('rebalance my portfolio')) {
      handleRebalanceRequest(inputMessage);
    } else if (inputMessage.includes('optimize my yield farming positions')) {
      handleRiskAnalysisRequest(inputMessage);
    } else if (inputMessage.includes('analyze my current yield farming risk')) {
      handleRiskAnalysisRequest(inputMessage);
    } else {
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
    }
  };

    // MVP Flow Handlers
  const handleWithdrawRequest = async (message: string) => {
    if (!connected || !publicKey) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        content: '❌ Please connect your wallet first to withdraw funds.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Add bot response
    const botResponse = {
      id: (Date.now() + 1).toString(),
      type: 'bot' as const,
      content: '🔄 Processing withdrawal request...',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, botResponse]);

    try {
      if (transactionMode === 'devnet') {
        // Use browser-compatible treasury service for automated withdrawal
        const treasuryService = createBrowserTreasuryService();
        
        // Check if user has a deposit to withdraw
        const storedDeposit = localStorage.getItem('cyphr_deposit');
        
        if (storedDeposit) {
          try {
            const depositInfo = JSON.parse(storedDeposit);
            const depositAmount = depositInfo.amount;
            const targetAPY = depositInfo.targetAPY;
            
            // Health check first
            const isHealthy = await treasuryService.healthCheck();
            if (!isHealthy) {
              throw new Error('Treasury service health check failed');
            }
            
            // Process withdrawal through treasury service
            const result = await treasuryService.processWithdrawal(publicKey, depositAmount, targetAPY);
            
            // Success message with transaction hash
            const successMessage = {
              id: (Date.now() + 2).toString(),
              type: 'bot' as const,
              content: `✅ [DEVNET MODE] Automated withdrawal successful!\n\n📝 Hash: ${result.signature.substring(0, 8)}...${result.signature.substring(result.signature.length - 8)}\n🔗 [View on Explorer](https://explorer.solana.com/tx/${result.signature}?cluster=devnet)\n💰 Original Deposit: ${result.originalDeposit} SOL\n🎯 Yield Earned: ${result.yieldEarned.toFixed(4)} SOL (${targetAPY}% APY)\n💸 Total Returned: ${result.totalReturn.toFixed(4)} SOL\n\n🚀 You should now see your funds and earnings in your wallet!`,
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, successMessage]);
            
            // Clear stored deposit info
            localStorage.removeItem('cyphr_deposit');
            
            // Add to activity panel
            const newActivity = {
              id: Date.now().toString(),
              type: 'withdraw',
              description: `Withdrawal ${result.totalReturn.toFixed(4)} SOL`,
              timestamp: new Date().toLocaleString(),
              amount: `${result.totalReturn.toFixed(4)} SOL`,
              status: 'completed' as const,
              signature: result.signature
            };
            
            console.log('Treasury withdrawal completed:', { signature: result.signature, amount: result.totalReturn });
            
          } catch (error) {
            console.error('Treasury withdrawal failed:', error);
            
            // Show error message with retry option
            const errorMessage = {
              id: (Date.now() + 2).toString(),
              type: 'bot' as const,
              content: `❌ [DEVNET MODE] Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\n🔄 Your funds are safe and secure. Click "Try Withdrawal Again" to retry.`,
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, errorMessage]);
            
            // Add retry chip
            setTimeout(() => {
              const retryChip = {
                id: (Date.now() + 3).toString(),
                type: 'bot' as const,
                content: `🔄 [Try Withdrawal Again] [Contact Support]`,
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, retryChip]);
            }, 1000);
            
            return; // Don't proceed with fallback
          }
        } else {
          // No deposit found, fall back to regular devnet transaction
          await executeDevnetTransaction('withdraw', '0.5 SOL');
        }
      } else {
        // Demo mode withdrawal
        const demoMessage = {
          id: (Date.now() + 2).toString(),
          type: 'bot' as const,
          content: `🎭 [DEMO MODE] SOL withdrawal simulated!\n\n💰 Amount: 0.5 SOL\n⏱️ Status: Simulated\n\n🚀 In real mode, this would withdraw SOL from your vault position.`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, demoMessage]);
      }

      // Refresh vault balances after successful withdrawal
      await refreshVaultBalances();
      
      // Show post-withdrawal chips
      setTimeout(() => {
        const chipsResponse = {
          id: (Date.now() + 3).toString(),
          type: 'bot' as const,
          content: `🎯 [Deposit again] [View balance] [Change strategy]`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, chipsResponse]);
      }, 1000);

    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        type: 'bot' as const,
        content: `❌ Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleYieldStrategyRequest = async (message: string) => {
    const targetAPY = message.includes('25%') ? '25%' : '50%';
    
    // Add bot response
    const botResponse = {
      id: (Date.now() + 1).toString(),
      type: 'bot' as const,
      content: `🔎 Finding ${targetAPY} yield opportunities...`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, botResponse]);

    // Simulate finding strategy
    setTimeout(() => {
      const strategyResponse = {
        id: (Date.now() + 2).toString(),
        type: 'bot' as const,
        content: `✅ Found a ${targetAPY} APY strategy! This involves staking SOL in a high-yield liquidity pool with automated rebalancing.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, strategyResponse]);

      // Show amount selection with quick chips
      setTimeout(() => {
        const amountResponse = {
          id: (Date.now() + 3).toString(),
          type: 'bot' as const,
          content: `How much SOL would you like to deposit?`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, amountResponse]);

        // Add amount selection chips
        setTimeout(() => {
          const chipsResponse = {
            id: (Date.now() + 1).toString(),
            type: 'bot' as const,
            content: `💡 Quick amounts:`,
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, chipsResponse]);

          // Add action chips
          setTimeout(() => {
            const actionChipsResponse = {
              id: (Date.now() + 2).toString(),
              type: 'bot' as const,
              content: `🚀 [Deposit 0.1 SOL] [Deposit 0.5 SOL] [Deposit 1.0 SOL] [Custom Amount]`,
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, actionChipsResponse]);

            // Add strategy execution chip
            setTimeout(() => {
              const executeChipResponse = {
                id: (Date.now() + 3).toString(),
                type: 'bot' as const,
                content: `⚡ [Execute ${targetAPY} Strategy]`,
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, executeChipResponse]);
            }, 500);
          }, 300);
        }, 500);
      }, 1000);
    }, 2000);
  };

  const handleBorrowYieldRequest = async (message: string) => {
    const botResponse = {
      id: (Date.now() + 1).toString(),
      type: 'bot' as const,
      content: `🏦 Setting up collateralized borrowing for yield farming...`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, botResponse]);

    setTimeout(() => {
      const strategyResponse = {
        id: (Date.now() + 2).toString(),
        type: 'bot' as const,
        content: `✅ Strategy ready! You'll deposit SOL as collateral, borrow USDC, and farm both assets for maximum yield.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, strategyResponse]);
    }, 2000);
  };

  const handleBorrowTradeRequest = async (message: string) => {
    const botResponse = {
      id: (Date.now() + 1).toString(),
      type: 'bot' as const,
      content: `📈 Setting up collateralized borrowing for trading...`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, botResponse]);

    setTimeout(() => {
      const strategyResponse = {
        id: (Date.now() + 2).toString(),
        type: 'bot' as const,
        content: `✅ Trading strategy ready! You'll deposit SOL as collateral, borrow USDC, and use it for spot trading opportunities.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, strategyResponse]);
    }, 2000);
  };

  const handleRebalanceRequest = async (message: string) => {
    const botResponse = {
      id: (Date.now() + 1).toString(),
      type: 'bot' as const,
      content: `⚖️ Setting up automated portfolio rebalancing...`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, botResponse]);

    setTimeout(() => {
      const strategyResponse = {
        id: (Date.now() + 2).toString(),
        type: 'bot' as const,
        content: `✅ Rebalancing strategy active! Your portfolio will automatically rebalance every 24 hours to maintain optimal risk/reward ratios.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, strategyResponse]);
    }, 2000);
  };

  const handleOptimizeRequest = async (message: string) => {
    const botResponse = {
      id: (Date.now() + 1).toString(),
      type: 'bot' as const,
      content: `🔧 Analyzing your current positions for optimization opportunities...`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, botResponse]);

    setTimeout(() => {
      const strategyResponse = {
        id: (Date.now() + 2).toString(),
        type: 'bot' as const,
        content: `✅ Optimization complete! I recommend reallocating 15% to higher-yield staking pools and reducing exposure to volatile farming pairs.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, strategyResponse]);
    }, 2000);
  };

  const handleRiskAnalysisRequest = async (message: string) => {
    const botResponse = {
      id: (Date.now() + 1).toString(),
      type: 'bot' as const,
      content: `📊 Analyzing your portfolio risk profile...`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, botResponse]);

    setTimeout(() => {
      const strategyResponse = {
        id: (Date.now() + 2).toString(),
        type: 'bot' as const,
        content: `📊 Risk Analysis Complete:\n• Portfolio Concentration: Medium risk (65% in single strategy)\n• Impermanent Loss Exposure: Low (stable pairs)\n• Smart Contract Risk: Low (audited protocols)\n• Liquidity Risk: Medium (48h average exit time)\n• Recommended Action: Diversify into 2-3 additional protocols`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, strategyResponse]);
    }, 2000);
  };

  // Transaction functions (demo vs devnet)
  const executeTransaction = async (type: string, amount?: string) => {
    if (transactionMode === 'demo') {
      executeDemoTransaction(type, amount);
    } else {
      await executeDevnetTransaction(type, amount);
    }
  };

  // Demo mode transaction simulation
  const executeDemoTransaction = (type: string, amount?: string) => {
    // Generate a realistic transaction hash
    const hash = '5J' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Add transaction message
    const txMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot' as const,
      content: `🎭 [DEMO MODE] Processing ${type} transaction...`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, txMessage]);

    // Simulate transaction processing
    setTimeout(() => {
      const txHashMessage = {
        id: (Date.now() + 2).toString(),
        type: 'bot' as const,
        content: `✅ [DEMO MODE] Transaction completed!\n\n📝 Hash: ${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}\n🔗 [View on Explorer](https://explorer.solana.com/tx/${hash}?cluster=devnet)\n💰 Amount: ${amount || 'N/A'}\n⏱️ Status: Confirmed\n\n⚠️ This is a demo transaction - no real SOL was moved`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, txHashMessage]);

      // Add to event bus for activity tracking
      console.log('Demo transaction completed:', { type, hash, amount });

      // Add post-flow chips
      setTimeout(() => {
        const postFlowChips = {
          id: (Date.now() + 3).toString(),
          type: 'bot' as const,
          content: `🎯 [Withdraw now] [Run again] [Change target]`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, postFlowChips]);
        
        // Refresh vault balances after demo transaction
        if (type.includes('deposit')) {
          refreshVaultBalances();
        }
      }, 1000);
    }, 3000);
  };

  // Devnet mode real transaction
  const executeDevnetTransaction = async (type: string, amount?: string) => {
    if (!connected || !publicKey) {
      const errorMessage = {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: `❌ Error: Wallet not connected. Please connect your wallet to execute real devnet transactions.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      return;
    }

    try {
      // Add transaction message
      const txMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        content: `🌐 [DEVNET MODE] Building ${type} transaction...`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, txMessage]);

      // Build real Solana transaction
      const connection = getConnection();
      const transaction = new Transaction();
      
      if (type.includes('deposit')) {
        // REAL MVP demo: Move SOL from user to treasury on devnet
        // This creates an actual on-chain transaction that moves real SOL
        
        const solAmount = parseFloat(amount.replace(' SOL', ''));
        const lamports = solAmount * LAMPORTS_PER_SOL;
        
        // Use the new treasury address that we control
        const treasuryAddress = new PublicKey('BAcgS8dQ3e5FgN1UWNEKPTjcGNQYBrNK97VQq2HMeuNG');
        
        console.log('Creating REAL deposit transaction:', {
          from: publicKey.toString(),
          to: treasuryAddress.toString(),
          amount: solAmount,
          lamports
        });
        
        // REAL SOL transfer from user to treasury
        const transferInstruction = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryAddress,
          lamports: lamports
        });
        
        transaction.add(transferInstruction);
        
        // Add memo to identify this as a yield strategy deposit
        const memoInstruction = new TransactionInstruction({
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: Buffer.from(`Yield Strategy Deposit: ${amount} SOL at 25% APY - REAL TRANSACTION`, 'utf8')
        });
        
        transaction.add(memoInstruction);
        
        // Store the deposit info for withdrawal calculations
        const depositInfo = {
          amount: solAmount,
          treasuryAddress: treasuryAddress.toString(),
          timestamp: Date.now(),
          targetAPY: 25,
          status: 'active',
          userAddress: publicKey.toString()
        };
        
        // Store in localStorage for demo purposes
        localStorage.setItem('cyphr_deposit', JSON.stringify(depositInfo));
        
        console.log('REAL deposit transaction created:', {
          amount: solAmount,
          targetAPY: 25,
          timestamp: Date.now(),
          treasuryAddress: treasuryAddress.toString()
        });
      }

      // Handle withdraw transactions
      if (type.includes('withdraw')) {
        // REAL MVP demo: Return SOL + yield from treasury to user on devnet
        // This creates an actual on-chain transaction that returns real SOL
        
        // Get the stored deposit info
        const storedDeposit = localStorage.getItem('cyphr_deposit');
        if (storedDeposit) {
          try {
            const depositInfo = JSON.parse(storedDeposit);
            const depositAmount = depositInfo.amount;
            const targetAPY = depositInfo.targetAPY;
            
            // Calculate yield (25% APY for demo purposes)
            // For demo, we'll use a fixed yield amount to make it predictable
            const yieldAmount = depositAmount * (targetAPY / 100);
            const totalReturn = depositAmount + yieldAmount;
            const totalReturnLamports = totalReturn * LAMPORTS_PER_SOL;
            
            console.log('Processing REAL withdrawal:', {
              depositAmount,
              yieldAmount,
              totalReturn,
              targetAPY,
              totalReturnLamports
            });
            
            // REAL SOL transfer from treasury back to user
            // Note: For this to work, the treasury address needs to have SOL
            // In a real system, this would be your actual treasury contract
            const treasuryAddress = new PublicKey('BAcgS8dQ3e5FgN1UWNEKPTjcGNQYBrNK97VQq2HMeuNG');
            
            // Create the transfer instruction to return SOL + yield
            const transferInstruction = SystemProgram.transfer({
              fromPubkey: treasuryAddress,
              toPubkey: publicKey,
              lamports: totalReturnLamports
            });
            
            transaction.add(transferInstruction);
            
            // Add memo to identify this as a yield strategy withdrawal
            const memoInstruction = new TransactionInstruction({
              keys: [],
              programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
              data: Buffer.from(`Yield Strategy Withdrawal: ${depositAmount} SOL + ${yieldAmount.toFixed(4)} SOL yield (${targetAPY}% APY) = ${totalReturn.toFixed(4)} SOL total - REAL TRANSACTION`, 'utf8')
            });
            
            transaction.add(memoInstruction);
            
            // Store withdrawal info for UI updates
            const withdrawalInfo = {
              originalDeposit: depositAmount,
              yieldEarned: yieldAmount,
              totalReturn: totalReturn,
              timestamp: Date.now()
            };
            localStorage.setItem('cyphr_withdrawal', JSON.stringify(withdrawalInfo));
            
            // Clear the stored deposit info
            localStorage.removeItem('cyphr_deposit');
            
            // Add a message to the chat explaining the withdrawal
            setTimeout(() => {
              const withdrawalMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot' as const,
                content: `💰 REAL Withdrawal processed!\n\n📊 Original Deposit: ${depositAmount} SOL\n🎯 Yield Earned: ${yieldAmount.toFixed(4)} SOL (${targetAPY}% APY)\n💸 Total Returned: ${totalReturn.toFixed(4)} SOL\n\n✅ Your SOL + yield has been successfully processed!\n\n🔗 Check your wallet balance - you should see the increase!`,
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, withdrawalMessage]);
            }, 1000);
            
          } catch (error) {
            console.error('Error processing withdrawal:', error);
            // Fallback: create generic withdrawal memo
            const memoInstruction = new TransactionInstruction({
              keys: [],
              programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
              data: Buffer.from(`Yield Strategy Withdrawal: ${amount || 'Full amount'} SOL + 25% APY yield`, 'utf8')
            });
            transaction.add(memoInstruction);
          }
        } else {
          // No deposit found, create generic withdrawal memo
          const memoInstruction = new TransactionInstruction({
            keys: [],
            programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
            data: Buffer.from(`Yield Strategy Withdrawal: ${amount || 'Full amount'} SOL + 25% APY yield`, 'utf8')
          });
          transaction.add(memoInstruction);
        }
      }
      
      // Process all transactions (deposits and withdrawals)
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign and send transaction
      const txMessage2 = {
        id: (Date.now() + 2).toString(),
        type: 'bot' as const,
        content: `🌐 [DEVNET MODE] Signing transaction with wallet...`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, txMessage2]);

      const signature = await sendTransaction(transaction);
      
      // Wait for confirmation
      const txMessage3 = {
        id: (Date.now() + 3).toString(),
        type: 'bot' as const,
        content: `🌐 [DEVNET MODE] Transaction sent! Waiting for confirmation...`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, txMessage3]);

      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      // Transaction successful
      const txHashMessage = {
        id: (Date.now() + 4).toString(),
        type: 'bot' as const,
        content: `✅ [DEVNET MODE] Transaction confirmed!\n\n📝 Hash: ${signature.substring(0, 8)}...${signature.substring(signature.length - 8)}\n🔗 [View on Explorer](https://explorer.solana.com/tx/${signature}?cluster=devnet)\n💰 Amount: ${amount || 'N/A'}\n⏱️ Status: Confirmed\n\n🚀 Real devnet transaction completed!`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, txHashMessage]);

      // Add to activity panel
      const newActivity = {
        id: Date.now().toString(),
        type: type.includes('deposit') ? 'deposit' : type.includes('withdraw') ? 'withdraw' : 'strategy',
        description: `${type} ${amount || ''}`,
        timestamp: new Date().toLocaleString(),
        amount: amount,
        status: 'completed' as const,
        signature: signature
      };
      
      // Add to event bus for activity tracking
      console.log('Devnet transaction completed:', { type, signature, amount });

      // Add post-flow chips
      setTimeout(() => {
        const postFlowChips = {
          id: (Date.now() + 5).toString(),
          type: 'bot' as const,
          content: `🎯 [Withdraw now] [Run again] [Change target]`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, postFlowChips]);
      }, 1000);

    } catch (error) {
      console.error('Transaction failed:', error);
      const errorMessage = {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: `❌ [DEVNET MODE] Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle deposit chip clicks
  const handleDepositChip = (amount: string) => {
    // Add user confirmation message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: `I want to deposit ${amount} SOL`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Execute the transaction (demo or devnet based on mode)
    executeTransaction('deposit', amount);
  };

  // Handle strategy execution chip clicks
  const handleExecuteStrategyChip = (targetAPY: string) => {
    // Add user confirmation message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: `Execute ${targetAPY} strategy`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Execute strategy (demo or devnet based on mode)
    executeTransaction('strategy execution', targetAPY);
  };

  // Handle retry withdrawal
  const handleRetryWithdrawal = async () => {
    // Add user confirmation message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: 'Try withdrawal again',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Retry the withdrawal
    await handleWithdrawRequest('retry withdrawal');
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

  const refreshVaultBalances = async () => {
    if (!connected || !publicKey) return;
    
    try {
      // Try to fetch vault state first
      if (vaultService) {
        const vaultState = await vaultService.getBasicVaultState();
        const userDeposit = await vaultService.getUserDeposit();
        
        if (vaultState && userDeposit) {
          // Calculate current yield based on deposit amount and time
          const depositAmount = userDeposit.depositAmount.toNumber() / 1e9; // Convert lamports to SOL
          const yieldEarned = userDeposit.yieldEarned.toNumber() / 1e9; // Convert lamports to SOL
          const totalVaultValue = depositAmount + yieldEarned;
          
          // Update the displayed balance to show vault position
          const currentWallet = wallets[0];
          if (currentWallet) {
            const updatedWallet = {
              ...currentWallet,
              vaultPosition: `${depositAmount.toFixed(4)} SOL`,
              yieldEarned: `${yieldEarned.toFixed(4)} SOL`,
              totalVaultValue: `${totalVaultValue.toFixed(4)} SOL`
            };
            setWallets([updatedWallet]);
          }
          
          console.log('Vault balances updated:', {
            depositAmount,
            yieldEarned,
            totalVaultValue
          });
          return;
        }
      }
      
      // Fallback: Refresh wallet balances and show treasury position
      const connection = getConnection();
      const solBalance = await connection.getBalance(publicKey);
      const solBalanceSOL = (solBalance / 1e9).toFixed(4);
      
      // Check for stored deposit info to show treasury position
      const storedDeposit = localStorage.getItem('cyphr_deposit');
      let vaultPosition = 'No active position';
      let yieldEarned = '0.0000 SOL';
      let totalVaultValue = '0.0000 SOL';
      
      if (storedDeposit) {
        try {
          const depositInfo = JSON.parse(storedDeposit);
          const depositAmount = depositInfo.amount;
          const targetAPY = depositInfo.targetAPY;
          const timeElapsed = (Date.now() - depositInfo.timestamp) / (1000 * 60 * 60 * 24 * 365); // years
          const yieldAmount = depositAmount * (targetAPY / 100) * timeElapsed;
          
          vaultPosition = `${depositAmount.toFixed(4)} SOL`;
          yieldEarned = `${yieldAmount.toFixed(4)} SOL`;
          totalVaultValue = `${(depositAmount + yieldAmount).toFixed(4)} SOL`;
        } catch (error) {
          console.error('Error parsing deposit info:', error);
        }
      }
      
      const currentWallet = wallets[0];
      if (currentWallet) {
        const updatedWallet = {
          ...currentWallet,
          balance: `${solBalanceSOL} SOL`,
          balanceUSD: `$${(parseFloat(solBalanceSOL) * 100).toFixed(2)}`,
          vaultPosition,
          yieldEarned,
          totalVaultValue
        };
        setWallets([updatedWallet]);
      }
      
      console.log('Wallet balances refreshed:', { 
        solBalanceSOL, 
        vaultPosition, 
        yieldEarned, 
        totalVaultValue 
      });
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    }
  };

  const renderInteractiveChips = (content: string) => {
    // Check if content contains chip patterns
    if (content.includes('[Withdraw now]') && content.includes('[Run again]') && content.includes('[Change target]')) {
      return (
        <div className="interactive-chips">
          <ChatChip 
            label="Withdraw now" 
            onClick={() => handleWithdrawRequest('withdraw now')}
            variant="success"
          />
          <ChatChip 
            label="Run again" 
            onClick={() => handleYieldStrategyRequest('Find me a yield strategy that earns me 25% APY')}
            variant="primary"
          />
          <ChatChip 
            label="Change target" 
            onClick={() => {
              const message = {
                id: Date.now().toString(),
                type: 'user' as const,
                content: 'I want to change my yield target',
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, message]);
              // Add bot response
              setTimeout(() => {
                const botResponse = {
                  id: (Date.now() + 1).toString(),
                  type: 'bot' as const,
                  content: 'What yield target would you like? You can choose from 15%, 25%, or 50% APY strategies.',
                  timestamp: new Date()
                };
                setChatMessages(prev => [...prev, botResponse]);
              }, 500);
            }}
            variant="secondary"
          />
        </div>
      );
    }
    
    if (content.includes('[Deposit again]') && content.includes('[View balance]') && content.includes('[Change strategy]')) {
      return (
        <div className="interactive-chips">
          <ChatChip 
            label="Deposit again" 
            onClick={() => handleYieldStrategyRequest('Find me a yield strategy that earns me 25% APY')}
            variant="success"
          />
          <ChatChip 
            label="View balance" 
            onClick={() => {
              const message = {
                id: Date.now().toString(),
                type: 'user' as const,
                content: 'Show me my current balance',
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, message]);
              // Add bot response
              setTimeout(() => {
                const botResponse = {
                  id: (Date.now() + 1).toString(),
                  type: 'bot' as const,
                  content: `💰 Your current wallet balance:\n\nSOL: ${wallets[0]?.balance || 'Loading...'}\nUSD Value: ${wallets[0]?.balanceUSD || 'Loading...'}\n\nWould you like to deposit more or check your vault position?`,
                  timestamp: new Date()
                };
                setChatMessages(prev => [...prev, botResponse]);
              }, 500);
            }}
            variant="primary"
          />
          <ChatChip 
            label="Change strategy" 
            onClick={() => {
              const message = {
                id: Date.now().toString(),
                type: 'user' as const,
                content: 'I want to change my strategy',
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, message]);
              // Add bot response
              setTimeout(() => {
                const botResponse = {
                  id: (Date.now() + 1).toString(),
                  type: 'bot' as const,
                  content: 'What type of strategy would you like? I can help with yield farming, borrowing, trading, or portfolio optimization.',
                  timestamp: new Date()
                };
                setChatMessages(prev => [...prev, botResponse]);
              }, 500);
            }}
            variant="secondary"
          />
        </div>
      );
    }

    // Handle retry withdrawal chips
    if (content.includes('[Try Withdrawal Again]')) {
      return (
        <div className="interactive-chips">
          <ChatChip 
            label="Try Withdrawal Again" 
            onClick={handleRetryWithdrawal}
            variant="warning"
          />
          <ChatChip 
            label="Contact Support" 
            onClick={() => {
              const message = {
                id: Date.now().toString(),
                type: 'user' as const,
                content: 'I need help with my withdrawal',
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, message]);
              // Add bot response
              setTimeout(() => {
                const botResponse = {
                  id: (Date.now() + 1).toString(),
                  type: 'bot' as const,
                  content: 'I understand you\'re having trouble with your withdrawal. Let me help you troubleshoot this issue. Your funds are safe and secure, and we\'ll get them back to you.',
                  timestamp: new Date()
                };
                setChatMessages(prev => [...prev, botResponse]);
              }, 500);
            }}
            variant="secondary"
          />
        </div>
      );
    }
    
    // Return regular content if no chips
    return <span>{content}</span>;
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
          <span className={`mode-badge ${transactionMode === 'devnet' ? 'real-mode' : 'demo-mode'}`}>
            {transactionMode === 'devnet' ? '🌐 REAL DEVNET' : '🎭 DEMO MODE'}
          </span>
        </div>
        <div className="cyphr-bot-subtitle">
          Your AI-powered trading and strategy assistant
        </div>
        
        {/* Transaction Mode Toggle */}
        <div className="transaction-mode-toggle">
          <span className="mode-label">Transaction Mode:</span>
          <div className="mode-buttons">
            <button
              className={`mode-button ${transactionMode === 'demo' ? 'active' : ''}`}
              onClick={() => setTransactionMode('demo')}
            >
              🎭 Demo Mode
            </button>
            <button
              className={`mode-button ${transactionMode === 'devnet' ? 'active' : ''}`}
              onClick={() => setTransactionMode('devnet')}
            >
              🌐 Devnet Mode
            </button>
          </div>
          <div className="mode-description">
            {transactionMode === 'demo' 
              ? 'Simulated transactions for safe testing' 
              : 'Real devnet transactions with actual SOL movement'
            }
          </div>
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
            <div 
              className="chat-messages" 
              ref={chatMessagesRef}
              onScroll={handleChatScroll}
            >
              {chatMessages.map(message => (
                <div key={message.id} className={`chat-message ${message.type}`}>
                  {message.type === 'bot' && (
                    <div className="bot-avatar">
                      <Bot size={20} />
                    </div>
                  )}
                  <div className="message-content">
                    {message.content.includes('[Deposit') || message.content.includes('[Execute') ? (
                      <div>
                        <div>{message.content.split('[')[0]}</div>
                        <div className="action-chips">
                          {message.content.match(/\[([^\]]+)\]/g)?.map((chip, index) => {
                            const label = chip.replace(/[\[\]]/g, '');
                            if (label.includes('Deposit')) {
                              const amount = label.match(/Deposit ([\d.]+) SOL/)?.[1];
                              return (
                                <button
                                  key={index}
                                  className="action-chip deposit-chip"
                                  onClick={() => handleDepositChip(amount + ' SOL')}
                                >
                                  {label}
                                </button>
                              );
                            } else if (label.includes('Execute')) {
                              const targetAPY = label.match(/Execute ([\d.]+%)/)?.[1];
                              return (
                                <button
                                  key={index}
                                  className="action-chip execute-chip"
                                  onClick={() => handleExecuteStrategyChip(targetAPY || '25%')}
                                >
                                  {label}
                                </button>
                                );
                            }
                            return (
                              <span key={index} className="action-chip-text">
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : message.content.includes('[Withdraw now]') || message.content.includes('[Deposit again]') ? (
                      renderInteractiveChips(message.content)
                    ) : (
                      message.content
                    )}
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
              
              {/* Jump to latest button */}
              {!isAtBottom && (
                <div className="jump-to-latest">
                  <button 
                    className="jump-to-latest-btn"
                    onClick={scrollToBottom}
                  >
                    ↓ Jump to latest
                  </button>
                </div>
              )}
            </div>

            <div className="suggested-prompts">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="suggested-prompt"
                  onClick={() => {
                    // Automatically send the message and trigger bot response
                    setInputMessage(prompt);
                    
                    // Add user message to chat
                    const userMessage = {
                      id: Date.now().toString(),
                      type: 'user' as const,
                      content: prompt,
                      timestamp: new Date()
                    };
                    setChatMessages(prev => [...prev, userMessage]);
                    
                    // Clear input and trigger bot response
                    setInputMessage('');
                    
                    // Handle the specific prompt automatically
                    if (prompt.includes('25% APY') || prompt.includes('50% APY')) {
                      handleYieldStrategyRequest(prompt);
                    } else if (prompt.includes('borrow against it to yield farm')) {
                      handleBorrowYieldRequest(prompt);
                    } else if (prompt.includes('borrow against it to trade')) {
                      handleBorrowTradeRequest(prompt);
                    } else if (prompt.includes('rebalance my portfolio')) {
                      handleRebalanceRequest(prompt);
                    } else if (prompt.includes('optimize my yield farming positions')) {
                      handleOptimizeRequest(prompt);
                    } else if (prompt.includes('analyze my current yield farming risk')) {
                      handleRiskAnalysisRequest(prompt);
                    }
                  }}
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
            {!connected ? (
              <button 
                className="connect-wallet-button"
                onClick={async () => {
                  try {
                    console.log('Attempting to connect to Phantom wallet...');
                    // Use the proper wallet connection from the provider
                    await connect('phantom');
                    console.log('Wallet connection successful!');
                  } catch (error) {
                    console.error('Failed to connect wallet:', error);
                    alert(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
              >
                Connect Wallet
              </button>
            ) : (
              <button className="deposit-button">Deposit</button>
            )}
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
            {connected && (
              <div className="connection-status">
                <span className="status-indicator connected">●</span>
                <span className="status-text">Connected</span>
              </div>
            )}
          </div>

          {connected && (
            <div className="wallet-section">
              <div className="wallet-title">
                <Wallet className="wallet-icon" />
                <span>Wallet</span>
              </div>
              
              {publicKey ? (
                <div className="wallet-item">
                  <div className="wallet-network">
                    <span className="network-name">Solana</span>
                    <div className="wallet-address-container">
                      <span className="wallet-address">{`${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`}</span>
                      <div className="wallet-actions">
                        <button 
                          className="copy-button"
                          onClick={() => copyToClipboard(publicKey.toString())}
                          title="Copy address"
                        >
                          <Copy size={12} />
                        </button>
                        <button 
                          className="disconnect-button"
                          onClick={() => disconnect()}
                          title="Disconnect wallet"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="wallet-balance">
                    <span className="balance-amount">
                      {wallets.length > 0 ? wallets[0].balance : 'Loading...'}
                    </span>
                    <span className="balance-usd">
                      {wallets.length > 0 ? wallets[0].balanceUSD : 'Loading...'}
                    </span>
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
                        <div className="asset-item">
                          <span className="asset-symbol">SOL</span>
                          <span className="asset-amount">
                            {wallets.length > 0 ? wallets[0].assets[0]?.amount : 'Loading...'}
                          </span>
                          <span className="asset-value">
                            {wallets.length > 0 ? wallets[0].assets[0]?.valueUSD : 'Loading...'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
