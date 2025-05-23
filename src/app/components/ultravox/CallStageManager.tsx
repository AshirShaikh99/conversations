'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  UltravoxCallStageManager, 
  defaultCallStageConfig, 
  CallStage,
  CallStageConfig 
} from '@/app/lib/ultravox-config';

interface CallStageManagerProps {
  config?: CallStageConfig;
  onStageChange?: (stageId: string, stageName: string) => void;
  onCallEnd?: () => void;
  onError?: (error: string) => void;
}

export default function CallStageManager({ 
  config = defaultCallStageConfig,
  onStageChange,
  onCallEnd,
  onError 
}: CallStageManagerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [stageName, setStageName] = useState<string>('');
  const [manager, setManager] = useState<UltravoxCallStageManager | null>(null);
  const [joinUrl, setJoinUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize the call stage manager
  useEffect(() => {
    if (!isClient) return;

    try {
      // No need for API key on client side anymore since we use proxy
      const callManager = new UltravoxCallStageManager(config, ''); // Empty string as placeholder
      setManager(callManager);
      setError(''); // Clear any previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Ultravox';
      console.error('Ultravox initialization error:', err);
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [config, onError, isClient]);

  // Start a new call
  const startCall = useCallback(async () => {
    if (!manager || !isClient) {
      const errorMessage = 'Call manager not initialized or not on client side';
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      console.log('Starting call with manager...');
      const url = await manager.initializeCall();
      console.log('Got join URL:', url);
      setJoinUrl(url);
      
      console.log('Joining call...');
      await manager.joinCall(url);
      
      setIsConnected(true);
      setIsConnecting(false);
      
      const initialStage = config.stages.find(s => s.id === config.initialStageId);
      if (initialStage) {
        setCurrentStage(initialStage.id);
        setStageName(initialStage.name);
        onStageChange?.(initialStage.id, initialStage.name);
      }
      
      console.log('Call started successfully');
    } catch (err) {
      console.error('Call start error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start call';
      setError(errorMessage);
      setIsConnecting(false);
      onError?.(errorMessage);
    }
  }, [manager, config, onStageChange, onError, isClient]);

  // End the call
  const endCall = useCallback(async () => {
    if (!manager) return;

    try {
      await manager.leaveCall();
      setIsConnected(false);
      setCurrentStage('');
      setStageName('');
      setJoinUrl('');
      onCallEnd?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end call';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [manager, onCallEnd, onError]);

  // Get current stage information
  const getCurrentStageInfo = useCallback((): CallStage | null => {
    if (!manager || !currentStage) return null;
    return manager.getStageConfig(currentStage) || null;
  }, [manager, currentStage]);

  // Don't render anything until we're on the client side
  if (!isClient) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const stageInfo = getCurrentStageInfo();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Ultravox Call Stages
        </h2>
        <p className="text-sm text-gray-600">
          Multi-stage voice conversation system
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm font-medium">Error:</p>
          <p className="text-red-700 text-sm">{error}</p>
          {error.includes('Failed to fetch') && (
            <div className="mt-2 text-xs text-red-600">
              <p>Possible causes:</p>
              <ul className="list-disc list-inside">
                <li>Network connectivity issues</li>
                <li>Invalid API key</li>
                <li>Browser blocking the request</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <span className={`text-sm px-2 py-1 rounded-full ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : isConnecting
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Current Stage Info */}
      {isConnected && stageInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-1">Current Stage</h3>
          <p className="text-sm text-blue-800">{stageName}</p>
          <p className="text-xs text-blue-600 mt-1">
            ID: {currentStage}
          </p>
          {stageInfo.nextStages && stageInfo.nextStages.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-blue-600">Next stages available:</p>
              <p className="text-xs text-blue-700">
                {stageInfo.nextStages.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Call Controls */}
      <div className="space-y-3">
        {!isConnected ? (
          <button
            onClick={startCall}
            disabled={isConnecting || !manager}
            className={`w-full py-2 px-4 rounded-lg font-medium ${
              isConnecting || !manager
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isConnecting ? 'Starting Call...' : 'Start Call'}
          </button>
        ) : (
          <button
            onClick={endCall}
            className="w-full py-2 px-4 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white"
          >
            End Call
          </button>
        )}
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 space-y-2">
          {joinUrl && (
            <div className="p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
              <strong>Join URL:</strong> {joinUrl.substring(0, 50)}...
            </div>
          )}
          <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
            <strong>Manager:</strong> {manager ? 'Initialized' : 'Not initialized'}
          </div>
          <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
            <strong>Client:</strong> {isClient ? 'Ready' : 'Loading'}
          </div>
        </div>
      )}

      {/* Stage Configuration Preview */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-800 mb-2">Available Stages</h3>
        <div className="space-y-2">
          {config.stages.map((stage) => (
            <div
              key={stage.id}
              className={`p-2 rounded text-sm ${
                stage.id === currentStage
                  ? 'bg-blue-100 border border-blue-300'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{stage.name}</span>
                <span className="text-xs text-gray-500">{stage.voice}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Temperature: {stage.temperature} | Tools: {stage.selectedTools?.length || 0}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 