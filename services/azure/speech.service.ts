// Azure Speech service for natural British male voice
// Uses Azure TTS with en-GB-RyanNeural voice

export class AzureSpeechService {
  private apiKey: string | undefined;
  private region: string | undefined;
  private voiceName = 'en-GB-RyanNeural'; // Natural British male voice

  constructor() {
    this.apiKey = process.env.AZURE_SPEECH_API_KEY;
    this.region = process.env.AZURE_SPEECH_REGION || 'uksouth';

    if (!this.apiKey) {
      console.warn('⚠️ Azure Speech API key not configured. TTS will use browser fallback.');
    } else {
      console.log('✅ Azure Speech initialized:', this.voiceName);
    }
  }

  // Generate SSML for natural speech
  private generateSSML(text: string): string {
    return `
      <speak version='1.0' xml:lang='en-GB' xmlns='http://www.w3.org/2001/10/synthesis'>
        <voice xml:lang='en-GB' name='${this.voiceName}'>
          <prosody rate='0.95' pitch='0%'>
            ${this.escapeXml(text)}
          </prosody>
        </voice>
      </speak>
    `.trim();
  }

  // Escape XML special characters
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Synthesize speech using Azure TTS
  async synthesize(text: string): Promise<ArrayBuffer | null> {
    if (!this.apiKey || !this.region) {
      console.warn('⚠️ Azure Speech not configured, use browser fallback');
      return null;
    }

    try {
      const ssml = this.generateSSML(text);
      const endpoint = `https://${this.region}.tts.speech.microsoft.com/cognitiveservices/v1`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        },
        body: ssml,
      });

      if (!response.ok) {
        throw new Error(`Azure TTS failed: ${response.status} ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('❌ Azure TTS error:', error);
      return null;
    }
  }

  // Get audio URL from synthesized speech
  async getAudioUrl(text: string): Promise<string | null> {
    const audioBuffer = await this.synthesize(text);
    if (!audioBuffer) return null;

    const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
    return URL.createObjectURL(blob);
  }

  // Check if service is ready
  isReady(): boolean {
    return !!this.apiKey && !!this.region;
  }

  // Get service info
  getServiceInfo() {
    return {
      voiceName: this.voiceName,
      region: this.region,
      ready: this.isReady(),
    };
  }
}

// Singleton instance
export const azureSpeech = new AzureSpeechService();
