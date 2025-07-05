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
import type { Agent } from '../lib/supabase';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const VoiceAgents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
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
    fetchElevenLabsAgents();
  }, []);

  const fetchElevenLabsAgents = async () => {
    setElLoading(true);
    try {
      const client = new ElevenLabsClient({ apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY });
      const res = await client.conversationalAi.agents.list();
      setElAgents(res.agents || []);
    } catch (err) {
      setElAgents([]);
    } finally {
      setElLoading(false);
    }
  };

  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setShowBuilder(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowBuilder(true);
  };

  const handleAgentSaved = (agent: Agent) => {
    setShowBuilder(false);
    loadAgents();
  };

  const toggleAgentStatus = async (agent: Agent) => {
    try {
      const newStatus = agent.status === 'active' ? 'paused' : 'active';
      await agentService.updateAgent(agent.id, { status: newStatus });
      loadAgents();
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  const deployAgent = async (agent: Agent) => {
    try {
      await voiceAgentService.deployAgent(agent.id);
      loadAgents();
      alert('Agent deployed successfully! Phone number assigned.');
    } catch (error) {
      console.error('Error deploying agent:', error);
      alert('Error deploying agent. Please try again.');
    }
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
                  ({elAgents.length})
                </span>
              </h1>
              <p className="text-gray-600">Manage your ElevenLabs voice agents for phone calls and customer interactions.</p>
            </div>
            <button 
              onClick={handleCreateAgent}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Audio Agent
            </button>
          </div>
        </div>

        {/* ElevenLabs Agents List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
          <div className="p-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span>ElevenLabs Agents</span>
              {elLoading && <span className="text-xs text-gray-400">(Loading...)</span>}
            </h3>
            {elAgents.length === 0 && !elLoading && (
              <div className="text-gray-500 text-sm">No ElevenLabs agents found.</div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 border-b text-left">Name</th>
                    <th className="px-3 py-2 border-b text-left">Agent ID</th>
                    <th className="px-3 py-2 border-b text-left">Creator</th>
                    <th className="px-3 py-2 border-b text-left">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {elAgents.map(agent => (
                    <tr
                      key={agent.agent_id}
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() => setElAgentDetail(agent)}
                    >
                      <td className="px-3 py-2 border-b">{agent.name}</td>
                      <td className="px-3 py-2 border-b">{agent.agent_id}</td>
                      <td className="px-3 py-2 border-b">{agent.access_info?.creator_name}</td>
                      <td className="px-3 py-2 border-b">
                        {agent.created_at_unix_secs
                          ? new Date(agent.created_at_unix_secs * 1000).toLocaleString()
                          : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Agent Detail Modal */}
            {elAgentDetail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                    onClick={() => setElAgentDetail(null)}
                  >
                    ×
                  </button>
                  <h4 className="text-xl font-bold mb-4">ElevenLabs Agent Details</h4>
                  <pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto">
                    {JSON.stringify(elAgentDetail, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h3 className="ml-3 font-semibold text-blue-900">Analytics</h3>
            </div>
            <p className="text-blue-700 text-sm mb-4">View detailed performance metrics for your voice agents.</p>
            <button className="text-blue-600 font-medium hover:text-blue-700">
              View Analytics →
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="ml-3 font-semibold text-green-900">Leads</h3>
            </div>
            <p className="text-green-700 text-sm mb-4">Manage leads captured by your voice agents.</p>
            <button className="text-green-600 font-medium hover:text-green-700">
              View Leads →
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h3 className="ml-3 font-semibold text-purple-900">Integrations</h3>
            </div>
            <p className="text-purple-700 text-sm mb-4">Connect your voice agents to CRM and other tools.</p>
            <button className="text-purple-600 font-medium hover:text-purple-700">
              Setup Integrations →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgents;