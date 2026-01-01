export interface LessonPlan {
  id: string;
  user_id?: string;
  title: string;
  subject: string;
  grade_level: string;
  duration_minutes: number;
  objectives: string[];
  introduction?: string;
  main_content?: string[];
  activities?: Array<{ name: string; duration: number; description: string }>;
  assessment?: string;
  resources?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}
