import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Users, Star, Building2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Marketplace: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'nhancio' | 'partner' | 'all'>('nhancio');

  // Fetch agents from Supabase
  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from('agents').select('*');
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
  }, []);

  const getCurrentAgents = () => {
    if (activeTab === 'all') return agents;
    return agents.filter(agent => agent.category === activeTab);
  };

  const AgentCard = ({ agent }: { agent: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group w-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          {agent.image ? (
            <img src={agent.image} alt={agent.name} className="w-16 h-16 object-cover rounded-full" />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">{agent.rating || '--'}</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent.name}</h3>

        {agent.partner && (
          <div className="flex items-center mb-2">
            <Building2 className="h-3 w-3 text-blue-500 mr-1" />
            <span className="text-xs text-blue-600 font-medium">{agent.partner}</span>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {agent.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {(agent.features || []).map((feature: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
              {feature}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-blue-600">
            ${agent.cost || '--'}/month
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-sm font-medium">
            Deploy Agent
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      <div className="w-full lg:ml-64 p-4 sm:p-8 pt-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Agent Marketplace</h1>
          <p className="text-sm sm:text-base text-gray-600">Discover and deploy pre-built AI agents for your business needs.</p>
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
              <Sparkles className="h-4 w-4 mr-2" />
              Nhancio Agents
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'partner'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Partner Agents
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Users className="h-4 w-4 mr-2" />
              All Agents
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