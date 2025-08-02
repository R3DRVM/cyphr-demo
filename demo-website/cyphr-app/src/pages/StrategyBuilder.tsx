import React, { useState, useCallback, useMemo } from 'react';
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
      <img src="/demo-website/TokenDataIcon.png" alt="Token Data" className="node-icon" style={{ width: '20px', height: '20px' }} />
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
      <img src="/demo-website/StrategyLogicIcon.png" alt="Strategy Logic" className="node-icon" style={{ width: '20px', height: '20px' }} />
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
      
      {data.logicType === 'time' && (
        <>
          <div className="parameter">
            <label>Duration:</label>
            <select 
              value={data.duration || '3'}
              onChange={(e) => data.onChange('duration', e.target.value)}
            >
              <option value="1">1 Week</option>
              <option value="2">2 Weeks</option>
              <option value="3">3 Weeks</option>
              <option value="4">1 Month</option>
              <option value="8">2 Months</option>
              <option value="12">3 Months</option>
            </select>
          </div>
          <div className="parameter">
            <label>Profit Target (%):</label>
            <input 
              type="number" 
              placeholder="15"
              value={data.profitTarget || ''}
              onChange={(e) => data.onChange('profitTarget', e.target.value)}
            />
          </div>
        </>
      )}
      
      {data.logicType === 'price' && (
        <>
          <div className="parameter">
            <label>Condition:</label>
            <select 
              value={data.condition || 'above'}
              onChange={(e) => data.onChange('condition', e.target.value)}
            >
              <option value="above">Price Above</option>
              <option value="below">Price Below</option>
              <option value="crosses">Price Crosses</option>
              <option value="percent_change">% Change</option>
            </select>
          </div>
          <div className="parameter">
            <label>Value:</label>
            <input 
              type="number" 
              placeholder="0.00"
              value={data.value || ''}
              onChange={(e) => data.onChange('value', e.target.value)}
            />
          </div>
        </>
      )}
      
      {data.logicType === 'volatility' && (
        <>
          <div className="parameter">
            <label>Volatility Threshold:</label>
            <select 
              value={data.volatilityThreshold || 'high'}
              onChange={(e) => data.onChange('volatilityThreshold', e.target.value)}
            >
              <option value="low">Low (&lt; 20%)</option>
              <option value="medium">Medium (20-50%)</option>
              <option value="high">High (&gt; 50%)</option>
            </select>
          </div>
          <div className="parameter">
            <label>Action:</label>
            <select 
              value={data.volatilityAction || 'exit'}
              onChange={(e) => data.onChange('volatilityAction', e.target.value)}
            >
              <option value="exit">Exit Position</option>
              <option value="hedge">Hedge Position</option>
              <option value="rebalance">Rebalance</option>
            </select>
          </div>
        </>
      )}
      
      {data.logicType === 'ai' && (
        <div className="ai-logic-info">
                      <div className="ai-badge">
              <img src="/RobotIcon.png" alt="AI" style={{ width: '14px', height: '14px', marginRight: '4px', verticalAlign: 'middle' }} />
              AI-Powered
            </div>
          <p>AI analyzes market conditions and optimizes entry/exit timing</p>
          <div className="ai-improvement">
            <span>Estimated Improvement:</span>
            <span className="improvement-value">+75%</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

const ActionNode: React.FC<{ data: any }> = ({ data }) => (
  <div className="strategy-node action-node" title="Action: Defines what happens when conditions are met">
    <Handle type="target" position={Position.Left} />
    <div className="node-header">
      <img src="/demo-website/ActionIcon.png" alt="Action" className="node-icon" style={{ width: '20px', height: '20px' }} />
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
      
      {data.actionType === 'entry' && (
        <>
          <div className="parameter">
            <label>Action:</label>
            <select 
              value={data.action || 'stake'}
              onChange={(e) => data.onChange('action', e.target.value)}
            >
              <option value="stake">Stake</option>
              <option value="buy">Buy</option>
              <option value="liquidity">Add Liquidity</option>
              <option value="yield_farm">Yield Farm</option>
            </select>
          </div>
        </>
      )}
      
      {data.actionType === 'exit' && (
        <>
          <div className="parameter">
            <label>Exit Strategy:</label>
            <select 
              value={data.exitStrategy || 'all'}
              onChange={(e) => data.onChange('exitStrategy', e.target.value)}
            >
              <option value="all">All (Initial + Earnings)</option>
              <option value="earnings">Earnings Only</option>
              <option value="partial">Partial Exit</option>
              <option value="stop_loss">Stop Loss</option>
            </select>
          </div>
          {data.exitStrategy === 'stop_loss' && (
            <div className="parameter">
              <label>Stop Loss (%):</label>
              <input 
                type="number" 
                placeholder="10"
                value={data.stopLoss || ''}
                onChange={(e) => data.onChange('stopLoss', e.target.value)}
              />
            </div>
          )}
        </>
      )}
      
      <div className="parameter">
        <label>Auto Execute:</label>
        <select 
          value={data.autoExecute || 'true'}
          onChange={(e) => data.onChange('autoExecute', e.target.value)}
        >
          <option value="true">Yes (Automated)</option>
          <option value="false">No (Manual Approval)</option>
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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [strategyName, setStrategyName] = useState('My DeFi Strategy');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState('20');
  const [selectedToken, setSelectedToken] = useState('SOL');
  const [tokenPrice, setTokenPrice] = useState(150);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [strategyRisk, setStrategyRisk] = useState('medium');
  const [showSocial, setShowSocial] = useState(false);

  // Calculate USD values
  const totalCostUSD = useMemo(() => {
    const amount = parseFloat(depositAmount) || 0;
    return amount * tokenPrice;
  }, [depositAmount, tokenPrice]);

  const averageCostUSD = useMemo(() => {
    return tokenPrice;
  }, [tokenPrice]);

  // Risk calculation based on strategy components
  const calculateStrategyRisk = useCallback(() => {
    const logicNodes = nodes.filter(n => n.type === 'logicNode');
    const actionNodes = nodes.filter(n => n.type === 'actionNode');
    
    let riskScore = 0;
    
    logicNodes.forEach(node => {
      if (node.data?.logicType === 'volatility') riskScore += 2;
      if (node.data?.logicType === 'ai') riskScore += 1;
      if (node.data?.logicType === 'price') riskScore += 1;
    });
    
    actionNodes.forEach(node => {
      if (node.data?.actionType === 'hedge') riskScore -= 1;
      if (node.data?.exitStrategy === 'stop_loss') riskScore -= 1;
    });
    
    if (riskScore <= 0) return 'low';
    if (riskScore <= 2) return 'medium';
    return 'high';
  }, [nodes]);

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

  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: type === 'input' ? 'inputNode' : type === 'logic' ? 'logicNode' : 'actionNode',
      position,
      data: {
        label: type === 'input' ? 'Data Input' : type === 'logic' ? 'Strategy Logic' : 'Action',
        onChange: (field: string, value: any) => updateNodeData(newNode.id, field, value),
        token: selectedToken,
        duration: '3',
        profitTarget: '15',
        action: 'stake',
        exitStrategy: 'all',
        logicType: 'time',
        riskLevel: 'medium-risk',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, updateNodeData, selectedToken]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const position = { x: event.clientX - 280, y: event.clientY - 100 };
      addNode(type, position);
    },
    [addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const generateAIStrategy = useCallback(() => {
    if (!aiPrompt.trim()) return;
    
    setIsSimulating(true);
    setTimeout(() => {
      // AI generates strategy based on prompt
      const aiNodes: Node[] = [
        {
          id: 'ai-input-1',
          type: 'inputNode',
          position: { x: 100, y: 100 },
          data: {
            label: 'AI Data Source',
            onChange: (field: string, value: any) => updateNodeData('ai-input-1', field, value),
            token: selectedToken,
            dataType: 'price',
          },
        },
        {
          id: 'ai-logic-1',
          type: 'logicNode',
          position: { x: 400, y: 100 },
          data: {
            label: 'AI-Optimized Logic',
            onChange: (field: string, value: any) => updateNodeData('ai-logic-1', field, value),
            logicType: 'ai',
            duration: '4',
            profitTarget: '12',
            riskLevel: 'low-risk',
          },
        },
        {
          id: 'ai-action-1',
          type: 'actionNode',
          position: { x: 700, y: 100 },
          data: {
            label: 'AI Action',
            onChange: (field: string, value: any) => updateNodeData('ai-action-1', field, value),
            actionType: 'entry',
            action: 'stake',
            riskLevel: 'low-risk',
          },
        },
      ];

      const aiEdges: Edge[] = [
        { id: 'ai-e1-2', source: 'ai-input-1', target: 'ai-logic-1' },
        { id: 'ai-e2-3', source: 'ai-logic-1', target: 'ai-action-1' },
      ];

      setNodes(aiNodes);
      setEdges(aiEdges);
      setShowAIBuilder(false);
      setIsSimulating(false);
    }, 2000);
  }, [aiPrompt, selectedToken, setNodes, setEdges, updateNodeData]);

  const simulateStrategy = useCallback(() => {
    setIsSimulating(true);
    setTimeout(() => {
      const profitTarget = parseFloat(nodes.find(n => n.type === 'logicNode')?.data?.profitTarget || '15');
      const duration = parseInt(nodes.find(n => n.type === 'logicNode')?.data?.duration || '3');
      const amount = parseFloat(depositAmount);
      const expectedProfit = (amount * profitTarget) / 100;
      const riskLevel = calculateStrategyRisk();
      const aiImprovement = nodes.some(n => n.data?.logicType === 'ai') ? 75 : 0;
      
      setSimulationResults({
        totalReturn: profitTarget + aiImprovement,
        timeToExit: `${duration} weeks`,
        expectedProfit: expectedProfit.toFixed(2),
        initialInvestment: amount,
        finalValue: (amount + expectedProfit).toFixed(2),
        successRate: 95.0,
        riskLevel: riskLevel,
        maxDrawdown: riskLevel === 'high' ? 25 : riskLevel === 'medium' ? 15 : 8,
        sharpeRatio: riskLevel === 'high' ? 1.2 : riskLevel === 'medium' ? 1.8 : 2.5,
        aiImprovement: aiImprovement,
        chartData: {
          labels: Array.from({length: duration}, (_, i) => `Week ${i + 1}`),
          datasets: [{
            label: `${selectedToken} Value`,
            data: Array.from({length: duration}, (_, i) => {
              const weeklyGrowth = (profitTarget + aiImprovement) / duration;
              return amount + (amount * weeklyGrowth * (i + 1)) / 100;
            }),
            borderColor: '#6D8FC7',
            backgroundColor: 'rgba(109, 143, 199, 0.1)',
            tension: 0.4,
            fill: true,
          }]
        }
      });
      setIsSimulating(false);
    }, 2000);
  }, [nodes, depositAmount, selectedToken, calculateStrategyRisk]);

  const saveStrategy = useCallback(() => {
    const strategy = {
      name: strategyName,
      nodes,
      edges,
      depositAmount,
      selectedToken,
      totalCostUSD,
      riskLevel: calculateStrategyRisk(),
      timestamp: new Date().toISOString(),
    };
    console.log('Saving strategy:', strategy);
    alert('Strategy saved! (Check console for details)');
  }, [strategyName, nodes, edges, depositAmount, selectedToken, totalCostUSD, calculateStrategyRisk]);

  const publishStrategy = useCallback(() => {
    const strategy = {
      name: strategyName,
      nodes,
      edges,
      riskLevel: calculateStrategyRisk(),
      publishedAt: new Date().toISOString(),
      author: 'User',
      forks: 0,
      likes: 0,
    };
    console.log('Publishing strategy:', strategy);
    setShowSocial(false);
    alert('Strategy published! (Check console for details)');
  }, [strategyName, nodes, edges, calculateStrategyRisk]);

  // Initialize with sample nodes for demonstration
  React.useEffect(() => {
    const sampleNodes: Node[] = [
      {
        id: 'input-1',
        type: 'inputNode',
        position: { x: 100, y: 100 },
        data: {
          label: 'Token Data',
          onChange: (field: string, value: any) => updateNodeData('input-1', field, value),
          token: selectedToken,
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
          duration: '3',
          profitTarget: '15',
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
          action: 'stake',
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
  }, [selectedToken]);

  return (
    <div className="strategy-builder animate-fade-in">
      {/* Header Section */}
      <div className="strategy-header animate-slide-up">
        <div className="strategy-status">
          <span className="status-indicator"></span>
          <span>Live</span>
        </div>
        <div className="strategy-title">
                      <h1>Strategy Builder</h1>
                      <p className="strategy-tagline">Test your risk before you buy</p>
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
          
          <div className="strategy-actions">
            <button 
              className="cyphr-btn cyphr-btn-ai"
              onClick={() => setShowAIBuilder(true)}
            >
                              AI Builder
            </button>
            <button 
              className="cyphr-btn cyphr-btn-primary" 
              onClick={simulateStrategy}
              disabled={isSimulating}
            >
              {isSimulating ? 'Simulating...' : 'Simulate Strategy'}
            </button>
                          <button className="cyphr-btn cyphr-btn-secondary" onClick={saveStrategy}>
                Save Strategy
              </button>
                          <button className="cyphr-btn cyphr-btn-social" onClick={() => setShowSocial(true)}>
                Publish
              </button>
          </div>
        </div>
      </div>

      {/* Risk Profile Banner */}
      <div className="risk-profile-banner animate-slide-up">
        <div className="risk-indicator">
          <span className="risk-label">Strategy Risk Level:</span>
          <span className={`risk-badge ${calculateStrategyRisk()}-risk`}>
            {calculateStrategyRisk().toUpperCase()} RISK
          </span>
        </div>
        <div className="risk-metrics">
          <div className="risk-metric">
            <span>Max Drawdown:</span>
            <span className="metric-value">
              {calculateStrategyRisk() === 'high' ? '25%' : 
               calculateStrategyRisk() === 'medium' ? '15%' : '8%'}
            </span>
          </div>
          <div className="risk-metric">
            <span>Sharpe Ratio:</span>
            <span className="metric-value">
              {calculateStrategyRisk() === 'high' ? '1.2' : 
               calculateStrategyRisk() === 'medium' ? '1.8' : '2.5'}
            </span>
          </div>
        </div>
      </div>

      {/* Deposit Configuration */}
      <div className="deposit-config animate-slide-up">
        <div className="config-card">
          <h3><img src="/demo-website/DepositIcon.png" alt="Deposit" style={{ width: '16px', height: '16px', marginRight: '8px', verticalAlign: 'middle' }} /> Deposit Configuration</h3>
          <div className="config-grid">
            <div className="config-item">
              <label>Token:</label>
              <select 
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="cyphr-select"
              >
                <option value="SOL">SOL</option>
                <option value="ETH">ETH</option>
                <option value="BTC">BTC</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
            
            <div className="config-item">
              <label>Amount:</label>
              <input 
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="20"
                className="cyphr-input"
              />
            </div>
            
            <div className="config-item">
              <label>Total Cost (USD):</label>
              <div className="cost-display">
                <span className="cost-amount">${totalCostUSD.toFixed(2)}</span>
                <span className="cost-per-token">@ ${averageCostUSD.toFixed(2)} per {selectedToken}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Builder Modal */}
      {showAIBuilder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
              <img src="/RobotIcon.png" alt="AI" style={{ width: '16px', height: '16px', marginRight: '8px', verticalAlign: 'middle' }} />
              AI Strategy Builder
            </h3>
              <button className="modal-close" onClick={() => setShowAIBuilder(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Describe your strategy and AI will generate it for you:</p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., 'I want a low-risk staking strategy for SOL with 10% yield and stop-loss protection'"
                className="ai-prompt-input"
              />
              <div className="ai-examples">
                <h4>Example Prompts:</h4>
                <ul>
                  <li>"Conservative yield farming with USDC, max 5% risk"</li>
                  <li>"Aggressive SOL trading with AI optimization"</li>
                  <li>"Balanced portfolio with automatic rebalancing"</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cyphr-btn cyphr-btn-secondary" onClick={() => setShowAIBuilder(false)}>
                Cancel
              </button>
              <button className="cyphr-btn cyphr-btn-primary" onClick={generateAIStrategy}>
                Generate Strategy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Publishing Modal */}
      {showSocial && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Publish Strategy</h3>
              <button className="modal-close" onClick={() => setShowSocial(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Share your strategy with the community and earn from referrals:</p>
              <div className="social-benefits">
                <div className="benefit-item">
                  <img src="/demo-website/DepositIcon.png" alt="Deposit" className="benefit-icon" style={{ width: '16px', height: '16px' }} />
                  <span>Earn 5% from strategy forks</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📈</span>
                  <span>Build reputation in the community</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🤝</span>
                  <span>Collaborate with other builders</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cyphr-btn cyphr-btn-secondary" onClick={() => setShowSocial(false)}>
                Cancel
              </button>
              <button className="cyphr-btn cyphr-btn-primary" onClick={publishStrategy}>
                Publish Strategy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Builder Content */}
      <div className="builder-content animate-slide-up">
        <div className="sidebar animate-slide-up">
          <div className="sidebar-section">
            <h3><img src="/demo-website/TokenDataIcon.png" alt="Token Data" style={{ width: '16px', height: '16px', marginRight: '8px' }} /> Data Sources</h3>
            <div className="node-palette">
              <div 
                className="palette-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', 'input');
                }}
                title="Drag to add data source node"
              >
                <img src="/demo-website/TokenDataIcon.png" alt="Token Data" className="palette-icon" style={{ width: '16px', height: '16px' }} />
                <span>Token Data</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3><img src="/demo-website/StrategyLogicIcon.png" alt="Strategy Logic" style={{ width: '16px', height: '16px', marginRight: '8px' }} /> Strategy Logic</h3>
            <div className="node-palette">
              <div 
                className="palette-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', 'logic');
                }}
                title="Drag to add logic node"
              >
                <img src="/demo-website/TimeProfitIcon.png" alt="Time & Profit" className="palette-icon" style={{ width: '16px', height: '16px' }} />
                <span>Time & Profit Logic</span>
              </div>
              <div 
                className="palette-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', 'logic');
                }}
                title="Drag to add price-based logic"
              >
                <img src="/demo-website/PriceLogic.png" alt="Price Logic" className="palette-icon" style={{ width: '16px', height: '16px' }} />
                <span>Price-Based Logic</span>
              </div>
              <div 
                className="palette-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', 'logic');
                }}
                title="Drag to add volatility-based logic"
              >
                <img src="/demo-website/TokenDataIcon.png" alt="Token Data" className="palette-icon" style={{ width: '16px', height: '16px' }} />
                <span>Volatility Logic</span>
              </div>
              <div 
                className="palette-item ai-palette-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', 'logic');
                }}
                title="Drag to add AI-optimized logic"
              >
                <img src="/RobotIcon.png" alt="AI" className="palette-icon" style={{ width: '16px', height: '16px' }} />
                <span>AI-Optimized Logic</span>
                <span className="ai-badge">+75%</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3><img src="/demo-website/ActionIcon.png" alt="Action" style={{ width: '16px', height: '16px', marginRight: '8px' }} /> Actions</h3>
            <div className="node-palette">
              <div 
                className="palette-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', 'action');
                }}
                title="Drag to add action node"
              >
                <img src="/demo-website/ActionIcon.png" alt="Action" className="palette-icon" style={{ width: '16px', height: '16px' }} />
                <span>Entry & Exit</span>
              </div>
              <div 
                className="palette-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', 'action');
                }}
                title="Drag to add hedge action"
              >
                <img src="/demo-website/HedgeIcon.png" alt="Hedge" className="palette-icon" style={{ width: '16px', height: '16px' }} />
                <span>Hedge Action</span>
              </div>
            </div>
          </div>
        </div>

        <div className="canvas-container animate-slide-up" onDrop={onDrop} onDragOver={onDragOver}>
          {nodes.length === 0 && (
            <div className="empty-canvas">
              <div className="empty-canvas-content">
                <h2>Build Your DeFi Strategy</h2>
                <p>Drag and drop components from the sidebar to create your strategy</p>
                <div className="canvas-instructions">
                  <div className="instruction">
                    <img src="/demo-website/TokenDataIcon.png" alt="Token Data" className="instruction-icon" style={{ width: '16px', height: '16px' }} />
                    <span>Start with Token Data</span>
                  </div>
                  <div className="instruction">
                    <img src="/demo-website/TimeProfitIcon.png" alt="Time & Profit" className="instruction-icon" style={{ width: '16px', height: '16px' }} />
                    <span>Add Time & Profit Logic</span>
                  </div>
                  <div className="instruction">
                    <img src="/demo-website/ActionIcon.png" alt="Action" className="instruction-icon" style={{ width: '16px', height: '16px' }} />
                    <span>Configure Entry & Exit</span>
                  </div>
                </div>
                <button 
                  className="cyphr-btn cyphr-btn-ai"
                  onClick={() => setShowAIBuilder(true)}
                >
                  Or use AI Builder
                </button>
              </div>
            </div>
          )}
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

        <div className="results-panel animate-slide-up">
          <h3><img src="/demo-website/TokenDataIcon.png" alt="Token Data" style={{ width: '16px', height: '16px', marginRight: '8px' }} /> Strategy Results</h3>
          {isSimulating ? (
            <div className="simulation-loading">
              <div className="loading-spinner"></div>
              <p>Running simulation...</p>
            </div>
          ) : simulationResults ? (
            <div className="simulation-results">
              <div className="result-metrics">
                <div className="metric">
                  <span className="metric-label">Total Return</span>
                  <span className="metric-value positive">+{simulationResults.totalReturn}%</span>
                </div>
                {simulationResults.aiImprovement > 0 && (
                  <div className="metric ai-improvement">
                    <span className="metric-label">AI Improvement</span>
                    <span className="metric-value positive">+{simulationResults.aiImprovement}%</span>
                  </div>
                )}
                <div className="metric">
                  <span className="metric-label">Time to Exit</span>
                  <span className="metric-value">{simulationResults.timeToExit}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Expected Profit</span>
                  <span className="metric-value positive">+{simulationResults.expectedProfit} {selectedToken}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Initial Investment</span>
                  <span className="metric-value">{simulationResults.initialInvestment} {selectedToken}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Final Value</span>
                  <span className="metric-value">{simulationResults.finalValue} {selectedToken}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Success Rate</span>
                  <span className="metric-value">{simulationResults.successRate}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Max Drawdown</span>
                  <span className="metric-value">{simulationResults.maxDrawdown}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Sharpe Ratio</span>
                  <span className="metric-value">{simulationResults.sharpeRatio}</span>
                </div>
              </div>
              <div className="result-chart">
                <Line
                  data={simulationResults.chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#333',
                        borderWidth: 1,
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          color: '#333',
                        },
                        ticks: {
                          color: '#888',
                        },
                      },
                      y: {
                        grid: {
                          color: '#333',
                        },
                        ticks: {
                          color: '#888',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="no-results">
              <p>Click "Simulate Strategy" to see results</p>
            </div>
          )}
        </div>
      </div>

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