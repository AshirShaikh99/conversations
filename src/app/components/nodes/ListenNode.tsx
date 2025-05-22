'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from './CustomNode';

const ListenNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }) => {
  return (
    <div className="w-40 shadow-md rounded-md bg-white border-2 border-yellow-500">
      <div className="p-3 border-b border-yellow-400 font-semibold bg-yellow-500 text-white">
        {data.label || 'Listen'}
      </div>
      <div className="p-3 text-sm text-center">
        <p className="text-gray-700">Waiting for user...</p>
        {/* Future: Add options like timeout, specific keywords to listen for */}
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!bg-gray-400 w-3 h-3" />
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="!bg-gray-400 w-3 h-3" />
    </div>
  );
};

export default ListenNode; 