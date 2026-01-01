import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { lessonPlanService } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const lessonId = params.id;

    const { data: lessonPlan, error } = await supabase
      .from('lesson_plans')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error || !lessonPlan) {
      return NextResponse.json({ error: 'Lesson plan not found' }, { status: 404 });
    }

    return NextResponse.json(lessonPlan);
  } catch (error) {
    console.error('Error fetching lesson plan:', error);
    return NextResponse.json({ error: 'Failed to fetch lesson plan' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const lessonId = params.id;

    const body = await request.json();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedPlan = await lessonPlanService.update(lessonId, body);

    return NextResponse.json({ success: true, lessonPlan: updatedPlan });
  } catch (error) {
    console.error('Error updating lesson plan:', error);
    return NextResponse.json({ error: 'Failed to update lesson plan' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const lessonId = params.id;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await lessonPlanService.delete(lessonId);

    return NextResponse.json({ success: true, message: 'Lesson plan deleted' });
  } catch (error) {
    console.error('Error deleting lesson plan:', error);
    return NextResponse.json({ error: 'Failed to delete lesson plan' }, { status: 500 });
  }
}