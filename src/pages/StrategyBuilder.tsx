import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Rocket, DollarSign, Trophy, Check, Settings, Trash2 } from 'lucide-react';
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

// Enhanced Node Types with Risk Profiling
const InputNode: React.FC<{ data: any }> = ({ data }) => (
  <div className="strategy-node input-node" title="Data Source: Provides real-time token data for strategy execution">
    <Handle type="source" position={Position.Right} />
    <div className="node-header">
      <img src="/assets/icons/TokenDataIcon.png" alt="Token Data" className="node-icon" style={{ width: '20px', height: '20px' }} />
      <span className="node-title">{data.label}</span>
      <div className="node-risk-badge low-risk">Low Risk</div>
    </div>
    <div className="node-content">
      <div className="parameter">
        <label>Token:</label>
        <input 
          type="text" 
          placeholder="SOL, ETH, etc."
          value={data.token || ''}
          onChange={(e) => data.onChange('token', e.target.value)}
        />
      </div>
      <div className="parameter">
        <label>Data Type:</label>
        <select 
          value={data.dataType || 'price'}
          onChange={(e) => data.onChange('dataType', e.target.value)}
        >
          <option value="price">Price</option>
          <option value="volume">Volume</option>
          <option value="volatility">Volatility</option>
          <option value="market_cap">Market Cap</option>
        </select>
      </div>
    </div>
  </div>
);

const LogicNode: React.FC<{ data: any }> = ({ data }) => (
  <div className="strategy-node logic-node" title="Strategy Logic: Defines conditions and triggers for your strategy">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <div className="node-header">
      <img src="/assets/icons/StrategyLogicIcon.png" alt="Strategy Logic" className="node-icon" style={{ width: '20px', height: '20px' }} />
      <span className="node-title">{data.label}</span>
      <div className={`node-risk-badge ${data.riskLevel || 'medium-risk'}`}>
        {data.riskLevel === 'low-risk' ? 'Low Risk' : 
         data.riskLevel === 'high-risk' ? 'High Risk' : 'Medium Risk'}
      </div>
    </div>
    <div className="node-content">
      <div className="parameter">
        <label>Logic Type:</label>
        <select 
          value={data.logicType || 'time'}
          onChange={(e) => data.onChange('logicType', e.target.value)}
        >
          <option value="time">Time-Based</option>
          <option value="price">Price-Based</option>
          <option value="volatility">Volatility-Based</option>
          <option value="volume">Volume-Based</option>
          <option value="ai">AI-Optimized</option>
        </select>
      </div>
      <div className="parameter">
        <label>Duration:</label>
        <select 
          value={data.duration || '1-week'}
          onChange={(e) => data.onChange('duration', e.target.value)}
        >
          <option value="1-day">1 Day</option>
          <option value="1-week">1 Week</option>
          <option value="2-weeks">2 Weeks</option>
          <option value="3-weeks">3 Weeks</option>
          <option value="1-month">1 Month</option>
        </select>
      </div>
      <div className="parameter">
        <label>Profit Target (%):</label>
        <input 
          type="number"
          value={data.profitTarget || '15'}
          onChange={(e) => data.onChange('profitTarget', e.target.value)}
          placeholder="15"
          min="1"
          max="100"
        />
      </div>
    </div>
  </div>
);

const ActionNode: React.FC<{ data: any }> = ({ data }) => (
  <div className="strategy-node action-node" title="Action: Defines what happens when conditions are met">
    <Handle type="target" position={Position.Left} />
    <div className="node-header">
      <img src="/assets/icons/ActionIcon.png" alt="Action" className="node-icon" style={{ width: '20px', height: '20px' }} />
      <span className="node-title">{data.label}</span>
      <div className={`node-risk-badge ${data.riskLevel || 'medium-risk'}`}>
        {data.riskLevel === 'low-risk' ? 'Low Risk' : 
         data.riskLevel === 'high-risk' ? 'High Risk' : 'Medium Risk'}
      </div>
    </div>
    <div className="node-content">
      <div className="parameter">
        <label>Action Type:</label>
        <select 
          value={data.actionType || 'entry'}
          onChange={(e) => data.onChange('actionType', e.target.value)}
        >
          <option value="entry">Entry Action</option>
          <option value="exit">Exit Action</option>
          <option value="rebalance">Rebalance</option>
          <option value="hedge">Hedge</option>
        </select>
      </div>
      <div className="parameter">
        <label>Action:</label>
        <select 
          value={data.action || 'stake'}
          onChange={(e) => data.onChange('action', e.target.value)}
        >
          <option value="stake">Stake</option>
          <option value="swap">Swap</option>
          <option value="lend">Lend</option>
          <option value="borrow">Borrow</option>
          <option value="yield-farm">Yield Farm</option>
        </select>
      </div>
      <div className="parameter">
        <label>Auto Execute:</label>
        <select 
          value={data.autoExecute || 'yes'}
          onChange={(e) => data.onChange('autoExecute', e.target.value)}
        >
          <option value="yes">Yes (Automated)</option>
          <option value="no">No (Manual)</option>
          <option value="semi">Semi-Automated</option>
        </select>
      </div>
    </div>
  </div>
);

const nodeTypes: NodeTypes = {
  inputNode: InputNode,
  logicNode: LogicNode,
  actionNode: ActionNode,
};

console.log('Node types defined:', Object.keys(nodeTypes));

const StrategyBuilder: React.FC = () => {
  // State for ReactFlow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
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

  // Safe config loading with fallback
  const [config, setConfig] = useState<any>({});

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

      {/* Header Section */}
      <div className="strategy-header">
        <div className="strategy-title">
          <h1>STRATEGY BUILDER</h1>
          <p className="strategy-tagline">Test your risk before you buy</p>
        </div>
      </div>

      {/* Strategy Overview */}
      <div className="strategy-overview">
        <div className="risk-level">
          <span className="risk-label">Strategy Risk Level:</span>
          <div className={`risk-badge ${strategyRisk}`}>
            {strategyRisk === 'low' ? 'LOW RISK' : 
             strategyRisk === 'high' ? 'HIGH RISK' : 'MEDIUM RISK'}
          </div>
        </div>
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

      {/* Lending & Borrowing Section */}
      <div className="lending-borrowing-section">
        <div className="section-header">
          <h2>Lending & Borrowing</h2>
          <p>Deposit SOL as collateral and borrow USDC for trading strategies</p>
        </div>
        
        <div className="lending-borrowing-cards">
          {/* Lending Card */}
          <div className="lending-borrowing-card">
            <div className="card-header">
              <div className="header-content">
                <div className="header-icon">
                  <img src="/assets/icons/WalletIcon.png" alt="Lending" />
                </div>
                <div>
                  <h3>Lending & Deposits</h3>
                  <p>Deposit SOL as collateral to earn yield and enable borrowing</p>
                </div>
              </div>
              <div className="header-badge">
                <span className="badge-text">Lending Pool</span>
              </div>
            </div>
            
            <div className="lending-content">
              {connected ? (
                <div className="lending-overview">
                  <div className="lending-stats">
                    <div className="stat-item">
                      <div className="stat-icon">
                        <img src="/assets/icons/DepositIcon.png" alt="Deposits" />
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{(userPosition.collateralDeposited).toFixed(4)} SOL</div>
                        <div className="stat-label">Your Collateral</div>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">
                        <img src="/assets/icons/PNLIcon.png" alt="Yield" />
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{(lendingStats.depositAPY * 100).toFixed(2)}%</div>
                        <div className="stat-label">Supply APY</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="deposit-form">
                    <div className="form-group">
                      <label>Deposit Amount (SOL):</label>
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
                      className="lending-action-btn"
                      onClick={handleDeposit}
                      disabled={isDepositing || !depositAmount || parseFloat(depositAmount) <= 0}
                    >
                      {isDepositing ? (
                        <>
                          <div className="loading-spinner"></div>
                          <span>Depositing...</span>
                        </>
                      ) : (
                        <>
                          <img src="/assets/icons/DepositIcon.png" alt="Deposit" />
                          <span>Deposit SOL Collateral</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="wallet-connect-prompt">
                  <div className="prompt-icon">
                    <img src="/assets/icons/WalletIcon.png" alt="Wallet" />
                  </div>
                  <p>Connect your wallet to deposit SOL and earn yield</p>
                  <button className="connect-wallet-btn" onClick={() => {}}>
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Strategy Vault Card */}
          <div className="vault-card">
            <div className="card-header">
              <div className="header-content">
                <div className="header-icon">
                  <img src="/assets/icons/ActionIcon.png" alt="Strategy Vault" />
                </div>
                <div>
                  <h3>Borrowing & Trading</h3>
                  <p>Borrow USDC against your SOL collateral to fund trading strategies</p>
                </div>
              </div>
              <div className="header-badge">
                <span className="badge-text">Lending Pool</span>
              </div>
            </div>
            
            <div className="borrow-content">
              {connected ? (
                <div className="borrow-overview">
                  <div className="borrow-stats">
                    <div className="stat-item">
                      <div className="stat-icon">
                        <img src="/assets/icons/ActionIcon.png" alt="Strategies" />
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">${userPosition.usdcBorrowed.toFixed(2)}</div>
                        <div className="stat-label">USDC Borrowed</div>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">
                        <img src="/assets/icons/HedgeIcon.png" alt="PNL" />
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{userPosition.healthFactor.toFixed(2)}</div>
                        <div className="stat-label">Health Factor</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="borrow-form">
                    <div className="form-group">
                      <label>Borrow Amount (USDC):</label>
                      <div className="input-with-button">
                        <input
                          type="number"
                          value={borrowAmountInput}
                          onChange={(e) => setBorrowAmountInput(e.target.value)}
                          placeholder="0.0"
                          min="0"
                          step="0.1"
                          className="deposit-input"
                        />
                        <button 
                          className="max-btn"
                          onClick={() => setBorrowAmountInput(userPosition.availableToBorrow.toString())}
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                    
                    <div className="balance-info">
                      <span>Available: ${userPosition.availableToBorrow.toFixed(2)} USDC</span>
                      <span>LTV: {(userPosition.ltvRatio * 100).toFixed(1)}% / {(LENDING_CONFIG.maxLtv * 100).toFixed(0)}%</span>
                    </div>
                    
                    <button 
                      className="borrow-action-btn"
                      onClick={handleBorrow}
                      disabled={isBorrowing || !borrowAmountInput || parseFloat(borrowAmountInput) <= 0}
                    >
                      {isBorrowing ? (
                        <>
                          <div className="loading-spinner"></div>
                          <span>Depositing...</span>
                        </>
                      ) : (
                        <>
                          <img src="/assets/icons/ActionIcon.png" alt="Strategy" />
                          <span>Borrow USDC</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Position Management Section */}
                  <div className="position-management">
                    <h4>Manage Your Position</h4>
                    <div className="position-actions">
                      <button 
                        className="position-btn withdraw"
                        onClick={() => handleWithdraw()}
                        disabled={userPosition.collateralDeposited <= 0}
                      >
                        <img src="/assets/icons/DepositIcon.png" alt="Withdraw" />
                        <span>Withdraw SOL</span>
                      </button>
                      <button 
                        className="position-btn repay"
                        onClick={() => handleRepayUSDC()}
                        disabled={userPosition.usdcBorrowed <= 0}
                      >
                        <img src="/assets/icons/ActionIcon.png" alt="Repay" />
                        <span>Repay USDC</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="wallet-connect-prompt">
                  <div className="prompt-icon">
                    <img src="/assets/icons/ActionIcon.png" alt="Wallet" />
                  </div>
                  <p>Connect your wallet to borrow USDC against your collateral</p>
                  <button className="connect-wallet-btn" onClick={() => {}}>
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Builder Bar */}
      <div className="strategy-builder-bar">
        <div className="strategy-tabs">
          <button className="strategy-tab active">My DeFi Strategy</button>
          <button className="strategy-tab ai-builder">AI Builder</button>
          <button className="strategy-tab">Simulate Strategy</button>
          <button className="strategy-tab">Save Strategy</button>
          <button className="strategy-tab">Publish</button>
        </div>
        
        <div className="strategy-actions">
          <button className="strategy-btn execute">
            <Rocket className="w-4 h-4" />
            EXECUTE STRATEGY
          </button>
          <button className="strategy-btn withdraw">
            <DollarSign className="w-4 h-4" />
            WITHDRAW SOL
          </button>
          <button className="strategy-btn claim">
            <Trophy className="w-4 h-4" />
            CLAIM YIELD
          </button>
          <button className="strategy-btn test-wallet">
            <Check className="w-4 h-4" />
            TEST WALLET
          </button>
        </div>
      </div>

      {/* BOTTOM HALF: Strategy Builder Section */}
      <div className="strategy-builder-section">
        <div className="section-header">
          <h2>Strategy Builder</h2>
          <p>Design and execute your DeFi trading strategies</p>
        </div>

        {/* Deposit Configuration */}
        <div className="deposit-configuration">
          <h3>Deposit Configuration</h3>
          <div className="deposit-inputs">
            <div className="deposit-input-group">
              <label>Token:</label>
              <select 
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
              >
                <option value="SOL">SOL</option>
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
              </select>
            </div>
            
            <div className="deposit-input-group">
              <label>Amount:</label>
              <input
                type="number"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                placeholder="20"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="deposit-summary">
              <div className="total-cost">
                <span className="cost-label">Total Cost (USD):</span>
                <span className="cost-value">${(parseFloat(collateralAmount) * tokenPrice).toFixed(2)}</span>
                <span className="cost-per-token">@ ${tokenPrice.toFixed(2)} per {selectedToken}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Builder Content */}
        <div className="strategy-content">
          {/* Left Sidebar - Data Sources & Strategy Logic */}
          <div className="sidebar">
            <div className="sidebar-section">
              <h3>
                <img src="/assets/icons/TokenDataIcon.png" alt="Data" className="section-icon" />
                Data Sources
              </h3>
              <div className="strategy-inputs-list">
                <div className="strategy-input-item" draggable onDragStart={(event) => onDragStart(event, 'inputNode', 'Token Data')}>
                  <img src="/assets/icons/TokenDataIcon.png" alt="Token Data" className="palette-icon" />
                  <span>Token Data</span>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>
                <img src="/assets/icons/StrategyLogicIcon.png" alt="Logic" className="section-icon" />
                Strategy Logic
              </h3>
              <div className="strategy-inputs-list">
                <div className="strategy-input-item" draggable onDragStart={(event) => onDragStart(event, 'logicNode', 'Time & Profit Logic')}>
                  <img src="/assets/icons/TimeProfitIcon.png" alt="Time & Profit" className="palette-icon" />
                  <span>Time & Profit Logic</span>
                </div>
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
            <h3>Strategy Canvas</h3>
            <div style={{ height: '500px', width: '100%' }}>
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
              </ReactFlow>
            </div>
            <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
              Debug: {nodes.length} nodes, {edges.length} edges
            </div>
          </div>

          {/* Right Results Panel */}
          <div className="results-panel">
            <h3>
              <img src="/assets/icons/TokenDataIcon.png" alt="Results" className="section-icon" />
              Strategy Results
            </h3>
            
            <div className="results-content">
              <p>Click 'Simulate Strategy' to see results</p>
              <div className="results-placeholder">
                {/* Results will be displayed here after simulation */}
              </div>
            </div>

            <div className="wallet-connection">
              <p>Connect your Phantom wallet to interact with the Cyphr Vaults.</p>
              <div className="wallet-icon">
                <img src="/assets/icons/WalletIcon.png" alt="Wallet" />
              </div>
              <p className="wallet-status">Wallet Not Connected</p>
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