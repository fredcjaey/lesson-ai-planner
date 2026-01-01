'use client';

import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push('/dashboard');
    } else {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">LessonAI</span>
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition font-medium"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            AI-Powered Lesson Planning
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {' '}Made Simple
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Generate comprehensive lesson plans, real-time video captions, and
            interactive quizzes with AI. Everything teachers need to create
            engaging lessons.
          </p>
          <button
            onClick={() => router.push('/auth/signup')}
            className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:opacity-90 transition"
          >
            Get Started Free
          </button>
        </div>
      </main>
    </div>
  );
}