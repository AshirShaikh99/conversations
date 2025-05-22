'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from './CustomNode';

// EndNode should only have a target handle (it's an end point)
const EndNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }) => {
  return (
    <div 
      className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl rounded-lg overflow-hidden w-48 h-24 flex flex-col justify-center items-center border-2 border-red-700"
    >
      <div className="p-3 text-center">
        <p className="text-sm font-semibold tracking-wide uppercase">End</p>
        <p className="text-lg font-bold truncate" title={data.label}>{data.label || 'End Flow'}</p>
      </div>
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className="!bg-white !w-3 !h-3 !border-2 !border-red-700 !rounded-full hover:!bg-red-200 transition-all duration-150"
      />
    </div>
  );
};

export default EndNode; 