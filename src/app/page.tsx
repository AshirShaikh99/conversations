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
import DynamicCallStageManager from '@/app/components/ultravox/DynamicCallStageManager';
import { CustomNodeData } from '@/app/components/nodes/CustomNode';
import { getAllFlowTemplates, getFlowTemplate } from '@/app/lib/flow-templates';

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
  const [showCallStages, setShowCallStages] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [activeNodeId, setActiveNodeId] = useState<string>('');
  const [flowValidation, setFlowValidation] = useState<{isValid: boolean; errors: string[]}>({
    isValid: true,
    errors: []
  });
  const [useDynamicFlow, setUseDynamicFlow] = useState(true);

  // Update node styles based on active stage
  const getNodeStyle = useCallback((nodeId: string) => {
    const isActive = nodeId === activeNodeId;
    if (isActive) {
      console.log('🎨 Applying active style to node:', { nodeId, activeNodeId });
      return {
        border: '3px solid #10b981', // Green border for active node
        boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
        backgroundColor: '#ecfdf5', // Light green background
      };
    }
    return {};
  }, [activeNodeId]);

  // Apply styles to nodes
  const nodesWithStyles = nodes.map(node => {
    const style = getNodeStyle(node.id);
    const hasStyle = Object.keys(style).length > 0;
    if (hasStyle) {
      console.log('🖌️ Applying style to node:', { nodeId: node.id, style });
    }
    return {
      ...node,
      style: {
        ...node.style,
        ...style
      }
    };
  });

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

  const onLoadTemplate = useCallback((templateId: string) => {
    const template = getFlowTemplate(templateId);
    if (template) {
      setNodes(template.nodes);
      setEdges(template.edges);
      const maxId = template.nodes.reduce((max: number, node: Node) => {
        const numPart = parseInt(node.id.split('_')[1]);
        return numPart > max ? numPart : max;
      }, 0);
      nodeUniqueId = maxId + 1;
      setSelectedNode(null);
      alert(`Template "${template.name}" loaded successfully!`);
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
    
    // Show Ultravox Call Stages interface
    setShowCallStages(true);
    
    setIsSubmitting(false);
  }, [rfInstance]);

  const handleStageChange = useCallback((stageId: string, stageName: string) => {
    console.log('🎯 handleStageChange called:', { stageId, stageName });
    console.log('📋 Current nodes:', nodes.map(n => ({ id: n.id, label: n.data.label })));
    
    setCurrentStage(stageId);
    setActiveNodeId(stageId); // Highlight the node corresponding to the current stage
    
    console.log('✅ Stage state updated:', { 
      newCurrentStage: stageId, 
      newActiveNodeId: stageId,
      matchingNode: nodes.find(n => n.id === stageId)?.data.label 
    });
    
    console.log(`🎨 Node highlighted: ${stageName} (${stageId})`);
  }, [nodes]);

  const handleCallEnd = useCallback(() => {
    setShowCallStages(false);
    setCurrentStage('');
    console.log('Call ended');
  }, []);

  const handleCallError = useCallback((error: string) => {
    console.error('Call error:', error);
    alert(`Call error: ${error}`);
  }, []);

  const handleFlowValidation = useCallback((isValid: boolean, errors: string[]) => {
    setFlowValidation({ isValid, errors });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background-start-rgb">
      <header className="bg-gray-900 text-white p-4 shadow-lg flex justify-between items-center z-20">
        <h1 className="text-xl font-bold tracking-tight">Voice Conversational Workflow Builder</h1>
        <div className="space-x-4 flex items-center">
          <Button onClick={onSave} className="button-primary" disabled={isSubmitting}>Save Flow</Button>
          <Button onClick={onLoad} className="button-secondary" disabled={isSubmitting}>Load Flow</Button>
          
          {/* Template Dropdown */}
          <div className="relative">
            <select
              onChange={(e) => e.target.value && onLoadTemplate(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>Load Template</option>
              {getAllFlowTemplates().map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Flow Mode Toggle */}
          <div className="flex items-center space-x-2">
            <label className="text-sm">
              <input
                type="checkbox"
                checked={useDynamicFlow}
                onChange={(e) => setUseDynamicFlow(e.target.checked)}
                className="mr-1"
              />
              Dynamic Flow
            </label>
          </div>
          
          <Button 
            onClick={onRunFlow} 
            className={`text-white ${
              flowValidation.isValid 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
            disabled={isSubmitting || (!useDynamicFlow ? false : !flowValidation.isValid)}
          >
            {isSubmitting ? 'Processing...' : 'Start Call'}
          </Button>
          {currentStage && (
            <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full">
              Stage: {currentStage}
            </span>
          )}
        </div>
      </header>
      
      {/* Flow Validation Banner */}
      {useDynamicFlow && !flowValidation.isValid && flowValidation.errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Flow Validation Issues:</strong>
              </p>
              <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                {flowValidation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-grow overflow-hidden">
        <ReactFlowProvider>
          <Sidebar />
          <main className="flex-grow h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
              nodes={nodesWithStyles}
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
        
        {/* Ultravox Call Stages Panel */}
        {showCallStages && (
          <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Ultravox Call Stages</h2>
                <button
                  onClick={() => setShowCallStages(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Multi-stage voice conversation system
              </p>
            </div>
            <div className="p-4">
              {useDynamicFlow ? (
                <DynamicCallStageManager
                  nodes={nodes}
                  edges={edges}
                  onStageChange={handleStageChange}
                  onCallEnd={handleCallEnd}
                  onError={handleCallError}
                  onFlowValidation={handleFlowValidation}
                />
              ) : (
                <div className="text-center text-gray-600">
                  <p>Static call stages mode</p>
                  <p className="text-sm mt-1">Enable &quot;Dynamic Flow&quot; to use your custom flow</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Voice Flow Builder</h1>
          {activeNodeId && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Agent Active: {nodes.find(n => n.id === activeNodeId)?.data.label || activeNodeId}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useDynamicFlow}
              onChange={(e) => setUseDynamicFlow(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Dynamic Flow</span>
          </label>
          <Button
            onClick={() => setShowCallStages(!showCallStages)}
            variant="secondary"
            className="text-sm"
          >
            {showCallStages ? 'Hide' : 'Show'} Call Stages
          </Button>
        </div>
      </div>
    </div>
  );
}
