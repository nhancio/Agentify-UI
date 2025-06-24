import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Phone, 
  Video,
  Users,
  Heart,
  Play
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Marketplace: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [agentTemplates, setAgentTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch agent templates from Supabase
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('agent_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching agent templates:', error);
        setAgentTemplates([]);
      } else {
        setAgentTemplates(data || []);
      }
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  const categories = [
    { id: 'all', label: 'All Categories' },
    // You can dynamically generate categories from agentTemplates if needed
    { id: 'hr', label: 'HR & Recruitment' },
    { id: 'hospitality', label: 'Hospitality' },
    { id: 'sales', label: 'Sales & Lead Gen' },
    { id: 'support', label: 'Customer Support' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'finance', label: 'Finance & Banking' }
  ];

  const filteredAgents = agentTemplates.filter(agent => {
    const matchesCategory = selectedCategory === 'all' || (agent.category && agent.category.toLowerCase().includes(selectedCategory));
    const matchesSearch = agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />
      <div className="lg:ml-64 flex-1 p-4 sm:p-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Marketplace</h1>
          <p className="text-gray-600">Discover and deploy pre-built AI agents for your business needs.</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-5 w-5 mr-2 text-gray-400" />
              Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{category.label}</span>
                    {/* Optionally show count if you fetch category counts */}
                  </button>
                ))}
              </div>
              {/* ...existing filter UI... */}
            </div>
          </div>

          {/* Agent Templates Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading templates...</div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No agents found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                  <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={agent.image || 'https://via.placeholder.com/300x200?text=Agent'} 
                        alt={agent.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        {(agent.tags || []).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                        </button>
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                          <Play className="h-4 w-4 text-gray-600 hover:text-blue-500" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{agent.name}</h3>
                          <p className="text-sm text-gray-600">{agent.category}</p>
                        </div>
                        <div className="flex items-center">
                          {agent.agent_type?.includes('video') ? (
                            <Video className="h-4 w-4 text-purple-600 mr-1" />
                          ) : (
                            <Phone className="h-4 w-4 text-blue-600 mr-1" />
                          )}
                          <span className="text-sm text-gray-600">{agent.agent_type}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(agent.features || []).slice(0, 3).map((feature: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="flex items-center mr-4">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-gray-900 ml-1">{agent.rating || '4.5'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Download className="h-4 w-4 mr-1" />
                            {(agent.download_count || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {agent.price ? (agent.price === 0 ? 'Free' : `$${agent.price}`) : 'Free'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {agent.author || 'Unknown'}
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                            Preview
                          </button>
                          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg text-sm font-medium flex items-center">
                            <Download className="h-4 w-4 mr-1" />
                            {agent.price === 0 || agent.price === 'Free' ? 'Install' : 'Buy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Load More */}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;