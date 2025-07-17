import { supabase } from './supabase';
import type { Agent, Call, Lead, AgentTemplate } from './supabase';

// Add ElevenLabs API integration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/convai/agents/create';
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

async function createElevenLabsAgent(conversationConfig: any) {
  // Only send { conversation_config } in the body
  const response = await fetch(ELEVENLABS_API_URL, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ conversation_config: conversationConfig })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create agent in ElevenLabs: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.agent_id;
}

export const agentService = {
  // Get all agents for current user
  async getAgents() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create new agent (also creates in ElevenLabs)
  async createAgent(agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) {
    // 1. Create agent in ElevenLabs
    // You may want to map your agent fields to ElevenLabs config here
    const conversationConfig = agent.conversation_config || {};

    const elevenLabsAgentId = await createElevenLabsAgent(conversationConfig);

    // 2. Save agent in Supabase, including the ElevenLabs agent_id
    const { data, error } = await supabase
      .from('agents')
      .insert({
        ...agent,
        elevenlabs_agent_id: elevenLabsAgentId // Add this field to your table if not present
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update agent
  async updateAgent(id: string, updates: Partial<Agent>) {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete agent
  async deleteAgent(id: string) {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Deploy agent (activate)
  async deployAgent(id: string) {
    return this.updateAgent(id, { status: 'active' });
  },

  // Pause agent
  async pauseAgent(id: string) {
    return this.updateAgent(id, { status: 'paused' });
  }
};

export const callService = {
  // Get calls for user's agents
  async getCalls(agentId?: string) {
    let query = supabase
      .from('calls')
      .select(`
        *,
        agents(name, user_id)
      `)
      .order('created_at', { ascending: false });

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get call details
  async getCall(id: string) {
    const { data, error } = await supabase
      .from('calls')
      .select(`
        *,
        agents(name, user_id)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get call analytics
  async getCallAnalytics(timeRange: string = '7d') {
    const { data, error } = await supabase
      .rpc('get_call_analytics', { time_range: timeRange });

    if (error) throw error;
    return data;
  }
};