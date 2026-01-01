export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  correct_answer: string;
  explanation: string;
}

export interface StudentResponse {
  question_id: string;
  answer: string;
}

export interface GradingResult {
  total_questions: number;
  correct_answers: number;
  score: number; // percentage
  feedback: Array<{
    question_id: string;
    question_text: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
  }>;
}

export function gradeQuiz(
  questions: QuizQuestion[],
  responses: StudentResponse[]
): GradingResult {
  const feedback = [];
  let correctCount = 0;

  // Create a map of responses for easy lookup
  const responseMap = new Map(
    responses.map(r => [r.question_id, r.answer])
  );

  for (const question of questions) {
    const studentAnswer = responseMap.get(question.id) || '';
    const isCorrect = compareAnswers(
      studentAnswer,
      question.correct_answer,
      question.type
    );

    if (isCorrect) {
      correctCount++;
    }

    feedback.push({
      question_id: question.id,
      question_text: question.text,
      student_answer: studentAnswer,
      correct_answer: question.correct_answer,
      is_correct: isCorrect,
      explanation: question.explanation,
    });
  }

  const score = (correctCount / questions.length) * 100;

  return {
    total_questions: questions.length,
    correct_answers: correctCount,
    score: Math.round(score),
    feedback,
  };
}

function compareAnswers(
  studentAnswer: string,
  correctAnswer: string,
  type: 'multiple-choice' | 'short-answer'
): boolean {
  const normalize = (str: string) => str.trim().toLowerCase();

  if (type === 'multiple-choice') {
    return normalize(studentAnswer) === normalize(correctAnswer);
  }

  // For short-answer, allow some flexibility
  const student = normalize(studentAnswer);
  const correct = normalize(correctAnswer);

  // Exact match
  if (student === correct) return true;

  // Check if student answer contains key words from correct answer
  const correctWords = correct.split(/\s+/);
  const matchedWords = correctWords.filter(word =>
    student.includes(word)
  );

  // If 70% of words match, consider it correct
  return matchedWords.length / correctWords.length >= 0.7;
}

export async function sendGradeEmail(
  studentEmail: string,
  quizTitle: string,
  score: number,
  feedback: GradingResult['feedback']
) {
  // This would integrate with your email service
  // Using a service like SendGrid, Mailgun, etc.
  console.log(`Email sent to ${studentEmail} - Score: ${score}%`);
}