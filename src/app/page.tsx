'use client';

import React, { useState, useCallback, DragEvent, MouseEvent, useEffect } from 'react';
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
// Removed direct UltravoxSessionStatus import as it's now through the store or inferred
import { UltravoxSessionStatus } from 'ultravox-client'; 

import Sidebar from '@/app/components/panels/Sidebar';
import PropertiesPanel from '@/app/components/panels/PropertiesPanel';
import Button from '@/app/components/ui/Button';
import StartNode from '@/app/components/nodes/StartNode';
import MessageNode from '@/app/components/nodes/MessageNode';
import ListenNode from '@/app/components/nodes/ListenNode';
import ConditionNode from '@/app/components/nodes/ConditionNode';
import EndNode from '@/app/components/nodes/EndNode';
import { CustomNodeData } from '@/app/components/nodes/CustomNode';
import { useUltravoxStore } from '@/app/store/ultravoxStore'; // Import Zustand store

// Transcript interface is now defined in the store, but ensure CustomNodeData is correct.
// Re-defined here if page.tsx still needs its own local definition for some reason, otherwise remove.
// interface Transcript {
//   text: string;
//   isFinal: boolean;
//   speaker: 'user' | 'agent';
//   medium: 'voice' | 'text';
// }

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
  const [isSubmitting, setIsSubmitting] = useState(false); // Keep for UI feedback during flow processing before call
  
  // State from Zustand store
  const {
    initializeSession,
    sessionStatus,
    transcripts,
    startCall,
    leaveCall,
    error: ultravoxError,
    setJoinUrl,
  } = useUltravoxStore();

  useEffect(() => {
    initializeSession(); // Initialize Ultravox session via store on component mount
  }, [initializeSession]);

  // Effect to show Ultravox errors from the store
  useEffect(() => {
    if (ultravoxError) {
      alert(`Ultravox Error: ${ultravoxError}`);
      useUltravoxStore.setState({ error: null }); // Clear error after showing
    }
  }, [ultravoxError]);

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
    // No longer need to check for uvSessionRef.current as store handles session initialization

    setIsSubmitting(true);
    const flow = rfInstance.toObject(); // We still need the flow for agent configuration
    console.log("Current flow for agent (nodes, edges):", flow.nodes, flow.edges);
    
    // TODO: Replace this with your actual join URL generation logic!
    // This URL will likely come from a backend that provisions the Ultravox call
    // and potentially uses the flow data (nodes, edges) to configure the agent.
    const placeholderJoinUrl = 'wss://your-ultravox-instance.com/ws/join/CALL_ID_HERE'; 
    alert('Using a PLACEHOLDER joinUrl. The call will likely not connect to a configured agent. Replace this in onRunFlow with actual join URL generation logic.');
    console.warn('Using placeholderJoinUrl:', placeholderJoinUrl, ' - The flow data (nodes, edges) is available here but not currently sent to a backend to configure the agent before joining.');

    setJoinUrl(placeholderJoinUrl); // Set it in the store

    try {
      await startCall(); // Call startCall from the store
      // The store will handle status updates. Any specific UI changes after starting can go here.
      // For example, if you want to show an immediate alert:
      // alert('Attempting to start call via store...');
    } catch (error) {
      // Error is now handled and alerted by the useEffect for ultravoxError
      // or directly logged by the store's startCall action.
      // We can keep setIsSubmitting(false) in a finally block if needed.
      console.error('onRunFlow caught an error from startCall (this is usually handled by store):', error);
    }

    // It might be better to set isSubmitting to false based on sessionStatus changes
    // e.g., when status becomes CONNECTING, IDLE, or DISCONNECTED after an attempt.
    // For now, we'll set it to false here.
    setIsSubmitting(false);
  }, [rfInstance, startCall, setJoinUrl]);

  const handleLeaveCall = useCallback(async () => {
    setIsSubmitting(true); // Indicate an operation is in progress
    await leaveCall(); // Call leaveCall from the store
    setIsSubmitting(false); // Reset after the attempt
    // alert for success/failure is handled by ultravoxError effect or store logs
  }, [leaveCall]);

  // Ensure isActiveSession is always boolean for button disabled prop
  const isActiveSession = !!(sessionStatus && 
                           sessionStatus !== UltravoxSessionStatus.DISCONNECTED && 
                           sessionStatus !== UltravoxSessionStatus.DISCONNECTING);

  return (
    <div className="flex flex-col h-screen bg-background-start-rgb">
      <header className="bg-gray-900 text-white p-4 shadow-lg flex justify-between items-center z-20">
        <h1 className="text-xl font-bold tracking-tight">Voice Conversational Workflow Builder</h1>
        <div className="space-x-4 flex items-center">
          <Button onClick={onSave} className="button-primary" disabled={isSubmitting || isActiveSession}>Save Flow</Button>
          <Button onClick={onLoad} className="button-secondary" disabled={isSubmitting || isActiveSession}>Load Flow</Button>
          <Button 
            onClick={onRunFlow} 
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={isSubmitting || 
              sessionStatus === UltravoxSessionStatus.CONNECTING ||
              sessionStatus === UltravoxSessionStatus.IDLE ||
              sessionStatus === UltravoxSessionStatus.LISTENING ||
              sessionStatus === UltravoxSessionStatus.SPEAKING ||
              sessionStatus === UltravoxSessionStatus.THINKING // Added THINKING as an active state
            }
          >
            {isSubmitting ? 'Processing...' : 
              (isActiveSession ? `Status: ${sessionStatus}` : 'Run Flow')
            }
          </Button>
          {isActiveSession && (
             <Button onClick={handleLeaveCall} className="bg-red-500 hover:bg-red-600 text-white" disabled={isSubmitting}>
              Leave Call
            </Button>
          )}
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
      {transcripts.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800 bg-opacity-90 text-white max-h-40 overflow-y-auto text-sm z-30">
          <h4 className="font-semibold mb-2 text-gray-300">Live Transcript:</h4>
          {transcripts.map((t, index) => (
            <div key={index} className={`mb-1 p-1.5 rounded-md ${t.speaker === 'agent' ? 'text-blue-300' : 'text-green-300'}`}>
              <strong>{t.speaker === 'agent' ? 'Agent' : 'User'}:</strong> {t.text} {t.isFinal ? '' : '...'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
