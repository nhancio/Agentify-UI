import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import VoiceAgentBuilder from '../components/VoiceAgentBuilder';
import {
  Bot,
  Phone,
  Play,
  Pause,
  Settings,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  PhoneCall,
  Mic,
  Volume2
} from 'lucide-react';
import { agentService } from '../lib/api';
import { voiceAgentService } from '../lib/voiceAgent';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const VoiceAgents: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalCalls: 0,
    avgDuration: '0:00'
  });
  const [elAgents, setElAgents] = useState<any[]>([]);
  const [elAgentDetail, setElAgentDetail] = useState<any | null>(null);
  const [elLoading, setElLoading] = useState(false);

  const { user } = useAuth();

  const fetchAgents = async () => {
    setLoading(true);
    setError('');
    try {
      if (!user) {
        setAgents([]);
        setLoading(false);
        return;
      }
      // Fetch subscriptions and join with agents
      const { data, error } = await supabase
        .from('user_agent_subscriptions')
        .select('agent_id, agents(*)')
        .eq('user_id', user.id);
      if (error) throw error;
      // Extract agent details from the joined result
      const subscribedAgents = (data || []).map((row: any) => row.agents).filter(Boolean);
      setAgents(subscribedAgents);
    } catch (err) {
      setError('Failed to fetch subscribed agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [user]);

  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setShowBuilder(true);
  };

  const handleEditAgent = (agent: any) => {
    setSelectedAgent(agent);
    setShowBuilder(true);
  };

  const handleAgentSaved = (agent: any) => {
    setShowBuilder(false);
    fetchAgents();
  };

  if (showBuilder) {
    // Remove the builder UI and back button
    return null;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Agents
                <span className="ml-3 text-base font-normal text-blue-600 align-middle">
                  ({agents.length})
                </span>
              </h1>
              <p className="text-gray-600">Manage your agents for phone calls and customer interactions.</p>
            </div>
          </div>
        </div>
        {error && <div className="text-center text-red-600">{error}</div>}
        {loading ? (
          <div className="text-center py-12 text-base">Loading agents...</div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-base">No voice agents found.</div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group w-full p-6 flex flex-col items-center">
                  {agent.avatar_url || agent.logo ? (
                    <img src={agent.avatar_url || agent.logo} alt={agent.Name} className="w-16 h-16 object-cover rounded-full mb-3" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-3">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">{agent.Name}</h3>
                  <div className="text-xs text-gray-500 mb-2 text-center">{agent.id}</div>
                  <div className="text-sm text-gray-700 mb-1 text-center">{agent.description || 'No profile/description'}</div>
                  <div className="text-xs text-gray-400 text-center">{agent.created_at ? new Date(agent.created_at).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAgents;