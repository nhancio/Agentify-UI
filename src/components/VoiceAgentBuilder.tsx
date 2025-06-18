import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Phone, 
  Play, 
  Pause, 
  Save, 
  Settings, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  Volume2,
  Mic,
  PhoneCall
} from 'lucide-react';
import { voiceAgentService, voicePresets, conversationTemplates, type VoiceAgentConfig, type ConversationStep } from '../lib/voiceAgent';

interface VoiceAgentBuilderProps {
  agentId?: string;
  onSave?: (agent: any) => void;
}

const VoiceAgentBuilder: React.FC<VoiceAgentBuilderProps> = ({ agentId, onSave }) => {
  const [config, setConfig] = useState<VoiceAgentConfig>({
    name: 'My Voice Agent',
    description: '',
    voiceSettings: voicePresets.professional_female,
    conversationFlow: [],
    greetingMessage: 'Hello! Thank you for calling. How can I help you today?',
    fallbackMessage: 'I\'m sorry, I didn\'t understand that. Could you please repeat?',
    recordCalls: true,
    enableTranscription: true
  });

  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const stepTypes = [
    { id: 'greeting', label: 'Greeting', icon: MessageSquare, color: 'blue' },
    { id: 'question', label: 'Question', icon: HelpCircle, color: 'green' },
    { id: 'response', label: 'Response', icon: MessageSquare, color: 'purple' },
    { id: 'action', label: 'Action', icon: ArrowRight, color: 'orange' },
    { id: 'transfer', label: 'Transfer', icon: PhoneCall, color: 'red' }
  ];

  const addStep = (type: string) => {
    const newStep: ConversationStep = {
      id: `step_${Date.now()}`,
      type: type as any,
      content: '',
      nextStep: undefined
    };

    setConfig(prev => ({
      ...prev,
      conversationFlow: [...prev.conversationFlow, newStep]
    }));
  };

  const updateStep = (index: number, updates: Partial<ConversationStep>) => {
    setConfig(prev => ({
      ...prev,
      conversationFlow: prev.conversationFlow.map((step, i) => 
        i === index ? { ...step, ...updates } : step
      )
    }));
  };

  const removeStep = (index: number) => {
    setConfig(prev => ({
      ...prev,
      conversationFlow: prev.conversationFlow.filter((_, i) => i !== index)
    }));
    setSelectedStep(null);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newFlow = [...config.conversationFlow];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFlow.length) {
      [newFlow[index], newFlow[targetIndex]] = [newFlow[targetIndex], newFlow[index]];
      setConfig(prev => ({ ...prev, conversationFlow: newFlow }));
    }
  };

  const loadTemplate = (templateName: string) => {
    const template = conversationTemplates[templateName as keyof typeof conversationTemplates];
    if (template) {
      setConfig(prev => ({
        ...prev,
        conversationFlow: template
      }));
    }
  };

  const testVoice = () => {
    setIsPlaying(true);
    // Simulate voice playback
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const saveAgent = async () => {
    setSaving(true);
    try {
      const agent = await voiceAgentService.createVoiceAgent(config);
      onSave?.(agent);
    } catch (error) {
      console.error('Error saving agent:', error);
    } finally {
      setSaving(false);
    }
  };

  const testAgent = async () => {
    setTesting(true);
    try {
      // This would trigger a test call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Test call initiated! Check your phone.');
    } catch (error) {
      console.error('Error testing agent:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Agent Builder</h1>
            <p className="text-gray-600">Create and customize your AI voice agent with our visual builder.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={testAgent}
              disabled={testing}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {testing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Test Agent
            </button>
            <button 
              onClick={saveAgent}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {saving ? (
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Settings</h3>
            
            {/* Agent Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this agent does..."
              />
            </div>

            {/* Voice Settings */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Voice Preset</label>
              <select 
                value={Object.keys(voicePresets).find(key => 
                  JSON.stringify(voicePresets[key as keyof typeof voicePresets]) === JSON.stringify(config.voiceSettings)
                ) || 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    setConfig(prev => ({
                      ...prev,
                      voiceSettings: voicePresets[e.target.value as keyof typeof voicePresets]
                    }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="professional_female">Professional Female</option>
                <option value="professional_male">Professional Male</option>
                <option value="friendly_female">Friendly Female</option>
                <option value="friendly_male">Friendly Male</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Test Voice */}
            <div className="mb-6">
              <button
                onClick={testVoice}
                disabled={isPlaying}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {isPlaying ? (
                  <>
                    <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Test Voice
                  </>
                )}
              </button>
            </div>

            {/* Templates */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Templates</h4>
              <div className="space-y-2">
                <button
                  onClick={() => loadTemplate('hr_screening')}
                  className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  HR Screening
                </button>
                <button
                  onClick={() => loadTemplate('hotel_booking')}
                  className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hotel Booking
                </button>
                <button
                  onClick={() => loadTemplate('sales_qualifier')}
                  className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Sales Qualifier
                </button>
              </div>
            </div>

            {/* Add Step */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Add Step</h4>
              <div className="space-y-2">
                {stepTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => addStep(type.id)}
                    className="w-full flex items-center p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <type.icon className={`h-4 w-4 mr-2 text-${type.color}-600`} />
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Flow Builder */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Conversation Flow</h3>
              <p className="text-sm text-gray-600 mt-1">Design your agent's conversation flow step by step.</p>
            </div>
            
            <div className="p-6">
              {config.conversationFlow.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation steps yet</h3>
                  <p className="text-gray-600 mb-4">Start by adding a greeting or choosing a template.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {config.conversationFlow.map((step, index) => (
                    <div
                      key={step.id}
                      onClick={() => setSelectedStep(index)}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedStep === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            step.type === 'greeting' ? 'bg-blue-100 text-blue-600' :
                            step.type === 'question' ? 'bg-green-100 text-green-600' :
                            step.type === 'response' ? 'bg-purple-100 text-purple-600' :
                            step.type === 'action' ? 'bg-orange-100 text-orange-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {step.type === 'greeting' && <MessageSquare className="h-4 w-4" />}
                            {step.type === 'question' && <HelpCircle className="h-4 w-4" />}
                            {step.type === 'response' && <MessageSquare className="h-4 w-4" />}
                            {step.type === 'action' && <ArrowRight className="h-4 w-4" />}
                            {step.type === 'transfer' && <PhoneCall className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1 capitalize">{step.type} Step</h4>
                            <p className="text-sm text-gray-600 mb-2">{step.content || 'No content set'}</p>
                            {step.options && (
                              <div className="flex flex-wrap gap-2">
                                {step.options.map((option, optionIndex) => (
                                  <span
                                    key={optionIndex}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                  >
                                    {option}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStep(index, 'up');
                            }}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                          >
                            <MoveUp className="h-4 w-4 text-gray-400" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStep(index, 'down');
                            }}
                            disabled={index === config.conversationFlow.length - 1}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                          >
                            <MoveDown className="h-4 w-4 text-gray-400" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeStep(index);
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {index < config.conversationFlow.length - 1 && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                            <ArrowRight className="h-2 w-2 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step Editor */}
          {selectedStep !== null && config.conversationFlow[selectedStep] && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Edit Step: {config.conversationFlow[selectedStep].type}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    rows={4}
                    value={config.conversationFlow[selectedStep].content}
                    onChange={(e) => updateStep(selectedStep, { content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter what the agent should say..."
                  />
                </div>

                {config.conversationFlow[selectedStep].type === 'question' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Response Options (optional)</label>
                    <input
                      type="text"
                      value={config.conversationFlow[selectedStep].options?.join(', ') || ''}
                      onChange={(e) => updateStep(selectedStep, { 
                        options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Option 1, Option 2, Option 3..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentBuilder;