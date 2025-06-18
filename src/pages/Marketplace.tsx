import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Bot, 
  Phone, 
  Video,
  Users,
  Building,
  ShoppingCart,
  Heart,
  Clock,
  CheckCircle,
  Play
} from 'lucide-react';

const Marketplace: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'All Categories', count: 48 },
    { id: 'hr', label: 'HR & Recruitment', count: 12 },
    { id: 'hospitality', label: 'Hospitality', count: 8 },
    { id: 'sales', label: 'Sales & Lead Gen', count: 15 },
    { id: 'support', label: 'Customer Support', count: 10 },
    { id: 'healthcare', label: 'Healthcare', count: 6 },
    { id: 'finance', label: 'Finance & Banking', count: 7 }
  ];

  const agentTemplates = [
    {
      id: 1,
      name: 'HR Interview Assistant',
      description: 'Conducts initial candidate screening interviews with intelligent follow-up questions.',
      category: 'HR & Recruitment',
      type: 'Voice',
      rating: 4.9,
      downloads: 1247,
      price: 'Free',
      author: 'VoiceGenie Team',
      features: ['Skill Assessment', 'Background Check', 'Scheduling'],
      tags: ['Popular', 'New'],
      image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 2,
      name: 'Hotel Concierge Bot',
      description: 'Handles room bookings, amenity inquiries, and guest services with multilingual support.',
      category: 'Hospitality',
      type: 'Voice + Video',
      rating: 4.8,
      downloads: 892,
      price: '$29',
      author: 'HospitalityPro',
      features: ['Room Booking', 'Multilingual', 'Payment Processing'],
      tags: ['Premium', 'Featured'],
      image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 3,
      name: 'Sales Qualifier Pro',
      description: 'Qualifies leads, books appointments, and nurtures prospects through intelligent conversations.',
      category: 'Sales & Lead Gen',
      type: 'Voice',
      rating: 4.7,
      downloads: 2156,
      price: '$19',
      author: 'SalesForce Inc',
      features: ['Lead Scoring', 'CRM Integration', 'Auto Follow-up'],
      tags: ['Best Seller'],
      image: 'https://images.pexels.com/photos/3760778/pexels-photo-3760778.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 4,
      name: 'Customer Support Hero',
      description: 'Resolves common customer issues, escalates complex problems, and ensures satisfaction.',
      category: 'Customer Support',
      type: 'Video',
      rating: 4.6,
      downloads: 673,
      price: 'Free',
      author: 'SupportAI',
      features: ['Ticket Creation', 'Knowledge Base', 'Escalation'],
      tags: ['Popular'],
      image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 5,
      name: 'Medical Appointment Scheduler',
      description: 'Schedules patient appointments, handles insurance verification, and sends reminders.',
      category: 'Healthcare',
      type: 'Voice',
      rating: 4.9,
      downloads: 445,
      price: '$39',
      author: 'HealthTech Solutions',
      features: ['HIPAA Compliant', 'Insurance Check', 'Reminders'],
      tags: ['Premium', 'Verified'],
      image: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 6,
      name: 'Loan Application Assistant',
      description: 'Guides customers through loan applications, collects required documents, and pre-qualifies.',
      category: 'Finance & Banking',
      type: 'Voice + Video',
      rating: 4.5,
      downloads: 328,
      price: '$49',
      author: 'FinanceBot Co',
      features: ['Document Collection', 'Credit Check', 'Compliance'],
      tags: ['Enterprise'],
      image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=300'
    }
  ];

  const filteredAgents = agentTemplates.filter(agent => {
    const matchesCategory = selectedCategory === 'all' || agent.category.toLowerCase().includes(selectedCategory);
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8 pt-24">
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
                    <span className="text-sm text-gray-500">{category.count}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Filter by Type</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Voice Only</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Video Only</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Voice + Video</span>
                  </label>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Free</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">$1 - $50</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">$50+</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Templates Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAgents.map((agent) => (
                <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={agent.image} 
                      alt={agent.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {agent.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            tag === 'Popular' ? 'bg-green-100 text-green-800' :
                            tag === 'New' ? 'bg-blue-100 text-blue-800' :
                            tag === 'Premium' ? 'bg-purple-100 text-purple-800' :
                            tag === 'Featured' ? 'bg-yellow-100 text-yellow-800' :
                            tag === 'Best Seller' ? 'bg-red-100 text-red-800' :
                            tag === 'Verified' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
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
                        {agent.type.includes('Video') ? (
                          <Video className="h-4 w-4 text-purple-600 mr-1" />
                        ) : (
                          <Phone className="h-4 w-4 text-blue-600 mr-1" />
                        )}
                        <span className="text-sm text-gray-600">{agent.type}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {agent.features.slice(0, 3).map((feature, index) => (
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
                          <span className="text-sm font-medium text-gray-900 ml-1">{agent.rating}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Download className="h-4 w-4 mr-1" />
                          {agent.downloads.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {agent.price}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {agent.author}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                          Preview
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg text-sm font-medium flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          {agent.price === 'Free' ? 'Install' : 'Buy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-12 text-center">
              <button className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                Load More Templates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;