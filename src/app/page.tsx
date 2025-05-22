'use client';

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Node,
  Edge,
  Connection,
  MiniMap,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Sidebar from '@/app/components/panels/Sidebar';
import PropertiesPanel from '@/app/components/panels/PropertiesPanel';
import Button from '@/app/components/ui/Button';
import StartNode from '@/app/components/nodes/StartNode';
import MessageNode from '@/app/components/nodes/MessageNode';
import ListenNode from '@/app/components/nodes/ListenNode';
import ConditionNode from '@/app/components/nodes/ConditionNode';
import EndNode from '@/app/components/nodes/EndNode';
import { CustomNodeData } from '@/app/components/nodes/CustomNode';

const initialNodes: Node<CustomNodeData>[] = [
  {
    id: '1',
    type: 'startNode',
    data: { label: 'Start' },
    position: { x: 250, y: 25 },
  },
];

// Define custom node types
const nodeTypes = {
  startNode: StartNode,
  messageNode: MessageNode,
  listenNode: ListenNode,
  conditionNode: ConditionNode,
  endNode: EndNode,
  // We can also use the generic CustomNode for types not yet fully defined
  // custom: CustomNode, // Example if we had a generic 'custom' type
};

let id = 100;
const getId = () => `dndnode_${id++}`;

export default function HomePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const onUpdateNodeData = useCallback(
    (nodeId: string, newData: Partial<CustomNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // It's important to create a new object for the data field
            // to trigger a re-render of the node and its children/handles
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don_t need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      if (!rfInstance) {
        console.error("ReactFlow instance not available");
        return;
      }
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node<CustomNodeData> = {
        id: getId(),
        type,
        position,
        data: { label: label || `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<CustomNodeData>) => {
    setSelectedNode(node);
  }, []);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem('voice-flow', JSON.stringify(flow));
      alert('Workflow saved!');
    }
  }, [rfInstance]);

  const onLoad = useCallback(() => {
    const flowJson = localStorage.getItem('voice-flow');
    if (flowJson) {
      const flow = JSON.parse(flowJson);
      if (flow) {
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
      }
    } else {
      alert('No saved workflow found.');
    }
  }, [setNodes, setEdges]);


  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Voice Conversational Workflow Builder</h1>
        <div>
          <Button onClick={onSave}>Save</Button>
          <Button onClick={onLoad}>Load</Button>
        </div>
      </header>
      <div className="flex flex-grow">
        <ReactFlowProvider>
          <Sidebar />
          <main className="flex-grow h-full" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onInit={setRfInstance}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-50"
            >
              <Controls />
              <MiniMap />
              <Background gap={16} />
            </ReactFlow>
          </main>
          {selectedNode && (
            <PropertiesPanel 
              selectedNode={selectedNode} 
              onUpdateNodeData={onUpdateNodeData} 
            />
          )}
        </ReactFlowProvider>
      </div>
    </div>
  );
}
