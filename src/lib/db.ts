import { supabase } from './supabase';

// Lesson Plans
export const lessonPlanService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('lesson_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(userId: string, lessonData: any) {
    const { data, error } = await supabase
      .from('lesson_plans')
      .insert([{ user_id: userId, ...lessonData }])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async update(id: string, lessonData: any) {
    const { data, error } = await supabase
      .from('lesson_plans')
      .update(lessonData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('lesson_plans')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Video Sessions
export const videoSessionService = {
  async create(userId: string, sessionData: any) {
    const { data, error } = await supabase
      .from('video_sessions')
      .insert([{ user_id: userId, ...sessionData }])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async update(id: string, sessionData: any) {
    const { data, error } = await supabase
      .from('video_sessions')
      .update(sessionData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },
};

// Quizzes
export const quizService = {
  async create(userId: string, quizData: any) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([{ user_id: userId, ...quizData }])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async getQuestions(quizId: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('questions')
      .eq('id', quizId)
      .single();
    
    if (error) throw error;
    return data?.questions || [];
  },

  async saveResponse(quizId: string, responses: any) {
    const { data, error } = await supabase
      .from('quiz_responses')
      .insert([{ quiz_id: quizId, responses }])
      .select();
    
    if (error) throw error;
    return data[0];
  },
};