import React, { useState } from 'react';
import { Video, Play, Settings, Users, Clock, BarChart3 } from 'lucide-react';

interface VideoAgentCardProps {
  agent: {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'paused' | 'draft';
    replicaId: string;
    conversationsCount?: number;
    avgDuration?: string;
    successRate?: number;
  };
  onEdit: (agent: any) => void;
  onToggleStatus: (agent: any) => void;
  onStartConversation: (agent: any) => void;
}

const VideoAgentCard: React.FC<VideoAgentCardProps> = ({
  agent,
  onEdit,
  onToggleStatus,
  onStartConversation
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartConversation = async () => {
    setIsLoading(true);
    try {
      await onStartConversation(agent);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Video Preview */}
      <div className="relative h-48 bg-gray-900 flex items-center justify-center">
        <Video className="h-12 w-12 text-white opacity-50" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            agent.status === 'active' ? 'bg-green-100 text-green-800' :
            agent.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-600'
          }`}>
            {agent.status}
          </span>
        </div>

        {/* Play Button Overlay */}
        <button
          onClick={handleStartConversation}
          disabled={isLoading || agent.status !== 'active'}
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
        >
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            ) : (
              <Play className="h-6 w-6 text-gray-800 ml-1" />
            )}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{agent.name}</h3>
            <p className="text-sm text-gray-500">Video Agent</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {agent.description || 'No description provided'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm font-semibold text-gray-900">
                {agent.conversationsCount || 0}
              </span>
            </div>
            <div className="text-xs text-gray-500">Conversations</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-semibold text-gray-900">
                {agent.avgDuration || '0:00'}
              </span>
            </div>
            <div className="text-xs text-gray-500">Avg Duration</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center mb-1">
              <BarChart3 className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm font-semibold text-gray-900">
                {agent.successRate || 0}%
              </span>
            </div>
            <div className="text-xs text-gray-500">Success Rate</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleStatus(agent)}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              agent.status === 'active'
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {agent.status === 'active' ? 'Pause' : 'Activate'}
          </button>
          
          <button
            onClick={() => onEdit(agent)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleStartConversation}
            disabled={agent.status !== 'active'}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoAgentCard;