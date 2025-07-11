import React, { useState } from 'react';
import { Video, Play, Settings, Users, Clock, BarChart3 } from 'lucide-react';

interface VideoAgentCardProps {
  agent: {
    id: string;
    name: string;
    description?: string;
    image?: string;
  };
}

const VideoAgentCard: React.FC<VideoAgentCardProps> = ({
  agent
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow p-6 flex flex-col items-center">
      {agent.image ? (
        <img src={agent.image} alt={agent.name} className="w-16 h-16 object-cover rounded-full mb-3" />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-3">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">{agent.name}</h3>
      <p className="text-sm text-gray-600 mb-0 line-clamp-4 text-center">
        {agent.description || 'No description provided'}
      </p>
    </div>
  );
};

export default VideoAgentCard;