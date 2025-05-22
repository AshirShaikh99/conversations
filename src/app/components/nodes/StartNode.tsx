'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from './CustomNode'; // Import CustomNodeData

// StartNode should only have a source handle (it's the beginning)
const StartNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }) => {
  return (
    <div className="w-40 shadow-md rounded-md bg-sky-500 text-white border-2 border-sky-700">
      <div className="p-3 border-b border-sky-600 font-semibold text-center">
        {data.label || 'Start'}
      </div>
      {/* No specific content for StartNode needed in the body yet */}
      <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable} 
        className="!bg-green-500 w-3 h-3 border-2 border-white rounded-full"
      />
    </div>
  );
};

export default StartNode; 