'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from './CustomNode';

// ConditionNode might have multiple output paths based on conditions
// For now, one source handle. Later, we can make this dynamic or add more.
const ConditionNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }) => {
  return (
    <div className="w-48 shadow-md rounded-md bg-white border-2 border-purple-500">
      <div className="p-3 border-b border-purple-400 font-semibold bg-purple-500 text-white">
        {data.label || 'Condition'}
      </div>
      <div className="p-3 text-sm">
        <p className="text-gray-700">Branch on user input:</p>
        {/* Placeholder for condition editing UI */}
        <p className="text-xs text-gray-500 italic mt-1">(e.g., if intent is &apos;order_pizza&apos;)</p>
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!bg-gray-400 w-3 h-3" />
      {/* We might have multiple source handles for different conditions */}
      <Handle 
        type="source" 
        id="a" // Example ID for a condition path
        position={Position.Right} 
        isConnectable={isConnectable} 
        className="!bg-gray-400 w-3 h-3"
        style={{ top: '30%' }} // Adjust position for multiple handles if needed
      />
       <Handle 
        type="source" 
        id="b" // Example ID for another condition path
        position={Position.Right} 
        isConnectable={isConnectable} 
        className="!bg-gray-400 w-3 h-3"
        style={{ top: '70%' }} // Adjust position for multiple handles if needed
      />
    </div>
  );
};

export default ConditionNode; 