import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface LessonPlanRequest {
  title: string;
  subject: string;
  grade_level: string;
  duration_minutes: number;
  objectives: string[];
}

export interface GeneratedLessonPlan {
  title: string;
  subject: string;
  grade_level: string;
  duration_minutes: number;
  objectives: string[];
  introduction: string;
  main_content: string[];
  activities: Array<{
    name: string;
    duration: number;
    description: string;
  }>;
  assessment: string;
  resources: string[];
}

export async function generateLessonPlan(
  request: LessonPlanRequest
): Promise<GeneratedLessonPlan> {
  const prompt = `
You are an expert teacher. Create a detailed lesson plan with the following information:

Title: ${request.title}
Subject: ${request.subject}
Grade Level: ${request.grade_level}
Duration: ${request.duration_minutes} minutes
Learning Objectives:
${request.objectives.map(obj => `- ${obj}`).join('\n')}

Generate a comprehensive lesson plan in JSON format with these exact fields:
{
  "title": "${request.title}",
  "subject": "${request.subject}",
  "grade_level": "${request.grade_level}",
  "duration_minutes": ${request.duration_minutes},
  "objectives": [${request.objectives.map(o => `"${o}"`).join(', ')}],
  "introduction": "An engaging introduction paragraph (2-3 sentences)",
  "main_content": [
    "First main concept with explanation",
    "Second main concept with explanation",
    "Third main concept with explanation"
  ],
  "activities": [
    {
      "name": "Activity Name",
      "duration": 10,
      "description": "Detailed description of the activity"
    }
  ],
  "assessment": "How students will be assessed",
  "resources": [
    "Resource 1",
    "Resource 2",
    "Resource 3"
  ]
}

Return ONLY valid JSON, no additional text.
  `;

  try {
    const message = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const responseText = message.choices[0]?.message?.content || '';
    console.log('OpenAI Response:', responseText.substring(0, 200));
    
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse JSON from response - try multiple patterns
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON. Response:', responseText);
      throw new Error(`Could not parse JSON from response: ${responseText.substring(0, 100)}`);
    }

    try {
      const lessonPlan: GeneratedLessonPlan = JSON.parse(jsonMatch[0]);
      return lessonPlan;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Input:', jsonMatch[0].substring(0, 200));
      throw new Error(`Invalid JSON in response: ${parseError}`);
    }
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    if (error instanceof Error) throw error;
    throw new Error(String(error));
  }
}

export async function generateQuiz(
  lessonContent: string,
  numQuestions: number = 5
): Promise<Array<{
  id: string;
  text: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  correct_answer: string;
  explanation: string;
}>> {
  const prompt = `
Based on this lesson content:

${lessonContent}

Generate ${numQuestions} quiz questions in JSON format. Mix multiple-choice and short-answer questions.

Return a JSON array with this structure:
[
  {
    "id": "q1",
    "text": "Question text here?",
    "type": "multiple-choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "Why this is the correct answer"
  },
  {
    "id": "q2",
    "text": "Short answer question?",
    "type": "short-answer",
    "correct_answer": "Expected answer",
    "explanation": "Explanation of the answer"
  }
]

Return ONLY valid JSON array, no additional text.
  `;

  try {
    const message = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.choices[0]?.message?.content || '';
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    return questions;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz');
  }
}

export async function generateCaptions(
  transcript: string
): Promise<Array<{ timestamp: number; text: string }>> {
  const prompt = `
Convert this transcript into timestamped captions (every 10-15 words):

${transcript}

Return JSON array with timestamps (in seconds) and caption text:
[
  { "timestamp": 0, "text": "First caption" },
  { "timestamp": 5, "text": "Second caption" },
  { "timestamp": 10, "text": "Third caption" }
]

Return ONLY valid JSON array, no additional text.
  `;

  try {
    const message = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.choices[0]?.message?.content || '';
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const captions = JSON.parse(jsonMatch[0]);
    return captions;
  } catch (error) {
    console.error('Error generating captions:', error);
    throw new Error('Failed to generate captions');
  }
}