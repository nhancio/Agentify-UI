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
  Volume2,
  Zap,
  AlertCircle
} from 'lucide-react';
import { agentService } from '../lib/api';
import { voiceAgentService } from '../lib/voiceAgent';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const VoiceAgents: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [agentCredits, setAgentCredits] = useState<number>(10); // Default agent deployment cost
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
  const navigate = useNavigate();

  const fetchUserCredits = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user credits:', error);
        return;
      }

      setUserCredits(data.credits || 0);
    } catch (err) {
      console.error('Error fetching user credits:', err);
    }
  };

  const fetchAgents = async () => {
    setLoading(true);
    setError('');
    try {
      if (!user) {
        setAgents([]);
        setLoading(false);
        return;
      }
      console.log('Fetching agents for user:', user.id);

      // Fetch subscribed agents using the user_agent_subscriptions table
      const { data: subscribedAgents, error: agentsError } = await supabase
        .from('user_agent_subscriptions')
        .select(`
          agent_id,
          agents (*)
        `)
        .eq('user_id', user.id);

      if (agentsError) {
        console.error('Error fetching subscribed agents:', agentsError);
        throw agentsError;
      }

      console.log('Subscribed agents data:', subscribedAgents);

      // Extract the agents from the joined data
      const agents = subscribedAgents?.map(subscription => subscription.agents).filter(Boolean) || [];
      console.log('Extracted agents:', agents);
      setAgents(agents);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Failed to fetch agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchUserCredits();
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

  const handleDeployAgent = async (agent: any) => {
    try {
      // Check if user has enough credits
      if (userCredits < agentCredits) {
        // Show alert message
        alert(`Insufficient credits! You need ${agentCredits} credits to deploy this agent, but you only have ${userCredits} credits. Redirecting to profile page to add more credits.`);

        // Redirect to profile page to add more credits
        navigate('/profile');
        return;
      }

      // Deploy the agent
      await voiceAgentService.deployAgent(agent.id);

      // Deduct credits from user account
      const { error } = await supabase
        .from('users')
        .update({ credits: userCredits - agentCredits })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating credits:', error);
      } else {
        // Refresh user credits
        fetchUserCredits();
        // Refresh agents list
        fetchAgents();
      }
    } catch (err) {
      console.error('Error deploying agent:', err);
      setError('Failed to deploy agent');
    }
  };

  const handleAddCredits = () => {
    navigate('/profile');
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
              <p className="text-gray-600">Your subscribed voice agents for phone calls and customer interactions.</p>
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
                    <img src={agent.avatar_url || agent.logo} alt={agent.name} className="w-16 h-16 object-cover rounded-full mb-3" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-3">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">{agent.name}</h3>
                  <div className="text-xs text-gray-500 mb-2 text-center">{agent.id}</div>
                  <div className="text-sm text-gray-700 mb-1 text-center">{agent.description || 'No profile/description'}</div>
                  <div className="text-xs text-gray-400 text-center mb-4">{agent.created_at ? new Date(agent.created_at).toLocaleString() : ''}</div>

                  {/* Credit Information */}
                  <div className="w-full mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Your Credits:</span>
                      <span className="font-semibold text-blue-600">{userCredits}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600">Deploy Cost:</span>
                      <span className="font-semibold text-orange-600">{agentCredits}</span>
                    </div>
                  </div>

                  {/* Deploy Button */}
                  <button
                    onClick={() => handleDeployAgent(agent)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Deploy Agent
                  </button>
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