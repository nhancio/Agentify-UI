import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import VoiceAgentBuilder from '../components/VoiceAgentBuilder';
import {
  Bot,
  Phone,
  Play,
  Pause,
  Settings,
  Plus,
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

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.from('agents').select('*').eq('category', 'voice');
      if (error) throw error;
      setAgents(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch voice agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

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
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1">
          <div className="p-6 border-b border-gray-200 bg-white">
            <button
              onClick={() => setShowBuilder(false)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Voice Agents
            </button>
          </div>
          <VoiceAgentBuilder
            agentId={selectedAgent?.id}
            onSave={handleAgentSaved}
          />
        </div>
      </div>
    );
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
                My Voice Agents
                <span className="ml-3 text-base font-normal text-blue-600 align-middle">
                  ({agents.length})
                </span>
              </h1>
              <p className="text-gray-600">Manage your voice agents for phone calls and customer interactions.</p>
            </div>
            <button
              onClick={() => setShowBuilder(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Audio Agent
            </button>
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
                    <img src={agent.avatar_url || agent.logo} alt={agent.name} className="w-16 h-16 object-cover rounded-full mb-3" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-3">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">{agent.name}</h3>
                  <div className="text-xs text-gray-500 mb-2 text-center">{agent.id}</div>
                  <div className="text-sm text-gray-700 mb-1 text-center">{agent.creator || agent.created_by || 'Unknown Creator'}</div>
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