'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from './CustomNode'; // Assuming CustomNodeData is in the same folder

// StartNode should only have a source handle (it's the beginning)
const StartNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }) => {
  return (
    <div 
      className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl rounded-lg overflow-hidden w-48 h-24 flex flex-col justify-center items-center border-2 border-green-700"
    >
      <div className="p-3 text-center">
        <p className="text-sm font-semibold tracking-wide uppercase">Start</p>
        <p className="text-lg font-bold truncate" title={data.label}>{data.label || 'Start Flow'}</p>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable} 
        className="!bg-white !w-3 !h-3 !border-2 !border-green-700 !rounded-full hover:!bg-green-200 transition-all duration-150"
      />
    </div>
  );
};

export default StartNode; 