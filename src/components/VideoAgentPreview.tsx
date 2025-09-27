import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, ExternalLink } from 'lucide-react';

interface VideoAgentPreviewProps {
  agent: {
    name: string;
    role: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    features: string[];
  };
  className?: string;
}

const VideoAgentPreview: React.FC<VideoAgentPreviewProps> = ({ agent, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ${className}`}>
      {/* Video Container */}
      <div className="relative aspect-video bg-gray-900 overflow-hidden">
        {isPlaying ? (
          <iframe
            src={`${agent.videoUrl}&autoplay=1&muted=${isMuted ? 1 : 0}`}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full cursor-pointer" onClick={togglePlay}>
            <img 
              src={agent.thumbnailUrl} 
              alt={agent.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Play className="w-6 h-6 text-gray-800 ml-1" />
              </div>
            </div>
          </div>
        )}

        {/* Video Controls */}
        {isPlaying && (
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(false);
              }}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center px-3 py-1 bg-red-500 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
            <span className="text-white text-xs font-semibold">LIVE AI</span>
          </div>
        </div>

        {/* Agent Info Badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
            <h3 className="font-semibold text-gray-900 text-sm">{agent.name}</h3>
            <p className="text-xs text-gray-600">{agent.role}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {agent.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <button 
          onClick={togglePlay}
          className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
        >
          <Play className="w-4 h-4 mr-2" />
          {isPlaying ? 'Watching Live' : 'Start Conversation'}
        </button>
      </div>
    </div>
  );
};

export default VideoAgentPreview;