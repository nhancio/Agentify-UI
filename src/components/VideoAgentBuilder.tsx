import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Play, 
  Pause, 
  Save, 
  Settings, 
  Upload,
  User,
  MessageSquare,
  Clock,
  Globe,
  Mic,
  Camera,
  Monitor,
  Users,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { tavusService, videoAgentPersonas, replicaUtils, type VideoAgentConfig, type TavusReplica, type TavusPersona, ISO_TO_LANGUAGE } from '../lib/tavus';

interface VideoAgentBuilderProps {
  agentId?: string;
  onSave?: (agent: any) => void;
}

const VideoAgentBuilder: React.FC<VideoAgentBuilderProps> = ({ agentId, onSave }) => {
  const [config, setConfig] = useState<VideoAgentConfig>({
    name: 'My Video Agent',
    description: '',
    replicaId: '',
    personaId: '',
    conversationConfig: {
      maxDuration: 1800, // 30 minutes
      language: 'en',
      voice: 'natural',
      personality: 'professional',
      enableRecording: true,
      enableTranscription: true
    }
  });

  const [replicas, setReplicas] = useState<TavusReplica[]>([]);
  const [personas, setPersonas] = useState<TavusPersona[]>([]);
  const [selectedReplica, setSelectedReplica] = useState<TavusReplica | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<TavusPersona | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [showPersonaCreator, setShowPersonaCreator] = useState(false);
  const [newPersona, setNewPersona] = useState({
    name: '',
    systemPrompt: '',
    context: '',
    category: 'Custom'
  });

  useEffect(() => {
    loadReplicas();
    loadPersonas();
  }, []);

  useEffect(() => {
    if (config.replicaId) {
      const replica = replicas.find(r => r.replica_id === config.replicaId);
      setSelectedReplica(replica || null);
    }
  }, [config.replicaId, replicas]);

  useEffect(() => {
    if (config.personaId) {
      const persona = personas.find(p => p.persona_id === config.personaId);
      setSelectedPersona(persona || null);
    }
  }, [config.personaId, personas]);

  const loadReplicas = async () => {
    try {
      const data = await tavusService.getReplicas();
      setReplicas(data.replicas || []);
    } catch (error) {
      console.error('Error loading replicas:', error);
    }
  };

  const loadPersonas = async () => {
    try {
      const data = await tavusService.getPersonas();
      setPersonas(data.personas || []);
    } catch (error) {
      console.error('Error loading personas:', error);
    }
  };

  const createPersonaFromTemplate = async (personaKey: string) => {
    try {
      const personaConfig = videoAgentPersonas[personaKey as keyof typeof videoAgentPersonas];
      const persona = await tavusService.createPersona({
        persona_name: personaConfig.name,
        system_prompt: personaConfig.systemPrompt,
        context: personaConfig.context,
        default_replica_id: config.replicaId
      });
      
      await loadPersonas();
      setConfig(prev => ({ ...prev, personaId: persona.persona_id }));
      return persona;
    } catch (error) {
      console.error('Error creating persona:', error);
      throw error;
    }
  };

  const createCustomPersona = async () => {
    if (!newPersona.name || !newPersona.systemPrompt) {
      alert('Please fill in persona name and system prompt');
      return;
    }

    try {
      const persona = await tavusService.createPersona({
        persona_name: newPersona.name,
        system_prompt: newPersona.systemPrompt,
        context: newPersona.context,
        default_replica_id: config.replicaId
      });
      
      await loadPersonas();
      setConfig(prev => ({ ...prev, personaId: persona.persona_id }));
      setShowPersonaCreator(false);
      setNewPersona({ name: '', systemPrompt: '', context: '', category: 'Custom' });
    } catch (error) {
      console.error('Error creating custom persona:', error);
      alert('Failed to create persona');
    }
  };

  const startTestConversation = async () => {
    if (!config.replicaId) {
      alert('Please select a replica first');
      return;
    }

    setTesting(true);
    try {
      const conversation = await tavusService.createConversation({
        replica_id: config.replicaId,
        persona_id: config.personaId,
        conversation_name: `Test - ${config.name}`,
        properties: {
          max_call_duration: config.conversationConfig.maxDuration,
          enable_recording: config.conversationConfig.enableRecording,
          enable_transcription: config.conversationConfig.enableTranscription,
          language: ISO_TO_LANGUAGE[config.conversationConfig.language] || config.conversationConfig.language
        }
      });

      setActiveConversation(conversation);
      
      // Open conversation in new window
      if (conversation.conversationUrl) {
        window.open(conversation.conversationUrl, '_blank', 'width=800,height=600');
      }
    } catch (error) {
      console.error('Error starting test conversation:', error);
      alert('Failed to start test conversation');
    } finally {
      setTesting(false);
    }
  };

  const endTestConversation = async () => {
    if (!activeConversation) return;

    try {
      await tavusService.endConversation(activeConversation.conversationId);
      setActiveConversation(null);
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  const saveAgent = async () => {
    setLoading(true);
    try {
      // Here you would save to your database
      // For now, just call the onSave callback
      onSave?.(config);
      alert('Video agent saved successfully!');
    } catch (error) {
      console.error('Error saving agent:', error);
      alert('Failed to save agent');
    } finally {
      setLoading(false);
    }
  };

  const readyReplicas = replicaUtils.getReadyReplicas(replicas);
  const sortedReplicas = replicaUtils.sortByDate(readyReplicas);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Agent Builder</h1>
            <p className="text-gray-600">Create AI video agents using any of your Tavus replicas.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={startTestConversation}
              disabled={testing || !config.replicaId}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {testing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Test Agent
            </button>
            {activeConversation && (
              <button 
                onClick={endTestConversation}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Pause className="h-4 w-4 mr-2" />
                End Test
              </button>
            )}
            <button 
              onClick={saveAgent}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save & Deploy
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Agent Configuration</h3>
            
            {/* Agent Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this video agent does..."
              />
            </div>

            {/* Replica Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Replica ({readyReplicas.length} available)
              </label>
              <select 
                value={config.replicaId}
                onChange={(e) => setConfig(prev => ({ ...prev, replicaId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a replica...</option>
                {sortedReplicas.map((replica) => (
                  <option key={replica.replica_id} value={replica.replica_id}>
                    {replica.replica_name}
                  </option>
                ))}
              </select>
              {replicas.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No replicas found. Create one in your Tavus dashboard first.
                </p>
              )}
              {replicas.length > 0 && readyReplicas.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  Replicas are still training. Please wait for them to be ready.
                </p>
              )}
            </div>

            {/* Persona Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversation Persona ({personas.length} available)
              </label>
              <select 
                value={config.personaId}
                onChange={(e) => setConfig(prev => ({ ...prev, personaId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a persona...</option>
                {personas.map((persona) => (
                  <option key={persona.persona_id} value={persona.persona_id}>
                    {persona.persona_name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowPersonaCreator(true)}
                className="w-full mt-2 flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Persona
              </button>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select 
                value={config.conversationConfig.language}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  conversationConfig: { ...prev.conversationConfig, language: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            {/* Max Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Duration (minutes)</label>
              <input
                type="number"
                value={config.conversationConfig.maxDuration / 60}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  conversationConfig: { 
                    ...prev.conversationConfig, 
                    maxDuration: parseInt(e.target.value) * 60 
                  }
                }))}
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Quick Persona Templates */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Setup Templates</h4>
              <div className="space-y-2">
                {Object.entries(videoAgentPersonas).slice(0, 4).map(([key, persona]) => (
                  <button
                    key={key}
                    onClick={() => createPersonaFromTemplate(key)}
                    className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {persona.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Selected Replica Info */}
          {selectedReplica && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Replica</h3>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Video className="h-8 w-8 text-white opacity-50" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{selectedReplica.replica_name}</h4>
                  <p className="text-sm text-gray-500">ID: {selectedReplica.replica_id}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-700">Ready for conversations</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {selectedReplica.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(selectedReplica.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected Persona Info */}
          {selectedPersona && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Persona</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedPersona.persona_name}</h4>
                  <p className="text-sm text-gray-500">ID: {selectedPersona.persona_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-4">{selectedPersona.system_prompt}</p>
                  </div>
                </div>
                {selectedPersona.context && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
                    <p className="text-sm text-gray-600">{selectedPersona.context}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Video Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Video Agent Preview</h3>
            </div>
            
            <div className="p-6">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                {config.replicaId ? (
                  <div className="text-center text-white">
                    <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Video Agent Ready</p>
                    <p className="text-sm opacity-75">Using replica: {selectedReplica?.replica_name}</p>
                    <p className="text-sm opacity-75">Click "Test Agent" to start a conversation</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Select a Replica</p>
                    <p className="text-sm">Choose from {readyReplicas.length} available replicas</p>
                  </div>
                )}
              </div>

              {activeConversation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                    <div>
                      <p className="font-medium text-green-900">Test Conversation Active</p>
                      <p className="text-sm text-green-700">
                        Conversation ID: {activeConversation.conversationId}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Configuration</h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Conversation Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Recording Enabled</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={config.conversationConfig.enableRecording}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            conversationConfig: { 
                              ...prev.conversationConfig, 
                              enableRecording: e.target.checked 
                            }
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Transcription Enabled</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={config.conversationConfig.enableTranscription}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            conversationConfig: { 
                              ...prev.conversationConfig, 
                              enableTranscription: e.target.checked 
                            }
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Integration</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                      <input
                        type="url"
                        value={config.webhookUrl || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                        placeholder="https://your-app.com/webhook"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Persona Creator Modal */}
      {showPersonaCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create Custom Persona</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Persona Name</label>
                <input
                  type="text"
                  value={newPersona.name}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Customer Service Agent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
                <textarea
                  value={newPersona.systemPrompt}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Define how your agent should behave, what it should say, and how it should respond..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Context (Optional)</label>
                <input
                  type="text"
                  value={newPersona.context}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, context: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Customer support for SaaS platform"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowPersonaCreator(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createCustomPersona}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Persona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoAgentBuilder;