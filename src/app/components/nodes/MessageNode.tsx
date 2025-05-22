'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from './CustomNode';

interface MessageNodeData extends CustomNodeData {
  prompt?: string;
}

const MessageNode: React.FC<NodeProps<MessageNodeData>> = ({ data, isConnectable }) => {
  return (
    <div className="w-48 shadow-md rounded-md bg-white border-2 border-blue-500">
      <div className="p-3 border-b border-blue-400 font-semibold bg-blue-500 text-white">
        {data.label || 'Message'}
      </div>
      <div className="p-3 text-sm">
        <p className="text-gray-700">AI Speaks:</p>
        <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 truncate" title={data.prompt}>
          {data.prompt || 'No prompt set'}
        </p>
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!bg-gray-400 w-3 h-3" />
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="!bg-gray-400 w-3 h-3" />
    </div>
  );
};

export default MessageNode; 