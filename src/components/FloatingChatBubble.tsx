import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Bot, Video, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { tavusService, ISO_TO_LANGUAGE } from '../lib/tavus';

const VIDEO_SUPPORT_URL = 'https://tavus.daily.co/ca046e42141364c2';
const VIDEO_SUPPORT_CONVERSATION_ID = 'ca046e42141364c2';

const FloatingChatBubble: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const messages = [
    "Hi 👋 Need help? Try our AI video support!",
    "I'm Emma, your AI support agent. Ready to help!",
    "Want to see a live demo?",
    "Click to start a face-to-face conversation!"
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  // Pick customer support replica/persona IDs from .env
  const CUSTOMER_SUPPORT_REPLICA_ID = import.meta.env.VITE_TAVUS_REPLICA_ID || '';
  const CUSTOMER_SUPPORT_PERSONA_ID = import.meta.env.VITE_TAVUS_PERSONA_ID || '';

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible && !isExpanded) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isVisible, isExpanded, messages.length]);

  const startVideoSupport = async () => {
    setLoading(true);
    setError('');
    try {
      // Create a new Tavus conversation using the configured replica/persona
      if (!CUSTOMER_SUPPORT_REPLICA_ID || !CUSTOMER_SUPPORT_PERSONA_ID) {
        throw new Error('Tavus replica or persona ID not configured');
      }

      // Prepare the POST body as per Tavus API
      const body = {
        replica_id: CUSTOMER_SUPPORT_REPLICA_ID,
        persona_id: CUSTOMER_SUPPORT_PERSONA_ID,
        conversation_name: 'Support Chat',
        // Optionally add conversational_context, custom_greeting, callback_url, etc.
        properties: {
          max_call_duration: 1800,
          enable_recording: true,
          enable_closed_captions: true,
          language: 'english'
        }
      };

      // Call Tavus API directly
      const res = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_TAVUS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const convObj = await res.json();

      console.debug('[Tavus] createConversation response:', convObj);

      // Handle HTTP errors (like 400) with error message in body
      if (!res.ok) {
        // If Tavus returns { message: "..."} or { error: "...}
        const apiError = convObj?.message || convObj?.error || res.statusText;
        throw new Error(
          typeof apiError === 'string'
            ? apiError
            : JSON.stringify(apiError) || 'Tavus API error'
        );
      }

      // Use the correct fields from the new API output
      // Defensive: check for conversation_url, join_url, url, and ensure it's a string
      const conversationUrl =
        typeof convObj.conversation_url === 'string' && convObj.conversation_url
          ? convObj.conversation_url
          : typeof convObj.join_url === 'string' && convObj.join_url
          ? convObj.join_url
          : typeof convObj.url === 'string' && convObj.url
          ? convObj.url
          : '';

      const conversationId =
        typeof convObj.conversation_id === 'string' && convObj.conversation_id
          ? convObj.conversation_id
          : typeof convObj.id === 'string' && convObj.id
          ? convObj.id
          : '';

      if (!conversationUrl) {
        console.error('No conversation URL returned from Tavus. Full response:', convObj);
        throw new Error('No conversation URL returned from Tavus. Please check your Tavus dashboard for the conversation and verify if the conversation_url or join_url is present in the API response.');
      }
      if (!conversationId) {
        throw new Error('No conversation ID returned from Tavus');
      }

      setActiveConversation({
        conversationId,
        url: conversationUrl
      });
      setIsVideoMode(true);
      setError('');
    } catch (error) {
      console.error('Error starting video support:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);

      // if (errorMessage.includes('maximum concurrent')) {
      //   alert('You have reached the maximum number of concurrent video support sessions. Please end an existing session or try again later.');
      // } else 
      if (errorMessage.includes('API key')) {
        alert('Video support is not configured yet. Please contact support via email or try text chat.');
      } else if (errorMessage.includes('replica')) {
        alert('Video agent is not available right now. Please try text chat or contact us via email.');
      } else {
        alert('Unable to start video support. Please try again or contact us via email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const endVideoSupport = async () => {
    setActiveConversation(null);
    setIsVideoMode(false);
    setError('');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isExpanded ? (
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-w-xs cursor-pointer transform transition-all duration-300 hover:scale-105 animate-bounce"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Agently.ai Support
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {messages[currentMessage]}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Typing indicator */}
          <div className="flex items-center space-x-1 mt-2 ml-13">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden" style={{ width: isVideoMode ? '400px' : '320px', height: isVideoMode ? '500px' : 'auto' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {isVideoMode ? 'Emma - Support Agent' : 'Agently.ai Support'}
                </p>
                <p className="text-xs text-green-500 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  {isVideoMode ? 'Live Video Chat' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isVideoMode && activeConversation && (
                <>
                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                  </button>
                  <button
                    onClick={endVideoSupport}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="End video chat"
                  >
                    <Pause className="w-4 h-4 text-red-600" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            </div>
          </div>
          
          {/* Video Chat Area */}
          {isVideoMode && activeConversation ? (
            <div className="relative h-80 bg-gray-900">
              <iframe
                src={`${activeConversation.url}&muted=${isMuted ? 1 : 0}`}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; microphone; camera"
                allowFullScreen
              />
              
              {/* Video overlay info */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                  <p className="text-white text-xs">
                    You're chatting with Emma, our AI support specialist
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="p-4">
              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-3 mb-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                      <Video className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Emma</span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    Hi! I'm Emma, your AI support agent. I can help you with:
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                    <li>• Setting up voice agents</li>
                    <li>• Configuring video agents</li>
                    <li>• Billing and account questions</li>
                    <li>• Technical troubleshooting</li>
                  </ul>
                  
                  {/* Tavus Status */}
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                      💡 Video support powered by Tavus AI technology
                    </p>
                    {!import.meta.env.VITE_TAVUS_API_KEY && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        ⚠️ Video chat requires Tavus configuration
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={startVideoSupport}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Starting Video Chat...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Video className="w-4 h-4 mr-2" />
                      Start Video Support
                    </div>
                  )}
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Text Chat
                  </button>
                  <button 
                    onClick={() => window.location.href = 'mailto:support@agently.ai'}
                    className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    📧 Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          {!isVideoMode && (
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Powered by Agently.ai • Available 24/7
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingChatBubble;