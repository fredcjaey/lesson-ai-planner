'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { lessonPlanService } from '@/lib/db';
import { BookOpen, Zap, Play } from 'lucide-react';
import { LessonPlan } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setUser(user);
    fetchLessonPlans(user.id);
  };

  const fetchLessonPlans = async (userId: string) => {
    try {
      const plans = await lessonPlanService.getAll(userId);
      setLessonPlans(plans);
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
          <h1 className="text-white font-bold text-lg">LessonAI</h1>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-gray-400">Welcome, {user?.email}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/lesson-plan/new')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition"
            >
              <Zap className="w-5 h-5" />
              New Lesson
            </button>
            <button
              onClick={() => router.push('/live-session')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-700/50 border border-purple-500/20 text-white font-bold hover:bg-slate-700 transition"
            >
              <Play className="w-5 h-5" />
              Go Live
            </button>
          </div>
        </div>

        {/* Lesson Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessonPlans.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No lesson plans yet. Create one to get started!</p>
            </div>
          ) : (
            lessonPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => router.push(`/lesson-plan/${plan.id}`)}
                className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition cursor-pointer group"
              >
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-purple-400 transition">
                  {plan.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{plan.subject}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Grade: {plan.grade_level}</span>
                  <span className="text-gray-500 text-xs">{plan.duration_minutes} min</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}