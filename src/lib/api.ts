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
        agents(name, user_id),
        leads(*)
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

export const leadService = {
  // Get leads for current user
  async getLeads(status?: string) {
    let query = supabase
      .from('leads')
      .select(`
        *,
        calls(from_number, duration),
        agents(name)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Update lead
  async updateLead(id: string, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create manual lead
  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const marketplaceService = {
  // Get agent templates
  async getTemplates(category?: string, featured?: boolean) {
    let query = supabase
      .from('agent_templates')
      .select('*')
      .eq('is_approved', true)
      .order('download_count', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get template details
  async getTemplate(id: string) {
    const { data, error } = await supabase
      .from('agent_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Install template (create agent from template)
  async installTemplate(templateId: string, customizations?: any) {
    const template = await this.getTemplate(templateId);
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Create agent from template
    const agentData = {
      ...template.template_data,
      ...customizations,
      user_id: user.user.id,
      name: customizations?.name || template.name,
      description: customizations?.description || template.description,
      agent_type: template.agent_type,
    };

    const agent = await agentService.createAgent(agentData);

    // Increment download count
    await supabase
      .from('agent_templates')
      .update({ download_count: template.download_count + 1 })
      .eq('id', templateId);

    return agent;
  }
};

export const billingService = {
  // Get user subscription
  async getSubscription() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get billing history
  async getBillingHistory() {
    const { data, error } = await supabase
      .from('billing_history')
      .select('*')
      .order('billing_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create checkout session (would integrate with Stripe)
  async createCheckoutSession(priceId: string) {
    // Call Supabase Edge Function endpoint
    const response = await fetch('/functions/v1/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    });
    if (!response.ok) throw new Error('Failed to create checkout session');
    return await response.json();
  }
};

export const integrationService = {
  // Get user integrations
  async getIntegrations() {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add integration
  async addIntegration(integration: {
    service_name: string;
    service_type: string;
    credentials: Record<string, any>;
    settings?: Record<string, any>;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('integrations')
      .insert({
        ...integration,
        user_id: user.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update integration
  async updateIntegration(id: string, updates: any) {
    const { data, error } = await supabase
      .from('integrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete integration
  async deleteIntegration(id: string) {
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};