import { Node, Edge } from 'reactflow';
import { CustomNodeData } from '@/app/components/nodes/CustomNode';

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
}

export const flowTemplates: FlowTemplate[] = [
  {
    id: 'customer-support',
    name: 'Customer Support Flow',
    description: 'A basic customer support conversation flow with greeting, issue collection, and resolution',
    nodes: [
      {
        id: 'start_1',
        type: 'startNode',
        position: { x: 100, y: 100 },
        data: {
          label: 'Welcome',
          prompt: 'Hello! Welcome to our customer support. How can I help you today?',
          voice: 'Olivia',
          additionalInstructions: 'Be warm and professional. Listen carefully to understand the customer\'s needs.'
        }
      },
      {
        id: 'listen_1',
        type: 'listenNode',
        position: { x: 300, y: 100 },
        data: {
          label: 'Listen to Issue',
          prompt: 'Please describe your issue in detail. I\'m here to help.',
          eventName: 'customer_issue',
          timeout: 60,
          voice: 'Olivia'
        }
      },
      {
        id: 'condition_1',
        type: 'conditionNode',
        position: { x: 500, y: 100 },
        data: {
          label: 'Issue Type Check',
          condition: 'Determine issue complexity',
          conditionLogic: 'If the issue is technical or complex, escalate to specialist. If it\'s simple, provide direct help.',
          prompt: 'Analyze the customer\'s issue and determine if it requires escalation or can be resolved directly.'
        }
      },
      {
        id: 'message_1',
        type: 'messageNode',
        position: { x: 400, y: 250 },
        data: {
          label: 'Provide Solution',
          prompt: 'Based on your issue, here\'s what I can help you with...',
          voice: 'Olivia',
          additionalInstructions: 'Provide clear, step-by-step instructions. Be patient and thorough.'
        }
      },
      {
        id: 'message_2',
        type: 'messageNode',
        position: { x: 600, y: 250 },
        data: {
          label: 'Escalate to Specialist',
          prompt: 'I\'m going to connect you with one of our specialists who can better assist you with this technical issue.',
          voice: 'Olivia',
          additionalInstructions: 'Reassure the customer and explain the escalation process.'
        }
      },
      {
        id: 'end_1',
        type: 'endNode',
        position: { x: 500, y: 400 },
        data: {
          label: 'End Call',
          prompt: 'Thank you for contacting us today. Is there anything else I can help you with?',
          voice: 'Olivia',
          summaryInstructions: 'Summarize the issue discussed and any actions taken or next steps.'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'start_1', target: 'listen_1' },
      { id: 'e2', source: 'listen_1', target: 'condition_1' },
      { id: 'e3', source: 'condition_1', target: 'message_1' },
      { id: 'e4', source: 'condition_1', target: 'message_2' },
      { id: 'e5', source: 'message_1', target: 'end_1' },
      { id: 'e6', source: 'message_2', target: 'end_1' }
    ]
  },
  {
    id: 'order-inquiry',
    name: 'Order Inquiry Flow',
    description: 'Handle customer order status inquiries and provide tracking information',
    nodes: [
      {
        id: 'start_2',
        type: 'startNode',
        position: { x: 100, y: 100 },
        data: {
          label: 'Greeting',
          prompt: 'Hello! I can help you check your order status. May I have your order number please?',
          voice: 'Mark',
          additionalInstructions: 'Be friendly and efficient. Focus on getting the order number quickly.'
        }
      },
      {
        id: 'listen_2',
        type: 'listenNode',
        position: { x: 300, y: 100 },
        data: {
          label: 'Get Order Number',
          prompt: 'Please provide your order number. It should be 8-12 characters long.',
          eventName: 'order_number',
          timeout: 45,
          voice: 'Mark'
        }
      },
      {
        id: 'condition_2',
        type: 'conditionNode',
        position: { x: 500, y: 100 },
        data: {
          label: 'Validate Order',
          condition: 'Check if order number is valid',
          conditionLogic: 'Verify the order number format and check if it exists in the system.',
          prompt: 'Validate the provided order number and check its status in our system.'
        }
      },
      {
        id: 'message_3',
        type: 'messageNode',
        position: { x: 400, y: 250 },
        data: {
          label: 'Order Status',
          prompt: 'Great! I found your order. Let me give you the current status and tracking information.',
          voice: 'Mark',
          additionalInstructions: 'Provide detailed status information including expected delivery date.'
        }
      },
      {
        id: 'message_4',
        type: 'messageNode',
        position: { x: 600, y: 250 },
        data: {
          label: 'Order Not Found',
          prompt: 'I\'m sorry, I couldn\'t find an order with that number. Could you please double-check and try again?',
          voice: 'Mark',
          additionalInstructions: 'Be helpful and suggest alternative ways to locate the order.'
        }
      },
      {
        id: 'end_2',
        type: 'endNode',
        position: { x: 500, y: 400 },
        data: {
          label: 'Complete',
          prompt: 'Is there anything else I can help you with regarding your order?',
          voice: 'Mark',
          summaryInstructions: 'Summarize the order status information provided to the customer.'
        }
      }
    ],
    edges: [
      { id: 'e7', source: 'start_2', target: 'listen_2' },
      { id: 'e8', source: 'listen_2', target: 'condition_2' },
      { id: 'e9', source: 'condition_2', target: 'message_3' },
      { id: 'e10', source: 'condition_2', target: 'message_4' },
      { id: 'e11', source: 'message_3', target: 'end_2' },
      { id: 'e12', source: 'message_4', target: 'listen_2' }
    ]
  }
];

export function getFlowTemplate(id: string): FlowTemplate | undefined {
  return flowTemplates.find(template => template.id === id);
}

export function getAllFlowTemplates(): FlowTemplate[] {
  return flowTemplates;
} 