import React, { useState, useEffect } from 'react';
import { getGeminiService, geminiUtils } from '../lib/gemini';
import { CheckCircle, AlertCircle, Loader2, Settings, Brain, Zap, Image } from 'lucide-react';
import GeminiImageTest from './GeminiImageTest';

interface GeminiSetupProps {
    onSetupComplete?: () => void;
}

export const GeminiSetup: React.FC<GeminiSetupProps> = ({ onSetupComplete }) => {
    const [apiKey, setApiKey] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check if API key is already configured
        const existingKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (existingKey && existingKey !== 'your_gemini_api_key_here') {
            setApiKey(existingKey);
            testConnection(existingKey);
        }
    }, []);

    const testConnection = async (key?: string) => {
        setIsTesting(true);
        setError('');

        try {
            const testKey = key || apiKey;
            if (!testKey) {
                throw new Error('Please enter your Gemini API key');
            }

            // Create a temporary service instance with the provided key
            const tempService = getGeminiService(testKey);
            const response = await tempService.generateText('Hello, this is a test message.');

            if (response && response.length > 0) {
                setIsConnected(true);
                setError('');
                onSetupComplete?.();
            } else {
                throw new Error('Invalid response from Gemini API');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect to Gemini API');
            setIsConnected(false);
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError('');

        try {
            // In a real application, you would save this to your backend
            // For now, we'll just test the connection
            await testConnection();

            if (isConnected) {
                // Store the API key in localStorage for demo purposes
                // In production, this should be handled securely by your backend
                localStorage.setItem('gemini_api_key', apiKey);
                onSetupComplete?.();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save configuration');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyChange = (value: string) => {
        setApiKey(value);
        setError('');
        setIsConnected(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gemini AI Setup</h2>
                    <p className="text-gray-600">Configure your Gemini AI integration for enhanced voice agents</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* API Key Input */}
                <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                        Gemini API Key
                    </label>
                    <div className="relative">
                        <input
                            id="apiKey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => handleKeyChange(e.target.value)}
                            placeholder="Enter your Gemini API key"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isTesting || isLoading}
                        />
                        {isConnected && (
                            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Get your API key from{' '}
                        <a
                            href="https://makersuite.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            Google AI Studio
                        </a>
                    </p>
                </div>

                {/* Connection Status */}
                {isTesting && (
                    <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Testing connection...</span>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </div>
                )}

                {isConnected && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span>Successfully connected to Gemini AI!</span>
                    </div>
                )}

                {/* Features List */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Gemini AI Features</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span>AI-powered conversation responses</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span>Automatic training data generation</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span>Call transcript analysis</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span>Intelligent conversation flow generation</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Image className="w-4 h-4 text-yellow-500" />
                            <span>AI image generation with Gemini</span>
                        </div>
                    </div>
                </div>

                {/* Image Generation Test */}
                {isConnected && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Test Image Generation</h4>
                        <GeminiImageTest />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => testConnection()}
                        disabled={!apiKey || isTesting || isLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isTesting ? 'Testing...' : 'Test Connection'}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!apiKey || !isConnected || isLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>

                {/* Model Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Models
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        {geminiUtils.getAvailableModels().map((model) => (
                            <div key={model} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <Settings className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{model}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeminiSetup;
