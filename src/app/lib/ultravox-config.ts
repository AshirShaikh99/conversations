// Types for ultravox-client (in case types are not available)
interface UltravoxSession {
  registerToolImplementation(name: string, implementation: ClientToolImplementation): void;
  joinCall(joinUrl: string): Promise<void>;
  leaveCall(): Promise<void>;
}

// Constructor type for UltravoxSession
interface UltravoxSessionConstructor {
  new (): UltravoxSession;
}

// Client tool implementation function type
type ClientToolImplementation = (parameters: Record<string, unknown>) => string | Promise<string>;

// Types for call stages
export interface CallStage {
  id: string;
  name: string;
  systemPrompt: string;
  voice?: string;
  temperature?: number;
  selectedTools?: SelectedTool[];
  languageHint?: string;
  nextStages?: string[];
}

export interface SelectedTool {
  toolName?: string;
  toolId?: string;
  temporaryTool?: {
    modelToolName: string;
    description: string;
    dynamicParameters: DynamicParameter[];
    client?: Record<string, unknown>;
  };
  parameterOverrides?: Record<string, unknown>;
}

export interface DynamicParameter {
  name: string;
  location: ParameterLocation;
  schema: {
    description: string;
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
    enum?: string[];
  };
  required: boolean;
}

export enum ParameterLocation {
  BODY = 'PARAMETER_LOCATION_BODY',
  QUERY = 'PARAMETER_LOCATION_QUERY',
  PATH = 'PARAMETER_LOCATION_PATH',
  HEADER = 'PARAMETER_LOCATION_HEADER'
}

export interface CallStageConfig {
  stages: CallStage[];
  initialStageId: string;
  globalConfig: {
    model: string;
    maxDuration?: string;
    recordingEnabled?: boolean;
    medium?: Record<string, unknown>;
  };
}

// Default configuration for the voice flow builder - REMOVED PREDEFINED PROMPTS
// The system now exclusively uses prompts generated from the conversational flow
export const defaultCallStageConfig: CallStageConfig = {
  initialStageId: 'flow-start',
  globalConfig: {
    model: 'fixie-ai/ultravox-70B',
    maxDuration: '1800s', // 30 minutes
    recordingEnabled: true,
  },
  stages: [
    // This will be replaced by flow-generated stages
    // No predefined stages to avoid interference with flow prompts
  ]
};

// Parameters for stage transitions
interface StageTransitionParams {
  targetStage: string;
  reason: string;
}

interface CallCompletionParams {
  summary: string;
}

interface IssueEscalationParams {
  issueType: string;
  issueDetails: string;
}

interface IssueResolutionParams {
  resolution: string;
}

interface RefundAuthorizationParams {
  amount: number;
  reason: string;
}

interface CallbackSchedulingParams {
  timeframe: string;
}

// Mock implementation for when ultravox-client is not available
class MockUltravoxSession implements UltravoxSession {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registerToolImplementation(_name: string, _implementation: ClientToolImplementation): void {
    console.log(`Mock: Registered tool ${_name}`);
  }
  
  async joinCall(_joinUrl: string): Promise<void> {
    console.log(`Mock: Joined call with URL ${_joinUrl}`);
  }
  
  async leaveCall(): Promise<void> {
    console.log('Mock: Left call');
  }
}

// Dynamic import function for UltravoxSession
async function getUltravoxSession(): Promise<UltravoxSessionConstructor> {
  try {
    const ultravoxModule = await import('ultravox-client');
    return ultravoxModule.UltravoxSession as unknown as UltravoxSessionConstructor;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    console.warn('ultravox-client not available, using mock implementation');
    return MockUltravoxSession;
  }
}

// Ultravox session management
export class UltravoxCallStageManager {
  private session: UltravoxSession | null = null;
  private currentStage: string = '';
  private config: CallStageConfig;
  private apiKey: string;

  constructor(config: CallStageConfig, apiKey: string) {
    this.config = config;
    this.apiKey = apiKey;
  }

  async initializeCall(): Promise<string> {
    try {
      // Create initial call with first stage configuration
      const initialStage = this.config.stages.find(s => s.id === this.config.initialStageId);
      if (!initialStage) {
        throw new Error('Initial stage not found');
      }

      // Create call configuration using ONLY the prompt from the conversational flow
      const callConfig = {
        systemPrompt: initialStage.systemPrompt, // This comes directly from your flow node prompt
        model: this.config.globalConfig.model,
        voice: initialStage.voice || 'Mark',
        temperature: initialStage.temperature || 0.4,
        // Don't include selectedTools in initial call creation for client-side tools
        // selectedTools: initialStage.selectedTools || [],
        languageHint: initialStage.languageHint || 'en',
        maxDuration: this.config.globalConfig.maxDuration,
        recordingEnabled: this.config.globalConfig.recordingEnabled,
        medium: this.config.globalConfig.medium,
        firstSpeaker: 'FIRST_SPEAKER_AGENT',
        // Removed hardcoded firstSpeakerSettings to let the agent use only the flow prompt
        initialOutputMedium: 'MESSAGE_MEDIUM_VOICE'
      };

      console.log('Initializing call with config:', callConfig);

      // Use our proxy API route instead of calling Ultravox directly
      const response = await fetch('/api/ultravox/create-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callConfig)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Response Error:', errorData);
        
        if (errorData.error && errorData.error.includes('Invalid API key')) {
          throw new Error('Invalid Ultravox API key. Please check your NEXT_PUBLIC_ULTRAVOX_API_KEY environment variable.');
        }
        
        throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const call = await response.json();
      this.currentStage = this.config.initialStageId;
      
      console.log('Call created successfully:', call);
      return call.joinUrl;
    } catch (error) {
      console.error('Failed to initialize Ultravox call:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to Ultravox API. Please check your internet connection.');
      }
      throw error;
    }
  }

  async joinCall(joinUrl: string): Promise<void> {
    const UltravoxSessionClass = await getUltravoxSession();
    this.session = new UltravoxSessionClass();
    
    // Register all possible tool implementations that may be used in the flow
    if (this.session) {
      // Core navigation tool
      this.session.registerToolImplementation('moveToStage', this.handleStageTransition.bind(this));
      
      // Flow-specific tools
      this.session.registerToolImplementation('captureInput', this.handleCaptureInput.bind(this));
      this.session.registerToolImplementation('evaluateCondition', this.handleEvaluateCondition.bind(this));
      this.session.registerToolImplementation('endCall', this.handleEndCall.bind(this));
      
      // Legacy tools (kept for backwards compatibility)
      this.session.registerToolImplementation('completeCall', this.handleCallCompletion.bind(this));
      this.session.registerToolImplementation('escalateIssue', this.handleIssueEscalation.bind(this));
      this.session.registerToolImplementation('resolveIssue', this.handleIssueResolution.bind(this));
      this.session.registerToolImplementation('authorizeRefund', this.handleRefundAuthorization.bind(this));
      this.session.registerToolImplementation('scheduleCallback', this.handleCallbackScheduling.bind(this));

      await this.session.joinCall(joinUrl);
    }
  }

  async leaveCall(): Promise<void> {
    if (this.session) {
      await this.session.leaveCall();
      this.session = null;
    }
  }

  private async handleStageTransition(parameters: Record<string, unknown>): Promise<string> {
    const { targetStage, reason } = parameters as unknown as StageTransitionParams;
    
    console.log(`Transitioning from ${this.currentStage} to ${targetStage}: ${reason}`);
    
    // Find the target stage configuration
    const nextStage = this.config.stages.find(s => s.id === targetStage);
    if (!nextStage) {
      return `Error: Stage "${targetStage}" not found`;
    }

    // Validate transition is allowed
    const currentStageConfig = this.config.stages.find(s => s.id === this.currentStage);
    if (currentStageConfig && currentStageConfig.nextStages && 
        !currentStageConfig.nextStages.includes(targetStage)) {
      return `Error: Transition from "${this.currentStage}" to "${targetStage}" is not allowed`;
    }

    // Update current stage
    this.currentStage = targetStage;
    
    // Create stage transition API call to update the system prompt
    try {
      const response = await fetch('/api/ultravox/stage-transition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt: nextStage.systemPrompt,
          voice: nextStage.voice || 'Mark',
          temperature: nextStage.temperature || 0.4,
          toolResultText: `(Stage Transition) Successfully moved to ${nextStage.name} stage. ${reason}`,
          stageName: nextStage.name,
          stageId: targetStage
        })
      });

      if (!response.ok) {
        console.error('Failed to transition stage via API:', response.statusText);
        return `Stage transition initiated locally. Now in ${nextStage.name} stage: ${reason}`;
      }

      console.log(`Successfully transitioned to ${nextStage.name} stage via API`);
      return `Successfully transitioned to ${nextStage.name} stage. ${reason}`;
    } catch (error) {
      console.error('Error during stage transition:', error);
      // Fallback to local transition
      return `Stage transition initiated. Now in ${nextStage.name} stage: ${reason}`;
    }
  }

  private async handleCallCompletion(parameters: Record<string, unknown>): Promise<string> {
    const { summary } = parameters as unknown as CallCompletionParams;
    console.log(`Call completed: ${summary}`);
    return `Call completed successfully. Summary: ${summary}`;
  }

  private async handleIssueEscalation(parameters: Record<string, unknown>): Promise<string> {
    const { issueType, issueDetails } = parameters as unknown as IssueEscalationParams;
    console.log(`Issue escalated - Type: ${issueType}, Details: ${issueDetails}`);
    return `Issue has been escalated to our ${issueType} specialist team. You will receive a callback within 2 hours.`;
  }

  private async handleIssueResolution(parameters: Record<string, unknown>): Promise<string> {
    const { resolution } = parameters as unknown as IssueResolutionParams;
    console.log(`Issue resolved: ${resolution}`);
    return `Great! The issue has been resolved: ${resolution}`;
  }

  private async handleRefundAuthorization(parameters: Record<string, unknown>): Promise<string> {
    const { amount, reason } = parameters as unknown as RefundAuthorizationParams;
    console.log(`Refund authorized - Amount: $${amount}, Reason: ${reason}`);
    return `I've authorized a refund of $${amount} for ${reason}. You'll see this credited to your account within 3-5 business days.`;
  }

  private async handleCallbackScheduling(parameters: Record<string, unknown>): Promise<string> {
    const { timeframe } = parameters as unknown as CallbackSchedulingParams;
    console.log(`Callback scheduled for: ${timeframe}`);
    return `I've scheduled a priority callback for you within ${timeframe.replace('_', ' ')}. You'll receive a call from our specialist team.`;
  }

  private async handleCaptureInput(parameters: Record<string, unknown>): Promise<string> {
    const { inputValue, inputType } = parameters as { inputValue: string; inputType?: string };
    console.log(`Captured input - Type: ${inputType || 'general'}, Value: ${inputValue}`);
    
    // Store the captured input in context (this could be enhanced to persist data)
    // For now, just acknowledge the capture
    return `I've captured your ${inputType || 'input'}: "${inputValue}". Thank you for providing that information.`;
  }

  private async handleEvaluateCondition(parameters: Record<string, unknown>): Promise<string> {
    const { conditionResult, nextStage } = parameters as { conditionResult: boolean; nextStage: string };
    console.log(`Condition evaluated - Result: ${conditionResult}, Next stage: ${nextStage}`);
    
    // Find the target stage configuration
    const targetStage = this.config.stages.find(s => s.id === nextStage);
    if (!targetStage) {
      return `Error: Target stage "${nextStage}" not found`;
    }

    // Trigger stage transition based on condition result
    return await this.handleStageTransition({ 
      targetStage: nextStage, 
      reason: `Condition evaluated to ${conditionResult}` 
    });
  }

  private async handleEndCall(parameters: Record<string, unknown>): Promise<string> {
    const { summary } = parameters as { summary?: string };
    console.log(`Call ending - Summary: ${summary || 'No summary provided'}`);
    
    // End the call gracefully
    if (this.session) {
      setTimeout(async () => {
        try {
          await this.session?.leaveCall();
          this.session = null;
        } catch (error) {
          console.error('Error ending call:', error);
        }
      }, 2000); // Give time for the response to be delivered
    }
    
    return summary 
      ? `Thank you for the conversation. ${summary} Have a great day!`
      : `Thank you for the conversation. Have a great day!`;
  }

  getCurrentStage(): string {
    return this.currentStage;
  }

  getStageConfig(stageId: string): CallStage | undefined {
    return this.config.stages.find(s => s.id === stageId);
  }

  getAllStages(): CallStage[] {
    return this.config.stages;
  }
}

// Environment configuration - only run on client side
export function getUltravoxConfig(): { apiKey: string } {
  // Only access environment variables on the client side
  if (typeof window === 'undefined') {
    throw new Error('Ultravox config should only be accessed on the client side');
  }

  const apiKey = process.env.NEXT_PUBLIC_ULTRAVOX_API_KEY;
  
  if (!apiKey) {
    throw new Error('Ultravox API key not found in environment variables');
  }

  return { apiKey };
} 