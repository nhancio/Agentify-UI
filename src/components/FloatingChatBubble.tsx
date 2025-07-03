import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Video, Pause, Volume2, VolumeX } from 'lucide-react';

const FloatingChatBubble: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [activeConversation, setActiveConversation] = useState<{ url: string; conversationId: string } | null>(null);
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

  const API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
  const REPLICA_ID = import.meta.env.VITE_TAVUS_REPLICA_ID;
  const PERSONA_ID = import.meta.env.VITE_TAVUS_PERSONA_ID;

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
      if (!API_KEY || !REPLICA_ID || !PERSONA_ID) {
        throw new Error('Tavus API, Persona, or Replica ID missing.');
      }

      const res = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          replica_id: REPLICA_ID,
          persona_id: PERSONA_ID,
          conversation_name: 'Support Chat',
          properties: {
            max_call_duration: 1800,
            enable_recording: true,
            enable_closed_captions: true,
            language: 'english'
          }
        })
      });

      const convObj = await res.json();

      if (!res.ok) {
        const apiError = convObj?.message || convObj?.error || res.statusText;
        throw new Error(typeof apiError === 'string' ? apiError : JSON.stringify(apiError));
      }

      const conversationUrl =
        convObj.conversation_url || convObj.join_url || convObj.url;
      const conversationId = convObj.conversation_id || convObj.id;

      if (!conversationUrl || !conversationId) {
        throw new Error('Missing conversation URL or ID in Tavus response.');
      }

      setActiveConversation({ url: conversationUrl, conversationId });
      setIsVideoMode(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error starting video support:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const endVideoSupport = () => {
    setActiveConversation(null);
    setIsVideoMode(false);
    setError('');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-xs sm:bottom-6 sm:right-6">
      {!isExpanded ? (
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 w-full max-w-xs cursor-pointer transform transition-all duration-300 hover:scale-105 animate-bounce"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Support</p>
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
        </div>
      ) : (
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-xs sm:max-w-sm md:max-w-md"
          style={{
            width: '100%',
            maxWidth: isVideoMode ? 400 : 320,
            height: isVideoMode ? '90vh' : 'auto',
            maxHeight: isVideoMode ? 600 : 'auto',
            minHeight: isVideoMode ? 400 : 'auto'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{isVideoMode ? 'Emma - Support Agent' : 'AI Support'}</p>
                <p className="text-xs text-green-500 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  {isVideoMode ? 'Live Video Chat' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isVideoMode && activeConversation && (
                <>
                  <button onClick={toggleMute} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button onClick={endVideoSupport} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Pause className="w-4 h-4 text-red-600" />
                  </button>
                </>
              )}
              <button onClick={() => setIsExpanded(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          {isVideoMode && activeConversation ? (
            <div className="relative h-[60vh] max-h-[400px] bg-gray-900">
              <iframe
                src={`${activeConversation.url}${activeConversation.url.includes('?') ? '&' : '?'}muted=${isMuted ? 1 : 0}`}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; microphone; camera"
                allowFullScreen
              />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                  <p className="text-white text-xs">You're chatting with Emma, our AI support specialist</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {error && (
                <div className="bg-red-100 text-red-800 p-2 rounded text-sm">{error}</div>
              )}
              <p className="text-sm text-gray-800 dark:text-gray-200">
                Hi! I'm Emma, your AI support agent. I can help you with:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Setting up voice agents</li>
                <li>• Configuring video agents</li>
                <li>• Billing and account questions</li>
                <li>• Troubleshooting issues</li>
              </ul>

              <button
                onClick={startVideoSupport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Start Video Support'}
              </button>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <button className="hover:underline">Text Chat</button>
                <button onClick={() => window.location.href = 'mailto:support@agentlybot.com'} className="hover:underline">Email</button>
              </div>
            </div>
          )}
          {!isVideoMode && (
            <div className="px-4 pb-4 text-center text-xs text-gray-500 dark:text-gray-400">
              Powered by Tavus • Available 24/7
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingChatBubble;