import React, { useState } from 'react';
import { AudioLines, Play, Download, Calendar, Filter, Search } from 'lucide-react';
import { mockCallLogs } from '../data/mockData';

export const AudioStorage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const formatFileSize = (seconds: number) => {
    // Rough estimate: 1 minute = ~1MB at standard quality
    const sizeInMB = (seconds / 60) * 1;
    return sizeInMB < 1 ? `${(sizeInMB * 1024).toFixed(0)} KB` : `${sizeInMB.toFixed(1)} MB`;
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'negative': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredFiles = mockCallLogs
    .filter(log =>
      log.callerID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.transcription.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      } else if (sortBy === 'duration') {
        return b.duration - a.duration;
      }
      return a.callerID.localeCompare(b.callerID);
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audio & Transcription Storage</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search audio files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="duration">Sort by Duration</option>
            <option value="caller">Sort by Caller</option>
          </select>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AudioLines className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Total Files</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockCallLogs.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Storage Used</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">124 MB</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Filter className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">This Month</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockCallLogs.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AudioLines className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Avg Duration</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">3:15</p>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Audio Files & Transcriptions</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredFiles.map((file) => (
            <div key={file.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      Call from {file.callerID}
                    </h3>
                    {file.sentiment && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(file.sentiment)}`}>
                        {file.sentiment}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Date:</span> {new Date(file.dateTime).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {Math.floor(file.duration / 60)}:{(file.duration % 60).toString().padStart(2, '0')}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {formatFileSize(file.duration)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Transcription Preview</h4>
                    <p className="text-sm text-gray-700 line-clamp-3">{file.transcription}</p>
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col space-y-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Play className="w-4 h-4" />
                    <span>Play</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <AudioLines className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No audio files found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Your audio recordings will appear here.'}
          </p>
        </div>
      )}
    </div>
  );
};