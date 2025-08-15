import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Rocket, DollarSign, Trophy, Check, Settings, Trash2, Play, Save, Zap } from 'lucide-react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
  useReactFlow,
} from 'reactflow';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'reactflow/dist/style.css';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { usePosition } from '../hooks/usePosition';
import { useTxToasts } from '../hooks/useTxToasts';
import { enableCollateral, borrow, repay } from '../adapters/lender';
import { swap } from '../adapters/dex';
import { enforcePolicy } from '../utils/enforcePolicy';
import { DEFAULT_POLICY } from '../config/policy';
import { PositionCard } from '../components/PositionCard';
import NumericInput from '../components/ui/NumericInput';
import { usePreflight, PreflightBanner } from '../debug/Preflight';
import { useStrategyStore } from '../state/strategyStore';
import { serializeGraph, validateConfig, simulate, create, execute, setStrategyEventBus } from '../services/strategyBuilderService';
import { getVaultInfo, getUserVaultStats } from '../services/vaultService';
import './StrategyBuilder.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Custom Controls Component for ReactFlow
const CustomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  
  return (
    <div className="custom-controls">
      <button 
        className="control-button zoom-in" 
        onClick={() => zoomIn()}
        title="Zoom In"
      />
      <button 
        className="control-button zoom-out" 
        onClick={() => zoomOut()}
        title="Zoom Out"
      />
      <button 
        className="control-button fullscreen" 
        onClick={() => {
          const canvas = document.querySelector('.strategy-canvas');
          if (canvas) {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              canvas.requestFullscreen();
            }
          }
        }}
        title="Toggle Fullscreen"
      />
      <button 
        className="control-button center" 
        onClick={() => fitView()}
        title="Center Strategy"
      />
    </div>
  );
};

// Import the updated node components
import InputNode from '../components/nodes/InputNode';
import LogicNode from '../components/nodes/LogicNode';
import ActionNode from '../components/nodes/ActionNode';






const StrategyBuilder: React.FC = () => {
  // State for ReactFlow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Node delete handler
  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  // Define node types with delete functionality
  const nodeTypes: NodeTypes = useMemo(() => ({
    inputNode: (props: any) => <InputNode {...props} onDelete={handleNodeDelete} />,
    logicNode: (props: any) => <LogicNode {...props} onDelete={handleNodeDelete} />,
    actionNode: (props: any) => <ActionNode {...props} onDelete={handleNodeDelete} />,
  }), [handleNodeDelete]);

  console.log('StrategyBuilder render - nodes:', nodes, 'edges:', edges);
  const [strategyName, setStrategyName] = useState('My DeFi Strategy');
  const [isExecuting, setIsExecuting] = useState(false);
  const [collateralAmount, setCollateralAmount] = useState('20');
  const [borrowAmountStr, setBorrowAmountStr] = useState('500');
  const borrowAmount = borrowAmountStr === '' || borrowAmountStr === '.' ? 0 : Number(borrowAmountStr);
  const [ltvPct, setLtvPct] = useState(String(DEFAULT_POLICY.maxLtv * 100));
  const [slippagePct, setSlippagePct] = useState(String(DEFAULT_POLICY.maxSlippageBps / 100));
  const [selectedToken, setSelectedToken] = useState('SOL');
  const [tokenPrice, setTokenPrice] = useState(150);
  const [strategyRisk, setStrategyRisk] = useState('low');
  const [maxDrawdown, setMaxDrawdown] = useState(8);
  const [sharpeRatio, setSharpeRatio] = useState(2.5);
  
  // Lending and borrowing state
  const [depositAmount, setDepositAmount] = useState('');
  const [borrowAmountInput, setBorrowAmountInput] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [solBalance, setSolBalance] = useState(0);
  
  // Lending pool configuration
  const LENDING_CONFIG = {
    collateralToken: 'SOL',
    borrowToken: 'USDC',
    maxLtv: 0.75, // 75% loan-to-value ratio
    liquidationThreshold: 0.8,
    borrowRate: 0.08, // 8% APY
    supplyRate: 0.06  // 6% APY
  };
  
  // Lending and borrowing state
  const [lendingStats, setLendingStats] = useState({
    totalDeposits: 0,
    totalBorrows: 0,
    utilizationRate: 0,
    depositAPY: 0.06,
    borrowAPY: 0.08
  });
  
  // User's lending position
  const [userPosition, setUserPosition] = useState({
    collateralDeposited: 0,      // SOL deposited as collateral
    usdcBorrowed: 0,             // USDC borrowed
    availableToBorrow: 0,        // USDC available to borrow
    healthFactor: 1.0,           // Collateral health factor
    ltvRatio: 0                  // Current loan-to-value ratio
  });

  // Wallet integration
  const { connected, publicKey } = useSolanaWallet();
  const position = usePosition();
  const { withTxToasts } = useTxToasts();

  // Preflight check
  const { ok: preflightOk } = usePreflight();

  // Strategy store
  const { 
    graph, setGraph, cfg, setCfg, lastResult, setLastResult, 
    loading, setLoading, events, pushEvent 
  } = useStrategyStore();

  // Safe config loading with fallback
  const [config, setConfig] = useState<any>({});

  // Set up strategy event bus
  useEffect(() => {
    setStrategyEventBus(pushEvent);
  }, [pushEvent]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configModule = await import('../config/tokens.devnet.json');
        setConfig(configModule.default || configModule);
      } catch (e) {
        console.warn('Could not load tokens.devnet.json, using empty config');
        setConfig({});
      }
    };
    loadConfig();
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Strategy handlers
  const handleSimulate = async () => {
    if (!connected || !preflightOk) return;
    
    setLoading('simulate', true);
    try {
      // Update graph in store
      const currentGraph = { nodes, edges };
      setGraph(currentGraph);
      
      // Serialize to config
      const strategyConfig = serializeGraph(currentGraph);
      setCfg(strategyConfig);
      
      // Validate config
      const validation = validateConfig(strategyConfig);
      if (!validation.ok) {
        throw new Error(`Invalid strategy: ${validation.errors.join(', ')}`);
      }
      
      // Simulate strategy
      const simulation = await simulate(strategyConfig);
      
      // Store results
      setLastResult({
        type: 'simulate',
        data: simulation,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setLoading('simulate', false);
    }
  };

  const handleSave = async () => {
    if (!connected || !preflightOk || !cfg) return;
    
    setLoading('create', true);
    try {
      // Create strategy
      const result = await withTxToasts(
        create(cfg),
        {
          pending: 'Creating strategy...',
          success: 'Strategy created successfully',
          error: 'Failed to create strategy'
        }
      );
      
      // Store results
      setLastResult({
        type: 'create',
        data: result,
        timestamp: Date.now()
      });
      
      // Refresh position
      position.refresh();
      
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading('create', false);
    }
  };

  const handleExecute = async () => {
    if (!connected || !preflightOk || !lastResult || lastResult.type !== 'create') return;
    
    setLoading('execute', true);
    try {
      // Execute strategy
      const result = await withTxToasts(
        execute(lastResult.data.strategyId),
        {
          pending: 'Executing strategy...',
          success: 'Strategy executed successfully',
          error: 'Failed to execute strategy'
        }
      );
      
      // Store results
      setLastResult({
        type: 'execute',
        data: result,
        timestamp: Date.now()
      });
      
      // Refresh position
      position.refresh();
      
    } catch (error) {
      console.error('Execute failed:', error);
    } finally {
      setLoading('execute', false);
    }
  };

  // Load vault info when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      const loadVaultInfo = async () => {
        try {
          await getVaultInfo();
          await getUserVaultStats(publicKey);
        } catch (error) {
          console.warn('Failed to load vault info:', error);
        }
      };
      loadVaultInfo();
    }
  }, [connected, publicKey]);

  const updateNodeData = useCallback((nodeId: string, field: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: value,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Drag and Drop functionality
  const onDragStart = useCallback((event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: nodeType,
      label: label,
    }));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    // Create new node based on type
    let newNode: Node;
    const nodeId = `${data.type}-${Date.now()}`;

    switch (data.type) {
      case 'inputNode':
        newNode = {
          id: nodeId,
          type: 'inputNode',
          position,
          data: {
            label: data.label,
            onChange: (field: string, value: any) => updateNodeData(nodeId, field, value),
            token: 'SOL',
            dataType: 'price',
          },
        };
        break;
      case 'logicNode':
        newNode = {
          id: nodeId,
          type: 'logicNode',
          position,
          data: {
            label: data.label,
            onChange: (field: string, value: any) => updateNodeData(nodeId, field, value),
            logicType: 'time',
            riskLevel: 'medium-risk',
            duration: '3-weeks',
            profitTarget: '15',
          },
        };
        break;
      case 'actionNode':
        newNode = {
          id: nodeId,
          type: 'actionNode',
          position,
          data: {
            label: data.label,
            onChange: (field: string, value: any) => updateNodeData(nodeId, field, value),
            actionType: 'entry',
            action: 'stake',
            autoExecute: 'yes',
            riskLevel: 'medium-risk',
          },
        };
        break;
      default:
        return;
    }

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, updateNodeData]);

  const borrowAndTrade = async () => {
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected');
    }

    // Validate config is loaded
    if (!config.mintA || !config.mintB) {
      throw new Error('Token configuration not loaded. Please run setup:devnet first.');
    }

    const collateralAmountNum = parseFloat(collateralAmount);
    const borrowAmountNum = borrowAmount;
    const ltvPctNum = parseFloat(ltvPct);
    const slippageBpsNum = parseFloat(slippagePct) * 100;

    // Validate amounts
    if (isNaN(collateralAmountNum) || collateralAmountNum <= 0) {
      throw new Error('Invalid collateral amount');
    }
    if (isNaN(borrowAmountNum) || borrowAmountNum <= 0) {
      throw new Error('Invalid borrow amount');
    }

    // Enforce policy caps
    const intent = {
      collateralMint: config.mintA,
      collateralAmount: collateralAmountNum,
      borrowMint: config.mintB,
      borrowAmount: borrowAmountNum,
      targetMint: config.mintA,
      slippageBps: slippageBpsNum,
      borrowAmountUsd: borrowAmountNum,
      ltv: ltvPctNum / 100,
    };

    enforcePolicy(intent);

    setIsExecuting(true);
    try {
      // Step 1: Enable collateral
      await withTxToasts(
        enableCollateral(config.mintA, collateralAmountNum),
        {
          pending: 'Enabling collateral...',
          success: 'Collateral enabled',
          error: 'Failed to enable collateral',
        }
      );

      // Step 2: Borrow
      await withTxToasts(
        borrow(config.mintB, borrowAmountNum),
        {
          pending: `Borrowing ${borrowAmountNum}...`,
          success: 'Borrow successful',
          error: 'Borrow failed',
        }
      );

      // Step 3: Swap
      await withTxToasts(
        swap(config.mintB, config.mintA, borrowAmountNum, slippageBpsNum),
        {
          pending: 'Executing swap...',
          success: 'Trade executed',
          error: 'Swap failed',
        }
      );

      // Refresh position
      await position.refresh();
    } catch (error) {
      console.error('Borrow & Trade failed:', error);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  const handleBorrowAndTrade = async () => {
    try {
      await borrowAndTrade();
    } catch (error) {
      console.error('Error in borrow and trade:', error);
    }
  };

  const handleRepay = async () => {
    if (!position.position) return;
    
    try {
      setIsExecuting(true);
      // Implementation for repay would go here
      console.log('Repay functionality to be implemented');
    } catch (error) {
      console.error('Repay failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleUnwind = async () => {
    if (!position.position) return;
    
    try {
      setIsExecuting(true);
      // Implementation for unwind would go here
      console.log('Unwind functionality to be implemented');
    } catch (error) {
      console.error('Unwind failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRepayAndUnwind = async () => {
    if (!position.position || !connected || !publicKey) return;

    try {
      setIsExecuting(true);
      const pos = position.position;
      const slippageBpsNum = 100; // 1% slippage for unwind

      // Step 1: If exposure token != borrow asset, swap back
      if (pos.exposure.amount > 0 && pos.exposure.symbol !== pos.debt.symbol) {
        await withTxToasts(
          swap(
            config.mintA, // exposure asset (assuming mintA is collateral/exposure)
            config.mintB, // debt asset
            pos.exposure.amount,
            slippageBpsNum
          ),
          {
            pending: 'Converting exposure back to debt asset...',
            success: 'Exposure converted',
            error: 'Failed to convert exposure',
          }
        );
      }

      // Step 2: Repay outstanding debt
      if (pos.debt.amount > 0) {
        await withTxToasts(
          repay(config.mintB, pos.debt.amount),
          {
            pending: `Repaying ${pos.debt.amount} ${pos.debt.symbol}...`,
            success: 'Debt repaid successfully',
            error: 'Failed to repay debt',
          }
        );
      }

      // Step 3: Refresh position
      await position.refresh();
    } catch (error) {
      console.error('Repay & Unwind failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle SOL deposit as collateral
  const handleDeposit = async () => {
    if (!connected || !publicKey) return;
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    try {
      setIsDepositing(true);
      
      // Use your existing enableCollateral function from the lender adapter
      await withTxToasts(
        enableCollateral('SOL', amount),
        {
          pending: `Depositing ${amount} SOL as collateral...`,
          success: `${amount} SOL deposited as collateral!`,
          error: 'Deposit failed',
        }
      );
      
      // Clear the input and refresh lending stats
      setDepositAmount('');
      await refreshLendingStats();
      
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsDepositing(false);
    }
  };

  // Handle USDC borrow
  const handleBorrow = async () => {
    if (!connected || !publicKey) return;
    
    const amount = parseFloat(borrowAmountInput);
    if (isNaN(amount) || amount <= 0) return;
    
    try {
      setIsBorrowing(true);
      
      // Use your existing borrow function from the lender adapter
      await withTxToasts(
        borrow('USDC', amount),
        {
          pending: `Borrowing ${amount} USDC...`,
          success: `${amount} USDC borrowed successfully!`,
          error: 'Borrow failed',
        }
      );
      
      // Clear the input and refresh lending stats
      setBorrowAmountInput('');
      await refreshLendingStats();
      
    } catch (error) {
      console.error('Borrow failed:', error);
    } finally {
      setIsBorrowing(false);
    }
  };

  // Handle SOL withdrawal
  const handleWithdraw = async () => {
    if (!connected || !publicKey) return;
    
    try {
      // For demo purposes, simulate withdrawal
      await withTxToasts(
        Promise.resolve({ signature: 'withdraw_' + Date.now() }),
        {
          pending: 'Withdrawing SOL collateral...',
          success: 'SOL withdrawn successfully!',
          error: 'Withdrawal failed',
        }
      );
      
      await refreshLendingStats();
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  // Handle USDC repayment
  const handleRepayUSDC = async () => {
    if (!connected || !publicKey) return;
    
    try {
      // For demo purposes, simulate repayment
      await withTxToasts(
        Promise.resolve({ signature: 'repay_' + Date.now() }),
        {
          pending: 'Repaying USDC...',
          success: 'USDC repaid successfully!',
          error: 'Repayment failed',
        }
      );
      
      await refreshLendingStats();
    } catch (error) {
      console.error('Repayment failed:', error);
    }
  };

  // Refresh lending and borrowing stats
  const refreshLendingStats = async () => {
    // Simulate lending data (replace with actual contract calls)
    setLendingStats({
      totalDeposits: Math.floor(Math.random() * 1000000) + 500000,
      totalBorrows: Math.floor(Math.random() * 800000) + 200000,
      utilizationRate: 0.6 + (Math.random() * 0.3),
      depositAPY: 0.06,
      borrowAPY: 0.08
    });

    setUserPosition({
      collateralDeposited: 2.5 + (Math.random() * 5), // 2.5-7.5 SOL
      usdcBorrowed: 100 + (Math.random() * 400),      // $100-$500 USDC
      availableToBorrow: 200 + (Math.random() * 800), // $200-$1000 USDC
      healthFactor: 1.2 + (Math.random() * 0.8),      // 1.2-2.0
      ltvRatio: 0.3 + (Math.random() * 0.4)          // 30%-70% LTV
    });
  };

  // Initialize lending stats and sample nodes
  useEffect(() => {
    refreshLendingStats();
    
    const sampleNodes: Node[] = [
      {
        id: 'input-1',
        type: 'inputNode',
        position: { x: 100, y: 100 },
        data: {
          label: 'Token Data',
          onChange: (field: string, value: any) => updateNodeData('input-1', field, value),
          token: 'SOL',
          dataType: 'price',
        },
      },
      {
        id: 'logic-1',
        type: 'logicNode',
        position: { x: 400, y: 100 },
        data: {
          label: 'Strategy Logic',
          onChange: (field: string, value: any) => updateNodeData('logic-1', field, value),
          logicType: 'time',
          riskLevel: 'medium-risk',
          duration: '3-weeks',
          profitTarget: '15',
        },
      },
      {
        id: 'action-1',
        type: 'actionNode',
        position: { x: 700, y: 100 },
        data: {
          label: 'Action',
          onChange: (field: string, value: any) => updateNodeData('action-1', field, value),
          actionType: 'entry',
          action: 'stake',
          autoExecute: 'yes',
          riskLevel: 'medium-risk',
        },
      },
    ];

    const sampleEdges: Edge[] = [
      { id: 'e1-2', source: 'input-1', target: 'logic-1' },
      { id: 'e2-3', source: 'logic-1', target: 'action-1' },
    ];

    setNodes(sampleNodes);
    setEdges(sampleEdges);
    console.log('Initialized sample nodes:', sampleNodes);
    console.log('Initialized sample edges:', sampleEdges);
  }, [updateNodeData]);

  return (
    <div className="strategy-builder">
      {/* Preflight Check */}
      <PreflightBanner />

      {/* Header Section - Bloomberg Style */}
      <div className="strategy-header-bar">
        <div className="header-left">
          <div className="strategy-title">
            <h1>STRATEGY BUILDER</h1>
            <p className="strategy-tagline">Test your risk before you buy</p>
          </div>
        </div>
        <div className="header-center">
          <div className="strategy-status">
            <span className="status-label">Strategy Risk Level:</span>
            <div className={`risk-badge ${strategyRisk}`}>
              {strategyRisk === 'low' ? 'LOW RISK' : 
               strategyRisk === 'high' ? 'HIGH RISK' : 'MEDIUM RISK'}
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="strategy-metrics">
            <div className="metric">
              <span className="metric-label">Max Drawdown:</span>
              <span className="metric-value">{maxDrawdown}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Sharpe Ratio:</span>
              <span className="metric-value">{sharpeRatio}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Modular Layout */}
      <div className="strategy-main-content">
        {/* Top Row - 4 Modules */}
        <div className="strategy-top-row">
          {/* Module 1: Deposit Collateral */}
          <div className="strategy-module deposit-module">
            <div className="module-header">
              <div className="module-title">
                <img src="/assets/icons/DepositIcon.png" alt="Deposit" className="module-icon" />
                <span>DEPOSIT COLLATERAL</span>
              </div>
              <div className="module-badge">
                <span>Roots Protocol</span>
              </div>
            </div>
            
            <div className="module-content">
              {connected ? (
                <div className="deposit-overview">
                  <div className="deposit-stats">
                    <div className="stat-item">
                      <div className="stat-value">{(userPosition.collateralDeposited).toFixed(4)} SOL</div>
                      <div className="stat-label">Your Collateral</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{(lendingStats.depositAPY * 100).toFixed(2)}%</div>
                      <div className="stat-label">Supply APY</div>
                    </div>
                  </div>
                  
                  <div className="deposit-form">
                    <div className="form-group">
                      <label>Amount (SOL):</label>
                      <div className="input-with-button">
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0.0"
                          min="0"
                          step="0.1"
                          className="deposit-input"
                        />
                        <button 
                          className="max-btn"
                          onClick={() => setDepositAmount(solBalance.toString())}
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                    
                    <div className="balance-info">
                      <span>Balance: {solBalance.toFixed(4)} SOL</span>
                      <span>≈ ${(solBalance * tokenPrice).toFixed(2)}</span>
                    </div>
                    
                    <button 
                      className="action-btn deposit"
                      onClick={handleDeposit}
                      disabled={isDepositing || !depositAmount || parseFloat(depositAmount) <= 0}
                    >
                      {isDepositing ? 'Depositing...' : 'DEPOSIT SOL'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="wallet-connect-prompt">
                  <div className="prompt-icon">
                    <img src="/assets/icons/WalletIcon.png" alt="Wallet" />
                  </div>
                  <p>Connect wallet to deposit SOL</p>
                  <button className="connect-wallet-btn" onClick={() => {}}>
                    {connected ? 'Connected ✓' : 'Connect Wallet'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Module 2: Borrow USDC */}
          <div className="strategy-module borrow-module">
            <div className="module-header">
              <div className="module-title">
                <img src="/assets/icons/ActionIcon.png" alt="Borrow" className="module-icon" />
                <span>BORROW USDC</span>
              </div>
              <div className="module-badge">
                <span>Roots Protocol</span>
              </div>
            </div>
            
            <div className="module-content">
              {connected ? (
                <div className="borrow-overview">
                  <div className="borrow-stats">
                    <div className="stat-item">
                      <div className="stat-value">${userPosition.usdcBorrowed.toFixed(2)}</div>
                      <div className="stat-label">USDC Borrowed</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{(lendingStats.borrowAPY * 100).toFixed(2)}%</div>
                      <div className="stat-label">Borrow APR</div>
                    </div>
                  </div>
                  
                  <div className="borrow-form">
                    <div className="form-group">
                      <label>Amount (USDC):</label>
                      <div className="input-with-button">
                        <input
                          type="number"
                          value={borrowAmountInput}
                          onChange={(e) => setBorrowAmountInput(e.target.value)}
                          placeholder="0.0"
                          min="0"
                          step="1"
                          className="borrow-input"
                        />
                        <button 
                          className="max-btn"
                          onClick={() => setBorrowAmountInput(userPosition.availableToBorrow.toString())}
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                    
                    <div className="borrow-info">
                      <span>Available: ${userPosition.availableToBorrow.toFixed(2)} USDC</span>
                      <span>Max LTV: {(LENDING_CONFIG.maxLtv * 100).toFixed(0)}%</span>
                    </div>
                    
                    <button 
                      className="action-btn borrow"
                      onClick={handleBorrow}
                      disabled={isBorrowing || !borrowAmountInput || parseFloat(borrowAmountInput) <= 0}
                    >
                      {isBorrowing ? 'Borrowing...' : 'BORROW USDC'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="wallet-connect-prompt">
                  <div className="prompt-icon">
                    <img src="/assets/icons/WalletIcon.png" alt="Wallet" />
                  </div>
                  <p>Connect wallet to borrow USDC</p>
                  <button className="connect-wallet-btn" onClick={() => {}}>
                    {connected ? 'Connected ✓' : 'Connect Wallet'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Module 3: Borrowing Health */}
          <div className="strategy-module health-module">
            <div className="module-header">
              <div className="module-title">
                <img src="/assets/icons/PNLIcon.png" alt="Health" className="module-icon" />
                <span>BORROWING HEALTH</span>
              </div>
              <div className="module-badge">
                <span>Risk Monitor</span>
              </div>
            </div>
            
            <div className="module-content">
              {connected ? (
                <div className="health-overview">
                  <div className="health-indicator">
                    <div className={`health-dot ${userPosition.healthFactor > 1.5 ? 'green' : userPosition.healthFactor > 1.1 ? 'yellow' : 'red'}`}></div>
                    <span className="health-text">
                      {userPosition.healthFactor > 1.5 ? 'SAFE' : userPosition.healthFactor > 1.1 ? 'WARNING' : 'DANGER'}
                    </span>
                  </div>
                  
                  <div className="health-metrics">
                    <div className="metric-row">
                      <span className="metric-label">Collateral:</span>
                      <span className="metric-value">{(userPosition.collateralDeposited).toFixed(4)} SOL</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Debt:</span>
                      <span className="metric-value">${userPosition.usdcBorrowed.toFixed(2)}</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">LTV Ratio:</span>
                      <span className="metric-value">{(userPosition.ltvRatio * 100).toFixed(1)}%</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Health Factor:</span>
                      <span className="metric-value">{userPosition.healthFactor.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="liquidation-warning">
                    {userPosition.healthFactor < 1.1 && (
                      <div className="warning-message">
                        ⚠️ Risk of liquidation - Add collateral or repay debt
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="wallet-connect-prompt">
                  <div className="prompt-icon">
                    <img src="/assets/icons/WalletIcon.png" alt="Wallet" />
                  </div>
                  <p>Connect wallet to view health</p>
                  <button className="connect-wallet-btn" onClick={() => {}}>
                    {connected ? 'Connected ✓' : 'Connect Wallet'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Module 4: Lending Pools */}
          <div className="strategy-module pools-module">
            <div className="module-header">
              <div className="module-title">
                <img src="/assets/icons/TokenDataIcon.png" alt="Pools" className="module-icon" />
                <span>LENDING POOLS</span>
              </div>
              <div className="module-badge">
                <span>Available</span>
              </div>
            </div>
            
            <div className="module-content">
              <div className="pools-overview">
                <div className="pool-item">
                  <div className="pool-header">
                    <span className="pool-name">SOL/USDC</span>
                    <span className="pool-status active">Active</span>
                  </div>
                  <div className="pool-stats">
                    <div className="pool-stat">
                      <span className="stat-label">Supply APY:</span>
                      <span className="stat-value">{(lendingStats.depositAPY * 100).toFixed(2)}%</span>
                    </div>
                    <div className="pool-stat">
                      <span className="stat-label">Borrow APR:</span>
                      <span className="stat-value">{(lendingStats.borrowAPY * 100).toFixed(2)}%</span>
                    </div>
                    <div className="pool-stat">
                      <span className="stat-label">Max LTV:</span>
                      <span className="stat-value">{(LENDING_CONFIG.maxLtv * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="pool-item">
                  <div className="pool-header">
                    <span className="pool-name">ETH/USDC</span>
                    <span className="pool-status coming-soon">Coming Soon</span>
                  </div>
                  <div className="pool-stats">
                    <div className="pool-stat">
                      <span className="stat-label">Supply APY:</span>
                      <span className="stat-value">--</span>
                    </div>
                    <div className="pool-stat">
                      <span className="stat-label">Borrow APR:</span>
                      <span className="stat-value">--</span>
                    </div>
                    <div className="pool-stat">
                      <span className="stat-label">Max LTV:</span>
                      <span className="stat-value">--</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Strategy Builder */}
        <div className="strategy-bottom-row">
          <div className="strategy-builder-module">
            <div className="module-header">
              <div className="module-title">
                <img src="/assets/icons/StrategyLogicIcon.png" alt="Strategy" className="module-icon" />
                <span>STRATEGY BUILDER</span>
              </div>
              <div className="module-badge">
                <span>Drag & Drop</span>
              </div>
            </div>
            
            <div className="module-content">
              <div className="strategy-builder-layout">
                {/* Left Sidebar - Strategy Components */}
                <div className="strategy-sidebar">
                  <div className="sidebar-section">
                    <h3>
                      <img src="/assets/icons/TokenDataIcon.png" alt="Data" className="section-icon" />
                      Data Sources
                    </h3>
                    <div className="strategy-inputs-list">
                      <div className="strategy-input-item" draggable onDragStart={(event) => onDragStart(event, 'inputNode', 'Token Price Data')}>
                        <img src="/assets/icons/TokenDataIcon.png" alt="Price Data" className="palette-icon" />
                        <span>Token Price Data</span>
                      </div>
                      <div className="strategy-input-item" draggable onDragStart={(event) => onDragStart(event, 'inputNode', 'Volume Data')}>
                        <img src="/assets/icons/TokenDataIcon.png" alt="Volume" className="palette-icon" />
                        <span>Volume Data</span>
                      </div>
                      <div className="strategy-input-item" draggable onDragStart={(event) => onDragStart(event, 'inputNode', 'Market Cap Data')}>
                        <img src="/assets/icons/TokenDataIcon.png" alt="Market Cap" className="palette-icon" />
                        <span>Market Cap Data</span>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-section">
                    <h3>
                      <img src="/assets/icons/StrategyLogicIcon.png" alt="Logic" className="section-icon" />
                      Strategy Logic
                    </h3>
                    <div className="strategy-inputs-list">
                      <div className="strategy-input-item" draggable onDragStart={(event) => onDragStart(event, 'logicNode', 'Price-Based Logic')}>
                        <img src="/assets/icons/PriceLogic.png" alt="Price Logic" className="palette-icon" />
                        <span>Price-Based Logic</span>
                      </div>
                      <div className="strategy-input-item" draggable onDragStart={(event) => onDragStart(event, 'logicNode', 'Volatility Logic')}>
                        <img src="/assets/icons/PulseIcon.png" alt="Volatility" className="palette-icon" />
                        <span>Volatility Logic</span>
                      </div>
                      <div className="strategy-input-item ai-optimized" draggable onDragStart={(event) => onDragStart(event, 'logicNode', 'AI-Optimized Logic')}>
                        <img src="/assets/icons/RobotIcon.png" alt="AI" className="palette-icon" />
                        <span>AI-Optimized Logic</span>
                        <div className="ai-badge">+75%</div>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-section">
                    <h3>
                      <img src="/assets/icons/ActionIcon.png" alt="Actions" className="section-icon" />
                      Actions
                    </h3>
                    <div className="strategy-inputs-list">
                      <div className="strategy-input-item" draggable onDragStart={(event) => onDragStart(event, 'actionNode', 'Entry & Exit')}>
                        <img src="/assets/icons/ActionIcon.png" alt="Entry/Exit" className="palette-icon" />
                        <span>Entry & Exit</span>
                      </div>
                      <div className="strategy-input-item" draggable onDragStart={(event) => onDragStart(event, 'actionNode', 'Hedge Action')}>
                        <img src="/assets/icons/HedgeIcon.png" alt="Hedge" className="palette-icon" />
                        <span>Hedge Action</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Canvas */}
                <div className="canvas-container">
                  <div style={{ height: '600px', width: '100%', position: 'relative' }}>
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      onNodeClick={onNodeClick}
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      nodeTypes={nodeTypes}
                      fitView
                      className="strategy-canvas"
                      style={{ background: '#000000' }}
                    >
                      <Controls />
                      <Background color="#000000" />
                      <MiniMap />
                      
                      {/* Custom Control Buttons */}
                      <CustomControls />
                    </ReactFlow>
                  </div>
                </div>

                {/* Right Results Panel */}
                <div className="results-panel">
                  <h3>
                    <img src="/assets/icons/TokenDataIcon.png" alt="Results" className="section-icon" />
                    Strategy Results
                  </h3>
                  
                  <div className="results-content">
                    {!lastResult ? (
                      <p>Click 'Simulate Strategy' to see results</p>
                    ) : (
                      <div className="strategy-results">
                        {lastResult.type === 'simulate' && (
                          <div className="simulation-results">
                            <h4>Simulation Results</h4>
                            <p><strong>Success Probability:</strong> {(lastResult.data.successProb * 100).toFixed(1)}%</p>
                            <p><strong>Estimated Yield:</strong> {lastResult.data.estYieldPct.toFixed(2)}%</p>
                            <div className="notes">
                              <strong>Notes:</strong>
                              <ul>
                                {lastResult.data.notes.map((note: string, index: number) => (
                                  <li key={index}>{note}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                        
                        {lastResult.type === 'create' && (
                          <div className="create-results">
                            <h4>Strategy Created</h4>
                            <p><strong>Strategy ID:</strong> {lastResult.data.strategyId}</p>
                            <p><strong>Signature:</strong> {lastResult.data.signature.substring(0, 8)}...</p>
                          </div>
                        )}
                        
                        {lastResult.type === 'execute' && (
                          <div className="execute-results">
                            <h4>Strategy Executed</h4>
                            <p><strong>Signature:</strong> {lastResult.data.signature.substring(0, 8)}...</p>
                            <p><strong>Status:</strong> Executed</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="strategy-actions">
                      <button
                        className="cyphr-btn primary"
                        onClick={handleSimulate}
                        disabled={!connected || !preflightOk || loading.simulate}
                      >
                        <Play className="w-4 h-4 inline mr-2" />
                        {loading.simulate ? 'Simulating...' : 'Simulate Strategy'}
                      </button>
                      
                      <button
                        className="cyphr-btn secondary"
                        onClick={handleSave}
                        disabled={!connected || !preflightOk || !cfg || loading.create}
                      >
                        <Save className="w-4 h-4 inline mr-2" />
                        {loading.create ? 'Saving...' : 'Save Strategy'}
                      </button>
                      
                      <button
                        className="cyphr-btn success"
                        onClick={handleExecute}
                        disabled={!connected || !preflightOk || !lastResult || lastResult.type !== 'create' || loading.execute}
                      >
                        <Zap className="w-4 h-4 inline mr-2" />
                        {loading.execute ? 'Executing...' : 'Execute Strategy'}
                      </button>
                    </div>
                  </div>

                  <div className="wallet-connection">
                    {connected ? (
                      <>
                        <p>Wallet Connected ✓</p>
                        <div className="wallet-icon">
                          <img src="/assets/icons/WalletIcon.png" alt="Wallet" />
                        </div>
                        <p className="wallet-status">Connected to {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}</p>
                      </>
                    ) : (
                      <>
                        <p>Connect your Phantom wallet to interact with the Cyphr Vaults.</p>
                        <div className="wallet-icon">
                          <img src="/assets/icons/WalletIcon.png" alt="Wallet" />
                        </div>
                        <p className="wallet-status">Wallet Not Connected</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Position Card */}
      {position.position && (
        <div className="position-section">
          <PositionCard
            position={position.position}
            onRepay={handleRepay}
            onUnwind={handleUnwind}
            onRepayAndUnwind={handleRepayAndUnwind}
            preflightOk={preflightOk}
          />
        </div>
      )}

      {/* Node Properties */}
      {selectedNode && (
        <div className="node-properties">
          <h3><Settings className="w-5 h-5 inline mr-2" />Node Properties</h3>
          <div className="property-group">
            <label>Node Type:</label>
            <span>{selectedNode.type}</span>
          </div>
          <div className="property-group">
            <label>Node ID:</label>
            <span>{selectedNode.id}</span>
          </div>
          <button
            className="cyphr-btn danger"
            onClick={() => {
              setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
              setSelectedNode(null);
            }}
          >
            <Trash2 className="w-4 h-4 inline mr-1" />Delete Node
          </button>
        </div>
      )}
    </div>
  );
};

export default StrategyBuilder;