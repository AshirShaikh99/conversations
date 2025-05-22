'use client';

import React from 'react';

// These types should match the keys in nodeTypes in page.tsx
const nodeDisplayInfo = [
  { type: 'startNode', label: 'Start Node' },
  { type: 'messageNode', label: 'Message Node' },
  { type: 'listenNode', label: 'Listen Node' },
  { type: 'conditionNode', label: 'Condition Node' },
  { type: 'endNode', label: 'End Node' },
];

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-gray-100 p-4 border-r border-gray-300 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-gray-100 pb-2 z-10">Nodes</h2>
      {nodeDisplayInfo.map((nodeInfo) => (
        <div
          key={nodeInfo.type}
          className="p-3 border border-gray-400 rounded-md mb-3 cursor-grab bg-white shadow-sm hover:shadow-md transition-shadow"
          onDragStart={(event) => onDragStart(event, nodeInfo.type, nodeInfo.label)}
          draggable
        >
          {nodeInfo.label}
        </div>
      ))}
    </aside>
  );
} 