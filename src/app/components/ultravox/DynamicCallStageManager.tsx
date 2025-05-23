'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { CustomNodeData } from '@/app/components/nodes/CustomNode';
import { FlowExecutor, createFlowExecutor } from '@/app/lib/flow-executor';
import { UltravoxCallStageManager, getUltravoxConfig } from '@/app/lib/ultravox-config';

interface DynamicCallStageManagerProps {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  onStageChange: (stageId: string, stageName: string) => void;
  onCallEnd: () => void;
  onError: (error: string) => void;
  onFlowValidation: (isValid: boolean, errors: string[]) => void;
}

interface CallState {
  isActive: boolean;
  currentStage: string;
  joinUrl: string | null;
  executor: FlowExecutor | null;
  callManager: UltravoxCallStageManager | null;
}

export default function DynamicCallStageManager({
  nodes,
  edges,
  onStageChange,
  onCallEnd,
  onError,
  onFlowValidation
}: DynamicCallStageManagerProps) {
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    currentStage: '',
    joinUrl: null,
    executor: null,
    callManager: null
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [flowValidation, setFlowValidation] = useState<{isValid: boolean; errors: string[]}>({
    isValid: true,
    errors: []
  });

  // Validate flow whenever nodes or edges change
  useEffect(() => {
    if (nodes.length > 0) {
      const executor = createFlowExecutor(nodes, edges);
      const validation = executor.validateFlow();
      setFlowValidation(validation);
      onFlowValidation(validation.isValid, validation.errors);
    }
  }, [nodes, edges, onFlowValidation]);

  const initializeCall = useCallback(async () => {
    if (!flowValidation.isValid) {
      onError('Cannot start call: Flow validation failed');
      return;
    }

    setIsInitializing(true);
    
    try {
      // Create flow executor
      const executor = createFlowExecutor(nodes, edges);
      
      // Generate dynamic call stage configuration
      const callStageConfig = executor.generateCallStageConfig();
      
      console.log('🔧 Generated call stage config:', {
        initialStageId: callStageConfig.initialStageId,
        stageCount: callStageConfig.stages.length,
        stages: callStageConfig.stages.map(s => ({ id: s.id, name: s.name }))
      });
      
      // Get Ultravox configuration
      const { apiKey } = getUltravoxConfig();
      
      // Create call manager with dynamic config
      const callManager = new UltravoxCallStageManager(callStageConfig, apiKey);
      
      // Set up stage change callback with detailed logging
      console.log('🔗 Setting up stage change callback');
      callManager.setOnStageChange((stageId: string, stageName: string) => {
        console.log('📍 Stage change received in DynamicCallStageManager:', { stageId, stageName });
        onStageChange(stageId, stageName);
      });
      
      // Initialize the call
      console.log('🚀 Initializing Ultravox call...');
      const joinUrl = await callManager.initializeCall();
      
      setCallState({
        isActive: false,
        currentStage: callStageConfig.initialStageId,
        joinUrl,
        executor,
        callManager
      });
      
      // Notify initial stage
      console.log('🎯 Notifying initial stage to parent component');
      onStageChange(callStageConfig.initialStageId, 'Call Initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize call:', error);
      onError(`Failed to initialize call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsInitializing(false);
    }
  }, [nodes, edges, flowValidation.isValid, onStageChange, onError]);

  const startCall = useCallback(async () => {
    if (!callState.joinUrl || !callState.callManager) {
      onError('Call not initialized. Please initialize first.');
      return;
    }

    try {
      await callState.callManager.joinCall(callState.joinUrl);
      setCallState(prev => ({ ...prev, isActive: true }));
      onStageChange(callState.currentStage, 'Call Started');
      
      console.log('✅ Call started successfully - Stage transitions will update UI automatically');
      
    } catch (error) {
      console.error('❌ Failed to start call:', error);
      onError(`Failed to start call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [callState.joinUrl, callState.callManager, callState.currentStage, onStageChange, onError]);

  const endCall = useCallback(async () => {
    if (!callState.callManager) {
      onError('No active call to end.');
      return;
    }

    try {
      await callState.callManager.leaveCall();
      setCallState({
        isActive: false,
        currentStage: '',
        joinUrl: null,
        executor: null,
        callManager: null
      });
      onCallEnd();
    } catch (error) {
      console.error('❌ Failed to end call:', error);
      onError(`Failed to end call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [callState.callManager, onCallEnd, onError]);

  const getFlowSummary = () => {
    if (!callState.executor) return null;
    
    const startNode = nodes.find(n => n.type === 'startNode');
    const endNodes = nodes.filter(n => n.type === 'endNode');
    const totalNodes = nodes.length;
    const totalEdges = edges.length;

    return {
      startNode: startNode?.data.label || 'Start',
      endNodes: endNodes.map(n => n.data.label || 'End'),
      totalNodes,
      totalEdges,
      isValid: flowValidation.isValid
    };
  };

  const flowSummary = getFlowSummary();

  return (
    <div className="space-y-4">
      {/* Flow Validation Status */}
      <div className={`p-4 rounded-lg border ${
        flowValidation.isValid 
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            flowValidation.isValid ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="font-medium">
            {flowValidation.isValid ? 'Flow Valid' : 'Flow Invalid'}
          </span>
        </div>
        {!flowValidation.isValid && (
          <div className="mt-2">
            <p className="text-sm font-medium">Validation Errors:</p>
            <ul className="text-sm mt-1 space-y-1">
              {flowValidation.errors.map((error, index) => (
                <li key={index} className="flex items-start space-x-1">
                  <span>•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Flow Summary */}
      {flowSummary && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Flow Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Start:</span> {flowSummary.startNode}
            </div>
            <div>
              <span className="font-medium">Nodes:</span> {flowSummary.totalNodes}
            </div>
            <div>
              <span className="font-medium">End Points:</span> {flowSummary.endNodes.join(', ') || 'None'}
            </div>
            <div>
              <span className="font-medium">Connections:</span> {flowSummary.totalEdges}
            </div>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="space-y-3">
        {!callState.joinUrl && (
          <button
            onClick={initializeCall}
            disabled={isInitializing || !flowValidation.isValid || nodes.length === 0}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isInitializing || !flowValidation.isValid || nodes.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isInitializing ? 'Initializing...' : 'Initialize Call'}
          </button>
        )}

        {callState.joinUrl && !callState.isActive && (
          <button
            onClick={startCall}
            className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            Start Call
          </button>
        )}

        {callState.isActive && (
          <button
            onClick={endCall}
            className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            End Call
          </button>
        )}
      </div>

      {/* Call Status */}
      {callState.currentStage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600 font-medium">Current Stage:</span>
            <span className="text-sm text-blue-800">{callState.currentStage}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-blue-600 font-medium">Status:</span>
            <span className={`text-sm font-medium ${
              callState.isActive ? 'text-green-600' : 'text-gray-600'
            }`}>
              {callState.isActive ? 'Active' : 'Initialized'}
            </span>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && callState.executor && (
        <details className="bg-gray-100 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2 text-xs text-gray-600">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify({
                nodes: nodes.length,
                edges: edges.length,
                validation: flowValidation,
                callState: {
                  isActive: callState.isActive,
                  currentStage: callState.currentStage,
                  hasJoinUrl: !!callState.joinUrl,
                  hasExecutor: !!callState.executor,
                  hasCallManager: !!callState.callManager
                }
              }, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
} 