import { supabase } from './supabase';

// Gemini AI API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiRequest {
  contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason: string;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiService {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey || GEMINI_API_KEY;
    this.model = model;
    
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      // Don't throw error immediately, allow graceful degradation
      console.warn('Gemini API key not configured. Some features may not be available.');
    }
  }

  /**
   * Generate text using Gemini AI
   */
  async generateText(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      topK?: number;
      topP?: number;
    } = {}
  ): Promise<string> {
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key is required. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

    const request: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxTokens || 2048
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    try {
      const response = await fetch(`${GEMINI_API_URL}/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response generated from Gemini');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  /**
   * Generate conversation responses for voice agents
   */
  async generateConversationResponse(
    userInput: string,
    context: {
      agentName?: string;
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
      agentPersonality?: string;
      currentStep?: string;
    } = {}
  ): Promise<string> {
    const { agentName = 'AI Assistant', conversationHistory = [], agentPersonality = 'helpful and professional', currentStep } = context;

    let systemPrompt = `You are ${agentName}, a ${agentPersonality} AI assistant. `;
    
    if (currentStep) {
      systemPrompt += `You are currently in the "${currentStep}" step of the conversation flow. `;
    }

    systemPrompt += `Respond naturally and helpfully to the user's input. Keep responses concise and conversational.`;

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\n\nPrevious conversation:\n';
      conversationHistory.slice(-6).forEach(msg => {
        conversationContext += `${msg.role}: ${msg.content}\n`;
      });
    }

    const fullPrompt = `${systemPrompt}${conversationContext}\n\nUser: ${userInput}\n\nAssistant:`;

    return this.generateText(fullPrompt, {
      temperature: 0.8,
      maxTokens: 500
    });
  }

  /**
   * Generate training data for voice agents
   */
  async generateTrainingData(
    agentType: string,
    companyInfo: string,
    specificRequirements: string = ''
  ): Promise<string> {
    const prompt = `Generate comprehensive training data for a ${agentType} voice agent for a company with the following information:

Company Information: ${companyInfo}
${specificRequirements ? `Specific Requirements: ${specificRequirements}` : ''}

Please provide:
1. Common customer questions and appropriate responses
2. Company policies and procedures relevant to this agent type
3. Escalation procedures
4. Product/service information
5. FAQ responses
6. Conversation flow suggestions

Format the response as structured training data that can be used to train an AI voice agent.`;

    return this.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 2000
    });
  }

  /**
   * Analyze call transcripts and provide insights
   */
  async analyzeCallTranscript(
    transcript: string,
    agentId: string
  ): Promise<{
    sentiment: string;
    keyTopics: string[];
    customerSatisfaction: number;
    recommendations: string[];
    summary: string;
  }> {
    const prompt = `Analyze the following call transcript and provide insights:

Transcript: ${transcript}

Please provide:
1. Overall sentiment (positive, neutral, negative)
2. Key topics discussed
3. Customer satisfaction score (1-10)
4. Recommendations for improvement
5. Brief summary of the call

Format as JSON with the following structure:
{
  "sentiment": "positive/neutral/negative",
  "keyTopics": ["topic1", "topic2"],
  "customerSatisfaction": 8,
  "recommendations": ["recommendation1", "recommendation2"],
  "summary": "Brief summary of the call"
}`;

    const response = await this.generateText(prompt, {
      temperature: 0.3,
      maxTokens: 1000
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return {
        sentiment: 'neutral',
        keyTopics: [],
        customerSatisfaction: 5,
        recommendations: ['Unable to analyze transcript'],
        summary: 'Analysis failed'
      };
    }
  }

  /**
   * Generate agent conversation flows
   */
  async generateConversationFlow(
    agentType: string,
    businessContext: string,
    goals: string[]
  ): Promise<Array<{
    id: string;
    type: 'greeting' | 'question' | 'response' | 'action' | 'transfer';
    content: string;
    nextStep?: string;
    conditions?: Record<string, any>;
  }>> {
    const prompt = `Generate a conversation flow for a ${agentType} voice agent with the following context:

Business Context: ${businessContext}
Goals: ${goals.join(', ')}

Create a structured conversation flow with steps that include:
- Greeting and introduction
- Information gathering questions
- Decision points
- Actions to take
- Transfer or conclusion steps

Format as JSON array with this structure:
[
  {
    "id": "step_id",
    "type": "greeting|question|response|action|transfer",
    "content": "Step content",
    "nextStep": "next_step_id",
    "conditions": {}
  }
]`;

    const response = await this.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 1500
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse conversation flow:', error);
      return [
        {
          id: 'greeting',
          type: 'greeting' as const,
          content: 'Hello! How can I help you today?',
          nextStep: 'main_question'
        },
        {
          id: 'main_question',
          type: 'question' as const,
          content: 'What would you like to know about our services?',
          nextStep: 'end'
        }
      ];
    }
  }
}

// Export a function to get Gemini service instance (lazy loading)
export const getGeminiService = (apiKey?: string) => {
  return new GeminiService(apiKey);
};

// Export a default instance only if API key is available
export const geminiService = (() => {
  try {
    return new GeminiService();
  } catch (error) {
    // Return a mock service that throws helpful errors
    return {
      generateText: () => Promise.reject(new Error('Gemini API key not configured')),
      generateConversationResponse: () => Promise.reject(new Error('Gemini API key not configured')),
      generateTrainingData: () => Promise.reject(new Error('Gemini API key not configured')),
      analyzeCallTranscript: () => Promise.reject(new Error('Gemini API key not configured')),
      generateConversationFlow: () => Promise.reject(new Error('Gemini API key not configured'))
    } as any;
  }
})();

// Export utility functions
export const geminiUtils = {
  /**
   * Test Gemini API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
        return false;
      }
      const response = await geminiService.generateText('Hello, this is a test message.');
      return response.length > 0;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  },

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.0-pro'
    ];
  }
};
