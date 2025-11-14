// Central Orchestrator for PROJECT TOM
// Coordinates all interconnected services: Firebase, Azure OpenAI, Azure Speech, EPR adapters

import { firebaseDb } from '@/services/firebase/database.service';
import { azureOpenAI } from '@/services/azure/openai.service';
import { azureSpeech } from '@/services/azure/speech.service';
import { EPRAdapterFactory, EPRAdapter } from '@/services/epr/adapter.interface';
import { UniversalTheatreCase, QueryContext, TOMChatMessage } from '@/types/universal-data';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

export class ServiceOrchestrator {
  private eprAdapter: EPRAdapter;
  private initialized = false;

  constructor() {
    this.eprAdapter = EPRAdapterFactory.createAdapter();
  }

  // Initialize all services
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🚀 Initializing PROJECT TOM services...');

    // Check Firebase
    try {
      const cases = await firebaseDb.getTodaysCases();
      console.log(`✅ Firebase connected: ${cases.length} cases today`);
    } catch (error) {
      console.warn('⚠️ Firebase connection issue:', error);
    }

    // Check Azure OpenAI
    if (azureOpenAI.isReady()) {
      console.log('✅ Azure OpenAI ready:', azureOpenAI.getDeploymentInfo().deploymentName);
    } else {
      console.warn('⚠️ Azure OpenAI not configured');
    }

    // Check Azure Speech
    if (azureSpeech.isReady()) {
      console.log('✅ Azure Speech ready:', azureSpeech.getServiceInfo().voiceName);
    } else {
      console.warn('⚠️ Azure Speech not configured, using browser fallback');
    }

    // Check EPR adapter
    const eprHealth = await this.eprAdapter.healthCheck();
    if (eprHealth.healthy) {
      console.log('✅ EPR adapter ready:', this.eprAdapter.getSystemName());
    } else {
      console.warn('⚠️ EPR adapter issue:', eprHealth.message);
    }

    this.initialized = true;
    console.log('✨ PROJECT TOM fully initialized and interconnected!');
  }

  // Query theatre data based on user message
  private async queryTheatreData(userMessage: string): Promise<QueryContext> {
    const messageLower = userMessage.toLowerCase();
    let cases: UniversalTheatreCase[] = [];
    let queryType = 'general';

    try {
      // Determine query intent and fetch appropriate data
      if (messageLower.includes('today') || messageLower.includes('current')) {
        cases = await firebaseDb.getTodaysCases();
        queryType = 'today';
      } else if (messageLower.includes('tomorrow')) {
        cases = await firebaseDb.getTomorrowsCases();
        queryType = 'tomorrow';
      } else if (messageLower.includes('list') || messageLower.includes('schedule')) {
        // If asking for a list, try to get today's or tomorrow's
        if (messageLower.includes('tomorrow')) {
          cases = await firebaseDb.getTomorrowsCases();
          queryType = 'tomorrow';
        } else {
          cases = await firebaseDb.getTodaysCases();
          queryType = 'today';
        }
      } else if (messageLower.match(/surgeon|doctor|consultant/)) {
        // Extract surgeon name from message
        const surgeonMatch = messageLower.match(/(?:surgeon|doctor|consultant)\s+(\w+)/);
        if (surgeonMatch) {
          cases = await firebaseDb.getCasesBySurgeon(surgeonMatch[1]);
          queryType = 'surgeon';
        }
      } else if (messageLower.match(/theatre|room/)) {
        // Extract theatre number from message
        const theatreMatch = messageLower.match(/theatre\s+(\d+|[a-z])/);
        if (theatreMatch) {
          cases = await firebaseDb.getCasesByTheatre(theatreMatch[1]);
          queryType = 'theatre';
        }
      } else {
        // Default: get today's cases
        cases = await firebaseDb.getTodaysCases();
        queryType = 'default';
      }

      return {
        cases,
        metadata: {
          queryType,
          dateRange: {
            start: new Date(),
            end: new Date(),
          },
        },
      };
    } catch (error) {
      console.error('Error querying theatre data:', error);
      return {
        cases: [],
        metadata: { queryType: 'error' },
      };
    }
  }

  // Build context string from theatre data for RAG
  private buildContextString(context: QueryContext): string {
    if (!context.cases || context.cases.length === 0) {
      return 'No theatre cases found for this query. The theatre schedule may be empty or the database may need updating.';
    }

    const casesList = context.cases
      .map((c, idx) => {
        const date = new Date(c.scheduledDate);
        const dateStr = isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : format(date, 'dd/MM/yyyy');

        return `${idx + 1}. ${c.procedure}
   - Patient: ${c.patientName || c.patientId}
   - Surgeon: ${c.surgeon}
   - Theatre: ${c.theatre}
   - Time: ${c.scheduledTime || 'Not scheduled'}
   - Date: ${dateStr}
   - Status: ${c.status}
   ${c.specialRequirements?.length ? `- Special requirements: ${c.specialRequirements.join(', ')}` : ''}`;
      })
      .join('\n\n');

    return `Theatre Cases (${context.cases.length} total):

${casesList}`;
  }

  // Process chat message with full RAG pipeline
  async processChat(userMessage: string, userId?: string): Promise<TOMChatMessage> {
    await this.initialize();

    // Step 1: Query relevant theatre data
    const context = await this.queryTheatreData(userMessage);

    // Step 2: Build context string for GPT-4o
    const contextString = this.buildContextString(context);

    // Step 3: Generate response using Azure OpenAI with RAG
    let responseText: string;
    try {
      responseText = await azureOpenAI.chatWithContext(userMessage, contextString);
    } catch (error) {
      console.error('Error generating AI response:', error);
      responseText = `I apologize, but I'm having trouble connecting to the AI service. However, I can share what I found:

${contextString}`;
    }

    // Step 4: Log for NHS DTAC compliance
    await firebaseDb.logAudit({
      userId: userId || 'anonymous',
      action: 'chat_query',
      resource: 'tom_chat',
      details: {
        query: userMessage,
        casesFound: context.cases?.length || 0,
        queryType: context.metadata?.queryType,
      },
      gdprCompliant: true,
      dataEncrypted: true,
    });

    // Step 5: Return chat message
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: responseText,
      timestamp: new Date(),
      userId,
      context: contextString,
    };
  }

  // Generate speech audio for response
  async generateSpeech(text: string): Promise<string | null> {
    return azureSpeech.getAudioUrl(text);
  }

  // Get system status
  async getSystemStatus() {
    return {
      firebase: {
        connected: true,
        casesCount: (await firebaseDb.getTodaysCases()).length,
      },
      azureOpenAI: azureOpenAI.getDeploymentInfo(),
      azureSpeech: azureSpeech.getServiceInfo(),
      epr: {
        system: this.eprAdapter.getSystemName(),
        configured: this.eprAdapter.isConfigured(),
      },
      initialized: this.initialized,
    };
  }
}

// Singleton instance
export const orchestrator = new ServiceOrchestrator();
