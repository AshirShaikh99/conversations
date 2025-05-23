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

// Default configuration for the voice flow builder
export const defaultCallStageConfig: CallStageConfig = {
  initialStageId: 'greeting',
  globalConfig: {
    model: 'fixie-ai/ultravox-70B',
    maxDuration: '1800s', // 30 minutes
    recordingEnabled: true,
  },
  stages: [
    {
      id: 'greeting',
      name: 'Initial Greeting',
      systemPrompt: `
        You are a helpful AI assistant for a voice conversation system.
        
        ## Your Role
        - Greet the user warmly and professionally
        - Identify the purpose of their call
        - Guide them to the appropriate next stage of the conversation
        
        ## Available Tools
        - Use "moveToStage" to transition to different conversation stages
        
        ## Guidelines
        - Keep responses brief and natural
        - Listen actively to understand user needs
        - Always confirm understanding before moving to next stage
        
        ## Next Steps
        - For information requests: move to "information" stage
        - For support issues: move to "support" stage
        - For complex problems: move to "escalation" stage
      `,
      voice: 'Mark',
      temperature: 0.4,
      selectedTools: [
        {
          temporaryTool: {
            modelToolName: 'moveToStage',
            description: 'Move the conversation to a specific stage',
            dynamicParameters: [
              {
                name: 'targetStage',
                location: ParameterLocation.BODY,
                schema: {
                  description: 'The target stage to move to',
                  type: 'string',
                  enum: ['information', 'support', 'escalation']
                },
                required: true
              },
              {
                name: 'reason',
                location: ParameterLocation.BODY,
                schema: {
                  description: 'Reason for the stage transition',
                  type: 'string'
                },
                required: true
              }
            ],
            client: {}
          }
        }
      ],
      nextStages: ['information', 'support', 'escalation']
    },
    {
      id: 'information',
      name: 'Information Provision',
      systemPrompt: `
        You are now in the information provision stage.
        
        ## Your Role
        - Provide accurate and helpful information
        - Answer questions clearly and concisely
        - Offer additional related information when appropriate
        
        ## Guidelines
        - Be thorough but concise
        - Ask clarifying questions if needed
        - Suggest moving to support if technical issues arise
        
        ## Available Actions
        - Use "moveToStage" to transition if needed
        - Use "completeCall" when information needs are satisfied
      `,
      voice: 'Mark',
      temperature: 0.3,
      selectedTools: [
        {
          temporaryTool: {
            modelToolName: 'moveToStage',
            description: 'Move to another conversation stage',
            dynamicParameters: [
              {
                name: 'targetStage',
                location: ParameterLocation.BODY,
                schema: {
                  description: 'Target stage',
                  type: 'string',
                  enum: ['support', 'escalation', 'completion']
                },
                required: true
              },
              {
                name: 'reason',
                location: ParameterLocation.BODY,
                schema: {
                  description: 'Reason for transition',
                  type: 'string'
                },
                required: true
              }
            ],
            client: {}
          }
        },
        {
          temporaryTool: {
            modelToolName: 'completeCall',
            description: 'Complete the call successfully',
            dynamicParameters: [
              {
                name: 'summary',
                location: ParameterLocation.BODY,
                schema: {
                  description: 'Summary of what was accomplished',
                  type: 'string'
                },
                required: true
              }
            ],
            client: {}
          }
        }
      ],
      nextStages: ['support', 'escalation', 'completion']
    },
    {
      id: 'support',
      name: 'Technical Support',
      systemPrompt: `
        You are now providing technical support.
        
        ## Your Role
        - Diagnose and resolve technical issues
        - Guide users through troubleshooting steps
        - Escalate complex issues when necessary
        
        ## Guidelines
        - Be patient and step-by-step in your approach
        - Confirm each step before moving to the next
        - Document issues for future reference
        
        ## Available Actions
        - Use "escalateIssue" for complex problems
        - Use "resolveIssue" when problem is solved
      `,
      voice: 'Jessica',
      temperature: 0.2,
      selectedTools: [
        {
          temporaryTool: {
            modelToolName: 'escalateIssue',
            description: 'Escalate to senior support or specialist',
            dynamicParameters: [
              {
                name: 'issueType',
                location: ParameterLocation.BODY,
                schema: {
                  description: 'Type of issue requiring escalation',
                  type: 'string',
                  enum: ['technical', 'billing', 'urgent', 'other']
                },
                required: true
              },
              {
                name: 'issueDetails',
                location: ParameterLocation.BODY,
                schema: {
                  description: 'Detailed description of the issue',
                  type: 'string'
                },
                required: true
              }
            ],
            client: {}
          }
        },
        {
          temporaryTool: {
            modelToolName: 'resolveIssue',
            description: 'Mark issue as resolved',
            dynamicParameters: [
              {
                name: 'resolution',
                location: ParameterLocation.BODY,
                schema: {
                  description: 'How the issue was resolved',
                  type: 'string'
                },
                required: true
              }
            ],
            client: {}
          }
        }
      ],
      nextStages: ['escalation', 'completion']
    },
    {
      id: 'escalation',
      name: 'Manager Escalation',
      systemPrompt: `
        You are now a senior manager handling an escalated issue.
        
        ## Your Role
        - Handle complex or sensitive issues
        - Provide authoritative solutions
        - Ensure customer satisfaction
        
        ## Guidelines
        - Acknowledge the escalation immediately
        - Show empathy and understanding
        - Provide definitive solutions when possible
        - Follow up as needed
        
        ## Authority
        - You can authorize refunds up to $500
        - You can override standard policies when appropriate
        - You can schedule urgent callbacks
      `,
      voice: 'Tanya',
      temperature: 0.1,
      selectedTools: [
        {
          temporaryTool: {
            modelToolName: 'authorizeRefund',
            description: 'Authorize a refund for the customer',
            dynamicParameters: [
              {
                name: 'amount',
                location: ParameterLocation.BODY,
                schema: {
                  description: 'Refund amount in USD',
                  type: 'number'
                },
                required: true
              },
              {
                name: 'reason',
                location: ParameterLocation.BODY,
                schema: {
                  description: 'Reason for the refund',
                  type: 'string'
                },
                required: true
              }
            ],
            client: {}
          }
        },
        {
          temporaryTool: {
            modelToolName: 'scheduleCallback',
            description: 'Schedule a priority callback',
            dynamicParameters: [
              {
                name: 'timeframe',
                location: ParameterLocation.BODY,
                schema: {
                  description: 'When to schedule the callback',
                  type: 'string',
                  enum: ['1_hour', '4_hours', '24_hours', 'next_business_day']
                },
                required: true
              }
            ],
            client: {}
          }
        }
      ],
      nextStages: ['completion']
    },
    {
      id: 'completion',
      name: 'Call Completion',
      systemPrompt: `
        You are concluding the conversation.
        
        ## Your Role
        - Summarize what was accomplished
        - Ensure customer satisfaction
        - Provide any follow-up information
        - End the call professionally
        
        ## Guidelines
        - Thank the customer for their time
        - Confirm all issues are resolved
        - Provide reference numbers if applicable
        - Offer additional assistance if needed
        
        ## Completion
        - Use "endCall" when ready to conclude
      `,
      voice: 'Mark',
      temperature: 0.3,
      selectedTools: [
        {
          toolName: 'hangUp'
        }
      ],
      nextStages: []
    }
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

      // Create call configuration WITHOUT client-side tools for initial creation
      const callConfig = {
        systemPrompt: initialStage.systemPrompt,
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
        firstSpeakerSettings: {
          agent: {
            text: `Hello! I'm your assistant. How can I help you today?`,
            delay: '1s'
          }
        },
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
    
    // Register stage transition tool implementation
    if (this.session) {
      this.session.registerToolImplementation('moveToStage', this.handleStageTransition.bind(this));
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

    this.currentStage = targetStage;
    
    // This would typically trigger a new stage via API
    // For now, return success message
    return `Successfully transitioned to ${nextStage.name} stage. ${reason}`;
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