// Enhanced Tavus API integration with multi-replica support
export interface TavusConfig {
  apiKey: string;
}

export interface VideoAgentConfig {
  name: string;
  description: string;
  replicaId: string;
  personaId?: string;
  conversationConfig: {
    maxDuration: number;
    language: string;
    voice: string;
    personality: string;
    enableRecording: boolean;
    enableTranscription: boolean;
  };
  webhookUrl?: string;
}

export interface ConversationSession {
  conversationId: string;
  status: 'active' | 'ended' | 'error';
  participantId: string;
  streamUrl?: string;
  conversationUrl?: string;
}

export interface TavusReplica {
  replica_id: string;
  replica_name: string;
  status: 'ready' | 'training' | 'failed';
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  training_progress?: number;
}

export interface TavusPersona {
  persona_id: string;
  persona_name: string;
  system_prompt: string;
  context?: string;
  default_replica_id?: string;
  created_at: string;
}

export class TavusService {
  private apiKey: string;
  private baseUrl = 'https://tavusapi.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Test API connection with better error handling
  async testConnection() {
    try {
      if (!this.apiKey) {
        return { 
          success: false, 
          message: 'Tavus API key not configured. Please add VITE_TAVUS_API_KEY to your environment variables.' 
        };
      }

      const response = await fetch(`${this.baseUrl}/v2/replicas`, {
        headers: {
          'x-api-key': this.apiKey,
        },
      });
      // Debug: print status and headers
      console.debug('[TavusService] testConnection status:', response.status, response.statusText);
      console.debug('[TavusService] testConnection headers:', [...response.headers.entries()]);
      
      if (!response.ok) {
        if (response.status === 401) {
          return { 
            success: false, 
            message: 'Invalid Tavus API key. Please check your VITE_TAVUS_API_KEY.' 
          };
        }
        if (response.status === 403) {
          return { 
            success: false, 
            message: 'Tavus API access denied. Please check your account permissions.' 
          };
        }
        return { 
          success: false, 
          message: `Tavus API error: ${response.status} ${response.statusText}` 
        };
      }
      
      return { success: true, message: 'Tavus API connection successful' };
    } catch (error) {
      console.error('Tavus API test failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { 
          success: false, 
          message: 'Network error: Unable to connect to Tavus API. Please check your internet connection.' 
        };
      }
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown connection error' 
      };
    }
  }

  // Get all replicas with enhanced error handling
  async getReplicas(): Promise<{ replicas: TavusReplica[] }> {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/replicas`, {
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get replicas: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Get specific replica details
  async getReplica(replicaId: string): Promise<TavusReplica> {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/replicas/${replicaId}`, {
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Replica ${replicaId} not found. Please check the replica ID.`);
      }
      const errorText = await response.text();
      throw new Error(`Failed to get replica: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Create a new video agent replica
  async createReplica(config: {
    name: string;
    videoUrl: string;
    callback_url?: string;
  }) {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/replicas`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        train_video_url: config.videoUrl,
        replica_name: config.name,
        callback_url: config.callback_url,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to create replica: ${response.status} ${errorData}`);
    }

    return response.json();
  }

  // Delete a replica
  async deleteReplica(replicaId: string) {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/replicas/${replicaId}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete replica: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Get all personas
  async getPersonas(): Promise<{ personas: TavusPersona[] }> {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/personas`, {
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    // Debug: print status and headers
    console.debug('[TavusService] getPersonas status:', response.status, response.statusText);
    console.debug('[TavusService] getPersonas headers:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TavusService] getPersonas error:', errorText);
      throw new Error(`Failed to get personas: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.debug('[TavusService] getPersonas data:', data);
    return data;
  }

  // Create a persona (conversation personality)
  async createPersona(config: {
    persona_name: string;
    system_prompt: string;
    context?: string;
    default_replica_id?: string;
  }): Promise<TavusPersona> {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/personas`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to create persona: ${response.status} ${errorData}`);
    }

    return response.json();
  }

  // Update a persona
  async updatePersona(personaId: string, updates: Partial<{
    persona_name: string;
    system_prompt: string;
    context: string;
    default_replica_id: string;
  }>): Promise<TavusPersona> {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/personas/${personaId}`, {
      method: 'PATCH',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to update persona: ${response.status} ${errorData}`);
    }

    return response.json();
  }

  // Delete a persona
  async deletePersona(personaId: string) {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/personas/${personaId}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete persona: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Create a conversation session with enhanced error handling
  async createConversation(config: {
    replica_id: string;
    persona_id?: string;
    conversation_name: string;
    callback_url?: string;
    properties?: {
      max_call_duration?: number;
      participant_left_timeout?: number;
      participant_absent_timeout?: number;
      enable_recording?: boolean;
      enable_transcription?: boolean;
      language?: string;
    };
  }): Promise<ConversationSession> {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    if (!config.replica_id) {
      throw new Error('Replica ID is required to create a conversation');
    }

    // Patch: Convert ISO code to full language name if needed
    let patchedConfig = { ...config };
    if (patchedConfig.properties?.language) {
      const lang = patchedConfig.properties.language;
      if (ISO_TO_LANGUAGE[lang]) {
        patchedConfig.properties.language = ISO_TO_LANGUAGE[lang];
      }
    }

    const response = await fetch(`${this.baseUrl}/v2/conversations`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchedConfig),
    });

    if (!response.ok) {
      const errorData = await response.text();
      if (response.status === 404) {
        throw new Error(`Replica ${config.replica_id} not found. Please check if the replica exists and is ready.`);
      }
      if (response.status === 400) {
        throw new Error(`Invalid conversation configuration: ${errorData}`);
      }
      throw new Error(`Failed to create conversation: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    return {
      conversationId: data.conversation_id,
      status: 'active',
      participantId: data.participant_id || '',
      streamUrl: data.conversation_url,
      conversationUrl: data.conversation_url,
    };
  }

  // Get all conversations
  async getConversations() {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/conversations`, {
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get conversations: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Get conversation details
  async getConversation(conversationId: string) {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/conversations/${conversationId}`, {
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get conversation: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // End a conversation
  async endConversation(conversationId: string) {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to end conversation: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Get conversation recording
  async getConversationRecording(conversationId: string) {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/conversations/${conversationId}/recording`, {
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get recording: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Get conversation transcript
  async getConversationTranscript(conversationId: string) {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/conversations/${conversationId}/transcript`, {
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get transcript: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Batch operations for multiple replicas
  async batchCreateConversations(configs: Array<{
    replica_id: string;
    persona_id?: string;
    conversation_name: string;
    properties?: any;
  }>) {
    const conversations = await Promise.allSettled(
      configs.map(config => this.createConversation(config))
    );

    return conversations.map((result, index) => ({
      config: configs[index],
      result: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }

  // Get account usage and limits
  async getAccountInfo() {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/account`, {
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get account info: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }
}

// Initialize Tavus service with better error handling
export const tavusService = new TavusService(
  import.meta.env.VITE_TAVUS_API_KEY || ''
);

// Enhanced personas with more customization options
export const videoAgentPersonas = {
  hr_interviewer: {
    name: 'HR Interview Assistant',
    systemPrompt: `You are a professional HR interviewer conducting initial candidate screenings. 
    Be friendly but professional, ask relevant questions about experience and qualifications, 
    and provide a positive candidate experience. Keep responses concise and engaging.
    
    Interview Structure:
    1. Welcome and company introduction (30 seconds)
    2. Background and experience questions (3-4 minutes)
    3. Role-specific questions (2-3 minutes)
    4. Availability and logistics (1-2 minutes)
    5. Candidate questions and next steps (1-2 minutes)
    
    Always be encouraging and make candidates feel comfortable. Focus on their strengths.`,
    context: 'HR recruitment and candidate screening',
    category: 'Human Resources'
  },
  hotel_concierge: {
    name: 'Hotel Concierge',
    systemPrompt: `You are a warm and professional hotel concierge assistant. 
    Provide exceptional hospitality service with a personal touch. Be knowledgeable 
    about hotel amenities, local attractions, and guest services.
    
    Service Areas:
    - Room bookings and availability
    - Hotel amenities and services
    - Local restaurant recommendations
    - Transportation arrangements
    - Event planning assistance
    - Special requests and accommodations
    
    Always exceed guest expectations and maintain a welcoming, helpful tone.`,
    context: 'Hotel and hospitality services',
    category: 'Hospitality'
  },
  sales_agent: {
    name: 'Sales Representative',
    systemPrompt: `You are an enthusiastic and consultative sales representative. 
    Focus on understanding customer needs first, then present solutions that genuinely 
    help their business. Build trust through expertise and genuine interest.
    
    Sales Process:
    1. Rapport building and discovery (2-3 minutes)
    2. Needs assessment and pain point identification (3-4 minutes)
    3. Solution presentation tailored to their needs (2-3 minutes)
    4. Objection handling and clarification (1-2 minutes)
    5. Next steps and follow-up scheduling (1 minute)
    
    Be consultative, not pushy. Focus on value creation.`,
    context: 'Sales and lead generation',
    category: 'Sales'
  },
  customer_support: {
    name: 'Customer Support Agent',
    systemPrompt: `You are a patient and empathetic customer support representative. 
    Your goal is to resolve issues quickly while ensuring customer satisfaction. 
    Listen actively and provide clear, step-by-step solutions.
    
    Support Approach:
    1. Active listening and issue understanding
    2. Empathy and acknowledgment of frustration
    3. Clear explanation of resolution steps
    4. Verification that solution works
    5. Follow-up and additional assistance offer
    
    Always maintain professionalism and focus on resolution.`,
    context: 'Customer service and support',
    category: 'Support'
  },
  medical_assistant: {
    name: 'Medical Appointment Assistant',
    systemPrompt: `You are a professional medical appointment scheduling assistant. 
    Be compassionate, efficient, and maintain strict confidentiality. Help patients 
    schedule appointments and provide basic information about procedures.
    
    Responsibilities:
    - Appointment scheduling and rescheduling
    - Insurance verification assistance
    - Pre-appointment instructions
    - Basic procedure information
    - Referral coordination
    
    Always maintain HIPAA compliance and patient confidentiality.`,
    context: 'Healthcare appointment scheduling',
    category: 'Healthcare'
  },
  real_estate_agent: {
    name: 'Real Estate Agent',
    systemPrompt: `You are a knowledgeable real estate agent helping clients with 
    property inquiries. Be informative about market conditions, property features, 
    and the buying/selling process.
    
    Services:
    - Property information and virtual tours
    - Market analysis and pricing guidance
    - Buying/selling process explanation
    - Neighborhood information
    - Appointment scheduling for viewings
    
    Build trust through market expertise and genuine interest in client needs.`,
    context: 'Real estate sales and consultation',
    category: 'Real Estate'
  },
  financial_advisor: {
    name: 'Financial Advisor',
    systemPrompt: `You are a professional financial advisor providing initial 
    consultations. Be trustworthy, knowledgeable, and focus on understanding 
    client financial goals before making any recommendations.
    
    Consultation Areas:
    - Financial goal assessment
    - Investment strategy discussion
    - Retirement planning basics
    - Risk tolerance evaluation
    - Next steps and follow-up scheduling
    
    Always emphasize the importance of personalized advice and compliance.`,
    context: 'Financial planning and investment advice',
    category: 'Finance'
  },
  education_counselor: {
    name: 'Education Counselor',
    systemPrompt: `You are a supportive education counselor helping students and 
    parents with academic planning. Be encouraging, informative, and focused on 
    student success and development.
    
    Counseling Areas:
    - Course selection and academic planning
    - College preparation and applications
    - Career guidance and exploration
    - Study strategies and resources
    - Scholarship and financial aid information
    
    Always be supportive and focus on student potential and growth.`,
    context: 'Educational guidance and counseling',
    category: 'Education'
  }
};

// Utility functions for replica management
export const replicaUtils = {
  // Filter replicas by status
  filterByStatus: (replicas: TavusReplica[], status: string) => {
    return replicas.filter(replica => replica.status === status);
  },

  // Get ready replicas only
  getReadyReplicas: (replicas: TavusReplica[]) => {
    return replicas.filter(replica => replica.status === 'ready');
  },

  // Sort replicas by creation date
  sortByDate: (replicas: TavusReplica[], ascending = false) => {
    return [...replicas].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  },

  // Group replicas by status
  groupByStatus: (replicas: TavusReplica[]) => {
    return replicas.reduce((groups, replica) => {
      const status = replica.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(replica);
      return groups;
    }, {} as Record<string, TavusReplica[]>);
  }
};

// Add this mapping utility
export const ISO_TO_LANGUAGE: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  // Add more as needed
};