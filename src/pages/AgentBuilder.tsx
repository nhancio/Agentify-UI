import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

// 1. Define the conversation_config interface
interface ConversationConfig {
  asr?: {
    provider?: string;
    user_input_audio_format?: string;
    keywords?: string[];
    turn?: {
      turn_timeout?: number;
      silence_end_call_timeout?: number;
      mode?: string;
    };
  };
  tts?: {
    model_id?: string;
    voice_id?: string;
    supported_voices?: Array<{
      label: string;
      voice_id: string;
      description?: string;
      language?: string;
      model_family?: string;
      optimize_streaming_latency?: number;
      stability?: number;
      speed?: number;
      similarity_boost?: number;
    }>;
    agent_output_audio_format?: string;
    optimize_streaming_latency?: number;
    stability?: number;
    speed?: number;
    similarity_boost?: number;
    pronunciation_dictionary_locators?: Array<{
      pronunciation_dictionary_id: string;
      version_id: string;
    }>;
  };
  conversation?: {
    text_only?: boolean;
    max_duration_seconds?: number;
    client_events?: string[];
    language_presets?: Record<string, any>;
  };
  agent?: {
    first_message?: string;
    language?: string;
    dynamic_variables?: Record<string, any>;
    dynamic_variable_placeholders?: Record<string, any>;
    prompt?: {
      prompt?: string;
      llm?: string;
      temperature?: number;
      max_tokens?: number;
      tool_ids?: string[];
    };
    built_in_tools?: Record<string, {
      name: string;
      description?: string;
      params?: Record<string, any>;
      response_timeout_secs?: number;
      type?: string;
      mcp_server_ids?: string[];
      native_mcp_server_ids?: string[];
    }>;
    knowledge_base?: Array<{
      type: string;
      name: string;
      id: string;
      usage_mode?: string;
    }>;
    custom_llm?: {
      url?: string;
      model_id?: string;
      api_key?: {
        secret_id?: string;
        request_headers?: Record<string, string>;
      };
      ignore_default_personality?: boolean;
    };
    rag?: {
      enabled?: boolean;
      embedding_model?: string;
      max_vector_distance?: number;
      max_documents_length?: number;
      max_retrieved_rag_chunks_count?: number;
    };
    tools?: Array<{
      name: string;
      description?: string;
      params?: Record<string, any>;
      response_timeout_secs?: number;
      type?: string;
      mcp_server_ids?: string[];
      native_mcp_server_ids?: string[];
    }>;
  };
  quality?: string;
  provider?: string;
}

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string;

const defaultConfig: ConversationConfig = {
  asr: {
    provider: 'elevenlabs',
    user_input_audio_format: 'pcm_8000',
    keywords: [],
    turn: {
      turn_timeout: 5,
      silence_end_call_timeout: 10,
      mode: 'turn'
    }
  },
  tts: {
    model_id: '',
    voice_id: '',
    supported_voices: [],
    agent_output_audio_format: '',
    optimize_streaming_latency: 0,
    stability: 0.5,
    speed: 1.0,
    similarity_boost: 0.5,
    pronunciation_dictionary_locators: []
  },
  conversation: {
    text_only: false,
    max_duration_seconds: 300,
    client_events: [],
    language_presets: {}
  },
  agent: {
    first_message: '',
    language: 'en',
    dynamic_variables: {},
    dynamic_variable_placeholders: {},
    prompt: {
      prompt: '',
      llm: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 512,
      tool_ids: []
    },
    built_in_tools: {},
    knowledge_base: [],
    custom_llm: {},
    rag: { enabled: false },
    tools: []
  },
  quality: 'high',
  provider: 'elevenlabs'
};

const SECTIONS = [
  { id: 'asr', label: 'ASR (Speech-to-Text)' },
  { id: 'tts', label: 'TTS (Text-to-Speech)' },
  { id: 'conversation', label: 'Conversation' },
  { id: 'agent', label: 'Agent' },
  { id: 'general', label: 'General' }
];

const TTS_MODEL_IDS = [
  'eleven_turbo_v2',
  'eleven_turbo_v2_5',
  'eleven_flash_v2',
  'eleven_flash_v2_5'
];
const AUDIO_FORMATS = [
  'pcm_8000',
  'pcm_16000',
  'pcm_22050',
  'pcm_24000',
  'pcm_44100',
  'pcm_48000',
  'ulaw_8000'
];
const CLIENT_EVENTS = [
  'conversation_initiation_metadata',
  'asr_initiation_metadata',
  'ping',
  'audio',
  'interruption',
  'user_transcript',
  'agent_response',
  'agent_response_correction',
  'client_tool_call',
  'mcp_tool_call',
  'mcp_connection_status',
  'agent_tool_response',
  'vad_score',
  'internal_turn_probability',
  'internal_tentative_agent_response'
];

const AgentBuilder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversationConfig, setConversationConfig] = useState<ConversationConfig>(defaultConfig);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 2. Form handlers for updating config
  const handleChange = (path: string[], value: any) => {
    setConversationConfig(prev => {
      const newConfig = { ...prev };
      let obj: any = newConfig;
      for (let i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]]) obj[path[i]] = {};
        obj = obj[path[i]];
      }
      obj[path[path.length - 1]] = value;
      return newConfig;
    });
  };

  // Validation function
  const validateConfig = (config: ConversationConfig): string[] => {
    const errors: string[] = [];
    // asr
    if (!config.asr?.provider) errors.push('ASR provider is required.');
    if (!config.asr?.user_input_audio_format || !AUDIO_FORMATS.includes(config.asr.user_input_audio_format))
      errors.push('ASR user_input_audio_format must be one of: ' + AUDIO_FORMATS.join(', '));
    if (config.asr?.turn?.turn_timeout !== undefined && isNaN(Number(config.asr.turn.turn_timeout)))
      errors.push('ASR turn_timeout must be a number.');
    if (config.asr?.turn?.silence_end_call_timeout !== undefined && isNaN(Number(config.asr.turn.silence_end_call_timeout)))
      errors.push('ASR silence_end_call_timeout must be a number.');
    if (!config.asr?.turn?.mode) errors.push('ASR turn mode is required.');

    // tts
    if (!config.tts?.model_id || !TTS_MODEL_IDS.includes(config.tts.model_id))
      errors.push('TTS model_id must be one of: ' + TTS_MODEL_IDS.join(', '));
    if (!config.tts?.agent_output_audio_format || !AUDIO_FORMATS.includes(config.tts.agent_output_audio_format))
      errors.push('TTS agent_output_audio_format must be one of: ' + AUDIO_FORMATS.join(', '));
    if (config.tts?.stability !== undefined && (isNaN(Number(config.tts.stability)) || config.tts.stability < 0 || config.tts.stability > 1))
      errors.push('TTS stability must be a number between 0 and 1.');
    if (config.tts?.speed !== undefined && (isNaN(Number(config.tts.speed)) || config.tts.speed < 0.7))
      errors.push('TTS speed must be a number >= 0.7.');
    if (config.tts?.similarity_boost !== undefined && (isNaN(Number(config.tts.similarity_boost)) || config.tts.similarity_boost < 0 || config.tts.similarity_boost > 1))
      errors.push('TTS similarity_boost must be a number between 0 and 1.');

    // conversation
    if (config.conversation?.client_events && config.conversation.client_events.length > 0) {
      for (const ev of config.conversation.client_events) {
        if (!CLIENT_EVENTS.includes(ev)) {
          errors.push(`Conversation client_events contains invalid value: ${ev}`);
        }
      }
    } else {
      errors.push('At least one conversation client_event is required.');
    }
    if (config.conversation?.max_duration_seconds !== undefined && isNaN(Number(config.conversation.max_duration_seconds)))
      errors.push('Conversation max_duration_seconds must be a number.');

    // agent
    if (!config.agent?.first_message) errors.push('Agent first_message is required.');
    if (!config.agent?.language) errors.push('Agent language is required.');
    if (!config.agent?.prompt?.prompt) errors.push('Agent prompt is required.');
    if (!config.agent?.prompt?.llm) errors.push('Agent LLM is required.');
    if (config.agent?.prompt?.temperature !== undefined && isNaN(Number(config.agent.prompt.temperature)))
      errors.push('Agent prompt temperature must be a number.');
    if (config.agent?.prompt?.max_tokens !== undefined && isNaN(Number(config.agent.prompt.max_tokens)))
      errors.push('Agent prompt max_tokens must be a number.');

    // general
    if (!config.quality) errors.push('Quality is required.');
    if (!config.provider) errors.push('Provider is required.');

    return errors;
  };

  // 3. Submit handler
  const handleCreateAgent = async () => {
    const errors = validateConfig(conversationConfig);
    setValidationErrors(errors);
    if (errors.length > 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({ conversation_config: conversationConfig })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const data = await res.json();
      setResult(`Agent created! ID: ${data.agent_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  // Section renderers
  const renderASRSection = () => (
    <fieldset className="border p-4 rounded">
      <legend className="font-semibold">ASR (Speech-to-Text)</legend>
      <div className="mb-2">
        <label className="block text-sm">Provider</label>
        <input
          type="text"
          value={conversationConfig.asr?.provider || ''}
          onChange={e => handleChange(['asr', 'provider'], e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">User Input Audio Format</label>
        <select
          value={conversationConfig.asr?.user_input_audio_format || ''}
          onChange={e => handleChange(['asr', 'user_input_audio_format'], e.target.value)}
          className="w-full border px-2 py-1 rounded"
        >
          <option value="">Select format</option>
          {AUDIO_FORMATS.map(fmt => (
            <option key={fmt} value={fmt}>{fmt}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="block text-sm">Keywords (comma separated)</label>
        <input
          type="text"
          value={conversationConfig.asr?.keywords?.join(',') || ''}
          onChange={e => handleChange(['asr', 'keywords'], e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Turn Timeout (seconds)</label>
        <input
          type="number"
          min={0}
          value={conversationConfig.asr?.turn?.turn_timeout || ''}
          onChange={e => handleChange(['asr', 'turn', 'turn_timeout'], Number(e.target.value))}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Silence End Call Timeout (seconds)</label>
        <input
          type="number"
          min={0}
          value={conversationConfig.asr?.turn?.silence_end_call_timeout || ''}
          onChange={e => handleChange(['asr', 'turn', 'silence_end_call_timeout'], Number(e.target.value))}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Turn Mode</label>
        <input
          type="text"
          value={conversationConfig.asr?.turn?.mode || ''}
          onChange={e => handleChange(['asr', 'turn', 'mode'], e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
    </fieldset>
  );

  const renderTTSSection = () => (
    <fieldset className="border p-4 rounded">
      <legend className="font-semibold">TTS (Text-to-Speech)</legend>
      <div className="mb-2">
        <label className="block text-sm">Model ID</label>
        <select
          value={conversationConfig.tts?.model_id || ''}
          onChange={e => handleChange(['tts', 'model_id'], e.target.value)}
          className="w-full border px-2 py-1 rounded"
        >
          <option value="">Select model</option>
          {TTS_MODEL_IDS.map(mid => (
            <option key={mid} value={mid}>{mid}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="block text-sm">Voice ID</label>
        <input
          type="text"
          value={conversationConfig.tts?.voice_id || ''}
          onChange={e => handleChange(['tts', 'voice_id'], e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Agent Output Audio Format</label>
        <select
          value={conversationConfig.tts?.agent_output_audio_format || ''}
          onChange={e => handleChange(['tts', 'agent_output_audio_format'], e.target.value)}
          className="w-full border px-2 py-1 rounded"
        >
          <option value="">Select format</option>
          {AUDIO_FORMATS.map(fmt => (
            <option key={fmt} value={fmt}>{fmt}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="block text-sm">Stability (0-1)</label>
        <input
          type="number"
          min={0}
          max={1}
          step="0.01"
          value={conversationConfig.tts?.stability ?? ''}
          onChange={e => handleChange(['tts', 'stability'], Number(e.target.value))}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Speed (min 0.7)</label>
        <input
          type="number"
          min={0.7}
          step="0.01"
          value={conversationConfig.tts?.speed ?? ''}
          onChange={e => handleChange(['tts', 'speed'], Number(e.target.value))}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Similarity Boost (0-1)</label>
        <input
          type="number"
          min={0}
          max={1}
          step="0.01"
          value={conversationConfig.tts?.similarity_boost ?? ''}
          onChange={e => handleChange(['tts', 'similarity_boost'], Number(e.target.value))}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
    </fieldset>
  );

  const renderConversationSection = () => (
    <fieldset className="border p-4 rounded">
      <legend className="font-semibold">Conversation</legend>
      <div className="mb-2">
        <label className="block text-sm">Text Only</label>
        <input
          type="checkbox"
          checked={conversationConfig.conversation?.text_only || false}
          onChange={e => handleChange(['conversation', 'text_only'], e.target.checked)}
          className="mr-2"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Max Duration (seconds)</label>
        <input
          type="number"
          min={0}
          value={conversationConfig.conversation?.max_duration_seconds || ''}
          onChange={e => handleChange(['conversation', 'max_duration_seconds'], Number(e.target.value))}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Client Events (comma separated, at least 1)</label>
        <input
          type="text"
          value={conversationConfig.conversation?.client_events?.join(',') || ''}
          onChange={e => handleChange(['conversation', 'client_events'], e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          className="w-full border px-2 py-1 rounded"
          placeholder={CLIENT_EVENTS.join(', ')}
        />
      </div>
    </fieldset>
  );

  const renderAgentSection = () => (
    <fieldset className="border p-4 rounded">
      <legend className="font-semibold">Agent</legend>
      <div className="mb-2">
        <label className="block text-sm">First Message</label>
        <input
          type="text"
          value={conversationConfig.agent?.first_message || ''}
          onChange={e => handleChange(['agent', 'first_message'], e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Language</label>
        <input
          type="text"
          value={conversationConfig.agent?.language || ''}
          onChange={e => handleChange(['agent', 'language'], e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Prompt</label>
        <textarea
          value={conversationConfig.agent?.prompt?.prompt || ''}
          onChange={e => handleChange(['agent', 'prompt', 'prompt'], e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
    </fieldset>
  );

  const renderGeneralSection = () => (
    <fieldset className="border p-4 rounded">
      <legend className="font-semibold">General</legend>
      <div className="mb-2">
        <label className="block text-sm">Quality</label>
        <input
          type="text"
          value={conversationConfig.quality || ''}
          onChange={e => handleChange(['quality'], e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Provider</label>
        <input
          type="text"
          value={conversationConfig.provider || ''}
          onChange={e => handleChange(['provider'], e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
    </fieldset>
  );

  // Section switcher
  const renderSection = () => {
    switch (activeSection) {
      case 'asr': return renderASRSection();
      case 'tts': return renderTTSSection();
      case 'conversation': return renderConversationSection();
      case 'agent': return renderAgentSection();
      case 'general': return renderGeneralSection();
      default: return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 pt-24 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow space-y-6">
          <h1 className="text-2xl font-bold mb-4">Create ElevenLabs Agent</h1>
          {/* Top bar navigation */}
          <div className="flex space-x-2 mb-6">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-t-lg font-medium border-b-2 ${
                  activeSection === section.id
                    ? 'border-blue-600 text-blue-700 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-blue-600'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleCreateAgent();
            }}
            className="space-y-4"
          >
            {renderSection()}
            {validationErrors.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                <ul className="list-disc pl-5">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Agent'}
              </button>
            </div>
          </form>
          {/* JSON Preview */}
          <div className="mt-6">
            <div className="font-mono text-xs mb-2 text-gray-700">JSON sent to API:</div>
            <pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto">
              {JSON.stringify({ conversation_config: conversationConfig }, null, 2)}
            </pre>
          </div>
          {result && <div className="mt-4 text-green-700">{result}</div>}
          {error && <div className="mt-4 text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default AgentBuilder;