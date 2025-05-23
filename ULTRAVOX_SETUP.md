# Ultravox Voice Call Stages Setup

This document describes how to set up and use the Ultravox Call Stages feature in the Voice Conversational Workflow Builder.

## Overview

The Call Stages feature implements a multi-stage conversational flow using Ultravox's voice AI technology. Each stage represents a different phase of a customer service conversation with specific behaviors, voices, and available actions.

## Prerequisites

1. **Ultravox API Key**: You need an API key from Ultravox. Get one from [Ultravox Console](https://console.ultravox.ai).
2. **Node.js**: Version 18 or higher
3. **Browser**: Modern browser with microphone access for voice calls

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the project root with your Ultravox API key:

```bash
NEXT_PUBLIC_ULTRAVOX_API_KEY=your_actual_api_key_here
```

**Important**: Do not put quotes around the API key value.

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

## Architecture

### Tool Implementation Strategy

The application uses **client-side tools** rather than server-side HTTP tools. This approach:

1. **Avoids HTTPS Requirements**: Client-side tools don't require HTTPS URLs like server-side tools do
2. **Simplifies Development**: No need to set up HTTPS certificates for local development  
3. **Real-time Processing**: Tool implementations run directly in the browser for immediate feedback
4. **Better Error Handling**: Direct access to application state and error management

When a tool is called by the AI agent:
1. **AI Agent** → **Tool Call** → **Browser JavaScript Function**
2. The function processes the request locally
3. Results are returned immediately to the conversation

### CORS Solution for API Calls

For creating calls, we still use a **proxy API pattern** to avoid CORS issues:

1. **Client** → **Next.js API Route** → **Ultravox API**
2. The client calls `/api/ultravox/create-call` (same domain, no CORS issue)
3. Our API route forwards the request to Ultravox API (server-to-server, no CORS restrictions)
4. The response is forwarded back to the client

### File Structure

```
src/
├── app/
│   ├── api/
│   │   └── ultravox/
│   │       └── create-call/          # Proxy for call creation only
│   ├── components/
│   │   └── ultravox/
│   │       └── CallStageManager.tsx  # Main UI component with tool implementations
│   └── lib/
│       └── ultravox-config.ts        # Configuration and types
```

## Call Stages

The system includes 5 predefined stages:

### 1. Initial Greeting (Mark, Temperature: 0.4)
- **Purpose**: Welcome users and identify their needs
- **Tools**: Stage transition (client-side)
- **Next Stages**: Information, Support, Escalation

### 2. Information Provision (Mark, Temperature: 0.3)
- **Purpose**: Provide information and answer questions
- **Tools**: Stage transition, Call completion (client-side)
- **Next Stages**: Support, Escalation, Completion

### 3. Technical Support (Jessica, Temperature: 0.2)
- **Purpose**: Diagnose and resolve technical issues
- **Tools**: Issue escalation, Issue resolution (client-side)
- **Next Stages**: Escalation, Completion

### 4. Manager Escalation (Tanya, Temperature: 0.1)
- **Purpose**: Handle complex issues with management authority
- **Tools**: Refund authorization ($500 limit), Callback scheduling (client-side)
- **Authority**: Can override policies and authorize refunds
- **Next Stages**: Completion

### 5. Call Completion (Mark, Temperature: 0.3)
- **Purpose**: Conclude conversations professionally
- **Tools**: Hang up (built-in)
- **Next Stages**: None (terminal stage)

## Usage

1. **Start the application**: Visit `http://localhost:3000`
2. **Open Call Stages**: Click "Run with Ultravox" button
3. **View stages panel**: The right panel shows all available stages
4. **Start conversation**: Click "Start Call" to begin
5. **Grant permissions**: Allow microphone access when prompted
6. **Interact**: Speak with the AI agent
7. **Stage transitions**: The AI will move between stages based on conversation flow

## Troubleshooting

### Common Issues

#### 1. HTTPS Protocol Errors
**Error**: `Tools must use one of the following protocols: {'https'}. Got ``.`
**Solution**: This is now fixed by using client-side tools instead of HTTP tools. Make sure you're using the latest code.

#### 2. API Key Errors
**Error**: `Invalid API key`
**Solutions**:
- Verify your API key is correct in `.env.local`
- Ensure no quotes around the API key value
- Restart the development server after changing the file

#### 3. Parameter Location Enum Errors  
**Error**: `Invalid enum value BODY for enum type ultravox.v1.ParameterLocation`
**Solution**: Use the correct Ultravox API enum values:
- `PARAMETER_LOCATION_BODY` (not `BODY`)
- `PARAMETER_LOCATION_QUERY` (not `QUERY`)
- `PARAMETER_LOCATION_PATH` (not `PATH`)
- `PARAMETER_LOCATION_HEADER` (not `HEADER`)

This is already fixed in the current codebase.

#### 4. Microphone Access
**Error**: Agent not speaking or not hearing user
**Solutions**:
- Grant microphone permissions when prompted
- Check browser settings for microphone access
- Try refreshing the page and starting a new call
- Use Chrome or Firefox for best compatibility

#### 5. Network Issues
**Error**: `Failed to fetch` or `Network error`
**Solutions**:
- Check internet connection
- Verify the development server is running
- Check browser console for detailed error messages

### Browser Compatibility

- ✅ **Chrome**: Full support
- ✅ **Firefox**: Full support  
- ✅ **Safari**: Full support
- ✅ **Edge**: Full support

### Debug Information

When `NODE_ENV=development`, the interface shows additional debug information:
- API call status
- Manager initialization state
- Client-side readiness
- Join URL (truncated for security)

## Client-Side Tool Implementation

All conversation tools are implemented as client-side JavaScript functions:

- `moveToStage` - Handles stage transitions between conversation phases
- `completeCall` - Completes calls with summary information
- `escalateIssue` - Escalates issues to appropriate specialists  
- `resolveIssue` - Marks issues as resolved with resolution details
- `authorizeRefund` - Authorizes refunds up to policy limits
- `scheduleCallback` - Schedules priority callbacks for follow-up

These tools run directly in the browser and provide immediate feedback to the AI agent, creating a seamless conversational experience.

## API Routes

Only one API route is needed for the proxy functionality:

- `POST /api/ultravox/create-call` - Creates new voice calls (proxy to avoid CORS)

## Security

- ✅ API keys are stored securely on the server
- ✅ No sensitive data exposed to the client
- ✅ Call creation goes through our secure proxy
- ✅ Environment variables are properly isolated
- ✅ Client-side tools provide immediate feedback without network calls

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your `.env.local` file configuration
3. Ensure your Ultravox API key is valid and has sufficient quota
4. Make sure your browser has microphone permissions enabled

For Ultravox-specific issues, consult the [Ultravox Documentation](https://docs.ultravox.ai). 