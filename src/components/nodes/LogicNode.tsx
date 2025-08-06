import React from 'react';
import { Handle, Position } from 'reactflow';

interface LogicNodeProps {
  data: {
    label: string;
    condition?: string;
  };
}

const LogicNode: React.FC<LogicNodeProps> = ({ data }) => {
  return (
    <div className="logic-node">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="node-content">
        <h4>{data.label}</h4>
        {data.condition && <p>{data.condition}</p>}
      </div>
    </div>
  );
};

export default LogicNode; 