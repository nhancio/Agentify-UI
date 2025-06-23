import React, { useState, useEffect } from 'react';
import { Play, Download, Eye, Search, Filter, Calendar, Phone } from 'lucide-react';
import supabase from '../utils/supabase';

export interface SupabaseCallLog {
  userid: number;
  created_at: string;
  caller_id: string;
  from_number: string;
  duration: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  transcription?: string;
  audio_url?: string;
}

export const CallLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const [callLogs, setCallLogs] = useState<SupabaseCallLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCallLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching call logs:', error);
        setCallLogs([]);
      } else {
        setCallLogs(data || []);
      }
      setLoading(false);
    };
    fetchCallLogs();
  }, []);

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700 border-green-200';
      case 'negative': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Filter logic (search by caller_id or from_number)
  const filteredLogs = callLogs.filter(log =>
    (log.caller_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.from_number?.includes(searchTerm))
  );

  const viewTranscript = (log: SupabaseCallLog) => {
    setSelectedTranscript(log.transcription || 'No transcript available.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Call Logs</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search calls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Call Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Total Calls</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Avg Duration</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatDuration(Math.round(filteredLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / (filteredLogs.length || 1)))}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Filter className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Positive Calls</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {filteredLogs.filter(log => log.sentiment === 'positive').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Phone className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Total Minutes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(() => {
              const totalSeconds = filteredLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
              const minutes = Math.floor(totalSeconds / 60);
              const seconds = totalSeconds % 60;
              return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            })()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Caller ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sentiment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.userid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.caller_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.from_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(log.duration || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.sentiment && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSentimentColor(log.sentiment)}`}>
                        {log.sentiment}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button className="text-blue-600 hover:text-blue-900 inline-flex items-center space-x-1 transition-colors">
                        <Play className="w-4 h-4" />
                        <span>Play</span>
                      </button>
                      <button className="text-green-600 hover:text-green-900 inline-flex items-center space-x-1 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <button 
                        onClick={() => viewTranscript(log)}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center space-x-1 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Transcript</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && !loading && (
        <div className="text-center py-12">
          <Phone className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No calls found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Your call logs will appear here.'}
          </p>
        </div>
      )}

      {/* Transcript Modal */}
      {selectedTranscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Call Transcript</h2>
              <button
                onClick={() => setSelectedTranscript(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedTranscript}
              </p>
            </div>
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setSelectedTranscript(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};