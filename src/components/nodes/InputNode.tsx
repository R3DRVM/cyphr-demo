import React from 'react';
import { Handle, Position } from 'reactflow';

interface InputNodeProps {
  data: {
    label: string;
    value?: string;
  };
}

const InputNode: React.FC<InputNodeProps> = ({ data }) => {
  return (
    <div className="input-node">
      <Handle type="source" position={Position.Right} />
      <div className="node-content">
        <h4>{data.label}</h4>
        {data.value && <p>{data.value}</p>}
      </div>
    </div>
  );
};

export default InputNode; 