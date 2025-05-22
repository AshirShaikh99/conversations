'use client';

import React from 'react';

// Define a more structured type for node display information
interface DraggableNodeInfo {
  type: string;
  label: string;
  description: string;
  icon?: React.ReactElement; // Optional: for a visual cue
  colorClass?: string; // Optional: for a colored accent
}

const nodeDisplayInfo: DraggableNodeInfo[] = [
  { type: 'startNode', label: 'Start', description: 'Begins the conversation flow.' },
  { type: 'messageNode', label: 'Message', description: 'Sends a message from the AI.' },
  { type: 'listenNode', label: 'Listen', description: 'Waits for user input or event.' },
  { type: 'conditionNode', label: 'Condition', description: 'Branches flow based on logic.' },
  { type: 'endNode', label: 'End', description: 'Concludes the conversation.' },
];

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label); // Pass the specific label for the new node
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-72 p-5 shadow-md overflow-y-auto bg-card-background border-r border-border-color">
      <h3 className="text-xl font-semibold text-text-color-primary mb-6 sticky top-0 pb-3 z-10 border-b border-border-color bg-card-background">
        Add Nodes
      </h3>
      <div className="space-y-3">
        {nodeDisplayInfo.map((nodeInfo) => (
          <div
            key={nodeInfo.type}
            className="sidebar-node-item"
            onDragStart={(event) => onDragStart(event, nodeInfo.type, nodeInfo.label)}
            draggable
            title={nodeInfo.description}
          >
            <div className="font-semibold">{nodeInfo.label}</div>
            <p className="text-xs text-text-color-muted mt-0.5">{nodeInfo.description}</p>
          </div>
        ))}
      </div>
    </aside>
  );
} 