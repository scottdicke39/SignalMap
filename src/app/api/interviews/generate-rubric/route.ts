import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { stage, jobFunction, competencies, customPrompt } = await request.json();

    if (!stage || !stage.name || !stage.intent) {
      return NextResponse.json({ 
        error: 'Stage information is required' 
      }, { status: 400 });
    }

    const systemPrompt = `You are an expert in creating interview evaluation rubrics. Create a comprehensive rubric for this interview stage that enables consistent, fair evaluation of candidates.

The rubric should:
- Cover the key competencies being assessed in this stage
- Have 4 performance levels: Excellent, Good, Needs Improvement, Poor
- Use specific, observable behaviors rather than vague descriptions
- Be actionable for interviewers to use during evaluation
- Help differentiate between candidate performance levels
- Be appropriate for the job function and seniority level

Return ONLY a JSON array of rubric criteria with this structure:
[
  {
    "criterion": "Name of the evaluation criterion",
    "excellent": "Specific behaviors/responses for excellent performance",
    "good": "Specific behaviors/responses for good performance", 
    "needs_improvement": "Specific behaviors/responses for needs improvement",
    "poor": "Specific behaviors/responses for poor performance"
  }
]

Make each description specific and actionable, not generic. Focus on what the interviewer would actually observe or hear.`;

    let userPrompt = `Create an evaluation rubric for:
          
Stage: ${stage.name}
Intent: ${stage.intent}
Duration: ${stage.durationMins} minutes
Job Function: ${jobFunction || 'General'}
Competencies to Assess: ${(stage.signals || []).join(', ')}

The rubric should help interviewers consistently evaluate candidates on these specific competencies during this interview stage.`;

    // Add custom prompt if provided
    if (customPrompt) {
      userPrompt += `\n\nADDITIONAL GUIDANCE: ${customPrompt}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) {
      throw new Error('No response from OpenAI');
    }

    console.log('Raw rubric response:', rawResponse);

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

    console.log('Cleaned rubric response:', cleanedResponse);

    try {
      const rubric = JSON.parse(cleanedResponse);
      return NextResponse.json({ rubric });

    } catch (parseError) {
      console.error('Failed to parse rubric response:', cleanedResponse);
      
      // Fallback rubric based on competencies
      const fallbackRubric = generateFallbackRubric(stage);
      return NextResponse.json({ rubric: fallbackRubric });
    }

  } catch (error) {
    console.error('Rubric generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate rubric', details: error.message },
      { status: 500 }
    );
  }
}

function generateFallbackRubric(stage: any) {
  const primaryCompetency = (stage.signals || [])[0] || 'General Performance';
  
  return [
    {
      criterion: primaryCompetency,
      excellent: "Demonstrates exceptional capability with specific examples and clear impact",
      good: "Shows solid competency with relevant examples and positive outcomes", 
      needs_improvement: "Shows basic understanding but examples lack depth or clarity",
      poor: "Unable to demonstrate competency or provides irrelevant examples"
    },
    {
      criterion: "Communication",
      excellent: "Articulates thoughts clearly, listens actively, asks thoughtful questions",
      good: "Communicates effectively with minor areas for improvement",
      needs_improvement: "Communication is unclear or one-directional", 
      poor: "Significant communication barriers or unprofessional demeanor"
    },
    {
      criterion: "Problem-Solving Approach",
      excellent: "Demonstrates structured thinking, considers multiple approaches, shows adaptability",
      good: "Uses logical approach with some structure and consideration of alternatives",
      needs_improvement: "Basic problem-solving approach with limited structure or creativity",
      poor: "Disorganized thinking or inability to work through problems systematically"
    }
  ];
}








