'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from './CustomNode';

// interface ConditionNodeData extends CustomNodeData {
//   conditionLogic?: string;
// }

const ConditionNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }) => {
  return (
    <div 
      className="bg-white shadow-lg rounded-lg w-64 border-2 border-purple-500 hover:border-purple-600 transition-colors duration-150"
    >
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm font-semibold text-purple-700 tracking-wide uppercase">Condition</p>
        <p className="text-lg font-bold text-gray-800 truncate" title={data.label}>{data.label || 'Condition Node'}</p>
      </div>
      <div className="p-4 text-sm text-gray-700 space-y-1 bg-gray-50">
        <p className="font-medium text-gray-600">Logic:</p>
        <p className="italic text-gray-500 break-words min-h-[20px] max-h-24 overflow-y-auto">
          {data.conditionLogic || <span className="text-gray-400">No logic set...</span>}
        </p>
      </div>
      {/* Handles for ConditionNode: one target, multiple sources (e.g., true/false paths) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white !rounded-full hover:!bg-purple-400"
      />
      <Handle 
        id="true"
        type="source" 
        position={Position.Right} 
        style={{ top: '35%' }} // Adjust position for multiple handles
        isConnectable={isConnectable} 
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white !rounded-full hover:!bg-purple-400"
      />
      <Handle 
        id="false"
        type="source" 
        position={Position.Right} 
        style={{ top: '65%' }} // Adjust position for multiple handles
        isConnectable={isConnectable} 
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white !rounded-full hover:!bg-purple-400"
      />
      {/* Labels for source handles */}
      <div className="absolute right-[-30px] top-[calc(35%-8px)] text-xs text-purple-700 font-medium">True</div>
      <div className="absolute right-[-35px] top-[calc(65%-8px)] text-xs text-purple-700 font-medium">False</div>
    </div>
  );
};

export default ConditionNode; 