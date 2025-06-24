import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Users, Clock, Star } from 'lucide-react';

interface VideoAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  stats: {
    conversations: number;
    avgDuration: string;
    rating: number;
  };
  features: string[];
}

const VideoAgentShowcase: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);

  // Demo video agents with realistic examples
  const videoAgents: VideoAgent[] = [
    {
      id: 'hr-assistant',
      name: 'Sarah - HR Interview Assistant',
      description: 'Professional AI recruiter that conducts initial candidate screenings with natural conversation flow.',
      category: 'Human Resources',
      videoUrl: 'https://player.vimeo.com/video/891679646?autoplay=1&loop=1&muted=1',
      thumbnailUrl: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=600',
      stats: {
        conversations: 1247,
        avgDuration: '8:32',
        rating: 4.9
      },
      features: ['Skill Assessment', 'Background Verification', 'Scheduling Integration']
    },
    {
      id: 'hotel-concierge',
      name: 'Marcus - Hotel Concierge',
      description: 'Multilingual hospitality expert providing 24/7 guest services and booking assistance.',
      category: 'Hospitality',
      videoUrl: 'https://player.vimeo.com/video/891679646?autoplay=1&loop=1&muted=1',
      thumbnailUrl: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=600',
      stats: {
        conversations: 892,
        avgDuration: '5:18',
        rating: 4.8
      },
      features: ['Room Booking', 'Local Recommendations', 'Multilingual Support']
    },
    {
      id: 'sales-agent',
      name: 'Alex - Sales Representative',
      description: 'Persuasive sales professional that qualifies leads and schedules demos with high conversion rates.',
      category: 'Sales & Marketing',
      videoUrl: 'https://player.vimeo.com/video/891679646?autoplay=1&loop=1&muted=1',
      thumbnailUrl: 'https://images.pexels.com/photos/3760778/pexels-photo-3760778.jpeg?auto=compress&cs=tinysrgb&w=600',
      stats: {
        conversations: 2156,
        avgDuration: '12:45',
        rating: 4.7
      },
      features: ['Lead Qualification', 'Demo Scheduling', 'CRM Integration']
    },
    {
      id: 'customer-support',
      name: 'Emma - Support Specialist',
      description: 'Empathetic customer service agent that resolves issues and ensures customer satisfaction.',
      category: 'Customer Support',
      videoUrl: 'https://player.vimeo.com/video/891679646?autoplay=1&loop=1&muted=1',
      thumbnailUrl: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=600',
      stats: {
        conversations: 3421,
        avgDuration: '6:12',
        rating: 4.6
      },
      features: ['Issue Resolution', 'Ticket Creation', 'Knowledge Base']
    }
  ];

  const handleVideoPlay = (agentId: string) => {
    setActiveVideo(activeVideo === agentId ? null : agentId);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-6">
            <Play className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Live Video Agents in Action</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Meet Your AI Video Team
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ready to Work 24/7
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Watch our AI video agents in action. Each agent is powered by Tavus technology, 
            providing natural, face-to-face interactions that feel completely human.
          </p>
        </div>

        {/* Video Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {videoAgents.map((agent, index) => (
            <div 
              key={agent.id} 
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Video Container */}
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                {activeVideo === agent.id ? (
                  <iframe
                    src={`${agent.videoUrl}&muted=${muted ? 1 : 0}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div 
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => handleVideoPlay(agent.id)}
                  >
                    <img 
                      src={agent.thumbnailUrl} 
                      alt={agent.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                        <Play className="w-8 h-8 text-gray-800 ml-1" />
                      </div>
                    </div>
                    
                    {/* Agent Info Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                        <h3 className="font-semibold text-gray-900 mb-1">{agent.name}</h3>
                        <p className="text-sm text-gray-600">{agent.category}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Controls */}
                {activeVideo === agent.id && (
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                      className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVideo(null);
                      }}
                      className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Live Indicator */}
                <div className="absolute top-4 left-4">
                  <div className="flex items-center px-3 py-1 bg-red-500 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                    <span className="text-white text-xs font-semibold">LIVE</span>
                  </div>
                </div>
              </div>

              {/* Agent Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {agent.category}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      {agent.stats.rating}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                  {agent.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-blue-600 mr-1" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {agent.stats.conversations.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Conversations</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {agent.stats.avgDuration}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Avg Duration</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {agent.stats.rating}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {agent.features.map((feature, featureIndex) => (
                      <span
                        key={featureIndex}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleVideoPlay(agent.id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {activeVideo === agent.id ? 'Watching' : 'Watch Demo'}
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Try Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Demo Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Experience the Future of Customer Interaction
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              These aren't pre-recorded videos. Each agent responds in real-time, 
              understands context, and provides personalized interactions just like a human would.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Real-Time Conversations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Powered by Tavus AI, each agent responds naturally to any question or scenario.
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Human-Like Presence</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Facial expressions, natural speech patterns, and authentic personality traits.
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">24/7 Availability</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Never miss an opportunity. Your AI team works around the clock.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Build Your AI Video Team?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Create your own video agents in minutes. Upload a training video, 
              configure the personality, and deploy instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Start Free Trial
              </button>
              <button
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                onClick={() => window.open('https://calendly.com/nithindidigam/platform-demo', '_blank')}
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoAgentShowcase;