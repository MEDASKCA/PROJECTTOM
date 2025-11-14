'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function TOMChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-GB';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);

          // Auto-send after 1.5 seconds
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
          }
          speechTimeoutRef.current = setTimeout(() => {
            handleSubmit(new Event('submit') as any, transcript);
          }, 1500);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Toggle microphone
  const toggleMicrophone = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Speak response using browser or Azure TTS
  const speak = async (text: string) => {
    setIsSpeaking(true);

    try {
      // Try Azure TTS first
      const ttsResponse = await fetch('/api/azure-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (ttsResponse.ok && ttsResponse.headers.get('content-type')?.includes('audio')) {
        // Azure TTS succeeded
        const audioBlob = await ttsResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      } else {
        // Fallback to browser TTS
        useBrowserTTS(text);
      }
    } catch (error) {
      console.error('TTS error:', error);
      useBrowserTTS(text);
    }
  };

  // Browser TTS fallback
  const useBrowserTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Try to find a natural British voice
      const voices = speechSynthesis.getVoices();
      const preferredVoices = [
        'Google UK English Male',
        'Microsoft George - English (United Kingdom)',
        'Daniel',
        'Samantha',
      ];

      for (const voiceName of preferredVoices) {
        const voice = voices.find(v => v.name.includes(voiceName));
        if (voice) {
          utterance.voice = voice;
          break;
        }
      }

      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault();
    const messageText = overrideInput || input.trim();
    if (!messageText || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call TOM chat API
      const response = await fetch('/api/tom-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date(data.timestamp),
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Speak the response
        await speak(data.message);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h1 className="text-2xl font-semibold text-gray-800 text-center">TOM</h1>
        <p className="text-sm text-gray-500 text-center">Theatre Operations Manager</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-3xl font-medium text-gray-800 mb-2">
                How can I help you with theatre operations?
              </h2>
              <p className="text-gray-500">Ask me about schedules, cases, staff, or equipment</p>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-6 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="text-left mb-6">
              <div className="inline-block bg-gray-100 px-4 py-3 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleMicrophone}
              disabled={isLoading}
              className={`p-3 rounded-full transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Wave Visualization */}
            <button
              type="button"
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50"
              disabled={isLoading}
              title="Voice mode"
            >
              <div className="flex items-center space-x-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-1 bg-gray-700 rounded-full transition-all ${
                      isSpeaking ? 'animate-pulse' : ''
                    }`}
                    style={{
                      height: isSpeaking ? `${12 + i * 4}px` : '12px',
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message TOM..."
              disabled={isLoading || isListening}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Status indicators */}
          <div className="flex justify-center items-center space-x-4 mt-2 text-xs text-gray-500">
            {isListening && <span className="text-red-500">🎤 Listening...</span>}
            {isSpeaking && <span className="text-green-500">🔊 Speaking...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
