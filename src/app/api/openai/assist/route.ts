import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { section, context, jobTitle, company } = await request.json();

    if (!section) {
      return NextResponse.json({ error: 'Section type is required' }, { status: 400 });
    }

    const systemPrompts = {
      idealCandidate: `You are a recruiting strategist helping identify ideal candidate profiles. 
      
      Based on the job and context provided, suggest 2-3 specific examples of ideal candidates, including:
      - Specific people (if known) or types of profiles
      - Companies they might come from
      - Key experiences that make them ideal
      - LinkedIn search criteria
      
      Be specific and actionable.`,
      
      objectives: `You are a business strategy consultant helping connect hiring to company objectives.
      
      Based on the role and context, suggest specific OKRs and strategic initiatives this hire would support:
      - Revenue impact
      - Strategic initiatives
      - Product/operational goals
      - Team building objectives
      
      Be concrete and measurable where possible.`,
      
      targetCompanies: `You are a recruiting sourcing expert suggesting target companies and industries.
      
      Based on the role context, suggest 8-12 specific companies and 3-4 industries where ideal candidates typically work:
      - Direct competitors with similar roles
      - Adjacent industries with transferable skills  
      - High-growth companies with strong talent
      - Companies known for excellence in this function
      
      Return as a simple comma-separated list.`,
      
      rolePitch: `You are a recruiting expert crafting compelling role pitches for top candidates.
      
      Create a compelling 2-3 paragraph pitch that would excite a high-performer, focusing on:
      - Growth opportunity and career advancement
      - Impact and visibility of the role
      - Company mission and market position
      - Unique challenges and learning opportunities
      - Team and culture highlights
      
      Make it inspiring but authentic.`
    };

    const systemPrompt = systemPrompts[section as keyof typeof systemPrompts] || 
      `You are a recruiting expert providing helpful suggestions for ${section}.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: `Help with ${section} for a ${jobTitle} role${company ? ` at ${company}` : ''}. 
          
          Current context: ${context || 'None provided'}
          
          Please provide specific, actionable suggestions.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const suggestion = completion.choices[0]?.message?.content;
    if (!suggestion) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('OpenAI assist error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI assistance', details: error.message },
      { status: 500 }
    );
  }
}








