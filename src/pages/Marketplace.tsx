import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Marketplace: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch agents from Supabase
  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from Supabase 'agents' table
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

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />
      <div className="lg:ml-64 flex-1 p-4 sm:p-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Marketplace</h1>
          <p className="text-gray-600">Discover and deploy pre-built AI agents for your business needs.</p>
        </div>

        {/* Agent Templates Grid */}
        <div className="w-full">
          {loading ? (
            <div className="text-center py-12">Loading agents...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No agents found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                  <div className="relative h-48 overflow-hidden flex items-center justify-center bg-gray-50">
                    {agent.logo ? (
                      <img
                        src={agent.logo}
                        alt={agent.name}
                        className="w-full h-full object-contain p-6"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
                        {agent.name?.[0] || 'A'}
                      </div>
                    )}
                    {agent.category && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {agent.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{agent.name}</h3>
                        <p className="text-sm text-gray-600">{agent.created_by || ''}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-blue-600">
                          {agent.cost ? `$${agent.cost}` : 'Free'}
                        </span>
                        <span className="text-xs text-gray-400">Cost</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.description}</p>
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {agent.subscribers || 0} Subscribers
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg text-sm font-medium">
                          View Agent
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg text-sm font-medium">
                          Hire Agent
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;