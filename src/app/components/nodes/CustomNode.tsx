'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface CustomNodeData {
  label: string;
  [key: string]: any; // For additional properties like prompt for MessageNode
}

// We can extend NodeProps with our custom data type
// interface CustomNodeProps extends NodeProps<CustomNodeData> {} // Removed this interface

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, type, isConnectable }) => { // Used NodeProps<CustomNodeData> directly
  return (
    <div className="react-flow__node-default w-40 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="p-3 border-b border-stone-400 font-semibold">
        {data.label || 'Custom Node'}
      </div>
      <div className="p-3 text-sm">
        {/* Placeholder for node-specific content */}
        {type === 'messageNode' && (
          <p>Prompt: {data.prompt || 'Not set'}</p>
        )}
        {/* Add more conditions for other node types as needed */}
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!bg-teal-500" />
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="!bg-teal-500" />
    </div>
  );
};

export default CustomNode; 