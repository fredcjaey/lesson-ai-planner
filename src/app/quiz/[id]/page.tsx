'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setQuiz(data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (questionId: string, answer: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!studentName.trim()) {
      alert('Please enter your name');
      return;
    }

    setSubmitting(true);

    try {
      const responseArray = Object.entries(responses).map(
        ([question_id, answer]) => ({
          question_id,
          answer,
        })
      );

      const response = await fetch(`/api/quizzes/${params.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: responseArray,
          student_name: studentName,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      const data = await response.json();
      setResult(data.grading_result);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Quiz not found</div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-8">
            <h2 className="text-4xl font-bold text-white mb-8">Quiz Results</h2>

            <div className="bg-slate-700/50 rounded-lg p-8 mb-8 border border-purple-500/20">
              <div className="text-center">
                <p className="text-gray-400 mb-2">Your Score</p>
                <p className="text-6xl font-bold text-purple-400">
                  {result.score}%
                </p>
                <p className="text-gray-400 mt-2">
                  {result.correct_answers} out of {result.total_questions} correct
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Detailed Feedback</h3>
              {result.feedback.map((item: any, i: number) => (
                <div
                  key={i}
                  className={`p-6 rounded-lg border ${
                    item.is_correct
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-white font-bold flex-1">
                      {i + 1}. {item.question_text}
                    </h4>
                    <span
                      className={`text-sm font-bold ${
                        item.is_correct ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {item.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-400">Your Answer:</p>
                      <p className="text-gray-300">{item.student_answer || '(Not answered)'}</p>
                    </div>
                    {!item.is_correct && (
                      <div>
                        <p className="text-gray-400">Correct Answer:</p>
                        <p className="text-green-400">{item.correct_answer}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400">Explanation:</p>
                      <p className="text-gray-300">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="mt-8 w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-2">{quiz.title}</h2>
          <p className="text-gray-400 mb-8">
            {quiz.questions.length} questions
          </p>

          {!studentName && (
            <div className="bg-slate-700/50 rounded-lg p-6 mb-8">
              <label className="block text-gray-300 font-medium mb-2">
                What is your name?
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-600 border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div className="space-y-8">
            {quiz.questions.map((question: Question, i: number) => (
              <div key={question.id} className="bg-slate-700/50 rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-white font-bold mb-4">
                  {i + 1}. {question.text}
                </h3>

                {question.type === 'multiple-choice' ? (
                  <div className="space-y-3">
                    {question.options?.map((option, idx) => (
                      <label key={idx} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={responses[question.id] === option}
                          onChange={(e) => handleResponse(question.id, e.target.value)}
                          className="mr-3 w-4 h-4 accent-purple-500"
                        />
                        <span className="text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={responses[question.id] || ''}
                    onChange={(e) => handleResponse(question.id, e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-600 border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 h-32"
                    placeholder="Type your answer here..."
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !studentName}
            className="mt-8 w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </main>
    </div>
  );
}