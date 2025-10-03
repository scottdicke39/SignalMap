import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { competencies, org, functionHint } = await request.json();

    if (!competencies || !org || !functionHint) {
      return NextResponse.json({ 
        error: 'Competencies, org context, and function hint are required' 
      }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert recruiting strategist designing interview processes. Create a comprehensive interview loop based on the provided competencies, org context, and role function.

Return ONLY valid JSON with this exact structure:
{
  "stages": [
    {
      "name": "Interview stage name",
      "intent": "What this stage evaluates",
      "durationMins": 30,
      "signals": ["competency1", "competency2"],
      "interviewerHints": ["suggested interviewer or role"],
      "formTemplateId": "optional template ID"
    }
  ],
  "totalMins": 240,
  "risks": ["potential issues with this interview process"]
}

Guidelines:
- Total time should typically be 180-300 minutes
- Include 4-6 stages: recruiter screen, hiring manager, technical/craft, collaboration, values
- Map competencies to appropriate stages
- Suggest interviewers from the org team when possible
- Identify risks like time overrun, signal overlap, missing coverage
- Tailor technical stages based on function (Portfolio/Craft for Design, Technical Deep Dive for Engineering, etc.)`
        },
        {
          role: "user",
          content: `Create an interview loop for:

Function: ${functionHint}
Competencies: ${competencies.map(c => `${c.name}: ${c.rationale}`).join('; ')}

Org Context:
- Manager: ${org.manager}
- Team: ${org.team?.join(', ') || 'TBD'}
- Cross-functional: ${org.crossFunc?.join(', ') || 'None'}`
        }
      ],
      temperature: 0.4,
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error('No response from OpenAI');
    }

    console.log('Raw OpenAI response:', rawContent);

    // Clean the response - remove markdown code blocks and extra text
    let cleanedContent = rawContent.trim();
    
    // Remove markdown code blocks
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove any text before the first { or after the last }
    const firstBrace = cleanedContent.indexOf('{');
    const lastBrace = cleanedContent.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
    }

    console.log('Cleaned OpenAI response:', cleanedContent);

    try {
      const loopPlan = JSON.parse(cleanedContent);
      
      // Calculate total minutes if not provided
      if (!loopPlan.totalMins && loopPlan.stages) {
        loopPlan.totalMins = loopPlan.stages.reduce((sum: number, stage: any) => 
          sum + (stage.durationMins || 0), 0
        );
      }

      return NextResponse.json(loopPlan);
    } catch (parseError) {
      console.error('Failed to parse cleaned OpenAI response:', cleanedContent);
      console.error('Parse error:', parseError);
      
      // Fallback response for UI stability
      const fallbackPlan = {
        stages: [
          {
            name: "Recruiter Screen",
            intent: "Initial assessment and role alignment",
            durationMins: 30,
            signals: ["Communication", "Motivation"],
            interviewerHints: ["Recruiting Team"],
            formTemplateId: null
          },
          {
            name: "Hiring Manager Interview", 
            intent: "Role-specific evaluation",
            durationMins: 45,
            signals: ["Technical Skills", "Experience"],
            interviewerHints: ["Hiring Manager"],
            formTemplateId: null
          }
        ],
        totalMins: 75,
        risks: ["AI parsing failed - using fallback plan. Please retry or manually create interview stages."]
      };
      
      return NextResponse.json(fallbackPlan);
    }

  } catch (error) {
    console.error('OpenAI synthesis error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize interview loop', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
