import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Image,
  Wand2,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  Palette,
  Camera
} from 'lucide-react';

interface ImageGeneration {
  id: string;
  prompt: string;
  api_provider: string;
  image_url: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedApi, setSelectedApi] = useState<'gpt5' | 'google_imagen' | 'gemini'>('gpt5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generations, setGenerations] = useState<ImageGeneration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [userCredits, setUserCredits] = useState<number>(0);
  const costPerImage = 5;
  const [showError, setShowError] = useState<boolean>(true);

  const apiOptions = [
    {
      id: 'gpt5' as const,
      name: 'GPT-5 (DALL-E 3)',
      description: 'OpenAI\'s advanced image generation',
      icon: Sparkles,
      color: 'text-green-600'
    },
    {
      id: 'google_imagen' as const,
      name: 'Google Imagen',
      description: 'Google\'s high-quality image generation',
      icon: Palette,
      color: 'text-blue-600'
    },
    // {
    //   id: 'qwen' as const,
    //   name: 'Qwen',
    //   description: 'Alibaba\'s multimodal AI',
    //   icon: Camera,
    //   color: 'text-purple-600'
    // }
  ];
  // Add Gemini (Nanobanana) as alias to Google Imagen backend
  apiOptions.splice(1, 0, {
    id: 'gemini' as const,
    name: 'Gemini (NanoBanana)',
    description: 'Google\'s advanced multimodal AI with image generation',
    icon: Sparkles,
    color: 'text-teal-600'
  });

  useEffect(() => {
    if (user) {
      fetchGenerations();
      fetchUserCredits();
    }
  }, [user]);

  const fetchGenerations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('image_generations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching generations:', error);
        return;
      }

      setGenerations(data || []);
    } catch (err) {
      console.error('Error fetching generations:', err);
    }
  };

  const fetchUserCredits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user credits:', error);
        return;
      }

      setUserCredits(data?.credits || 0);
    } catch (err) {
      console.error('Error fetching user credits:', err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;
    if (userCredits < costPerImage) {
      setError(`Insufficient credits. You need at least ${costPerImage} credits.`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setShowError(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: prompt.trim(),
          apiProvider: selectedApi,
          userId: user.id
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate image');
      }

      if (!data.success) {
        throw new Error(data.error || 'Image generation failed');
      }

      await fetchGenerations();
      await fetchUserCredits();
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      setShowError(true);
    } finally {
      setIsGenerating(false);
      // Always refresh credits to reflect any backend changes
      await fetchUserCredits();
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const fileName = `generated-image-${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}.png`;

      // If it's a data URL, download directly without fetching
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Otherwise, fetch and download (may require CORS from provider)
      const response = await fetch(imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading image:', err);
      // Fallback: open in new tab if direct download fails (user can save manually)
      try {
        window.open(imageUrl, '_blank', 'noopener,noreferrer');
      } catch { }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('image_generations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting generation:', error);
        return;
      }

      setGenerations(prev => prev.filter(gen => gen.id !== id));
    } catch (err) {
      console.error('Error deleting generation:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getApiName = (provider: string) => {
    const api = apiOptions.find(opt => opt.id === provider);
    return api?.name || provider;
  };

  const getApiGradient = (provider: 'gpt5' | 'google_imagen' | 'qwen' | 'gemini') => {
    switch (provider) {
      case 'gpt5':
        return 'from-purple-500 to-indigo-500';
      case 'google_imagen':
        return 'from-blue-500 to-cyan-500';
      case 'gemini':
        return 'from-teal-500 to-emerald-500';
      case 'qwen':
        return 'from-fuchsia-500 to-violet-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 flex-1 p-8 pt-24">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Wand2 className="w-8 h-8 text-purple-600" />
              AI Image Generator
            </h1>
            <p className="text-gray-600">Generate stunning images using advanced AI models</p>
          </div>
          <div className="shrink-0">
            <div className="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-600">Credits</span>
              <span className="text-sm font-semibold text-gray-900">{userCredits}</span>
              <span className="h-4 w-px bg-gray-200" />
              <span className="text-sm text-gray-600">Cost</span>
              <span className="text-sm font-semibold text-gray-900">{costPerImage}/img</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && showError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
            <button
              onClick={() => setShowError(false)}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Generation Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-6">
            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your image
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A majestic mountain landscape at sunset with a lake reflecting the sky..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                disabled={isGenerating}
              />
              <p className="text-sm text-gray-500 mt-1">
                Be specific and descriptive for better results
              </p>
            </div>

            {/* API Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose AI Model
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {apiOptions.map((api) => {
                  const IconComponent = api.icon;
                  return (
                    <button
                      key={api.id}
                      onClick={() => setSelectedApi(api.id)}
                      disabled={isGenerating}
                      className={`p-4 rounded-lg border-2 transition-all ${selectedApi === api.id
                        ? 'border-purple-500 bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'
                        } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} duration-200`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getApiGradient(api.id)} flex items-center justify-center shadow-sm`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{api.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 text-left">{api.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating || userCredits < costPerImage}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  {userCredits < costPerImage ? 'Insufficient credits' : 'Generate Image'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Images */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Generated Images</h3>
            <p className="text-sm text-gray-600 mt-1">Your recent AI-generated images</p>
          </div>

          <div className="p-6">
            {generations.length === 0 ? (
              <div className="text-center py-12">
                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No images generated yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first AI-generated image above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generations.map((generation) => (
                  <div key={generation.id} className="bg-gray-50 rounded-lg overflow-hidden relative border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="absolute top-2 left-2 z-10">
                      {generation.status === 'completed' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Completed</span>
                      )}
                      {generation.status === 'pending' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Pending</span>
                      )}
                      {generation.status === 'failed' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Failed</span>
                      )}
                    </div>
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {generation.status === 'completed' && generation.image_url ? (
                        <img
                          src={generation.image_url}
                          alt={generation.prompt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          {generation.status === 'pending' ? (
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                          ) : (
                            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                          )}
                          <p className="text-sm text-gray-500">
                            {generation.status === 'pending' ? 'Generating...' : 'Failed'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(generation.status)}
                          <span className="text-sm font-medium text-gray-700">
                            {getApiName(generation.api_provider)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(generation.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {generation.prompt}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(generation.created_at).toLocaleDateString()}
                        </span>

                        {generation.status === 'completed' && generation.image_url && (
                          <button
                            onClick={() => handleDownload(generation.image_url!, generation.prompt)}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {generation.error_message && (
                        <p className="text-xs text-red-500 mt-2">
                          {generation.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
