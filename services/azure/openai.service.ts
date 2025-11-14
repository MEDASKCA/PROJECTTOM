// Azure OpenAI service for PROJECT TOM
// Uses OpenAI SDK v4 which supports Azure natively
import { AzureOpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class AzureOpenAIService {
  private client: AzureOpenAI | null = null;
  private deploymentName: string;

  constructor() {
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const apiKey = process.env.AZURE_OPENAI_API_KEY;
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

      if (!apiKey || !endpoint) {
        console.warn('⚠️ Azure OpenAI credentials not configured');
        return;
      }

      this.client = new AzureOpenAI({
        apiKey,
        endpoint,
        apiVersion: '2024-08-01-preview',
        deployment: this.deploymentName,
      });

      console.log('✅ Azure OpenAI initialized:', this.deploymentName);
    } catch (error) {
      console.error('❌ Failed to initialize Azure OpenAI:', error);
    }
  }

  // Generate chat completion with GPT-4o
  async chat(
    messages: ChatCompletionMessageParam[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Azure OpenAI client not initialized. Check environment variables.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
        stream: false, // Explicitly set to false to ensure type is ChatCompletion
      });

      // Type guard: response is ChatCompletion when stream is false
      if ('choices' in response) {
        return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
      }

      return 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('❌ Azure OpenAI chat error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  // Generate response with RAG context
  async chatWithContext(
    userMessage: string,
    context: string,
    conversationHistory?: ChatCompletionMessageParam[]
  ): Promise<string> {
    const systemPrompt = `You are TOM (Theatre Operations Manager), an AI assistant for NHS theatre operations.

You have access to real-time theatre data and should provide accurate, helpful responses based on the context provided.

Context:
${context}

Guidelines:
- Be concise and professional
- Use British medical terminology
- Provide specific data when available
- If data is unavailable, clearly state this
- Prioritize patient safety and operational efficiency
- Follow NHS guidelines and best practices`;

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: userMessage },
    ];

    return this.chat(messages, { temperature: 0.5 });
  }

  // Check if client is ready
  isReady(): boolean {
    return this.client !== null;
  }

  // Get deployment info
  getDeploymentInfo() {
    return {
      deploymentName: this.deploymentName,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      ready: this.isReady(),
    };
  }
}

// Singleton instance
export const azureOpenAI = new AzureOpenAIService();
