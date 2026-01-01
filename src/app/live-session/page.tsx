'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { VideoRecorder } from '@/lib/video';
import { Play, Loader } from 'lucide-react';

export default function LiveSessionPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<VideoRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [captions, setCaptions] = useState([
    { time: '0:00', text: 'Welcome to the live lesson' },
    { time: '0:15', text: 'Today we are discussing key concepts' },
    { time: '0:45', text: 'Let me explain this in detail' },
  ]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
    } else {
      setUser(user);
    }
  };

  const handleStartRecording = async () => {
    try {
      setIsLoading(true);
      recorderRef.current = new VideoRecorder();
      await recorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Check camera/microphone permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsLoading(true);

      if (!recorderRef.current) return;

      const video = await recorderRef.current.stopRecording();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Upload to Supabase
      const videoUrl = await recorderRef.current.uploadToSupabase(
        video,
        user.id,
        `session-${Date.now()}`
      );

      // Save session to database
      const { error } = await supabase.from('video_sessions').insert([
        {
          user_id: user.id,
          session_name: `Live Session - ${new Date().toLocaleString()}`,
          video_url: videoUrl,
          transcript: 'Transcription will be added soon',
          captions: {},
          status: 'completed',
        },
      ]);

      if (error) throw error;

      alert('Video saved successfully!');
      setIsRecording(false);
      setRecordingTime(0);
    } catch (error) {
      console.error('Failed to save recording:', error);
      alert('Failed to save recording.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-slate-800/50 backdrop-blur border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-purple-400 hover:text-purple-300"
          >
            ← Back
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Live Lesson Session
            {isRecording && (
              <span className="ml-4 text-red-400 text-xl">
                REC {formatTime(recordingTime)}
              </span>
            )}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="md:col-span-2">
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4 border border-purple-500/20 overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                {!isRecording && !videoRef.current?.srcObject && (
                  <Play className="w-16 h-16 text-gray-500" />
                )}
              </div>

              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-bold transition ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-50'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : isRecording ? (
                  '⚫ Stop Recording'
                ) : (
                  '⚪ Start Recording'
                )}
              </button>
            </div>

            {/* Captions Panel */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
              <h3 className="text-white font-bold mb-4">Live Captions</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {captions.map((caption, i) => (
                  <div key={i} className="text-sm border-l-2 border-purple-500 pl-3">
                    <span className="text-purple-400 text-xs font-mono">
                      {caption.time}
                    </span>
                    <p className="text-gray-300">{caption.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}