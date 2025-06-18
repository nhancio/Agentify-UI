import React from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Bot, 
  Phone, 
  TrendingUp, 
  Users, 
  Plus,
  Play,
  Pause,
  Settings,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Active Agents',
      value: '12',
      change: '+2 this month',
      trend: 'up',
      icon: Bot,
      color: 'blue'
    },
    {
      title: 'Total Calls',
      value: '1,247',
      change: '+18% vs last month',
      trend: 'up',
      icon: Phone,
      color: 'green'
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      change: '+2.1% improvement',
      trend: 'up',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Leads Generated',
      value: '328',
      change: '+12% vs last month',
      trend: 'up',
      icon: Users,
      color: 'orange'
    }
  ];

  const agents = [
    {
      id: 1,
      name: 'HR Screening Assistant',
      type: 'Voice',
      status: 'active',
      calls: 234,
      successRate: 96,
      lastCall: '2 minutes ago'
    },
    {
      id: 2,
      name: 'Hotel Booking Agent',
      type: 'Voice + Video',
      status: 'active',
      calls: 189,
      successRate: 92,
      lastCall: '15 minutes ago'
    },
    {
      id: 3,
      name: 'Sales Qualifier',
      type: 'Voice',
      status: 'paused',
      calls: 167,
      successRate: 89,
      lastCall: '2 hours ago'
    },
    {
      id: 4,
      name: 'Customer Support Bot',
      type: 'Video',
      status: 'active',
      calls: 312,
      successRate: 94,
      lastCall: '5 minutes ago'
    }
  ];

  const recentCalls = [
    {
      id: 1,
      agent: 'HR Screening Assistant',
      caller: '+1 (555) 123-4567',
      duration: '4:32',
      status: 'completed',
      outcome: 'Qualified candidate',
      time: '2 min ago'
    },
    {
      id: 2,
      agent: 'Hotel Booking Agent',
      caller: '+1 (555) 987-6543',
      duration: '2:18',
      status: 'completed',
      outcome: 'Booking confirmed',
      time: '15 min ago'
    },
    {
      id: 3,
      agent: 'Sales Qualifier',
      caller: '+1 (555) 456-7890',
      duration: '6:45',
      status: 'completed',
      outcome: 'Follow-up scheduled',
      time: '1 hour ago'
    }
  ];

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Monitor your AI agents' performance and manage your automated conversations.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className={`text-sm font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800`}>
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.title}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agents List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Your AI Agents</h2>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    New Agent
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          agent.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Bot className={`h-5 w-5 ${
                            agent.status === 'active' ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{agent.type}</span>
                            <span>•</span>
                            <span>{agent.calls} calls</span>
                            <span>•</span>
                            <span>{agent.successRate}% success</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          agent.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {agent.status}
                        </span>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          {agent.status === 'active' ? (
                            <Pause className="h-4 w-4 text-gray-600" />
                          ) : (
                            <Play className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Settings className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-end justify-center p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">94.2%</div>
                  <div className="text-sm text-gray-600">Avg Success Rate</div>
                </div>
              </div>
            </div>

            {/* Recent Calls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Calls</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {recentCalls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{call.caller}</div>
                          <div className="text-xs text-gray-500">{call.outcome}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-900">{call.duration}</div>
                        <div className="text-xs text-gray-500">{call.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;