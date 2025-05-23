'use client';

import React, { useState, useCallback, DragEvent, MouseEvent } from 'react';
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
  SelectionMode,
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
    id: 'startNode_1',
    type: 'startNode',
    data: { label: 'Start Flow' },
    position: { x: 150, y: 150 },
    draggable: false,
  },
];

const nodeTypes = {
  startNode: StartNode,
  messageNode: MessageNode,
  listenNode: ListenNode,
  conditionNode: ConditionNode,
  endNode: EndNode,
};

let nodeUniqueId = 1;
const getId = (type: string = 'node') => `${type}_${nodeUniqueId++}`;

export default function HomePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<CustomNodeData, Edge> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onUpdateNodeData = useCallback(
    (nodeId: string, newData: Partial<CustomNodeData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node
        )
      );
      setSelectedNode((sn) => 
        sn && sn.id === nodeId ? { ...sn, data: { ...sn.data, ...newData } } : sn
      );
    },
    [setNodes, setSelectedNode]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label') || `${type.charAt(0).toUpperCase() + type.slice(1).replace('Node','')} Node`;

      if (typeof type === 'undefined' || !type || !rfInstance) {
        console.warn('Drop conditions not met: Invalid type or ReactFlow instance missing', { type, rfInstance });
        return;
      }

      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<CustomNodeData> = {
        id: getId(type),
        type,
        position,
        data: { label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance, setNodes]
  );

  const onNodeClick = useCallback((event: MouseEvent, node: Node<CustomNodeData>) => {
    setSelectedNode(node);
  }, []);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem('voice-flow-builder', JSON.stringify(flow));
      alert('Workflow saved successfully!');
    } else {
      alert('Error: Flow instance not available for saving.');
    }
  }, [rfInstance]);

  const onLoad = useCallback(() => {
    const flowJson = localStorage.getItem('voice-flow-builder');
    if (flowJson) {
      try {
        const flow = JSON.parse(flowJson);
        if (flow && flow.nodes && flow.edges) {
          setNodes(flow.nodes.map((n: Node<CustomNodeData>) => ({...n, data: n.data || {label: 'Untitled'}})) );
          setEdges(flow.edges);
          const maxId = flow.nodes.reduce((max: number, node: Node) => {
            const numPart = parseInt(node.id.split('_')[1]);
            return numPart > max ? numPart : max;
          }, 0);
          nodeUniqueId = maxId + 1;
          setSelectedNode(null);
          alert('Workflow loaded successfully!');
        } else {
          alert('Invalid workflow data found.');
        }
      } catch (error) {
        console.error("Failed to parse saved workflow:", error);
        alert('Failed to load workflow. Data might be corrupted.');
      }
    } else {
      alert('No saved workflow found.');
    }
  }, [setNodes, setEdges]);

  const onRunFlow = useCallback(async () => {
    if (!rfInstance) {
      alert('ReactFlow instance not available.');
      return;
    }

    setIsSubmitting(true);
    const flow = rfInstance.toObject();
    console.log("Current flow (nodes, edges):", flow.nodes, flow.edges);
    
    // TODO: Implement flow execution logic here
    alert('Flow execution logic needs to be implemented');
    
    setIsSubmitting(false);
  }, [rfInstance]);

  return (
    <div className="flex flex-col h-screen bg-background-start-rgb">
      <header className="bg-gray-900 text-white p-4 shadow-lg flex justify-between items-center z-20">
        <h1 className="text-xl font-bold tracking-tight">Voice Conversational Workflow Builder</h1>
        <div className="space-x-4 flex items-center">
          <Button onClick={onSave} className="button-primary" disabled={isSubmitting}>Save Flow</Button>
          <Button onClick={onLoad} className="button-secondary" disabled={isSubmitting}>Load Flow</Button>
          <Button 
            onClick={onRunFlow} 
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Run Flow'}
          </Button>
        </div>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <ReactFlowProvider>
          <Sidebar />
          <main className="flex-grow h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
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
              className="bg-transparent"
              deleteKeyCode={['Backspace', 'Delete']}
              selectionMode={SelectionMode.Full}
            >
              <Controls className="!bottom-5 !left-5 !shadow-xl !rounded-lg !border-border-color" />
              <MiniMap nodeStrokeWidth={3} zoomable pannable className="!bottom-5 !right-5 !h-44 !w-64 !shadow-xl !rounded-lg !border-border-color" />
              <Background color="var(--neutral-color-medium)" gap={24} size={1.5} />
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
