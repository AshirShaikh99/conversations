import { NextRequest, NextResponse } from 'next/server';
import { SelectedTool } from '@/app/lib/ultravox-config';

interface UltravoxStageResponse {
  systemPrompt: string;
  toolResultText: string;
  voice?: string;
  temperature?: number;
  languageHint?: string;
  selectedTools?: SelectedTool[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      systemPrompt, 
      voice, 
      temperature, 
      toolResultText, 
      stageName, 
      stageId,
      languageHint,
      selectedTools
    } = body;
    
    console.log(`Ultravox Call Stages API - Transitioning to ${stageName} (${stageId})`);
    
    // Construct response body according to Ultravox Call Stages specification
    // According to docs: systemPrompt, temperature, voice, languageHint, selectedTools can be changed
    const responseBody: UltravoxStageResponse = {
      systemPrompt, // New system prompt for the stage
      toolResultText: toolResultText || `Successfully transitioned to ${stageName} stage.`
    };

    // Only include properties that are being changed
    if (voice) {
      responseBody.voice = voice;
    }
    
    if (temperature !== undefined) {
      responseBody.temperature = temperature;
    }
    
    if (languageHint) {
      responseBody.languageHint = languageHint;
    }
    
    if (selectedTools) {
      responseBody.selectedTools = selectedTools;
    }

    console.log('Ultravox Call Stages - Response body:', responseBody);

    const response = NextResponse.json(responseBody);
    
    // Set the required Ultravox header for new stage transition
    response.headers.set('X-Ultravox-Response-Type', 'new-stage');
    
    console.log(`Ultravox Call Stages - Stage transition successful: ${stageName}`);
    
    return response;
  } catch (error) {
    console.error('Error in Ultravox Call Stages transition:', error);
    return NextResponse.json(
      { error: 'Failed to transition stage' },
      { status: 500 }
    );
  }
} 