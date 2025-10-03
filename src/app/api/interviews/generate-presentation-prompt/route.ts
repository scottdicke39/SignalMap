import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { stage, jobFunction, competencies, existingPrompt } = await request.json();

    if (!stage || !stage.name) {
      return NextResponse.json({ 
        error: 'Stage information is required' 
      }, { status: 400 });
    }

    const systemPrompt = `You are an expert in designing presentation-based interview assessments. Create a comprehensive presentation prompt that evaluates the specified competencies while being relevant to the role and company.

The presentation prompt should:
- Be realistic and relevant to the actual job responsibilities
- Allow candidates to showcase the target competencies naturally
- Include clear deliverables and evaluation criteria
- Specify time limits and format requirements
- Provide context that candidates need to create a compelling presentation
- Include guidance on what interviewers should look for

${existingPrompt ? `EXISTING PROMPT TO IMPROVE/BUILD UPON:\n${existingPrompt}\n` : ''}

Return a JSON object with this structure:
{
  "presentationPrompt": {
    "title": "Clear title for the presentation challenge",
    "context": "Background/scenario the candidate should address",
    "deliverables": ["Specific things the candidate should include"],
    "timeLimit": "X minutes for presentation + Y minutes for Q&A",
    "format": "Presentation format requirements (slides, etc.)",
    "evaluationCriteria": ["What interviewers should assess"],
    "candidateGuidance": ["Helpful tips for candidates to succeed"]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Create a presentation prompt for:
          
Stage: ${stage.name}
Intent: ${stage.intent}  
Duration: ${stage.durationMins} minutes
Job Function: ${jobFunction || 'General'}
Competencies to Assess: ${(stage.signals || []).join(', ')}

${existingPrompt ? 'Please improve and build upon the existing prompt provided.' : 'Create a new presentation prompt from scratch.'}

Focus on evaluating: ${(stage.signals || []).join(', ')}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) {
      throw new Error('No response from OpenAI');
    }

    console.log('Raw presentation prompt response:', rawResponse);

    // Clean the response
    let cleanedResponse = rawResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Find JSON object
    const objStart = cleanedResponse.indexOf('{');
    const objEnd = cleanedResponse.lastIndexOf('}');
    
    if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
      cleanedResponse = cleanedResponse.substring(objStart, objEnd + 1);
    }

    console.log('Cleaned presentation prompt response:', cleanedResponse);

    try {
      const result = JSON.parse(cleanedResponse);
      return NextResponse.json(result);

    } catch (parseError) {
      console.error('Failed to parse presentation prompt response:', cleanedResponse);
      
      // Fallback presentation prompt
      const fallbackPrompt = {
        presentationPrompt: {
          title: `${jobFunction || 'Role'} Case Study Presentation`,
          context: `You've been brought in as a consultant to help solve a challenge relevant to this ${jobFunction || 'role'}. Prepare a presentation that demonstrates your approach and recommendations.`,
          deliverables: [
            "Problem analysis and key insights",
            "Proposed solution with clear rationale", 
            "Implementation plan with timeline",
            "Success metrics and evaluation criteria"
          ],
          timeLimit: "15 minutes presentation + 10 minutes Q&A",
          format: "Slides recommended (5-8 slides max), bring your own laptop",
          evaluationCriteria: [
            "Clarity of thinking and communication",
            "Depth of analysis and insights",
            "Feasibility of proposed solutions",
            "Ability to handle questions and feedback"
          ],
          candidateGuidance: [
            "Focus on your thought process, not just conclusions",
            "Use specific examples where possible",
            "Be prepared to defend your recommendations",
            "Practice timing - stick to the time limit"
          ]
        }
      };
      
      return NextResponse.json(fallbackPrompt);
    }

  } catch (error) {
    console.error('Presentation prompt generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation prompt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}








