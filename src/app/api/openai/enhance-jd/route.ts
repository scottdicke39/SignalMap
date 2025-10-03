import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { jobDescription } = await request.json();

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert recruiter and job description writer. Your job is to enhance job descriptions to make them more compelling, clear, and effective at attracting top candidates.

          Focus on:
          - Improving clarity and readability
          - Making the role more compelling and exciting
          - Ensuring inclusive language
          - Highlighting growth opportunities and impact
          - Structuring information logically
          - Removing jargon and corporate speak
          - Adding specific, concrete details where helpful
          - Making requirements realistic and not overly restrictive
          
          Return only the enhanced job description, no commentary.`
        },
        {
          role: "user", 
          content: `Please enhance this job description:\n\n${jobDescription}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const enhancedJD = completion.choices[0]?.message?.content;
    if (!enhancedJD) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({ enhancedJD });

  } catch (error) {
    console.error('OpenAI job description enhancement error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance job description', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}








