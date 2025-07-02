import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Mic, Video, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const [voiceAgentsCount, setVoiceAgentsCount] = useState<number | null>(null);
  const [videoAgentsCount, setVideoAgentsCount] = useState<number | null>(null);
  const [callRecordsCount, setCallRecordsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: voiceCount } = await supabase.from('voice_agents').select('*', { count: 'exact', head: true });
      const { count: videoCount } = await supabase.from('video_agents').select('*', { count: 'exact', head: true });
      const { count: callCount } = await supabase.from('call_records').select('*', { count: 'exact', head: true });
      setVoiceAgentsCount(voiceCount ?? 0);
      setVideoAgentsCount(videoCount ?? 0);
      setCallRecordsCount(callCount ?? 0);
    };
    fetchCounts();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
            <Mic className="h-8 w-8 text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{voiceAgentsCount !== null ? voiceAgentsCount : '...'}</div>
            <div className="text-gray-600 mt-1">My Voice Agents</div>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;