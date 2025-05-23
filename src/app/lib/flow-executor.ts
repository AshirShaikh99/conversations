import { Node, Edge } from 'reactflow';
import { CustomNodeData } from '@/app/components/nodes/CustomNode';
import { CallStageConfig, CallStage, SelectedTool, ParameterLocation } from './ultravox-config';

export interface FlowExecutionContext {
  currentNodeId: string;
  variables: Record<string, string | number | boolean | null>;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  userInput?: string;
}

export class FlowExecutor {
  private nodes: Node<CustomNodeData>[];
  private edges: Edge[];
  private context: FlowExecutionContext;

  constructor(nodes: Node<CustomNodeData>[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.context = {
      currentNodeId: '',
      variables: {},
      conversationHistory: []
    };
  }

  /**
   * Convert ReactFlow nodes and edges into Ultravox CallStageConfig
   */
  generateCallStageConfig(): CallStageConfig {
    const stages: CallStage[] = [];
    const startNode = this.nodes.find(node => node.type === 'startNode');
    
    if (!startNode) {
      throw new Error('No start node found in the flow');
    }

    // Convert each node to a call stage
    for (const node of this.nodes) {
      const stage = this.nodeToCallStage(node);
      if (stage) {
        stages.push(stage);
      }
    }

    return {
      initialStageId: startNode.id,
      globalConfig: {
        model: 'fixie-ai/ultravox-70B',
        maxDuration: '1800s',
        recordingEnabled: true,
      },
      stages
    };
  }

  /**
   * Convert a ReactFlow node to an Ultravox CallStage
   */
  private nodeToCallStage(node: Node<CustomNodeData>): CallStage | null {
    const nextNodes = this.getNextNodes(node.id);
    const nextStageIds = nextNodes.map(n => n.id);

    switch (node.type) {
      case 'startNode':
        return {
          id: node.id,
          name: node.data.label || 'Start Flow',
          systemPrompt: this.generateStartPrompt(node),
          voice: 'Mark',
          temperature: 0.4,
          selectedTools: this.generateNavigationTools(nextStageIds),
          nextStages: nextStageIds
        };

      case 'messageNode':
        return {
          id: node.id,
          name: node.data.label || 'Message',
          systemPrompt: this.generateMessagePrompt(node),
          voice: 'Mark',
          temperature: 0.3,
          selectedTools: this.generateNavigationTools(nextStageIds),
          nextStages: nextStageIds
        };

      case 'listenNode':
        return {
          id: node.id,
          name: node.data.label || 'Listen',
          systemPrompt: this.generateListenPrompt(node),
          voice: 'Mark',
          temperature: 0.2,
          selectedTools: [
            ...this.generateNavigationTools(nextStageIds),
            this.generateCaptureInputTool()
          ],
          nextStages: nextStageIds
        };

      case 'conditionNode':
        return {
          id: node.id,
          name: node.data.label || 'Condition',
          systemPrompt: this.generateConditionPrompt(node),
          voice: 'Mark',
          temperature: 0.1,
          selectedTools: this.generateConditionalTools(node, nextNodes),
          nextStages: nextStageIds
        };

      case 'endNode':
        return {
          id: node.id,
          name: node.data.label || 'End',
          systemPrompt: this.generateEndPrompt(node),
          voice: 'Mark',
          temperature: 0.3,
          selectedTools: [this.generateEndCallTool()],
          nextStages: []
        };

      default:
        return null;
    }
  }

  /**
   * Get the next nodes connected to a given node
   */
  private getNextNodes(nodeId: string): Node<CustomNodeData>[] {
    const connectedEdges = this.edges.filter(edge => edge.source === nodeId);
    return connectedEdges
      .map(edge => this.nodes.find(node => node.id === edge.target))
      .filter((node): node is Node<CustomNodeData> => node !== undefined);
  }

  /**
   * Generate system prompt for start node
   */
  private generateStartPrompt(node: Node<CustomNodeData>): string {
    const customPrompt = node.data.prompt?.trim();
    
    // If user provided a custom prompt, use it exclusively
    if (customPrompt) {
      return customPrompt;
    }
    
    // Only use minimal default if no custom prompt provided
    return `You are starting a conversation. Begin naturally and guide the user through the flow.`;
  }

  /**
   * Generate system prompt for message node
   */
  private generateMessagePrompt(node: Node<CustomNodeData>): string {
    const customPrompt = node.data.prompt?.trim();
    
    // If user provided a custom prompt, use it exclusively
    if (customPrompt) {
      return customPrompt;
    }
    
    // Only use minimal default if no custom prompt provided
    return `Deliver your message clearly and naturally.`;
  }

  /**
   * Generate system prompt for listen node
   */
  private generateListenPrompt(node: Node<CustomNodeData>): string {
    const customPrompt = node.data.prompt?.trim();
    
    // If user provided a custom prompt, use it exclusively
    if (customPrompt) {
      return customPrompt;
    }
    
    // Only use minimal default if no custom prompt provided
    return `Listen carefully to the user and capture their input.`;
  }

  /**
   * Generate system prompt for condition node
   */
  private generateConditionPrompt(node: Node<CustomNodeData>): string {
    const customPrompt = node.data.prompt?.trim();
    
    // If user provided a custom prompt, use it exclusively
    if (customPrompt) {
      return customPrompt;
    }
    
    // Only use minimal default if no custom prompt provided
    return `Evaluate the condition and determine the appropriate path.`;
  }

  /**
   * Generate system prompt for end node
   */
  private generateEndPrompt(node: Node<CustomNodeData>): string {
    const customPrompt = node.data.prompt?.trim();
    
    // If user provided a custom prompt, use it exclusively
    if (customPrompt) {
      return customPrompt;
    }
    
    // Only use minimal default if no custom prompt provided
    return `Thank you for the conversation. Have a great day!`;
  }

  /**
   * Generate navigation tools for moving between stages
   */
  private generateNavigationTools(nextStageIds: string[]) {
    if (nextStageIds.length === 0) return [];

    return [{
      temporaryTool: {
        modelToolName: 'moveToStage',
        description: 'Move to the next stage in the conversation flow',
        dynamicParameters: [
          {
            name: 'targetStage',
            location: ParameterLocation.BODY,
            schema: {
              description: 'The target stage to move to',
              type: 'string',
              enum: nextStageIds
            },
            required: true
          },
          {
            name: 'reason',
            location: ParameterLocation.BODY,
            schema: {
              description: 'Reason for moving to this stage',
              type: 'string'
            },
            required: true
          }
        ],
        client: {}
      }
    }];
  }

  /**
   * Generate capture input tool for listen nodes
   */
  private generateCaptureInputTool() {
    return {
      temporaryTool: {
        modelToolName: 'captureInput',
        description: 'Capture and store user input',
        dynamicParameters: [
          {
            name: 'inputValue',
            location: ParameterLocation.BODY,
            schema: {
              description: 'The user input to capture',
              type: 'string'
            },
            required: true
          },
          {
            name: 'inputType',
            location: ParameterLocation.BODY,
            schema: {
              description: 'Type or category of the input',
              type: 'string'
            },
            required: false
          }
        ],
        client: {}
      }
    };
  }

  /**
   * Generate conditional tools for condition nodes
   */
  private generateConditionalTools(node: Node<CustomNodeData>, nextNodes: Node<CustomNodeData>[]) {
    const tools = [];

    // Add evaluation tool
    tools.push({
      temporaryTool: {
        modelToolName: 'evaluateCondition',
        description: 'Evaluate the condition and determine the next path',
        dynamicParameters: [
          {
            name: 'conditionResult',
            location: ParameterLocation.BODY,
            schema: {
              description: 'Result of the condition evaluation',
              type: 'boolean'
            },
            required: true
          },
          {
            name: 'nextStage',
            location: ParameterLocation.BODY,
            schema: {
              description: 'Next stage based on condition result',
              type: 'string',
              enum: nextNodes.map(n => n.id)
            },
            required: true
          }
        ],
        client: {}
      }
    });

    return tools;
  }

  /**
   * Generate end call tool
   */
  private generateEndCallTool() {
    return {
      temporaryTool: {
        modelToolName: 'endCall',
        description: 'End the conversation',
        dynamicParameters: [
          {
            name: 'summary',
            location: ParameterLocation.BODY,
            schema: {
              description: 'Summary of the conversation',
              type: 'string'
            },
            required: false
          }
        ],
        client: {}
      }
    };
  }

  /**
   * Get execution context
   */
  getContext(): FlowExecutionContext {
    return this.context;
  }

  /**
   * Update execution context
   */
  updateContext(updates: Partial<FlowExecutionContext>): void {
    this.context = { ...this.context, ...updates };
  }

  /**
   * Validate the flow structure
   */
  validateFlow(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for start node
    const startNodes = this.nodes.filter(node => node.type === 'startNode');
    if (startNodes.length === 0) {
      errors.push('Flow must have exactly one start node');
    } else if (startNodes.length > 1) {
      errors.push('Flow can only have one start node');
    }

    // Check for orphaned nodes (nodes with no connections)
    const connectedNodeIds = new Set([
      ...this.edges.map(edge => edge.source),
      ...this.edges.map(edge => edge.target)
    ]);

    const orphanedNodes = this.nodes.filter(node => 
      node.type !== 'startNode' && !connectedNodeIds.has(node.id)
    );

    if (orphanedNodes.length > 0) {
      errors.push(`Found ${orphanedNodes.length} orphaned nodes: ${orphanedNodes.map(n => n.data.label || n.id).join(', ')}`);
    }

    // Check for unreachable nodes
    const reachableNodes = this.getReachableNodes();
    const unreachableNodes = this.nodes.filter(node => !reachableNodes.has(node.id));
    
    if (unreachableNodes.length > 0) {
      errors.push(`Found ${unreachableNodes.length} unreachable nodes: ${unreachableNodes.map(n => n.data.label || n.id).join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get all reachable nodes from the start node
   */
  private getReachableNodes(): Set<string> {
    const startNode = this.nodes.find(node => node.type === 'startNode');
    if (!startNode) return new Set();

    const reachable = new Set<string>();
    const toVisit = [startNode.id];

    while (toVisit.length > 0) {
      const currentId = toVisit.pop()!;
      if (reachable.has(currentId)) continue;

      reachable.add(currentId);
      
      const nextNodeIds = this.edges
        .filter(edge => edge.source === currentId)
        .map(edge => edge.target);
      
      toVisit.push(...nextNodeIds);
    }

    return reachable;
  }

  /**
   * Generate the moveToStage tool for stage transitions
   */
  private generateMoveToStageTool(): SelectedTool {
    return {
      temporaryTool: {
        modelToolName: 'moveToStage',
        description: 'Move to the next stage in the conversation flow',
        dynamicParameters: [
          {
            name: 'targetStage',
            location: ParameterLocation.BODY,
            schema: {
              description: 'The ID of the target stage to move to',
              type: 'string',
              enum: this.getAllStageIds()
            },
            required: true
          },
          {
            name: 'reason',
            location: ParameterLocation.BODY,
            schema: {
              description: 'The reason for moving to this stage',
              type: 'string'
            },
            required: true
          }
        ],
        client: {} // This marks it as a client-side tool
      }
    };
  }

  /**
   * Get all stage IDs for the enum constraint
   */
  private getAllStageIds(): string[] {
    return this.nodes.map(node => node.id);
  }

  /**
   * Generate a call stage from a node
   */
  private generateStageFromNode(node: Node<CustomNodeData>, nextNodes: Node<CustomNodeData>[]): CallStage {
    // Generate prompt based on node type
    let systemPrompt: string;
    switch (node.type) {
      case 'startNode':
        systemPrompt = this.generateStartPrompt(node);
        break;
      case 'messageNode':
        systemPrompt = this.generateMessagePrompt(node);
        break;
      case 'listenNode':
        systemPrompt = this.generateListenPrompt(node);
        break;
      case 'conditionNode':
        systemPrompt = this.generateConditionPrompt(node);
        break;
      case 'endNode':
        systemPrompt = this.generateEndPrompt(node);
        break;
      default:
        systemPrompt = node.data.prompt?.trim() || 'Continue the conversation naturally.';
    }

    return {
      id: node.id, // Use the node ID as stage ID for proper highlighting
      name: node.data.label || node.type || 'Untitled',
      systemPrompt,
      voice: 'Mark',
      temperature: 0.4,
      selectedTools: [this.generateMoveToStageTool()], // Include moveToStage tool for stage transitions
      languageHint: 'en',
      nextStages: nextNodes.map(n => n.id)
    };
  }
}

/**
 * Factory function to create a flow executor
 */
export function createFlowExecutor(nodes: Node<CustomNodeData>[], edges: Edge[]): FlowExecutor {
  return new FlowExecutor(nodes, edges);
} 