'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from './CustomNode';

const MessageNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }) => {
  return (
    <div 
      className="bg-white shadow-lg rounded-lg w-64 border-2 border-indigo-500 hover:border-indigo-600 transition-colors duration-150"
    >
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm font-semibold text-indigo-700 tracking-wide uppercase">Message</p>
        <p className="text-lg font-bold text-gray-800 truncate" title={data.label}>{data.label || 'Message Node'}</p>
      </div>
      <div className="p-4 text-sm text-gray-700 space-y-1 bg-gray-50">
        <p className="font-medium text-gray-600">AI Speaks:</p>
        <p className="italic text-gray-500 break-words min-h-[20px] max-h-28 overflow-y-auto">
          {data.prompt || <span className="text-gray-400">No prompt set...</span>}
        </p>
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white !rounded-full hover:!bg-indigo-400" />
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white !rounded-full hover:!bg-indigo-400" />
    </div>
  );
};

export default MessageNode; 