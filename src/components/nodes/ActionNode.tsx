import React from 'react';
import { Handle, Position } from 'reactflow';

interface ActionNodeProps {
  data: {
    label: string;
    action?: string;
    actionType?: string;
    autoExecute?: string;
    riskLevel?: string;
    onChange?: (field: string, value: string) => void;
  };
  id: string;
  onDelete?: (nodeId: string) => void;
}

const ActionNode: React.FC<ActionNodeProps> = ({ data, id, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div className="action-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <button 
          className="node-delete-btn" 
          onClick={handleDelete}
          title="Delete node"
        >
          ×
        </button>
        
        <div className="node-header">
          <img src="/assets/icons/ActionIcon.png" alt="Action" className="node-icon" style={{ width: '20px', height: '20px' }} />
          <span className="node-title">{data.label}</span>
          <div className={`node-risk-badge ${data.riskLevel || 'medium-risk'}`}>
            {data.riskLevel === 'low-risk' ? 'Low Risk' : 
             data.riskLevel === 'high-risk' ? 'High Risk' : 'Medium Risk'}
          </div>
        </div>
        
        <div className="parameter">
          <label>Action Type:</label>
          <select 
            value={data.actionType || 'entry'}
            onChange={(e) => data.onChange && data.onChange('actionType', e.target.value)}
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
            onChange={(e) => data.onChange && data.onChange('action', e.target.value)}
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
            onChange={(e) => data.onChange && data.onChange('autoExecute', e.target.value)}
          >
            <option value="yes">Yes (Automated)</option>
            <option value="no">No (Manual)</option>
            <option value="semi">Semi-Automated</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ActionNode; 