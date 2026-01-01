'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function NewLessonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade_level: '',
    duration_minutes: 45,
    objectives: '',
  });

  const handleSubmit = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      // Get auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('No auth token');
      }

      // Call generate API
      const response = await fetch('/api/lesson-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          subject: formData.subject,
          grade_level: formData.grade_level,
          duration_minutes: formData.duration_minutes,
          objectives: formData.objectives.split('\n').filter(o => o.trim()),
        }),
      });

      // Safely parse response body (handle empty or non-JSON responses)
      const text = await response.text();
      let responseData: any = null;
      try {
        responseData = text ? JSON.parse(text) : null;
      } catch (err) {
        console.warn('Response is not valid JSON:', err, text?.slice(0, 200));
        responseData = null;
      }

      if (!response.ok) {
        const errMsg = responseData?.error || text || 'Failed to generate lesson plan';
        throw new Error(errMsg);
      }

      console.log('Lesson plan created:', responseData?.lessonPlan ?? responseData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create lesson plan');
    } finally {
      setLoading(false);
    }
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

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Create New Lesson Plan</h2>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Photosynthesis"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Subject
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select subject</option>
                  <option value="Science">Science</option>
                  <option value="Math">Math</option>
                  <option value="History">History</option>
                  <option value="English">English</option>
                  <option value="Art">Art</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Grade Level
                </label>
                <input
                  type="text"
                  value={formData.grade_level}
                  onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., 9-10"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Learning Objectives (one per line)
              </label>
              <textarea
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500 h-32"
                placeholder="Students will be able to...&#10;- Understand photosynthesis&#10;- Identify key components"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Generate Lesson Plan with AI ✨'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}