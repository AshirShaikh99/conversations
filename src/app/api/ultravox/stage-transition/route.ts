import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { systemPrompt, voice, temperature, toolResultText, stageName, stageId } = body;
    
    console.log(`Stage transition request - Moving to ${stageName} (${stageId})`);
    
    // Construct response body for Ultravox call stage transition
    const responseBody = {
      systemPrompt,
      voice: voice || 'Mark',
      temperature: temperature || 0.4,
      // toolResultText provides context for the model's next turn
      toolResultText: toolResultText || `Successfully transitioned to ${stageName} stage.`
    };

    console.log('Stage transition response body:', responseBody);

    const response = NextResponse.json(responseBody);
    
    // Set the Ultravox header to signal a new call stage
    response.headers.set('X-Ultravox-Response-Type', 'new-stage');
    
    console.log(`Stage transition successful - now in ${stageName} stage`);
    
    return response;
  } catch (error) {
    console.error('Error in stage transition:', error);
    return NextResponse.json(
      { error: 'Failed to transition stage' },
      { status: 500 }
    );
  }
} 