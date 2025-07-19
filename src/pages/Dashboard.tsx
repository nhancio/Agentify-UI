import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Mic, Video, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [voiceAgentsCount, setVoiceAgentsCount] = useState<number | null>(null);
  const [videoAgentsCount, setVideoAgentsCount] = useState<number | null>(null);
  const [callRecordsCount, setCallRecordsCount] = useState<number | null>(null);
  const [videoCallRecordsCount, setVideoCallRecordsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      const fetchCounts = async () => {
        setLoading(true);
        setError('');
        try {
          const { count: voiceCount, error: voiceError } = await supabase.from('voice_agents').select('*', { count: 'exact', head: true });
          const { count: videoCount, error: videoError } = await supabase.from('video_agents').select('*', { count: 'exact', head: true });
          const { count: callCount, error: callError } = await supabase.from('call_logs').select('*', { count: 'exact', head: true });
          // Removed video_call_records query as table doesn't exist

          if (voiceError || videoError || callError) {
            throw new Error('Failed to fetch one or more counts');
          }

          setVoiceAgentsCount(voiceCount ?? 0);
          setVideoAgentsCount(videoCount ?? 0);
          setCallRecordsCount(callCount ?? 0);
          setVideoCallRecordsCount(0); // Set to 0 since table doesn't exist
        } catch (err) {
          setError('Failed to load dashboard data');
        }
        setLoading(false);
      };
      fetchCounts();
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your dashboard</p>
          <a href="/login" className="text-blue-600 hover:text-blue-800">Go to Login</a>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
            <Mic className="h-8 w-8 text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{voiceAgentsCount !== null ? voiceAgentsCount : '...'}</div>
            <div className="text-gray-600 mt-1">My Agents</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
            <Video className="h-8 w-8 text-purple-600 mb-2" />
            <div className="text-2xl font-bold">{videoAgentsCount !== null ? videoAgentsCount : '...'}</div>
            <div className="text-gray-600 mt-1">Video Call History</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
            <Phone className="h-8 w-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold">{callRecordsCount !== null ? callRecordsCount : '...'}</div>
            <div className="text-gray-600 mt-1">Voice Call Records</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
            <Video className="h-8 w-8 text-pink-600 mb-2" />
            <div className="text-2xl font-bold">{videoCallRecordsCount !== null ? videoCallRecordsCount : '...'}</div>
            <div className="text-gray-600 mt-1">Video Call Records</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;