// Azure TTS API endpoint for natural British male voice
import { NextRequest, NextResponse } from 'next/server';
import { azureSpeech } from '@/services/azure/speech.service';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    // Check if Azure Speech is configured
    if (!azureSpeech.isReady()) {
      return NextResponse.json({
        success: false,
        useBrowserVoice: true,
        message: 'Azure Speech not configured, use browser fallback',
      });
    }

    // Generate speech audio
    const audioBuffer = await azureSpeech.synthesize(text);

    if (!audioBuffer) {
      return NextResponse.json({
        success: false,
        useBrowserVoice: true,
        message: 'TTS generation failed, use browser fallback',
      });
    }

    // Return audio as MP3
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mp3',
        'Content-Disposition': 'inline; filename="speech.mp3"',
      },
    });
  } catch (error) {
    console.error('❌ Azure TTS error:', error);
    return NextResponse.json(
      {
        success: false,
        useBrowserVoice: true,
        error: 'TTS generation failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
