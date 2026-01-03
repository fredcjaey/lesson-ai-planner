'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LessonPlan } from '@/types';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function LessonPlanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLessonPlan();
  }, [id]);

  const fetchLessonPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/dashboard');
        return;
      }

      setLessonPlan(data);
    } catch (error) {
      console.error('Error fetching lesson plan:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lesson plan?')) {
      return;
    }

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('lesson_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      alert('Failed to delete lesson plan');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!lessonPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-gray-400 text-xl">Lesson plan not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex gap-4">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-8">
          <h1 className="text-4xl font-bold text-white mb-2">{lessonPlan.title}</h1>
          
          <div className="flex gap-6 mb-8 text-sm text-gray-400">
            <span>Subject: <span className="text-purple-400 font-semibold">{lessonPlan.subject}</span></span>
            <span>Grade: <span className="text-purple-400 font-semibold">{lessonPlan.grade_level}</span></span>
            <span>Duration: <span className="text-purple-400 font-semibold">{lessonPlan.duration_minutes} min</span></span>
          </div>

          {/* Learning Objectives */}
          {lessonPlan.objectives && lessonPlan.objectives.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Learning Objectives</h2>
              <ul className="space-y-2">
                {lessonPlan.objectives.map((obj, i) => (
                  <li key={i} className="text-gray-300 flex items-start gap-3">
                    <span className="text-purple-400 font-bold mt-1">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Introduction */}
          {lessonPlan.introduction && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Introduction</h2>
              <p className="text-gray-300 leading-relaxed">{lessonPlan.introduction}</p>
            </div>
          )}

          {/* Main Content */}
          {lessonPlan.main_content && lessonPlan.main_content.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Main Content</h2>
              <ul className="space-y-3">
                {lessonPlan.main_content.map((content, i) => (
                  <li key={i} className="text-gray-300 flex items-start gap-3">
                    <span className="text-purple-400 font-bold mt-1">•</span>
                    <span>{content}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Activities */}
          {lessonPlan.activities && lessonPlan.activities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Activities</h2>
              <div className="space-y-4">
                {lessonPlan.activities.map((activity, i) => (
                  <div
                    key={i}
                    className="bg-slate-700/50 border border-purple-500/20 rounded-lg p-4"
                  >
                    <h3 className="text-purple-400 font-bold mb-2">
                      {activity.name} ({activity.duration} min)
                    </h3>
                    <p className="text-gray-300">{activity.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assessment */}
          {lessonPlan.assessment && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Assessment</h2>
              <p className="text-gray-300 leading-relaxed">{lessonPlan.assessment}</p>
            </div>
          )}

          {/* Resources */}
          {lessonPlan.resources && lessonPlan.resources.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Resources</h2>
              <ul className="space-y-2">
                {lessonPlan.resources.map((resource, i) => (
                  <li key={i} className="text-gray-300 flex items-start gap-3">
                    <span className="text-purple-400 font-bold mt-1">•</span>
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
