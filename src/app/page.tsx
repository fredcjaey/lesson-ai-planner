'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, Zap, Play } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-white font-bold text-2xl">LessonAI</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-purple-400 hover:text-purple-300"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-white mb-6">
            Create Lesson Plans with AI
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Generate comprehensive lesson plans, live captions, and interactive quizzes in minutes. Powered by advanced AI.
          </p>
          <button
            onClick={() => router.push('/auth/signup')}
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:opacity-90 transition"
          >
            Get Started Free
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/40 transition">
            <BookOpen className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">Lesson Plans</h3>
            <p className="text-gray-400">
              Generate detailed lesson plans tailored to your subject, grade level, and learning objectives.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/40 transition">
            <Zap className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">Live Sessions</h3>
            <p className="text-gray-400">
              Stream lessons with real-time captions and student engagement tools.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/40 transition">
            <Play className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">Quizzes</h3>
            <p className="text-gray-400">
              Create interactive quizzes with automatic grading and instant feedback.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
