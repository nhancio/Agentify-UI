import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Users, User, Settings, Play } from 'lucide-react';

const MyVideoAgents: React.FC = () => {
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch personas directly using the provided API code
  const fetchPersonas = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_TAVUS_API_KEY || process.env.VITE_TAVUS_API_KEY;
      if (!apiKey) {
        setError('Tavus API key not configured.');
        setPersonas([]);
        setLoading(false);
        return;
      }
      const options = { method: 'GET', headers: { 'x-api-key': apiKey } };
      const response = await fetch('https://tavusapi.com/v2/personas', options);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch personas: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      // Fix: Tavus API returns { data: [...] }, not { personas: [...] }
      setPersonas(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch personas');
      setPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

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
              onClick={fetchPersonas}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading personas...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : personas.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No personas found</h3>
            <p className="text-gray-600">Create a persona in your Tavus dashboard to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <div key={persona.persona_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <div className="flex items-center mb-4">
                  <User className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{persona.persona_name}</h4>
                    <p className="text-xs text-gray-500 font-mono">{persona.persona_id}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2 line-clamp-3">{persona.system_prompt}</p>
                  {persona.context && (
                    <p className="text-xs text-gray-500 mb-2">Context: {persona.context}</p>
                  )}
                </div>
                <div className="flex items-center mt-4 space-x-2">
                  <button
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => window.open('https://app.tavus.io/personas', '_blank')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => window.open('https://app.tavus.io/conversations', '_blank')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Try
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MyVideoAgents;
