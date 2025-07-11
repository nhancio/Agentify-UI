import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Users } from 'lucide-react';
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
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      <div className="w-full lg:ml-64 p-4 sm:p-8 pt-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Agent Marketplace</h1>
          <p className="text-sm sm:text-base text-gray-600">Discover and deploy pre-built AI agents for your business needs.</p>
        </div>

        {/* Agent Templates Grid */}
        <div className="w-full">
          {loading ? (
            <div className="text-center py-12 text-base">Loading agents...</div>
          ) : error ? (
            <div className="text-center text-red-600 text-base">{error}</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-base">No agents found.</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group w-full p-6 flex flex-col items-center">
                    {agent.image ? (
                      <img src={agent.image} alt={agent.name} className="w-16 h-16 object-cover rounded-full mb-3" />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-3">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{agent.name}</h3>
                    <p className="text-sm text-gray-600 mb-0 line-clamp-4 text-center">{agent.description ? (agent.description.length > 200 ? agent.description.slice(0, 200) + '...' : agent.description) : 'No description provided'}</p>
                    <div className="mt-2 text-base font-bold text-blue-600 text-center">
                      {(!agent.Cost || agent.Cost === 0) ? 'Free' : `$${agent.Cost}`}
                    </div>
                  </div>
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