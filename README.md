# PROJECT TOM - Theatre Operations Manager

An NHS DTAC compliant AI assistant for theatre operations, powered by Azure OpenAI GPT-4o and integrated with real-time theatre data.

## Features

✅ **ChatGPT-style interface** with natural conversation flow
✅ **Customizable hospital header** - NHS branding with trust/hospital logo
✅ **Voice interaction** - Microphone input with speech recognition
✅ **Natural British male voice** - Azure TTS (en-GB-RyanNeural)
✅ **Real-time theatre data** - Connected to Firebase (medaskca-93d48)
✅ **RAG (Retrieval-Augmented Generation)** - Queries database before responding
✅ **NHS DTAC compliant** - Audit logging, data encryption, GDPR compliant
✅ **EPR agnostic** - Universal adapter for Epic, Cerner, TPP, EMIS, or manual entry
✅ **Fully interconnected** - Central orchestrator coordinates all services
✅ **Zero TypeScript errors** - Production-ready clean code

## Architecture

```
PROJECT TOM
├── core/
│   └── orchestrator.ts          # Central service coordinator
├── services/
│   ├── firebase/
│   │   ├── config.ts           # Firebase initialization
│   │   └── database.service.ts # Firestore queries with RAG
│   ├── azure/
│   │   ├── openai.service.ts   # GPT-4o integration
│   │   └── speech.service.ts   # Azure TTS
│   └── epr/
│       └── adapter.interface.ts # Universal EPR adapter
├── types/
│   └── universal-data.ts        # Universal data models
├── app/
│   ├── api/
│   │   ├── tom-chat/           # Chat API with RAG
│   │   └── azure-tts/          # TTS API
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── components/
    └── TOMChat.tsx              # ChatGPT-style UI
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
- **Firebase**: medaskca-93d48 project credentials
- **Azure OpenAI**: GPT-4o deployment (medaskca-openai)
- **Azure Speech**: For natural British voice (optional, browser fallback available)

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for production

```bash
npm run build
npm start
```

## Azure Configuration

### Azure OpenAI GPT-4o
- **Endpoint**: https://medaskca-openai.openai.azure.com/
- **Deployment**: gpt-4o
- **API Version**: 2024-08-01-preview

### Azure Speech Services
- **Voice**: en-GB-RyanNeural (Natural British male)
- **Region**: uksouth
- **Rate**: 0.95 (slightly slower for clarity)

## Firebase Database

Connected to **medaskca-93d48** project with the following collections:
- `cases` - Theatre cases with schedule, surgeon, procedure
- `staff` - Theatre staff and availability
- `audit_logs` - NHS DTAC compliant audit trail

## EPR Integration

PROJECT TOM is **EPR agnostic** and can connect to any Electronic Patient Record system:

- **Epic** - Enterprise EPR (adapter ready)
- **Cerner** - Healthcare IT platform (adapter ready)
- **TPP** - SystmOne (adapter ready)
- **EMIS** - GP system (adapter ready)
- **Manual Entry** - For trusts without digital integration (default)

Configure EPR system in `.env.local`:
```
NEXT_PUBLIC_EPR_SYSTEM=manual
```

## NHS DTAC Compliance

✅ **Data Encryption** - All data encrypted in transit (TLS 1.3) and at rest
✅ **Audit Logging** - All interactions logged with GDPR compliance
✅ **Access Controls** - NHS Identity / Azure AD ready
✅ **Data Minimization** - Only necessary patient data processed
✅ **Right to Erasure** - GDPR compliant data deletion

## Tech Stack

- **Next.js 16** - React framework with App Router and Turbopack
- **TypeScript 5.9** - Strict type checking, zero errors
- **Firebase 12** - Real-time database (Firestore)
- **OpenAI SDK 4** - Azure OpenAI GPT-4o integration
- **Azure Speech** - Natural British male voice TTS
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **date-fns** - Date utilities

## Usage

### Voice Interaction

1. Click the **microphone icon** (🎤) to start voice input
2. Speak your question: "What's the list tomorrow?"
3. TOM will automatically send after 1.5 seconds
4. Listen to TOM's response with natural British voice

### Text Interaction

1. Type your question in the input field
2. Click **Send** or press Enter
3. TOM queries the database and responds with real data

### Example Queries

- "What's the list today?"
- "What's tomorrow's schedule?"
- "Show me cases for Theatre 2"
- "What cases does Mr Smith have?"
- "Are there any emergency cases?"

## API Endpoints

### POST /api/tom-chat
Process chat message with RAG pipeline

**Request:**
```json
{
  "message": "What's the list tomorrow?",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tomorrow's theatre schedule includes...",
  "context": "Theatre Cases (5 total): ...",
  "timestamp": "2025-01-14T10:30:00Z"
}
```

### GET /api/tom-chat
Health check and system status

**Response:**
```json
{
  "success": true,
  "status": {
    "firebase": { "connected": true, "casesCount": 12 },
    "azureOpenAI": { "deploymentName": "gpt-4o", "ready": true },
    "azureSpeech": { "voiceName": "en-GB-RyanNeural", "ready": true },
    "epr": { "system": "manual", "configured": true },
    "initialized": true
  }
}
```

### POST /api/azure-tts
Generate natural speech audio

**Request:**
```json
{
  "text": "Hello, I'm TOM"
}
```

**Response:**
- Success: MP3 audio stream
- Fallback: `{ "success": false, "useBrowserVoice": true }`

## Deployment

### Vercel (Recommended)

1. Push to GitHub: https://github.com/MEDASKCA/PROJECTTOM
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables (Vercel)

Add these in Project Settings → Environment Variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = medaskca-93d48
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_ENDPOINT` = https://medaskca-openai.openai.azure.com/
- `AZURE_OPENAI_DEPLOYMENT_NAME` = gpt-4o
- `AZURE_SPEECH_API_KEY` (optional)
- `AZURE_SPEECH_REGION` = uksouth

## License

MIT License - MEDASKCA

## Author

**MEDASKCA**
NHS Theatre Operations Management System

---

**🏥 Improving NHS theatre operations with AI**
