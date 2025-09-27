import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Video, Loader2, XCircle, CheckCircle, Clock, Upload, Download, Trash2 } from 'lucide-react';

interface VideoJob {
    id: string;
    prompt: string | null;
    api_provider: 'alibaba_wan_2_2';
    input_image_url: string | null;
    motion_video_url: string | null;
    output_video_url: string | null;
    status: 'pending' | 'completed' | 'failed';
    error_message: string | null;
    created_at: string;
}

const costPerVideo = 25; // credits per render

const VideoGenerator: React.FC = () => {
    const { user } = useAuth();
    const [userCredits, setUserCredits] = useState<number>(0);
    const [prompt, setPrompt] = useState<string>('');
    const [mode, setMode] = useState<'i2v' | 't2v'>('i2v');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [motionFile, setMotionFile] = useState<File | null>(null);
    const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('480p');
    const [duration, setDuration] = useState<number>(5);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [jobs, setJobs] = useState<VideoJob[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showError, setShowError] = useState<boolean>(true);

    useEffect(() => {
        if (user) {
            fetchUserCredits();
            fetchJobs();
        }
    }, [user]);

    const fetchUserCredits = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('users')
                .select('credits')
                .eq('id', user.id)
                .single();
            if (error) return;
            setUserCredits(data?.credits ?? 0);
        } catch { }
    };

    const fetchJobs = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('video_generations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(30);
            if (error) return;
            setJobs((data as unknown as VideoJob[]) || []);
        } catch { }
    };

    const uploadToStorage = async (file: File, bucket: string): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `${user!.id}/${fileName}`;
        const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async () => {
        if (!user) return;
        if (mode === 'i2v') {
            if (!imageFile || !motionFile) {
                setError('Please select both an input image and a motion reference video.');
                setShowError(true);
                return;
            }
        } else if (!prompt.trim()) {
            setError('Please enter a prompt for Text-to-Video.');
            setShowError(true);
            return;
        }
        if (userCredits < costPerVideo) {
            setError(`Insufficient credits. You need at least ${costPerVideo} credits.`);
            setShowError(true);
            return;
        }
        setIsSubmitting(true);
        setError(null);
        setShowError(false);
        try {
            let imageUrl: string | undefined;
            let motionUrl: string | undefined;
            if (mode === 'i2v') {
                [imageUrl, motionUrl] = await Promise.all([
                    uploadToStorage(imageFile!, 'video-generator-inputs'),
                    uploadToStorage(motionFile!, 'video-generator-inputs')
                ]);
            }

            const { data, error } = await supabase.functions.invoke('wavespeed-wan-animate', {
                body: {
                    userId: user.id,
                    mode,
                    prompt: prompt || null,
                    apiProvider: 'alibaba_wan_2_2',
                    inputImageUrl: imageUrl,
                    motionVideoUrl: motionUrl,
                    resolution,
                    durationSeconds: duration
                }
            });

            if (error) throw new Error(error.message || 'Failed to start video generation');
            if (!data?.success) throw new Error(data?.error || 'Video generation failed to start');

            await fetchUserCredits();
            await fetchJobs();
            setPrompt('');
            setImageFile(null);
            setMotionFile(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start video generation');
            setShowError(true);
        } finally {
            setIsSubmitting(false);
            await fetchUserCredits();
        }
    };

    const handleDownload = async (url: string) => {
        try {
            const res = await fetch(url, { mode: 'cors' });
            const blob = await res.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = 'generated-video.mp4';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(objectUrl);
        } catch { }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('video_generations').delete().eq('id', id);
            if (error) return;
            setJobs(prev => prev.filter(j => j.id !== id));
        } catch { }
    };

    const statusIcon = (status: VideoJob['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 pt-24 max-w-6xl">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Video className="w-8 h-8 text-indigo-600" />
                            AI Video Generator
                        </h1>
                        <p className="text-gray-600">Alibaba Wan 2.2 via Wavespeed. Submit an image and a motion reference video to animate.</p>
                    </div>
                    <div className="shrink-0">
                        <div className="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
                            <span className="text-sm text-gray-600">Credits</span>
                            <span className="text-sm font-semibold text-gray-900">{userCredits}</span>
                            <span className="h-4 w-px bg-gray-200" />
                            <span className="text-sm text-gray-600">Cost</span>
                            <span className="text-sm font-semibold text-gray-900">{costPerVideo}/video</span>
                        </div>
                    </div>
                </div>

                {error && showError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-4">
                        <div className="flex items-center">
                            <XCircle className="h-5 w-5 text-red-400 mr-2" />
                            <p className="text-red-600">{error}</p>
                        </div>
                        <button onClick={() => setShowError(false)} className="text-red-500 hover:text-red-600 text-sm">Dismiss</button>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Optional prompt</label>
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Short description to guide motion/style (optional)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                                <select
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value as 'i2v' | 't2v')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    disabled={isSubmitting}
                                >
                                    <option value="i2v">Image + Motion → Video (WAN 2.2)</option>
                                    <option value="t2v">Text → Video (WAN 2.5)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
                                <select
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value as '480p' | '720p' | '1080p')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    disabled={isSubmitting}
                                >
                                    <option value="480p">480p</option>
                                    <option value="720p">720p</option>
                                    <option value="1080p">1080p</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
                                <input
                                    type="number"
                                    min={3}
                                    max={10}
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value || '5', 10))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    disabled={isSubmitting || mode === 'i2v'}
                                />
                            </div>
                        </div>

                        {mode === 'i2v' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Input image</label>
                                    <div className="flex items-center gap-3">
                                        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} disabled={isSubmitting} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">PNG or JPG up to 5MB</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Motion reference video</label>
                                    <div className="flex items-center gap-3">
                                        <input type="file" accept="video/*" onChange={(e) => setMotionFile(e.target.files?.[0] || null)} disabled={isSubmitting} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">MP4 up to 20MB</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (mode === 'i2v' && (!imageFile || !motionFile)) || (mode === 't2v' && !prompt.trim()) || userCredits < costPerVideo}
                            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    {userCredits < costPerVideo ? 'Insufficient credits' : 'Generate Video'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Generations</h3>
                        <p className="text-sm text-gray-600 mt-1">Your latest AI video generations</p>
                    </div>
                    <div className="p-6">
                        {jobs.length === 0 ? (
                            <div className="text-center py-12">
                                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No videos generated yet</p>
                                <p className="text-sm text-gray-400 mt-1">Start by uploading an image and a motion video above</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {jobs.map(job => (
                                    <div key={job.id} className="bg-gray-50 rounded-lg overflow-hidden relative border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="absolute top-2 left-2 z-10">
                                            {job.status === 'completed' && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Completed</span>
                                            )}
                                            {job.status === 'pending' && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Pending</span>
                                            )}
                                            {job.status === 'failed' && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Failed</span>
                                            )}
                                        </div>

                                        <div className="aspect-video bg-black flex items-center justify-center">
                                            {job.status === 'completed' && job.output_video_url ? (
                                                <video controls className="w-full h-full">
                                                    <source src={job.output_video_url} type="video/mp4" />
                                                </video>
                                            ) : (
                                                <div className="text-center">
                                                    {job.status === 'pending' ? (
                                                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                                                    ) : (
                                                        <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                                    )}
                                                    <p className="text-sm text-gray-500">
                                                        {job.status === 'pending' ? 'Generating...' : 'Failed'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {statusIcon(job.status)}
                                                    <span className="text-sm font-medium text-gray-700">Alibaba Wan 2.2</span>
                                                </div>
                                                <button onClick={() => handleDelete(job.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {job.prompt && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.prompt}</p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">{new Date(job.created_at).toLocaleDateString()}</span>
                                                {job.status === 'completed' && job.output_video_url && (
                                                    <button onClick={() => handleDownload(job.output_video_url!)} className="text-blue-600 hover:text-blue-700 transition-colors">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {job.error_message && (
                                                <p className="text-xs text-red-500 mt-2">{job.error_message}</p>
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

export default VideoGenerator;


