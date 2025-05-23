# Dynamic Voice Flow Builder

This Voice Conversational Workflow Builder now supports dynamic flows that users can create and execute using the visual flow builder interface.

## Features

### 🎯 Dynamic Flow Creation
- **Visual Flow Builder**: Drag and drop interface to create conversation flows
- **Real-time Validation**: Instant feedback on flow structure and connectivity
- **Node Configuration**: Detailed properties panel for each node type
- **Template System**: Pre-built templates for common use cases

### 🎤 Voice Integration
- **Ultravox Integration**: Seamless voice conversation execution
- **Multiple Voices**: Choose from Mark, Olivia, Daniel, and Emma
- **AI Temperature Control**: Fine-tune AI response creativity
- **Language Hints**: Support for multiple languages

### 🔧 Node Types

#### Start Node
- **Purpose**: Begins the conversation flow
- **Configuration**:
  - Opening message
  - Voice selection
  - Additional behavioral instructions
  - AI temperature settings

#### Message Node
- **Purpose**: AI delivers a specific message to the user
- **Configuration**:
  - Message content
  - Delivery instructions
  - Voice and tone settings

#### Listen Node
- **Purpose**: Captures user input and processes it
- **Configuration**:
  - Listen instructions
  - Expected input type
  - Timeout settings
  - Input validation

#### Condition Node
- **Purpose**: Makes decisions based on conversation context
- **Configuration**:
  - Condition description
  - Decision logic
  - Evaluation instructions
  - Multiple output paths

#### End Node
- **Purpose**: Concludes the conversation
- **Configuration**:
  - Closing message
  - Summary instructions
  - Final voice settings

## Getting Started

### 1. Create Your First Flow

1. **Start with a Template**: Use the "Load Template" dropdown to load a pre-built flow
2. **Or Build from Scratch**: 
   - Drag nodes from the sidebar
   - Connect them with edges
   - Configure each node's properties

### 2. Configure Nodes

1. **Select a Node**: Click on any node to open the properties panel
2. **Set Basic Properties**:
   - Label: Display name for the node
   - Voice: Choose the AI voice
3. **Configure Node-Specific Settings**:
   - **Start Node**: Opening message and instructions
   - **Message Node**: Content and delivery style
   - **Listen Node**: What to listen for and timeout
   - **Condition Node**: Decision logic and criteria
   - **End Node**: Closing message and summary

### 3. Validate Your Flow

The system automatically validates your flow and shows:
- ✅ **Valid Flow**: Green indicator, ready to run
- ❌ **Invalid Flow**: Red indicator with specific error messages

Common validation issues:
- Missing start node
- Orphaned nodes (not connected)
- Unreachable nodes

### 4. Run Your Flow

1. **Enable Dynamic Flow**: Check the "Dynamic Flow" toggle
2. **Initialize Call**: Click "Initialize Call" to prepare the voice system
3. **Start Call**: Click "Start Call" to begin the conversation
4. **Monitor Progress**: Watch the current stage indicator
5. **End Call**: Click "End Call" when finished

## Flow Templates

### Customer Support Flow
A comprehensive customer service conversation that:
- Greets the customer warmly
- Listens to their issue
- Determines if escalation is needed
- Provides solution or escalates
- Ends with satisfaction check

### Order Inquiry Flow
Handles order status requests by:
- Requesting order number
- Validating the order
- Providing status information
- Handling invalid orders gracefully

## Advanced Features

### Context7 Integration
The system uses Context7 for enhanced AI capabilities:
- **Real-time Documentation**: Access to up-to-date API documentation
- **Smart Prompting**: Context-aware conversation management
- **Dynamic Tool Generation**: Automatic tool creation based on flow structure

### Flow Execution Engine
- **Dynamic Stage Generation**: Converts visual flows to Ultravox call stages
- **Tool Management**: Automatic tool creation for navigation and data capture
- **Context Preservation**: Maintains conversation state across stages

### Validation System
- **Structure Validation**: Ensures proper flow connectivity
- **Node Validation**: Checks required properties
- **Real-time Feedback**: Immediate error reporting

## Best Practices

### Flow Design
1. **Start Simple**: Begin with linear flows before adding complex branching
2. **Clear Labels**: Use descriptive names for nodes and stages
3. **Logical Flow**: Ensure conversation progression makes sense
4. **Error Handling**: Include paths for unexpected user responses

### Voice Configuration
1. **Consistent Voice**: Use the same voice throughout a flow for continuity
2. **Appropriate Tone**: Match voice and temperature to conversation context
3. **Clear Instructions**: Provide specific guidance for AI behavior

### Testing
1. **Validate Early**: Check flow validation before running
2. **Test Paths**: Verify all conversation branches work correctly
3. **Monitor Stages**: Watch stage transitions during execution
4. **Debug Mode**: Use development mode for detailed debugging info

## Troubleshooting

### Common Issues

**Flow Won't Start**
- Check that Dynamic Flow is enabled
- Ensure flow validation passes
- Verify all nodes have required properties

**Voice Not Working**
- Check Ultravox API configuration
- Verify internet connection
- Ensure microphone permissions

**Nodes Not Connecting**
- Make sure nodes are properly aligned
- Check that connection handles are visible
- Verify node types support connections

### Debug Information
In development mode, the system provides:
- Flow structure details
- Validation status
- Call state information
- Stage transition logs

## API Integration

### Ultravox Configuration
The system requires proper Ultravox API setup:
```typescript
// Configure in src/app/lib/ultravox-config.ts
export function getUltravoxConfig(): { apiKey: string } {
  return {
    apiKey: process.env.ULTRAVOX_API_KEY || 'your-api-key'
  };
}
```

### Environment Variables
```bash
ULTRAVOX_API_KEY=your_ultravox_api_key
NODE_ENV=development # for debug features
```

## Contributing

To extend the system:

1. **Add New Node Types**: Create new node components in `src/app/components/nodes/`
2. **Extend Properties**: Update `CustomNodeData` interface for new properties
3. **Add Templates**: Create new flow templates in `src/app/lib/flow-templates.ts`
4. **Enhance Validation**: Add new validation rules in the flow executor

## Support

For issues or questions:
1. Check the validation messages for specific guidance
2. Use debug mode for detailed troubleshooting
3. Review the flow templates for examples
4. Consult the Ultravox documentation for voice-specific issues

---

**Note**: This system integrates with Context7 for enhanced AI capabilities and Ultravox for voice conversation management. Ensure both services are properly configured for optimal performance. 