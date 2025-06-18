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

const VoiceAgents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalCalls: 0,
    avgDuration: '0:00'
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await agentService.getAgents();
      const voiceAgents = data.filter(agent => agent.agent_type === 'voice' || agent.agent_type === 'voice_video');
      setAgents(voiceAgents);
      
      // Calculate stats
      setStats({
        totalAgents: voiceAgents.length,
        activeAgents: voiceAgents.filter(a => a.status === 'active').length,
        totalCalls: 1247, // Mock data - would come from calls table
        avgDuration: '4:32' // Mock data
      });
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8 pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading voice agents...</p>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Agents</h1>
              <p className="text-gray-600">Manage your AI voice agents for phone calls and customer interactions.</p>
            </div>
            <button 
              onClick={handleCreateAgent}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Voice Agent
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-green-600">
                +2 this month
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalAgents}</div>
            <div className="text-sm text-gray-500">Total Voice Agents</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm font-semibold text-green-600">
                +1 today
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.activeAgents}</div>
            <div className="text-sm text-gray-500">Active Agents</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <PhoneCall className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-green-600">
                +18% vs last month
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalCalls.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Calls</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-sm font-semibold text-green-600">
                -0:15 vs last month
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.avgDuration}</div>
            <div className="text-sm text-gray-500">Avg Call Duration</div>
          </div>
        </div>

        {/* Agents List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Voice Agents</h2>
          </div>
          
          {agents.length === 0 ? (
            <div className="p-12 text-center">
              <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No voice agents yet</h3>
              <p className="text-gray-600 mb-6">Create your first voice agent to start handling phone calls automatically.</p>
              <button 
                onClick={handleCreateAgent}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Create Your First Voice Agent
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <div key={agent.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          agent.status === 'active' ? 'bg-green-100' : 
                          agent.status === 'paused' ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          <Bot className={`h-6 w-6 ${
                            agent.status === 'active' ? 'text-green-600' : 
                            agent.status === 'paused' ? 'text-yellow-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                          <p className="text-sm text-gray-500">{agent.agent_type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        agent.status === 'active' ? 'bg-green-100 text-green-800' :
                        agent.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {agent.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {agent.description || 'No description provided'}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Volume2 className="h-4 w-4 mr-1" />
                        {agent.language || 'en-US'}
                      </div>
                      <div className="flex items-center">
                        <PhoneCall className="h-4 w-4 mr-1" />
                        {Math.floor(Math.random() * 100)} calls
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleAgentStatus(agent)}
                        className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          agent.status === 'active'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {agent.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleEditAgent(agent)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      
                      {agent.status === 'draft' && (
                        <button
                          onClick={() => deployAgent(agent)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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