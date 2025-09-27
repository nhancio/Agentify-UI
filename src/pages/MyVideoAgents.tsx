import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';

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

  // Helper to get DiceBear avatar URL
  const getAvatarUrl = (name: string) =>
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name)}`;

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Video Agents</h1>
          <p className="text-gray-600">All your Tavus personas are listed here.</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No personas found</h3>
            <p className="text-gray-600">Create a persona in your Tavus dashboard to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <div key={persona.persona_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
                <img
                  src={getAvatarUrl(persona.persona_name)}
                  alt={persona.persona_name}
                  className="w-16 h-16 rounded-full mb-4 border border-gray-300"
                  loading="lazy"
                />
                <h4 className="font-semibold text-gray-900 text-center mb-2">{persona.persona_name}</h4>
                <p className="text-sm text-gray-700 text-center line-clamp-3">
                  {persona.system_prompt ? persona.system_prompt.replace(/\n/g, ' ').slice(0, 200) : 'No description.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MyVideoAgents;
