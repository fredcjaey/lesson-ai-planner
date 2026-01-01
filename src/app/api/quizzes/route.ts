import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { gradeQuiz } from '@/lib/grading';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id;
    const body = await request.json();
    const { responses, student_name } = body;

    // Get quiz from database
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('questions')
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Grade the quiz
    const result = gradeQuiz(quiz.questions, responses);

    // Save response to database
    const { data: savedResponse, error: saveError } = await supabase
      .from('quiz_responses')
      .insert([
        {
          quiz_id: quizId,
          student_name,
          responses,
          score: result.score,
        },
      ])
      .select()
      .single();

    if (saveError) {
      return NextResponse.json(
        { error: 'Failed to save response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response_id: savedResponse.id,
      grading_result: result,
    });
  } catch (error) {
    console.error('Grading error:', error);
    return NextResponse.json(
      { error: 'Failed to grade quiz' },
      { status: 500 }
    );
  }
}