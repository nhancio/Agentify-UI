import React, { useState } from 'react';
import { Bot, Save, Mic, Settings } from 'lucide-react';
import { mockAgent } from '../data/mockData';

export const AgentSetup: React.FC = () => {
  const [agent, setAgent] = useState(mockAgent);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log('Saving agent configuration:', agent);
    setIsEditing(false);
  };

  const handleToggleVoiceCloning = () => {
    setAgent(prev => ({
      ...prev,
      voiceCloning: {
        ...prev.voiceCloning,
        enabled: !prev.voiceCloning.enabled
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Agent Setup</h1>
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Configuration</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bot className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Basic Configuration</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={agent.name}
                onChange={(e) => setAgent(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <input
                type="text"
                value={agent.purpose}
                onChange={(e) => setAgent(prev => ({ ...prev, purpose: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={agent.status}
                onChange={(e) => setAgent(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Voice Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Mic className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Voice Configuration</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Type
              </label>
              <select
                value={agent.voiceType}
                onChange={(e) => setAgent(prev => ({ ...prev, voiceType: e.target.value as 'male' | 'female' | 'cloned' }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="cloned">Cloned Voice</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Voice Cloning</h3>
                <p className="text-sm text-gray-600">Enable custom voice cloning</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={agent.voiceCloning.enabled}
                  onChange={handleToggleVoiceCloning}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {agent.voiceCloning.enabled && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Cloning Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    agent.voiceCloning.status === 'completed' 
                      ? 'bg-green-100 text-green-700'
                      : agent.voiceCloning.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {agent.voiceCloning.status}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
        <textarea
          value={agent.jobDescription}
          onChange={(e) => setAgent(prev => ({ ...prev, jobDescription: e.target.value }))}
          disabled={!isEditing}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          placeholder="Describe what your agent should do..."
        />
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enabled Features</h2>
        <div className="space-y-3">
          {agent.features.map((feature, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-900">{feature}</span>
              <span className="text-sm text-green-600">Enabled</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};