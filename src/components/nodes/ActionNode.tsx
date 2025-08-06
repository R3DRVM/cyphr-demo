import React from 'react';
import { Handle, Position } from 'reactflow';

interface ActionNodeProps {
  data: {
    label: string;
    action?: string;
  };
}

const ActionNode: React.FC<ActionNodeProps> = ({ data }) => {
  return (
    <div className="action-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <h4>{data.label}</h4>
        {data.action && <p>{data.action}</p>}
      </div>
    </div>
  );
};

export default ActionNode; 