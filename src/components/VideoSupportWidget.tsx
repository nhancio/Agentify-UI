import React, { useState } from 'react';
import { Video, MessageSquare, Phone, Mail, X, Play, Volume2, VolumeX, Minimize2, AlertCircle } from 'lucide-react';
import { tavusService, ISO_TO_LANGUAGE } from '../lib/tavus';

interface VideoSupportWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  agentName?: string;
  agentRole?: string;
}

const VideoSupportWidget: React.FC<VideoSupportWidgetProps> = ({
  isOpen,
  onClose,
  agentName = 'Emma',
  agentRole = 'Customer Support Specialist'
}) => {
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState<string>('');

  // Your customer support replica and persona IDs
  const CUSTOMER_SUPPORT_REPLICA_ID = 'rf4703150052';
  const CUSTOMER_SUPPORT_PERSONA_ID = 'p7f9fc0aa93b';

  const startVideoConversation = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check if Tavus is configured
      const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
      if (!apiKey) {
        throw new Error('Video support is not configured. Please contact support via email.');
      }

      // Test connection
      const connectionTest = await tavusService.testConnection();
      if (!connectionTest.success) {
        throw new Error(`Video service unavailable: ${connectionTest.message}`);
      }

      const conversation = await tavusService.createConversation({
        replica_id: CUSTOMER_SUPPORT_REPLICA_ID,
        persona_id: CUSTOMER_SUPPORT_PERSONA_ID,
        conversation_name: `Support Chat - ${Date.now()}`,
        properties: {
          max_call_duration: 1800, // 30 minutes
          enable_recording: true,
          enable_transcription: true,
          language: ISO_TO_LANGUAGE['en'] // Use full language name
        }
      });

      // Use the correct property from Tavus response
      setActiveConversation({
        ...conversation,
        url: conversation.conversation_url // always use this for iframe
      });
      setError('');
    } catch (error) {
      console.error('Error starting video conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to start video chat';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const endConversation = async () => {
    if (activeConversation) {
      try {
        await tavusService.endConversation(activeConversation.conversationId);
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
    }
    setActiveConversation(null);
    setError('');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              {activeConversation && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{agentName}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{agentRole}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {activeConversation && (
              <>
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-gray-600" /> : <Volume2 className="w-4 h-4 text-gray-600" />}
                </button>
                <button
                  onClick={endConversation}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  title="End conversation"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex-1 flex flex-col h-[536px]">
            {activeConversation ? (
              /* Video Chat Area */
              <div className="flex-1 relative bg-gray-900">
                <iframe
                  src={`${activeConversation.url}&muted=${isMuted ? 1 : 0}`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; microphone; camera"
                  allowFullScreen
                />
                
                {/* Video overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{agentName}</p>
                        <p className="text-white/80 text-xs">Live video support</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs">LIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Welcome Screen */
              <div className="flex-1 p-6 flex flex-col">
                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Hi! I'm {agentName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Your AI-powered {agentRole.toLowerCase()}. I'm here to help you with any questions or issues.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">I can help you with:</h4>
                    <ul className="text-sm text-green-800 dark:text-green-400 space-y-1">
                      <li>• Account setup and configuration</li>
                      <li>• Voice and video agent creation</li>
                      <li>• Billing and subscription questions</li>
                      <li>• Technical troubleshooting</li>
                      <li>• Feature demonstrations</li>
                    </ul>
                  </div>

                  {/* Configuration Status */}
                  {!import.meta.env.VITE_TAVUS_API_KEY && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900 dark:text-yellow-300 text-sm">Video Chat Setup Required</h4>
                          <p className="text-yellow-800 dark:text-yellow-400 text-xs mt-1">
                            Video support requires Tavus configuration. Please use text chat or email for now.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-auto">
                  <button
                    onClick={startVideoConversation}
                    disabled={loading || !import.meta.env.VITE_TAVUS_API_KEY}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Play className="w-4 h-4 mr-2" />
                        {import.meta.env.VITE_TAVUS_API_KEY ? 'Start Video Chat' : 'Video Chat (Setup Required)'}
                      </div>
                    )}
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button className="flex flex-col items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Text</span>
                    </button>
                    <button 
                      onClick={() => window.location.href = 'tel:+1-555-SUPPORT'}
                      className="flex flex-col items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Call</span>
                    </button>
                    <button 
                      onClick={() => window.location.href = 'mailto:support@agentlybot.com'}
                      className="flex flex-col items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Email</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoSupportWidget;