import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Bot, 
  Phone, 
  Video, 
  Settings, 
  Play, 
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  MessageSquare,
  HelpCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const AgentBuilder: React.FC = () => {
  const [agentType, setAgentType] = useState<'voice' | 'video'>('voice');
  const [agentName, setAgentName] = useState('My New Agent');
  const [selectedStep, setSelectedStep] = useState(0);
  const [agentSteps, setAgentSteps] = useState([
    {
      id: 'greeting',
      type: 'message',
      title: 'Welcome Greeting',
      content: 'Hello! Thank you for calling. I\'m here to help you today. How can I assist you?',
      icon: MessageSquare
    },
    {
      id: 'question1',
      type: 'question',
      title: 'Collect Name',
      content: 'Could I please get your full name?',
      options: ['Continue to next question'],
      icon: HelpCircle
    },
    {
      id: 'question2',
      type: 'question',
      title: 'Purpose of Call',
      content: 'What brings you to call us today?',
      options: ['Sales Inquiry', 'Support Request', 'Booking', 'Other'],
      icon: HelpCircle
    },
    {
      id: 'action',
      type: 'action',
      title: 'Route Call',
      content: 'Based on your inquiry, I\'ll connect you with the right department.',
      icon: ArrowRight
    },
    {
      id: 'closing',
      type: 'message',
      title: 'Closing Message',
      content: 'Thank you for your time. Have a great day!',
      icon: CheckCircle
    }
  ]);

  const stepTypes = [
    { id: 'message', label: 'Message', icon: MessageSquare, color: 'blue' },
    { id: 'question', label: 'Question', icon: HelpCircle, color: 'green' },
    { id: 'action', label: 'Action', icon: ArrowRight, color: 'purple' }
  ];

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Builder</h1>
              <p className="text-gray-600">Create and customize your AI agents with our no-code builder.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Play className="h-4 w-4 mr-2" />
                Test Agent
              </button>
              <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg">
                <Save className="h-4 w-4 mr-2" />
                Save & Deploy
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Settings</h3>
              
              {/* Agent Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Agent Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAgentType('voice')}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      agentType === 'voice'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Phone className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Voice</div>
                  </button>
                  <button
                    onClick={() => setAgentType('video')}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      agentType === 'video'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Video className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Video</div>
                  </button>
                </div>
              </div>

              {/* Voice Settings */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Professional Female</option>
                  <option>Professional Male</option>
                  <option>Friendly Female</option>
                  <option>Friendly Male</option>
                </select>
              </div>

              {/* Language */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              {/* Add Step */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Step</h4>
                <div className="space-y-2">
                  {stepTypes.map((type) => (
                    <button
                      key={type.id}
                      className={`w-full flex items-center p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all`}
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
                <p className="text-sm text-gray-600 mt-1">Drag and drop to reorder steps, click to edit content.</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {agentSteps.map((step, index) => (
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
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            step.type === 'message' ? 'bg-blue-100 text-blue-600' :
                            step.type === 'question' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            <step.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{step.content}</p>
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
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoveUp className="h-4 w-4 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoveDown className="h-4 w-4 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Settings className="h-4 w-4 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded text-red-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                          <ArrowRight className="h-2 w-2 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                    <div className="flex items-center justify-center">
                      <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-600 mr-2" />
                      <span className="text-gray-600 group-hover:text-blue-600">Add Step</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Step Editor */}
            {selectedStep !== null && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Edit: {agentSteps[selectedStep]?.title}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Step Title</label>
                    <input
                      type="text"
                      value={agentSteps[selectedStep]?.title || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Step Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="message">Message</option>
                      <option value="question">Question</option>
                      <option value="action">Action</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      rows={4}
                      value={agentSteps[selectedStep]?.content || ''}
                      onChange={e => {
                        const updatedSteps = [...agentSteps];
                        updatedSteps[selectedStep] = {
                          ...updatedSteps[selectedStep],
                          content: e.target.value
                        };
                        setAgentSteps(updatedSteps);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter the message your agent will say..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentBuilder;