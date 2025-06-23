import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import VideoAgentBuilder from '../components/VideoAgentBuilder';
import VideoAgentCard from '../components/VideoAgentCard';
import TavusSetup from '../components/TavusSetup';
import { 
  Video, 
  Plus,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Monitor,
  Camera,
  Settings
} from 'lucide-react';
import { tavusService, ISO_TO_LANGUAGE } from '../lib/tavus';
import { agentService } from '../lib/api';
import type { Agent } from '../lib/supabase';

const VideoAgents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [tavusConnected, setTavusConnected] = useState(false);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalConversations: 0,
    avgDuration: '0:00'
  });

  useEffect(() => {
    checkTavusConnection();
    loadAgents();
  }, []);

  const checkTavusConnection = async () => {
    try {
      const result = await tavusService.testConnection();
      setTavusConnected(result.success);
    } catch (error) {
      setTavusConnected(false);
    }
  };

  const loadAgents = async () => {
    try {
      const data = await agentService.getAgents();
      const videoAgents = data.filter(agent => 
        agent.agent_type === 'video' || agent.agent_type === 'voice_video'
      );
      setAgents(videoAgents);
      
      // Calculate stats
      setStats({
        totalAgents: videoAgents.length,
        activeAgents: videoAgents.filter(a => a.status === 'active').length,
        totalConversations: 856, // Mock data - would come from conversations table
        avgDuration: '6:32' // Mock data
      });
    } catch (error) {
      console.error('Error loading video agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = () => {
    if (!tavusConnected) {
      setShowSetup(true);
      return;
    }
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

  const handleToggleStatus = async (agent: Agent) => {
    try {
      const newStatus = agent.status === 'active' ? 'paused' : 'active';
      await agentService.updateAgent(agent.id, { status: newStatus });
      loadAgents();
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  const handleStartConversation = async (agent: Agent) => {
    try {
      // Extract replica ID from agent configuration
      const replicaId = agent.voice_settings?.replicaId || import.meta.env.VITE_TAVUS_REPLICA_ID;
      
      if (!replicaId) {
        alert('No replica configured for this agent. Please edit the agent and select a replica.');
        return;
      }

      const conversation = await tavusService.createConversation({
        replica_id: replicaId,
        conversation_name: `Live - ${agent.name}`,
        properties: {
          max_call_duration: 1800, // 30 minutes
          enable_recording: true,
          enable_transcription: true,
          language: ISO_TO_LANGUAGE[agent.language || 'en'] || agent.language || 'English'
        }
      });

      // Open conversation in new window
      if (conversation.streamUrl) {
        window.open(conversation.streamUrl, '_blank', 'width=800,height=600');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please check your Tavus configuration.');
    }
  };

  if (showSetup) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1">
          <div className="p-6 border-b border-gray-200 bg-white">
            <button
              onClick={() => setShowSetup(false)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Video Agents
            </button>
          </div>
          <TavusSetup />
        </div>
      </div>
    );
  }

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
              ← Back to Video Agents
            </button>
          </div>
          <VideoAgentBuilder 
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
            <p className="text-gray-600">Loading video agents...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Agents</h1>
              <p className="text-gray-600">Create and manage AI video agents powered by Tavus technology.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowSetup(true)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Tavus Setup
              </button>
              <button 
                onClick={handleCreateAgent}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Video Agent
              </button>
            </div>
          </div>
        </div>

        {/* Tavus Connection Warning */}
        {!tavusConnected && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <Camera className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Tavus Setup Required</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  To create video agents, you need to configure your Tavus integration first.
                </p>
                <button
                  onClick={() => setShowSetup(true)}
                  className="mt-2 text-yellow-800 hover:text-yellow-900 font-medium text-sm underline"
                >
                  Set up Tavus now →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-green-600">
                +1 this month
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalAgents}</div>
            <div className="text-sm text-gray-500">Total Video Agents</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Monitor className="h-6 w-6 text-green-600" />
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
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-green-600">
                +23% vs last month
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalConversations.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Conversations</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-sm font-semibold text-green-600">
                +1:12 vs last month
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.avgDuration}</div>
            <div className="text-sm text-gray-500">Avg Conversation</div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Video Agents</h2>
          </div>
          
          {agents.length === 0 ? (
            <div className="p-12 text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No video agents yet</h3>
              <p className="text-gray-600 mb-6">Create your first video agent to start having AI-powered video conversations.</p>
              <button 
                onClick={handleCreateAgent}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Create Your First Video Agent
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <VideoAgentCard
                    key={agent.id}
                    agent={{
                      id: agent.id,
                      name: agent.name,
                      description: agent.description,
                      status: agent.status,
                      replicaId: agent.voice_settings?.replicaId || '',
                      conversationsCount: Math.floor(Math.random() * 100),
                      avgDuration: `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                      successRate: Math.floor(Math.random() * 20) + 80
                    }}
                    onEdit={handleEditAgent}
                    onToggleStatus={handleToggleStatus}
                    onStartConversation={handleStartConversation}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h3 className="ml-3 font-semibold text-purple-900">Analytics</h3>
            </div>
            <p className="text-purple-700 text-sm mb-4">View detailed performance metrics for your video agents.</p>
            <button className="text-purple-600 font-medium hover:text-purple-700">
              View Analytics →
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="ml-3 font-semibold text-blue-900">Conversations</h3>
            </div>
            <p className="text-blue-700 text-sm mb-4">Review conversation recordings and transcripts.</p>
            <button className="text-blue-600 font-medium hover:text-blue-700">
              View Conversations →
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <h3 className="ml-3 font-semibold text-green-900">Tavus Setup</h3>
            </div>
            <p className="text-green-700 text-sm mb-4">Configure your Tavus replicas and personas.</p>
            <button 
              onClick={() => setShowSetup(true)}
              className="text-green-600 font-medium hover:text-green-700"
            >
              Tavus Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAgents;