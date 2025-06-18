import React, { useState } from 'react';
import { Play, Pause, BarChart3, Phone, Users, TrendingUp } from 'lucide-react';

const DashboardPreview: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const mockData = {
    calls: 1247,
    agents: 5,
    successRate: 94.2,
    leads: 328
  };

  return (
    <div 
      className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto cursor-pointer group"
      onMouseEnter={() => setIsPlaying(true)}
      onMouseLeave={() => setIsPlaying(false)}
    >
      {/* Play button overlay */}
      <div className={`absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center transition-opacity duration-300 ${
        isPlaying ? 'opacity-0' : 'opacity-100'
      }`}>
        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
          <Play className="w-8 h-8 text-gray-800 ml-1" />
        </div>
      </div>

      {/* Dashboard content */}
      <div className={`transition-all duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Phone, label: 'Total Calls', value: mockData.calls, color: 'blue' },
            { icon: Users, label: 'Active Agents', value: mockData.agents, color: 'green' },
            { icon: TrendingUp, label: 'Success Rate', value: `${mockData.successRate}%`, color: 'purple' },
            { icon: BarChart3, label: 'Leads', value: mockData.leads, color: 'orange' }
          ].map((stat, index) => (
            <div 
              key={index}
              className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-all duration-300 ${
                isPlaying ? 'transform translate-y-0 opacity-100' : 'transform translate-y-2 opacity-80'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`w-8 h-8 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-lg flex items-center justify-center mb-2`}>
                <stat.icon className={`w-4 h-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-32 flex items-end justify-between">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-500 ${
                isPlaying ? 'opacity-100' : 'opacity-60'
              }`}
              style={{
                width: '20px',
                height: `${Math.random() * 80 + 20}px`,
                transitionDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;