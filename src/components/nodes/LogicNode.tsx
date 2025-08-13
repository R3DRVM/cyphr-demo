import React from 'react';
import { Handle, Position } from 'reactflow';

interface LogicNodeProps {
  data: {
    label: string;
    condition?: string;
    logicType?: string;
    duration?: string;
    profitTarget?: string;
    riskLevel?: string;
    onChange?: (field: string, value: string) => void;
  };
  id: string;
  onDelete?: (nodeId: string) => void;
}

const LogicNode: React.FC<LogicNodeProps> = ({ data, id, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div className="logic-node">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="node-content">
        <button 
          className="node-delete-btn" 
          onClick={handleDelete}
          title="Delete node"
        >
          ×
        </button>
        
        <div className="node-header">
          <img src="/assets/icons/StrategyLogicIcon.png" alt="Strategy Logic" className="node-icon" style={{ width: '20px', height: '20px' }} />
          <span className="node-title">{data.label}</span>
          <div className={`node-risk-badge ${data.riskLevel || 'medium-risk'}`}>
            {data.riskLevel === 'low-risk' ? 'Low Risk' : 
             data.riskLevel === 'high-risk' ? 'High Risk' : 'Medium Risk'}
          </div>
        </div>
        
        <div className="parameter">
          <label>Logic Type:</label>
          <select 
            value={data.logicType || 'time'}
            onChange={(e) => data.onChange && data.onChange('logicType', e.target.value)}
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
            onChange={(e) => data.onChange && data.onChange('duration', e.target.value)}
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
            onChange={(e) => data.onChange && data.onChange('profitTarget', e.target.value)}
            placeholder="15"
            min="1"
            max="100"
          />
        </div>
      </div>
    </div>
  );
};

export default LogicNode; 