import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Users, Star, Building2, Sparkles, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Marketplace: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'nhancio' | 'partner' | 'all'>('nhancio');
  const [deployingAgent, setDeployingAgent] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);

  const { user, signInWithGoogle } = useAuth();
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

  // Fetch agents from Supabase
  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .limit(100);
        if (error) throw error;
        setAgents(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch agents');
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
    fetchUserCredits();
  }, [user]);

  const getCurrentAgents = () => {
    if (activeTab === 'all') return agents;
    return agents.filter(agent => agent.category === activeTab);
  };

  const handleDeployAgent = async (agent: any) => {
    if (!user) {
      // Trigger Google sign-in for non-logged-in users
      signInWithGoogle();
      return;
    }

    try {
      setDeployingAgent(agent.id);

      // Check if user has enough credits
      const agentCost = agent.credits || 0;
      if (userCredits < agentCost) {
        // Show alert message
        alert(`Insufficient credits! You need ${agentCost} credits to deploy "${agent.Name}", but you only have ${userCredits} credits. Redirecting to profile page to add more credits.`);

        // Redirect to profile page to add more credits
        navigate('/profile');
        return;
      }

      // Here you would implement the actual deployment logic
      // For now, we'll just show a success message
      alert(`Agent "${agent.Name}" is being deployed to your account!`);

      // Deduct credits from user account
      const { error } = await supabase
        .from('users')
        .update({ credits: userCredits - agentCost })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating credits:', error);
      } else {
        // Refresh user credits
        fetchUserCredits();
      }

      // You could also redirect to the agent builder or dashboard
      // navigate('/voice-agents');

    } catch (error) {
      console.error('Deployment failed:', error);
      alert('Failed to deploy agent. Please try again.');
    } finally {
      setDeployingAgent(null);
    }
  };

  const AgentCard = ({ agent }: { agent: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group w-full">
      <div className="p-6">
        {/* Image */}
        <div className="flex items-center justify-between mb-4">
          {agent.image ? (
            <img src={agent.image} alt={agent["Name"]} className="w-16 h-16 object-cover rounded-full" />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent["Name"]}</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {agent.description}
        </p>

        {/* Credits and Subscribers */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-blue-700 font-medium">{agent.credits ?? '--'} credits/run</span>
          <span className="text-gray-500 text-sm">{agent["no.of_subscribers"] ?? 0} subscribers</span>
        </div>

        {/* User Credits Display */}
        {user && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Your Credits:</span>
              <span className={`font-semibold ${userCredits >= (agent.credits || 0) ? 'text-green-600' : 'text-red-600'}`}>
                {userCredits}
              </span>
            </div>
          </div>
        )}

        {/* Tag and Type as labels */}
        <div className="flex flex-wrap gap-2 mb-4">
          {agent.tag && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
              {agent.tag}
            </span>
          )}
          {agent.type && (
            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
              {agent.type}
            </span>
          )}
        </div>

        {/* Deploy Button */}
        <button
          onClick={() => handleDeployAgent(agent)}
          disabled={deployingAgent === agent.id}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white ${deployingAgent === agent.id ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {deployingAgent === agent.id ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Deploying...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Deploy Agent
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      <div className="w-full lg:ml-64 p-4 sm:p-8 pt-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Agent Marketplace</h1>
              <p className="text-sm sm:text-base text-gray-600">Discover and deploy pre-built AI agents for your business needs.</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('nhancio')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'nhancio'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Automations
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'partner'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Voice Agents
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Video Agents
            </button>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="w-full">
          {loading ? (
            <div className="text-center py-12 text-base">Loading agents...</div>
          ) : error ? (
            <div className="text-center text-red-600 text-base">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {getCurrentAgents().map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;