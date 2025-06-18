import { supabase } from './supabase';
import type { Agent } from './supabase';

export interface VoiceSettings {
  voice: string;
  speed: number;
  pitch: number;
  language: string;
  accent?: string;
}

export interface ConversationStep {
  id: string;
  type: 'greeting' | 'question' | 'response' | 'action' | 'transfer';
  content: string;
  options?: string[];
  nextStep?: string;
  conditions?: Record<string, any>;
}

export interface VoiceAgentConfig {
  name: string;
  description: string;
  voiceSettings: VoiceSettings;
  conversationFlow: ConversationStep[];
  trainingData?: string;
  greetingMessage: string;
  fallbackMessage: string;
  transferNumber?: string;
  recordCalls: boolean;
  enableTranscription: boolean;
}

export const voiceAgentService = {
  // Create a new voice agent
  async createVoiceAgent(config: VoiceAgentConfig): Promise<Agent> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const agentData = {
      user_id: user.user.id,
      name: config.name,
      description: config.description,
      agent_type: 'voice' as const,
      status: 'draft' as const,
      voice_settings: config.voiceSettings,
      conversation_flow: config.conversationFlow,
      training_data: config.trainingData,
      language: config.voiceSettings.language,
      greeting_message: config.greetingMessage,
      fallback_message: config.fallbackMessage,
    };

    const { data, error } = await supabase
      .from('agents')
      .insert(agentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deploy agent to Twilio
  async deployAgent(agentId: string): Promise<{ phoneNumber: string; webhookUrl: string }> {
    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error) throw error;

    // Call Supabase Edge Function to deploy to Twilio
    const { data, error: deployError } = await supabase.functions.invoke('deploy-voice-agent', {
      body: { agentId, agent }
    });

    if (deployError) throw deployError;

    // Update agent status to active
    await supabase
      .from('agents')
      .update({ status: 'active' })
      .eq('id', agentId);

    return data;
  },

  // Test agent with sample call
  async testAgent(agentId: string, testPhoneNumber: string): Promise<{ callSid: string }> {
    const { data, error } = await supabase.functions.invoke('test-voice-agent', {
      body: { agentId, testPhoneNumber }
    });

    if (error) throw error;
    return data;
  },

  // Get agent call history
  async getAgentCalls(agentId: string) {
    const { data, error } = await supabase
      .from('calls')
      .select(`
        *,
        leads(*)
      `)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get agent analytics
  async getAgentAnalytics(agentId: string, timeRange: string = '7d') {
    const { data, error } = await supabase
      .rpc('get_agent_analytics', { 
        agent_id: agentId, 
        time_range: timeRange 
      });

    if (error) throw error;
    return data;
  },

  // Update conversation flow
  async updateConversationFlow(agentId: string, flow: ConversationStep[]) {
    const { data, error } = await supabase
      .from('agents')
      .update({ conversation_flow: flow })
      .eq('id', agentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Train agent with custom data
  async trainAgent(agentId: string, trainingData: string) {
    const { data, error } = await supabase.functions.invoke('train-voice-agent', {
      body: { agentId, trainingData }
    });

    if (error) throw error;
    return data;
  }
};

// Voice configuration presets
export const voicePresets = {
  professional_female: {
    voice: 'alice',
    speed: 1.0,
    pitch: 1.0,
    language: 'en-US'
  },
  professional_male: {
    voice: 'man',
    speed: 1.0,
    pitch: 1.0,
    language: 'en-US'
  },
  friendly_female: {
    voice: 'alice',
    speed: 1.1,
    pitch: 1.1,
    language: 'en-US'
  },
  friendly_male: {
    voice: 'man',
    speed: 1.1,
    pitch: 0.9,
    language: 'en-US'
  }
};

// Conversation flow templates
export const conversationTemplates = {
  hr_screening: [
    {
      id: 'greeting',
      type: 'greeting',
      content: 'Hello! Thank you for calling about the job opportunity. I\'m an AI assistant here to conduct an initial screening. This call will take about 5-10 minutes. May I have your full name please?',
      nextStep: 'get_name'
    },
    {
      id: 'get_name',
      type: 'question',
      content: 'Thank you, {name}. Could you please tell me about your relevant work experience for this position?',
      nextStep: 'experience'
    },
    {
      id: 'experience',
      type: 'question',
      content: 'That sounds great. What interests you most about this role and our company?',
      nextStep: 'interest'
    },
    {
      id: 'interest',
      type: 'question',
      content: 'Excellent. Are you available to start within the next 2-4 weeks if selected?',
      nextStep: 'availability'
    },
    {
      id: 'availability',
      type: 'action',
      content: 'Thank you for your time, {name}. Based on our conversation, I\'ll forward your information to our hiring team. You should hear back within 3-5 business days. Have a great day!',
      nextStep: 'end'
    }
  ],
  hotel_booking: [
    {
      id: 'greeting',
      type: 'greeting',
      content: 'Hello and welcome to Grand Hotel! I\'m here to help you with your reservation. How may I assist you today?',
      nextStep: 'service_type'
    },
    {
      id: 'service_type',
      type: 'question',
      content: 'Would you like to make a new reservation, modify an existing booking, or do you have questions about our services?',
      options: ['New Reservation', 'Modify Booking', 'General Questions'],
      nextStep: 'handle_request'
    },
    {
      id: 'handle_request',
      type: 'question',
      content: 'Perfect! For a new reservation, what dates are you looking to stay with us?',
      nextStep: 'get_dates'
    },
    {
      id: 'get_dates',
      type: 'question',
      content: 'Great! How many guests will be staying, and do you have any room preferences?',
      nextStep: 'room_details'
    },
    {
      id: 'room_details',
      type: 'action',
      content: 'Excellent! I have all the information I need. Let me transfer you to our reservations specialist who will complete your booking and provide pricing. Please hold for just a moment.',
      nextStep: 'transfer'
    }
  ],
  sales_qualifier: [
    {
      id: 'greeting',
      type: 'greeting',
      content: 'Hi there! Thanks for your interest in our services. I\'m here to learn more about your needs and see how we can help. This will just take a few minutes. What\'s your name?',
      nextStep: 'get_name'
    },
    {
      id: 'get_name',
      type: 'question',
      content: 'Nice to meet you, {name}! What company are you with?',
      nextStep: 'company'
    },
    {
      id: 'company',
      type: 'question',
      content: 'Thanks! What specific challenges are you looking to solve with our solution?',
      nextStep: 'pain_points'
    },
    {
      id: 'pain_points',
      type: 'question',
      content: 'I understand. What\'s your timeline for implementing a solution?',
      nextStep: 'timeline'
    },
    {
      id: 'timeline',
      type: 'question',
      content: 'Perfect. What\'s the best way to follow up with you - email or phone?',
      nextStep: 'contact_preference'
    },
    {
      id: 'contact_preference',
      type: 'action',
      content: 'Excellent, {name}! Based on what you\'ve shared, I think we can definitely help. I\'m going to have one of our solution specialists reach out to you within 24 hours to discuss this further. Thanks for your time!',
      nextStep: 'end'
    }
  ]
};