import React from 'react';
import { Phone, Bot, Clock, TrendingUp, Play, Pause } from 'lucide-react';
import { mockAgent, mockCallStats, mockUser } from '../data/mockData';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Agent Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Agent Status</h2>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            mockAgent.status === 'active' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {mockAgent.status === 'active' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="capitalize font-medium">{mockAgent.status}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Phone className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Phone Number</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{mockUser.phoneNumber}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Voice Type</span>
            </div>
            <p className="text-lg font-bold text-gray-900 capitalize">{mockAgent.voiceType}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Purpose</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{mockAgent.purpose}</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Total Minutes</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{mockCallStats.totalMinutes}</p>
          </div>
        </div>
      </div>

      {/* Call Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Calls</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{mockCallStats.daily}</div>
          <p className="text-sm text-gray-500">+8% from yesterday</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Calls</h3>
          <div className="text-3xl font-bold text-indigo-600 mb-2">{mockCallStats.weekly}</div>
          <p className="text-sm text-gray-500">+12% from last week</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Calls</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">{mockCallStats.monthly}</div>
          <p className="text-sm text-gray-500">+25% from last month</p>
        </div>
      </div>

      {/* Voice Cloning Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Cloning Status</h3>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            mockAgent.voiceCloning.status === 'completed' 
              ? 'bg-green-100 text-green-700'
              : mockAgent.voiceCloning.status === 'processing'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {mockAgent.voiceCloning.status}
          </div>
          {mockAgent.voiceCloning.enabled && (
            <span className="text-sm text-gray-600">Voice cloning is enabled</span>
          )}
        </div>
      </div>
    </div>
  );
};