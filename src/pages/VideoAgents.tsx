import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import VideoAgentBuilder from '../components/VideoAgentBuilder';
import VideoAgentCard from '../components/VideoAgentCard';
import TavusSetup from '../components/TavusSetup';
import {
  Video,
  Plus,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Monitor,
  Camera,
  Settings
} from 'lucide-react';
import { tavusService, ISO_TO_LANGUAGE } from '../lib/tavus';
import { agentService } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VideoAgents: React.FC = () => {
  const [personas, setPersonas] = useState<any[]>([]);
  const [replicas, setReplicas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Move fetchData outside useEffect so it can be used for Refresh
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
      if (!apiKey) throw new Error('Tavus API key not configured.');
      const [personaResult, replicaResult] = await Promise.all([
        tavusService.getPersonas(),
        tavusService.getReplicas()
      ]);
      setPersonas(personaResult.personas || []);
      setReplicas(replicaResult.replicas || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      setPersonas([]);
      setReplicas([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading]);

  const getThumbnail = (persona: any) => {
    if (!persona.default_replica_id) return undefined;
    const replica = replicas.find((r: any) => r.replica_id === persona.default_replica_id);
    return replica?.thumbnail_url;
  };

  const getImage = (persona: any) => {
    // Use DiceBear avatar based on persona name
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(persona.persona_name || persona.persona_id)}`;
  };

  const getShortDescription = (systemPrompt: string) => {
    if (!systemPrompt) return '';
    // Remove everything after 'Context:' if present
    const noContext = systemPrompt.split('Context:')[0];
    return noContext.length > 200 ? noContext.slice(0, 200) + '...' : noContext;
  };

  if (authLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8 pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading video agents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Optionally redirect to login
    return <div>Please log in</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 pt-24">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Video Agents</h1>
              <p className="text-gray-600">All your Tavus personas are listed here.</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        {error && <div className="text-red-600 text-center">{error}</div>}
        {personas.length === 0 ? (
          <div className="p-12 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No video agents yet</h3>
            <p className="text-gray-600 mb-6">Create your first video agent in Tavus to see it here.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas.map((persona) => (
                <VideoAgentCard
                  key={persona.persona_id}
                  agent={{
                    id: persona.persona_id,
                    name: persona.persona_name,
                    description: getShortDescription(persona.system_prompt),
                    image: getImage(persona),
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoAgents;