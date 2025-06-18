import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Phone, 
  Clock, 
  Users, 
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Calendar,
  Download
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const stats = [
    {
      title: 'Total Calls',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Phone,
      color: 'blue'
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Avg Duration',
      value: '4:32',
      change: '-0:15',
      trend: 'down',
      icon: Clock,
      color: 'orange'
    },
    {
      title: 'Leads Generated',
      value: '1,423',
      change: '+18.3%',
      trend: 'up',
      icon: Users,
      color: 'purple'
    }
  ];

  const agentPerformance = [
    {
      name: 'HR Screening Assistant',
      calls: 856,
      successRate: 96.2,
      avgDuration: '5:12',
      leads: 423,
      trend: 'up'
    },
    {
      name: 'Hotel Booking Agent',
      calls: 634,
      successRate: 92.8,
      avgDuration: '3:45',
      leads: 312,
      trend: 'up'
    },
    {
      name: 'Sales Qualifier',
      calls: 523,
      successRate: 89.4,
      avgDuration: '6:28',
      leads: 287,
      trend: 'down'
    },
    {
      name: 'Customer Support Bot',
      calls: 834,
      successRate: 94.7,
      avgDuration: '4:15',
      leads: 401,
      trend: 'up'
    }
  ];

  const callOutcomes = [
    { outcome: 'Qualified Lead', count: 1247, percentage: 43.8, color: 'green' },
    { outcome: 'Appointment Booked', count: 856, percentage: 30.1, color: 'blue' },
    { outcome: 'Information Provided', count: 423, percentage: 14.9, color: 'orange' },
    { outcome: 'Transferred to Human', count: 234, percentage: 8.2, color: 'purple' },
    { outcome: 'Call Abandoned', count: 87, percentage: 3.0, color: 'red' }
  ];

  const recentCalls = [
    { id: 1, agent: 'HR Screening Assistant', caller: '+1 (555) 123-4567', duration: '4:32', outcome: 'Qualified', time: '2m ago', success: true },
    { id: 2, agent: 'Hotel Booking Agent', caller: '+1 (555) 987-6543', duration: '2:18', outcome: 'Booked', time: '5m ago', success: true },
    { id: 3, agent: 'Sales Qualifier', caller: '+1 (555) 456-7890', duration: '6:45', outcome: 'Follow-up', time: '8m ago', success: true },
    { id: 4, agent: 'Customer Support Bot', caller: '+1 (555) 321-0987', duration: '1:23', outcome: 'Transferred', time: '12m ago', success: false },
    { id: 5, agent: 'HR Screening Assistant', caller: '+1 (555) 654-3210', duration: '5:17', outcome: 'Qualified', time: '15m ago', success: true }
  ];

  const timeRanges = [
    { id: '24h', label: 'Last 24 hours' },
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 90 days' }
  ];

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
              <p className="text-gray-600">Track your AI agents' performance and optimize conversations.</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {timeRanges.map((range) => (
                  <option key={range.id} value={range.id}>{range.label}</option>
                ))}
              </select>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.title}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Call Volume & Success Rate</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Calls</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Success Rate</span>
                  </div>
                </div>
              </div>
              
              {/* Mock Chart */}
              <div className="h-64 bg-gradient-to-t from-gray-50 to-white rounded-lg flex items-end justify-between p-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <div 
                      className="w-8 bg-blue-500 rounded-t"
                      style={{ height: `${Math.random() * 100 + 50}px` }}
                    ></div>
                    <div className="text-xs text-gray-500">
                      {new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Performance Table */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Agent Performance</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm font-medium text-gray-500 border-b border-gray-200">
                        <th className="pb-3">Agent</th>
                        <th className="pb-3">Calls</th>
                        <th className="pb-3">Success Rate</th>
                        <th className="pb-3">Avg Duration</th>
                        <th className="pb-3">Leads</th>
                        <th className="pb-3">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {agentPerformance.map((agent, index) => (
                        <tr key={index} className="text-sm">
                          <td className="py-4 font-medium text-gray-900">{agent.name}</td>
                          <td className="py-4 text-gray-600">{agent.calls.toLocaleString()}</td>
                          <td className="py-4">
                            <span className="text-green-600 font-semibold">{agent.successRate}%</span>
                          </td>
                          <td className="py-4 text-gray-600">{agent.avgDuration}</td>
                          <td className="py-4 text-gray-600">{agent.leads}</td>
                          <td className="py-4">
                            {agent.trend === 'up' ? (
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-500" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Call Outcomes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Outcomes</h3>
              <div className="space-y-3">
                {callOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 bg-${outcome.color}-500 rounded-full mr-3`}></div>
                      <span className="text-sm text-gray-700">{outcome.outcome}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{outcome.count}</div>
                      <div className="text-xs text-gray-500">{outcome.percentage}%</div>
                    </div>
                  </div>
                ))}
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          call.success ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {call.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
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

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Highlights</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Peak Hour</span>
                  <span className="font-semibold text-gray-900">2:00 PM - 3:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Best Performing Agent</span>
                  <span className="font-semibold text-gray-900">HR Assistant</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="font-semibold text-green-600">0.8s avg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;