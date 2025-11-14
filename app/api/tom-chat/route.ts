// TOM chat API endpoint with full RAG integration
import { NextRequest, NextResponse } from 'next/server';
import { orchestrator } from '@/core/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Initialize orchestrator if needed
    await orchestrator.initialize();

    // Process chat with full RAG pipeline
    const response = await orchestrator.processChat(message, userId);

    return NextResponse.json({
      success: true,
      message: response.content,
      context: response.context,
      timestamp: response.timestamp,
    });
  } catch (error) {
    console.error('❌ TOM chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const status = await orchestrator.getSystemStatus();
    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Health check failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
