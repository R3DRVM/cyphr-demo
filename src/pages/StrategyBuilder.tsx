import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import BorrowPanel from '../components/borrow/BorrowPanel';
import LendingSection from '../components/LendingSection';
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
    </div>
  </div>
);

const nodeTypes: NodeTypes = {
  inputNode: InputNode,
  logicNode: LogicNode,
  actionNode: ActionNode,
};

const StrategyBuilder: React.FC = () => {
  // State for ReactFlow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [strategyName, setStrategyName] = useState('My DeFi Strategy');
  const [isExecuting, setIsExecuting] = useState(false);
  const [collateralAmount, setCollateralAmount] = useState('10');
  const [borrowAmountStr, setBorrowAmountStr] = useState('500');
  const borrowAmount = borrowAmountStr === '' || borrowAmountStr === '.' ? 0 : Number(borrowAmountStr);
  const [ltvPct, setLtvPct] = useState(String(DEFAULT_POLICY.maxLtv * 100));
  const [slippagePct, setSlippagePct] = useState(String(DEFAULT_POLICY.maxSlippageBps / 100));

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

  // Initialize with sample nodes for demonstration
  useEffect(() => {
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
  }, []);

  return (
    <div className="strategy-builder">
      {/* Preflight Check */}
      <PreflightBanner />

      {/* Header Section */}
      <div className="strategy-header">
        <div className="strategy-title">
          <h1>STRATEGY BUILDER</h1>
          <p className="strategy-tagline">Build and execute DeFi strategies</p>
        </div>
        
        <div className="strategy-status">
          <div className="status-indicator"></div>
          <span>Live</span>
        </div>

        <div className="strategy-controls">
          <div className="strategy-name-input">
            <input
              type="text"
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              placeholder="Enter strategy name..."
            />
          </div>
        </div>
      </div>

      {/* Lending & Borrowing Section - Top Card */}
      <div className="lending-borrowing-card">
        <div className="card-header">
          <div className="header-content">
            <div className="header-icon">
              <img src="/assets/icons/WalletIcon.png" alt="Lending" className="w-6 h-6" />
            </div>
            <div>
              <h2>Capital Management</h2>
              <p>Powered by Roots - Deposit assets and borrow capital to fund your strategies</p>
            </div>
          </div>
          <div className="header-badge">
            <span className="badge-text">Roots Integration</span>
          </div>
        </div>
        
        <div className="lending-content">
          <div className="lending-grid">
            <div className="lending-section">
              <LendingSection
                onNavigateToTerminal={() => {}}
                preflightOk={preflightOk}
              />
            </div>
            <div className="borrow-section">
              <BorrowPanel preflightOk={preflightOk} />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Profile Banner */}
      <div className="risk-profile-banner">
        <div className="risk-indicator">
          <span className="risk-label">Current Risk Profile:</span>
          <div className="risk-badge medium-risk">Medium Risk</div>
        </div>
        
        <div className="risk-metrics">
          <div className="risk-metric">
            <span>Max LTV</span>
            <span className="metric-value">75%</span>
          </div>
          <div className="risk-metric">
            <span>Max Slippage</span>
            <span className="metric-value">1%</span>
          </div>
          <div className="risk-metric">
            <span>Health Factor</span>
            <span className="metric-value">1.8</span>
          </div>
        </div>
      </div>

      {/* Strategy Execution Panel */}
      <div className="strategy-execution-panel">
        <div className="panel-header">
          <h3>
            <img src="/assets/icons/StrategyLogicIcon.png" alt="Strategy" className="w-5 h-5" />
            Strategy Execution
          </h3>
          <p>Configure and execute your DeFi strategy with borrowed capital</p>
        </div>
        
        <div className="execution-grid">
          <div className="execution-item">
            <label>Strategy Name</label>
            <input
              type="text"
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              placeholder="My DeFi Strategy"
              className="cyphr-input"
            />
          </div>
          
          <div className="execution-item">
            <label>Collateral Amount (SOL)</label>
            <input
              type="number"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              placeholder="10"
              className="cyphr-input"
              disabled={isExecuting}
            />
          </div>
          
          <div className="execution-item">
            <label>Borrow Amount (USDC)</label>
            <NumericInput
              value={borrowAmountStr}
              onChange={setBorrowAmountStr}
              maxDecimals={9}
              placeholder="500"
              disabled={isExecuting}
              className="cyphr-input"
            />
          </div>
          
          <div className="execution-item">
            <label>LTV %</label>
            <input
              type="number"
              value={ltvPct}
              onChange={(e) => setLtvPct(e.target.value)}
              placeholder={String(DEFAULT_POLICY.maxLtv * 100)}
              max={DEFAULT_POLICY.maxLtv * 100}
              className="cyphr-input"
              disabled={isExecuting}
            />
          </div>
          
          <div className="execution-item">
            <label>Slippage %</label>
            <input
              type="number"
              value={slippagePct}
              onChange={(e) => setSlippagePct(e.target.value)}
              placeholder={String(DEFAULT_POLICY.maxSlippageBps / 100)}
              max={DEFAULT_POLICY.maxSlippageBps / 100}
              className="cyphr-input"
              disabled={isExecuting}
            />
          </div>
          
          <div className="execution-item">
            <label>Strategy Type</label>
            <select className="cyphr-input" disabled={isExecuting}>
              <option value="momentum">Momentum Trading</option>
              <option value="mean-reversion">Mean Reversion</option>
              <option value="arbitrage">Arbitrage</option>
              <option value="trend-following">Trend Following</option>
              <option value="ai-optimized">AI Optimized</option>
            </select>
          </div>
        </div>

        <div className="execution-summary">
          <div className="summary-item">
            <span>Expected Return:</span>
            <span className="summary-value positive">+12.5%</span>
          </div>
          <div className="summary-item">
            <span>Risk Level:</span>
            <span className="summary-value medium">Medium</span>
          </div>
          <div className="summary-item">
            <span>Max Drawdown:</span>
            <span className="summary-value negative">-8.2%</span>
          </div>
          <div className="summary-item">
            <span>Sharpe Ratio:</span>
            <span className="summary-value positive">1.8</span>
          </div>
        </div>

        <div className="execution-actions">
          <button
            onClick={handleBorrowAndTrade}
            disabled={!preflightOk || isExecuting || !connected || !config.mintA || !config.mintB || borrowAmount <= 0}
            className="cyphr-btn cyphr-btn-primary execution-btn"
            title={!preflightOk ? 'System not ready - check preflight banner' : !connected ? 'Connect wallet first' : (!config.mintA || !config.mintB) ? 'Token configuration missing. Run setup:devnet first.' : borrowAmount <= 0 ? 'Enter a valid borrow amount' : ''}
          >
            {isExecuting ? (
              <div className="btn-loading">
                <div className="loading-spinner"></div>
                <span>Executing Strategy...</span>
              </div>
            ) : (
              <>
                <span className="btn-icon">🚀</span>
                <span>Execute Strategy</span>
              </>
            )}
          </button>
          
          <button className="cyphr-btn cyphr-btn-secondary">
            <span className="btn-icon">💾</span>
            <span>Save Strategy</span>
          </button>
          
          <button className="cyphr-btn cyphr-btn-secondary">
            <span className="btn-icon">📊</span>
            <span>Backtest</span>
          </button>
        </div>
      </div>

      {/* Main Builder Content */}
      <div className="builder-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-section">
            <h3>Strategy Inputs</h3>
            <div className="node-palette">
              <div className="palette-item" draggable>
                <span className="palette-icon">📊</span>
                <span>Price Data</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📈</span>
                <span>Volume Data</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">⚡</span>
                <span>Volatility Data</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">💰</span>
                <span>Market Cap Data</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🔄</span>
                <span>RSI Indicator</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📊</span>
                <span>MACD Indicator</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📉</span>
                <span>Moving Average</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🎯</span>
                <span>Bollinger Bands</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🔥</span>
                <span>Stochastic Oscillator</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">⚖️</span>
                <span>Williams %R</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Logic Operators</h3>
            <div className="node-palette">
              <div className="palette-item" draggable>
                <span className="palette-icon">➕</span>
                <span>Add</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">➖</span>
                <span>Subtract</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">✖️</span>
                <span>Multiply</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">➗</span>
                <span>Divide</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🔀</span>
                <span>Compare</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🔗</span>
                <span>AND Logic</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🔗</span>
                <span>OR Logic</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">❌</span>
                <span>NOT Logic</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">⏰</span>
                <span>Time Delay</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🔄</span>
                <span>Loop</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Strategy Actions</h3>
            <div className="node-palette">
              <div className="palette-item" draggable>
                <span className="palette-icon">🚀</span>
                <span>Buy Order</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📉</span>
                <span>Sell Order</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">⚖️</span>
                <span>Rebalance</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🛡️</span>
                <span>Stop Loss</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🎯</span>
                <span>Take Profit</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📊</span>
                <span>Set Position Size</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🔒</span>
                <span>Lock Position</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📈</span>
                <span>DCA Strategy</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🎲</span>
                <span>Random Entry</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📝</span>
                <span>Log Event</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Risk Management</h3>
            <div className="node-palette">
              <div className="palette-item" draggable>
                <span className="palette-icon">⚠️</span>
                <span>Risk Check</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📊</span>
                <span>Position Sizing</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🔄</span>
                <span>Dynamic Stop Loss</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📈</span>
                <span>Trailing Stop</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">⚖️</span>
                <span>Portfolio Balance</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🎯</span>
                <span>Max Drawdown</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📊</span>
                <span>Correlation Check</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🛡️</span>
                <span>Hedging</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>AI & Advanced</h3>
            <div className="node-palette">
              <div className="palette-item ai-palette-item" draggable>
                <span className="palette-icon">🤖</span>
                <span>AI Prediction</span>
                <div className="ai-badge">AI</div>
              </div>
              <div className="palette-item ai-palette-item" draggable>
                <span className="palette-icon">🧠</span>
                <span>Neural Network</span>
                <div className="ai-badge">AI</div>
              </div>
              <div className="palette-item ai-palette-item" draggable>
                <span className="palette-icon">📊</span>
                <span>Sentiment Analysis</span>
                <div className="ai-badge">AI</div>
              </div>
              <div className="palette-item ai-palette-item" draggable>
                <span className="palette-icon">🔍</span>
                <span>Pattern Recognition</span>
                <div className="ai-badge">AI</div>
              </div>
              <div className="palette-item ai-palette-item" draggable>
                <span className="palette-icon">📈</span>
                <span>ML Model</span>
                <div className="ai-badge">AI</div>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🌐</span>
                <span>Social Signals</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📰</span>
                <span>News Sentiment</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🔗</span>
                <span>On-Chain Data</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📊</span>
                <span>Whale Tracking</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Market Conditions</h3>
            <div className="node-palette">
              <div className="palette-item" draggable>
                <span className="palette-icon">🌍</span>
                <span>Market Regime</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📊</span>
                <span>Volatility State</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🌊</span>
                <span>Trend Direction</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">⚡</span>
                <span>Momentum</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🎯</span>
                <span>Support/Resistance</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">📈</span>
                <span>Breakout Detection</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🔄</span>
                <span>Mean Reversion</span>
              </div>
              <div className="palette-item" draggable>
                <span className="palette-icon">🌊</span>
                <span>Wave Analysis</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>AI Logic</h3>
            <div className="ai-logic-info">
              <div className="ai-badge">AI</div>
              <p>AI-powered strategy optimization</p>
              <div className="ai-improvement">
                <span>Expected Improvement:</span>
                <span className="improvement-value">+15.3%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="canvas-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="strategy-canvas"
          >
            <Controls />
            <Background />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Results Panel */}
        <div className="results-panel">
          <h3>Strategy Results</h3>
          
          <div className="simulation-loading">
            <div className="loading-spinner"></div>
            <span>Simulating strategy...</span>
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
          <h3>⚙️ Node Properties</h3>
          <div className="property-group">
            <label>Node Type:</label>
            <span>{selectedNode.type}</span>
          </div>
          <div className="property-group">
            <label>Node ID:</label>
            <span>{selectedNode.id}</span>
          </div>
          <button
            className="cyphr-btn cyphr-btn-danger"
            onClick={() => {
              setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
              setSelectedNode(null);
            }}
          >
            🗑️ Delete Node
          </button>
        </div>
      )}
    </div>
  );
};

export default StrategyBuilder;