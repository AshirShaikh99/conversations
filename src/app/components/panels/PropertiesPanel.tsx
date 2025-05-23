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

  const handleDataChange = (key: keyof CustomNodeData, value: string | number | boolean) => {
    const currentData = selectedNode.data || {};
    onUpdateNodeData(selectedNode.id, { ...currentData, [key]: value });
  };

  const voiceOptions = [
    { value: 'Mark', label: 'Mark (Male)' },
    { value: 'Olivia', label: 'Olivia (Female)' },
    { value: 'Daniel', label: 'Daniel (Male)' },
    { value: 'Emma', label: 'Emma (Female)' },
  ];

  return (
    <aside className="w-96 p-6 shadow-lg overflow-y-auto properties-panel">
      <h3 className="text-xl font-semibold mb-6 sticky top-0 pb-3 z-10 border-b properties-panel-header">
        Properties: <span className="text-primary-color font-semibold">{selectedNode.data.label || selectedNode.type}</span>
      </h3>
      <div className="space-y-6">
        {/* Basic Node Properties */}
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

        {/* Voice Selection (for all conversational nodes) */}
        {(selectedNode.type === 'startNode' || selectedNode.type === 'messageNode' || 
          selectedNode.type === 'listenNode' || selectedNode.type === 'endNode') && (
          <div>
            <label htmlFor="nodeVoice" className="block text-sm font-medium text-text-color-secondary mb-1.5">
              Voice
            </label>
            <select
              id="nodeVoice"
              value={selectedNode.data.voice || 'Mark'}
              onChange={(e) => handleDataChange('voice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {voiceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Start Node Properties */}
        {selectedNode.type === 'startNode' && (
          <>
            <div>
              <label htmlFor="startPrompt" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                Opening Message
              </label>
              <textarea
                id="startPrompt"
                value={selectedNode.data.prompt || ''}
                onChange={(e) => handleDataChange('prompt', e.target.value)}
                placeholder="Enter the opening message for the conversation (e.g., Hello! Welcome to our service. How can I help you today?)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="startInstructions" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                Additional Instructions
              </label>
              <textarea
                id="startInstructions"
                value={selectedNode.data.additionalInstructions || ''}
                onChange={(e) => handleDataChange('additionalInstructions', e.target.value)}
                placeholder="Any additional behavioral instructions for the AI at the start"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Message Node Properties */}
        {selectedNode.type === 'messageNode' && (
          <>
            <div>
              <label htmlFor="nodePrompt" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                Message Content
              </label>
              <textarea
                id="nodePrompt"
                value={selectedNode.data.prompt || ''}
                onChange={(e) => handleDataChange('prompt', e.target.value)}
                placeholder="Enter the message the AI should deliver (e.g., Thank you for your patience. Let me process your request.)"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="messageInstructions" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                Delivery Instructions
              </label>
              <textarea
                id="messageInstructions"
                value={selectedNode.data.additionalInstructions || ''}
                onChange={(e) => handleDataChange('additionalInstructions', e.target.value)}
                placeholder="How should this message be delivered? (e.g., speak slowly, emphasize certain words, etc.)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Listen Node Properties */}
        {selectedNode.type === 'listenNode' && (
          <>
            <div>
              <label htmlFor="listenPrompt" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                Listen Instructions
              </label>
              <textarea
                id="listenPrompt"
                value={selectedNode.data.prompt || ''}
                onChange={(e) => handleDataChange('prompt', e.target.value)}
                placeholder="Instructions for what to listen for (e.g., Please tell me your order number, or I'm listening for your question)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="listenEvent" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                Expected Input Type
              </label>
              <Input
                id="listenEvent"
                type="text"
                value={selectedNode.data.eventName || ''}
                onChange={(e) => handleDataChange('eventName', e.target.value)}
                placeholder="e.g., order_number, customer_name, question"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="listenTimeout" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                Timeout (seconds)
              </label>
              <Input
                id="listenTimeout"
                type="number"
                value={selectedNode.data.timeout || 30}
                onChange={(e) => handleDataChange('timeout', parseInt(e.target.value) || 30)}
                placeholder="30"
                min="5"
                max="300"
                className="w-full"
              />
            </div>
          </>
        )}
        
        {/* Condition Node Properties */}
        {selectedNode.type === 'conditionNode' && (
          <>
            <div>
              <label htmlFor="nodeCondition" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                Condition Description
              </label>
              <Input
                id="nodeCondition"
                type="text"
                value={selectedNode.data.condition || ''}
                onChange={(e) => handleDataChange('condition', e.target.value)}
                placeholder="e.g., Check if user provided valid order number"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="nodeConditionLogic" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                Condition Logic
              </label>
              <textarea
                id="nodeConditionLogic"
                value={selectedNode.data.conditionLogic || ''}
                onChange={(e) => handleDataChange('conditionLogic', e.target.value)}
                placeholder="Describe the logic for this condition (e.g., If the user input contains numbers and is 8-12 characters long, it's likely an order number)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="conditionPrompt" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                Evaluation Instructions
              </label>
              <textarea
                id="conditionPrompt"
                value={selectedNode.data.prompt || ''}
                onChange={(e) => handleDataChange('prompt', e.target.value)}
                placeholder="Instructions for the AI on how to evaluate this condition (e.g., Analyze the user's input and determine if it matches the expected format)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* End Node Properties */}
        {selectedNode.type === 'endNode' && (
          <>
            <div>
              <label htmlFor="endPrompt" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                Closing Message
              </label>
              <textarea
                id="endPrompt"
                value={selectedNode.data.prompt || ''}
                onChange={(e) => handleDataChange('prompt', e.target.value)}
                placeholder="Final message before ending the call (e.g., Thank you for contacting us. Have a great day!)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endSummary" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                Summary Instructions
              </label>
              <textarea
                id="endSummary"
                value={selectedNode.data.summaryInstructions || ''}
                onChange={(e) => handleDataChange('summaryInstructions', e.target.value)}
                placeholder="Instructions for summarizing the conversation (e.g., Provide a brief summary of what was accomplished)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Advanced Settings */}
        {(selectedNode.type === 'startNode' || selectedNode.type === 'messageNode' || 
          selectedNode.type === 'listenNode' || selectedNode.type === 'conditionNode') && (
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-3 py-2 bg-gray-50 cursor-pointer font-medium text-sm">
              Advanced Settings
            </summary>
            <div className="p-3 space-y-4">
              <div>
                <label htmlFor="nodeTemperature" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                  AI Temperature (0.0 - 1.0)
                </label>
                <Input
                  id="nodeTemperature"
                  type="number"
                  value={selectedNode.data.temperature || 0.3}
                  onChange={(e) => handleDataChange('temperature', parseFloat(e.target.value) || 0.3)}
                  placeholder="0.3"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower values make AI more focused, higher values more creative
                </p>
              </div>
              
              <div>
                <label htmlFor="nodeLanguageHint" className="block text-sm font-medium text-text-color-secondary mb-1.5">
                  Language Hint
                </label>
                <Input
                  id="nodeLanguageHint"
                  type="text"
                  value={selectedNode.data.languageHint || ''}
                  onChange={(e) => handleDataChange('languageHint', e.target.value)}
                  placeholder="e.g., en-US, es-ES, fr-FR"
                  className="w-full"
                />
              </div>
            </div>
          </details>
        )}
        
        {/* Node Info */}
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