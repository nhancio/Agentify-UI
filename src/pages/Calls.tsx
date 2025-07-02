import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const Calls: React.FC = () => {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const client = new ElevenLabsClient({ apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY });
      const res = await client.conversationalAi.conversations.list();
      setCalls(res.conversations || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch calls');
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Call History</h1>
          <p className="text-gray-600">All your ElevenLabs voice conversations are listed here.</p>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading calls...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : calls.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No calls found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 border-b text-left">Conversation ID</th>
                  <th className="px-3 py-2 border-b text-left">Agent ID</th>
                  <th className="px-3 py-2 border-b text-left">Status</th>
                  <th className="px-3 py-2 border-b text-left">Started At</th>
                  <th className="px-3 py-2 border-b text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                {calls.map(call => (
                  <tr key={call.conversation_id}>
                    <td className="px-3 py-2 border-b">{call.conversation_id}</td>
                    <td className="px-3 py-2 border-b">{call.agent_id}</td>
                    <td className="px-3 py-2 border-b">{call.status}</td>
                    <td className="px-3 py-2 border-b">
                      {call.started_at_unix_secs
                        ? new Date(call.started_at_unix_secs * 1000).toLocaleString()
                        : ''}
                    </td>
                    <td className="px-3 py-2 border-b">{call.duration_seconds ? `${call.duration_seconds}s` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calls;
