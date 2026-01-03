import { NextRequest, NextResponse } from 'next/server';
import { generateLessonPlan } from '@/lib/ai';
import { supabase } from '@/lib/supabase';
import { lessonPlanService } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const {
      title,
      subject,
      grade_level,
      duration_minutes,
      objectives,
    } = body;

    // Validate required fields
    if (!title || !subject || !grade_level || !duration_minutes || !objectives) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log request for debugging
    console.log('Generate lesson plan request body:', body);
    console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);

    // Generate lesson plan using OpenAI
    const generatedPlan = await generateLessonPlan({
      title,
      subject,
      grade_level,
      duration_minutes,
      objectives: Array.isArray(objectives) ? objectives : [objectives],
    });

    // Format content for storage
    const content = `
## ${generatedPlan.title}

### Introduction
${generatedPlan.introduction}

### Main Content
${generatedPlan.main_content.map(content => `- ${content}`).join('\n')}

### Activities
${generatedPlan.activities.map(activity => `
- **${activity.name}** (${activity.duration} min)
  ${activity.description}
`).join('\n')}

### Assessment
${generatedPlan.assessment}
    `.trim();

    // Save to database
    const lessonPlan = await lessonPlanService.create(user.id, {
      title,
      subject,
      grade_level,
      duration_minutes,
      objectives: generatedPlan.objectives,
      content,
      resources: generatedPlan.resources,
    });

    return NextResponse.json({
      success: true,
      lessonPlan,
      generated: generatedPlan,
    });
  } catch (error) {
    console.error('API Error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
