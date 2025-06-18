import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Video, 
  Upload,
  ExternalLink,
  RefreshCw,
  Users,
  Clock,
  BarChart3,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import { tavusService, replicaUtils, type TavusReplica, type TavusPersona } from '../lib/tavus';

const TavusSetup: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [replicas, setReplicas] = useState<TavusReplica[]>([]);
  const [personas, setPersonas] = useState<TavusPersona[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'replicas' | 'personas' | 'conversations'>('overview');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setError('');
    
    try {
      const result = await tavusService.testConnection();
      if (result.success) {
        setConnectionStatus('connected');
        await loadAllData();
      } else {
        setConnectionStatus('error');
        setError(result.message);
      }
    } catch (err) {
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [replicasData, personasData, conversationsData, accountData] = await Promise.allSettled([
        tavusService.getReplicas(),
        tavusService.getPersonas(),
        tavusService.getConversations(),
        tavusService.getAccountInfo()
      ]);
      
      if (replicasData.status === 'fulfilled') {
        setReplicas(replicasData.value.replicas || []);
      }
      
      if (personasData.status === 'fulfilled') {
        setPersonas(personasData.value.personas || []);
      }
      
      if (conversationsData.status === 'fulfilled') {
        setConversations(conversationsData.value.conversations || []);
      }
      
      if (accountData.status === 'fulfilled') {
        setAccountInfo(accountData.value);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteReplica = async (replicaId: string) => {
    if (!confirm('Are you sure you want to delete this replica? This action cannot be undone.')) {
      return;
    }

    try {
      await tavusService.deleteReplica(replicaId);
      await loadAllData();
    } catch (error) {
      console.error('Error deleting replica:', error);
      alert('Failed to delete replica');
    }
  };

  const deletePersona = async (personaId: string) => {
    if (!confirm('Are you sure you want to delete this persona?')) {
      return;
    }

    try {
      await tavusService.deletePersona(personaId);
      await loadAllData();
    } catch (error) {
      console.error('Error deleting persona:', error);
      alert('Failed to delete persona');
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Checking Tavus connection...';
      case 'connected':
        return 'Connected to Tavus API';
      case 'error':
        return `Connection failed: ${error}`;
    }
  };

  const replicasByStatus = replicaUtils.groupByStatus(replicas);
  const readyReplicas = replicaUtils.getReadyReplicas(replicas);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'replicas', label: 'Replicas', icon: Video },
    { id: 'personas', label: 'Personas', icon: Users },
    { id: 'conversations', label: 'Conversations', icon: Clock }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tavus Dashboard</h1>
        <p className="text-gray-600">Manage your Tavus replicas, personas, and video agent configurations.</p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
          <button
            onClick={checkConnection}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <span className={`font-medium ${
            connectionStatus === 'connected' ? 'text-green-700' :
            connectionStatus === 'error' ? 'text-red-700' :
            'text-blue-700'
          }`}>
            {getStatusMessage()}
          </span>
        </div>

        {connectionStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Setup Required</h4>
                <p className="text-red-700 text-sm mt-1">
                  To use video agents, you need to:
                </p>
                <ol className="text-red-700 text-sm mt-2 list-decimal list-inside space-y-1">
                  <li>Sign up at <a href="https://tavus.io" target="_blank" rel="noopener noreferrer" className="underline">Tavus.io</a></li>
                  <li>Get your API key from the dashboard</li>
                  <li>Update your environment variables</li>
                  <li>Create your first replica</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>

      {connectionStatus === 'connected' && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Video className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{replicas.length}</span>
              </div>
              <p className="text-sm text-gray-600">Total Replicas</p>
              <p className="text-xs text-green-600 mt-1">{readyReplicas.length} ready</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">{personas.length}</span>
              </div>
              <p className="text-sm text-gray-600">Personas</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{conversations.length}</span>
              </div>
              <p className="text-sm text-gray-600">Conversations</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {accountInfo?.usage?.minutes_used || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600">Minutes Used</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <a
                    href="https://app.tavus.io/replicas/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Create Replica</h4>
                      <p className="text-sm text-gray-600">Upload training video</p>
                    </div>
                  </a>

                  <a
                    href="https://app.tavus.io/personas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Users className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Manage Personas</h4>
                      <p className="text-sm text-gray-600">Configure personalities</p>
                    </div>
                  </a>

                  <a
                    href="https://app.tavus.io/conversations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Clock className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">View Conversations</h4>
                      <p className="text-sm text-gray-600">Review recordings</p>
                    </div>
                  </a>
                </div>

                {/* Replica Status Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Replica Status Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(replicasByStatus).map(([status, statusReplicas]) => (
                      <div key={status} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                          <span className="text-lg font-bold text-gray-900">{statusReplicas.length}</span>
                        </div>
                        <div className="space-y-1">
                          {statusReplicas.slice(0, 3).map((replica) => (
                            <p key={replica.replica_id} className="text-xs text-gray-600 truncate">
                              {replica.replica_name}
                            </p>
                          ))}
                          {statusReplicas.length > 3 && (
                            <p className="text-xs text-gray-500">+{statusReplicas.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Replicas Tab */}
            {activeTab === 'replicas' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Replicas ({replicas.length})</h3>
                  <a
                    href="https://app.tavus.io/replicas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage in Tavus
                  </a>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600">Loading replicas...</p>
                  </div>
                ) : replicas.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">No replicas found</h4>
                    <p className="text-gray-600 mb-4">Create your first replica to start building video agents.</p>
                    <a
                      href="https://app.tavus.io/replicas/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Create Replica
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {replicas.map((replica) => (
                      <div key={replica.replica_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 truncate">{replica.replica_name}</h4>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => deleteReplica(replica.replica_id)}
                              className="p-1 text-red-400 hover:text-red-600"
                              title="Delete replica"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            replica.status === 'ready' ? 'bg-green-100 text-green-800' :
                            replica.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {replica.status}
                          </span>
                          {replica.training_progress && replica.status === 'training' && (
                            <span className="text-xs text-gray-500">{replica.training_progress}%</span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 font-mono">{replica.replica_id}</p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(replica.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Personas Tab */}
            {activeTab === 'personas' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Personas ({personas.length})</h3>
                  <a
                    href="https://app.tavus.io/personas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage in Tavus
                  </a>
                </div>

                {personas.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">No personas created yet</h4>
                    <p className="text-gray-600">Personas will be created automatically when you build video agents.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {personas.map((persona) => (
                      <div key={persona.persona_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{persona.persona_name}</h4>
                            <p className="text-xs text-gray-500 font-mono mb-2">{persona.persona_id}</p>
                            <p className="text-sm text-gray-600 line-clamp-3">{persona.system_prompt}</p>
                            {persona.context && (
                              <p className="text-xs text-gray-500 mt-2">Context: {persona.context}</p>
                            )}
                          </div>
                          <button
                            onClick={() => deletePersona(persona.persona_id)}
                            className="p-1 text-red-400 hover:text-red-600 ml-2"
                            title="Delete persona"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(persona.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conversations Tab */}
            {activeTab === 'conversations' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Conversations ({conversations.length})</h3>
                  <a
                    href="https://app.tavus.io/conversations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View All
                  </a>
                </div>

                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">No conversations yet</h4>
                    <p className="text-gray-600">Start testing your video agents to see conversations here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversations.slice(0, 10).map((conversation) => (
                      <div key={conversation.conversation_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{conversation.conversation_name}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            conversation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            conversation.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {conversation.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-mono mb-2">{conversation.conversation_id}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Duration: {conversation.duration || 'N/A'}</span>
                          <span>Started: {new Date(conversation.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TavusSetup;