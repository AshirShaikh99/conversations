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
      <aside className="w-96 p-6 shadow-lg properties-panel">
        <h3 className="text-xl font-semibold mb-6">Properties</h3>
        <p className="text-sm text-text-color-muted">Select a node to view and edit its properties.</p>
      </aside>
    );
  }

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNodeData(selectedNode.id, { label: event.target.value });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDataChange = (key: keyof CustomNodeData, value: any) => {
    // Ensure data object exists and preserve other data properties
    const currentData = selectedNode.data || {};
    onUpdateNodeData(selectedNode.id, { ...currentData, [key]: value });
  };

  return (
    <aside className="w-96 p-6 shadow-lg overflow-y-auto properties-panel">
      <h3 className="text-xl font-semibold mb-6 sticky top-0 pb-3 z-10 border-b properties-panel-header">
        Properties: <span className="text-primary-color font-semibold">{selectedNode.data.label || selectedNode.type}</span>
      </h3>
      <div className="space-y-6">
        <div>
          <label htmlFor="nodeLabel" className="block text-sm font-medium text-text-color-secondary mb-1.5">
            Label
          </label>
          <Input
            id="nodeLabel"
            type="text"
            value={selectedNode.data.label || ''}
            onChange={handleLabelChange}
            placeholder="Enter node label"
            className="w-full"
          />
        </div>

        {selectedNode.type === 'messageNode' && (
          <div>
            <label htmlFor="nodePrompt" className="block text-sm font-medium text-text-color-secondary mb-1.5">
              AI Prompt
            </label>
            <textarea
              id="nodePrompt"
              value={selectedNode.data.prompt || ''}
              onChange={(e) => handleDataChange('prompt', e.target.value)}
              placeholder="Enter AI message prompt (e.g., Hello, how can I help you?)"
              rows={4}
              className="w-full"
            />
          </div>
        )}

        {selectedNode.type === 'listenNode' && (
          <div>
            <label htmlFor="listenEvent" className="block text-sm font-medium text-text-color-secondary mb-1.5">
              Listen For (Event Name)
            </label>
            <Input
              id="listenEvent"
              type="text"
              value={selectedNode.data.eventName || ''}
              onChange={(e) => handleDataChange('eventName', e.target.value)}
              placeholder="e.g., user_speech_processed"
              className="w-full"
            />
          </div>
        )}
        
        {selectedNode.type === 'conditionNode' && (
          <div>
            <label htmlFor="nodeCondition" className="block text-sm font-medium text-text-color-secondary mb-1.5">
              Condition Logic
            </label>
            <textarea
              id="nodeCondition"
              value={selectedNode.data.conditionLogic || ''}
              onChange={(e) => handleDataChange('conditionLogic', e.target.value)}
              placeholder="e.g., variables.orderStatus === 'shipped'"
              rows={3}
              className="w-full"
            />
            <p className="mt-1.5 text-xs text-text-color-muted">
              Use JavaScript-like expressions. Access variables via `variables.variableName`.
            </p>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-border-color">
          <h4 className="text-sm font-semibold text-text-color-secondary mb-2">Node Info</h4>
          <div className="space-y-1 text-xs text-text-color-muted bg-neutral-color-light p-3 rounded-md border border-border-color">
            <p><span className="font-medium text-text-color-primary">ID:</span> {selectedNode.id}</p>
            <p><span className="font-medium text-text-color-primary">Type:</span> <span className="px-2 py-0.5 bg-primary-color text-white rounded-full text-xs font-medium">{selectedNode.type}</span></p>
            <p><span className="font-medium text-text-color-primary">Position:</span> x: {selectedNode.position.x.toFixed(0)}, y: {selectedNode.position.y.toFixed(0)}</p>
          </div>
        </div>

      </div>
    </aside>
  );
} 