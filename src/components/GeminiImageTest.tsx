import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface GeminiImageTestProps {
    onTestComplete?: (success: boolean) => void;
}

export const GeminiImageTest: React.FC<GeminiImageTestProps> = ({ onTestComplete }) => {
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const testGeminiImageGeneration = async () => {
        setIsTesting(true);
        setTestResult('idle');
        setErrorMessage('');

        try {
            const response = await fetch('/api/v1/functions/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    prompt: 'A simple test image: a blue circle on a white background',
                    apiProvider: 'gemini',
                    userId: 'test-user'
                })
            });

            const data = await response.json();

            if (data.success && data.imageUrl) {
                setTestResult('success');
                onTestComplete?.(true);
            } else {
                setTestResult('error');
                setErrorMessage(data.error || 'Unknown error occurred');
                onTestComplete?.(false);
            }
        } catch (error) {
            setTestResult('error');
            setErrorMessage(error instanceof Error ? error.message : 'Network error');
            onTestComplete?.(false);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-100 rounded-lg">
                    <Sparkles className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gemini Image Test</h3>
                    <p className="text-sm text-gray-600">Test Gemini AI image generation</p>
                </div>
            </div>

            <div className="space-y-4">
                <button
                    onClick={testGeminiImageGeneration}
                    disabled={isTesting}
                    className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isTesting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Testing Gemini...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Test Image Generation
                        </>
                    )}
                </button>

                {testResult === 'success' && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Gemini image generation is working!</span>
                    </div>
                )}

                {testResult === 'error' && (
                    <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                        <XCircle className="w-4 h-4 mt-0.5" />
                        <div>
                            <span className="text-sm font-medium">Test failed</span>
                            {errorMessage && (
                                <p className="text-xs mt-1 text-red-500">{errorMessage}</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="text-xs text-gray-500">
                    <p><strong>Note:</strong> This test requires:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Gemini API key configured in Supabase</li>
                        <li>Active Supabase functions</li>
                        <li>Sufficient credits (5 credits per image)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GeminiImageTest;
