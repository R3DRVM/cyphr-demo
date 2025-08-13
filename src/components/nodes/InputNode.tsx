import React from 'react';
import { Handle, Position } from 'reactflow';

interface InputNodeProps {
  data: {
    label: string;
    value?: string;
    token?: string;
    dataType?: string;
    onChange?: (field: string, value: string) => void;
  };
  id: string;
  onDelete?: (nodeId: string) => void;
}

const InputNode: React.FC<InputNodeProps> = ({ data, id, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div className="input-node">
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
          <img src="/assets/icons/TokenDataIcon.png" alt="Token Data" className="node-icon" style={{ width: '20px', height: '20px' }} />
          <span className="node-title">{data.label}</span>
          <div className="node-risk-badge low-risk">Low Risk</div>
        </div>
        
        <div className="parameter">
          <label>Token:</label>
          <input 
            type="text" 
            placeholder="SOL, ETH, etc."
            value={data.token || ''}
            onChange={(e) => data.onChange && data.onChange('token', e.target.value)}
          />
        </div>
        <div className="parameter">
          <label>Data Type:</label>
          <select 
            value={data.dataType || 'price'}
            onChange={(e) => data.onChange && data.onChange('dataType', e.target.value)}
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
};

export default InputNode; 