import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { stage, jobFunction, competencies } = await request.json();

    if (!stage || !stage.name || !stage.intent) {
      return NextResponse.json({ 
        error: 'Stage information is required' 
      }, { status: 400 });
    }

    // Get Confluence best practices from our knowledge base
    const confluenceBestPractices = await getConfluenceBestPractices(stage, jobFunction);

    const systemPrompt = `You are an expert interview coach and recruiting strategist. Generate 4-6 high-quality interview questions for this interview stage, informed by best practices from the company's Confluence knowledge base.

CONTEXT FROM CONFLUENCE BEST PRACTICES:
${confluenceBestPractices}

Generate questions that:
- Align with the stage intent and competencies
- Use proven behavioral interviewing techniques (STAR method)
- Are specific and actionable, not generic
- Include both primary questions and suggested follow-ups
- Vary in type (behavioral, situational, technical as appropriate)
- Are appropriate for the job function and level

Return ONLY a JSON array of questions with this structure:
[
  {
    "question": "The main interview question",
    "type": "behavioral|technical|situational|values",
    "competency": "Primary competency this assesses",
    "followUps": ["Follow-up question 1", "Follow-up question 2"],
    "rationale": "Why this question is effective for this stage"
  }
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate interview questions for:
          
Stage: ${stage.name}
Intent: ${stage.intent}
Duration: ${stage.durationMins} minutes
Job Function: ${jobFunction || 'General'}
Competencies: ${(stage.signals || []).join(', ')}
Suggested Interviewers: ${(stage.interviewerHints || []).join(', ')}

Focus on questions that will effectively evaluate: ${(stage.signals || []).join(', ')}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) {
      throw new Error('No response from OpenAI');
    }

    console.log('Raw questions response:', rawResponse);

    // Clean the response
    let cleanedResponse = rawResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Find the JSON array
    const arrayStart = cleanedResponse.indexOf('[');
    const arrayEnd = cleanedResponse.lastIndexOf(']');
    
    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
      cleanedResponse = cleanedResponse.substring(arrayStart, arrayEnd + 1);
    }

    console.log('Cleaned questions response:', cleanedResponse);

    try {
      const questions = JSON.parse(cleanedResponse);
      
      // Add unique IDs to questions
      const questionsWithIds = questions.map((q: any, index: number) => ({
        ...q,
        id: `q_${Date.now()}_${index}`
      }));

      return NextResponse.json({ questions: questionsWithIds });

    } catch (parseError) {
      console.error('Failed to parse questions response:', cleanedResponse);
      
      // Fallback questions based on competencies
      const fallbackQuestions = generateFallbackQuestions(stage);
      return NextResponse.json({ questions: fallbackQuestions });
    }

  } catch (error) {
    console.error('Interview questions generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview questions', details: error.message },
      { status: 500 }
    );
  }
}

// Get best practices from our Confluence knowledge base
async function getConfluenceBestPractices(stage: any, jobFunction?: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/confluence/best-practices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        topic: 'interview_questions',
        stage: stage,
        jobFunction: jobFunction
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.bestPractices;
    }
  } catch (error) {
    console.error('Failed to fetch Confluence best practices:', error);
  }

  // Fallback to basic best practices if API call fails
  return `
INTERVIEW BEST PRACTICES:
- Use structured, competency-based questions
- Follow the STAR method for behavioral questions
- Focus on specific examples from the candidate's experience
- Ask follow-up questions to understand outcomes and lessons learned
- Look for evidence of growth and learning from challenges
`;
}

function generateFallbackQuestions(stage: any) {
  const competency = (stage.signals || [])[0] || 'General';
  
  return [
    {
      id: `fallback_1_${Date.now()}`,
      question: `Tell me about a time when you demonstrated ${competency.toLowerCase()} in a challenging situation.`,
      type: 'behavioral',
      competency,
      followUps: [
        'What was the outcome?',
        'What would you do differently?'
      ],
      rationale: 'Uses behavioral interviewing to assess past performance'
    },
    {
      id: `fallback_2_${Date.now()}`,
      question: `How do you approach ${stage.intent.toLowerCase()}?`,
      type: 'situational', 
      competency,
      followUps: [
        'Can you give me a specific example?',
        'How do you measure success in this area?'
      ],
      rationale: 'Assesses approach and methodology'
    }
  ];
}
