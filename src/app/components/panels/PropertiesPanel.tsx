'use client';

import React from 'react';
import { Node } from 'reactflow';
import Input from '@/app/components/ui/Input';
import { CustomNodeData } from '@/app/components/nodes/CustomNode';

interface PropertiesPanelProps {
  selectedNode: Node<CustomNodeData> | null;
  onUpdateNodeData: (nodeId: string, newData: Partial<CustomNodeData>) => void;
}

export default function PropertiesPanel({ selectedNode, onUpdateNodeData }: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <aside className="w-80 bg-gray-100 p-4 border-l border-gray-300">
        <h2 className="text-lg font-semibold mb-4">Properties</h2>
        <p className="text-sm text-gray-500">Select a node to edit its properties.</p>
      </aside>
    );
  }

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNodeData(selectedNode.id, { label: event.target.value });
  };

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure data object exists
    const currentData = selectedNode.data || {};
    onUpdateNodeData(selectedNode.id, { ...currentData, prompt: event.target.value });
  };

  return (
    <aside className="w-80 bg-gray-100 p-4 border-l border-gray-300 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-gray-100 pb-2 z-10">
        Properties: {selectedNode.data.label || selectedNode.type}
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="nodeLabel" className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <Input
            id="nodeLabel"
            type="text"
            value={selectedNode.data.label || ''}
            onChange={handleLabelChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {selectedNode.type === 'messageNode' && (
          <div>
            <label htmlFor="nodePrompt" className="block text-sm font-medium text-gray-700 mb-1">
              Prompt
            </label>
            <Input
              id="nodePrompt"
              type="text"
              value={selectedNode.data.prompt || ''}
              onChange={handlePromptChange}
              placeholder="Enter AI message prompt"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        {/* Add more specific property fields for other node types here */}
        {/* Example for a hypothetical 'condition' node:
        {selectedNode.type === 'conditionNode' && (
          <div>
            <label htmlFor="nodeCondition" className="block text-sm font-medium text-gray-700 mb-1">
              Condition Logic
            </label>
            <Input
              id="nodeCondition"
              type="text"
              value={selectedNode.data.conditionLogic || ''}
              onChange={(e) => onUpdateNodeData(selectedNode.id, { conditionLogic: e.target.value })}
              placeholder="e.g., userInput === 'yes'"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}
        */}

        <div className="mt-4 p-2 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 mb-1">Node Info</h3>
          <p className="text-xs text-gray-600">ID: {selectedNode.id}</p>
          <p className="text-xs text-gray-600">Type: {selectedNode.type}</p>
          <p className="text-xs text-gray-600">
            Position: x: {selectedNode.position.x.toFixed(0)}, y: {selectedNode.position.y.toFixed(0)}
          </p>
        </div>

      </div>
    </aside>
  );
} 