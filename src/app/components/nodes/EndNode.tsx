'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from './CustomNode';

// EndNode should only have a target handle (it's the end)
const EndNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }) => {
  return (
    <div className="w-40 shadow-md rounded-md bg-red-500 text-white border-2 border-red-700">
      <div className="p-3 border-b border-red-600 font-semibold text-center">
        {data.label || 'End'}
      </div>
      {/* No specific content for EndNode needed in the body yet */}
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className="!bg-red-700 w-3 h-3 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default EndNode; 