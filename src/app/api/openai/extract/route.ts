import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, hiringManager, department } = await request.json();

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert recruiter analyzing job descriptions. 

${hiringManager ? `HIRING CONTEXT TO CONSIDER:
- Hiring Manager: ${hiringManager}
- Department: ${department || 'Unknown'}

Use this context to accurately classify the role function. For example:
- Operations/Delivery managers typically hire for "Operations" roles
- Engineering managers hire for "Engineering" roles  
- AI/Data managers hire for "Data/ML" roles
- Product managers hire for "Product Management" roles

` : ''}CRITICAL: Return ONLY valid JSON. No explanations, no markdown, no additional text.

Return exactly this structure:
{
  "level": "Junior|Mid|Senior|Staff|Principal",
  "function": "Operations|Engineering|Product Design|Data/ML|Product Management|Business",
  "mustHaves": ["requirement1", "requirement2", "requirement3"],
  "niceToHaves": ["skill1", "skill2", "skill3"],
  "competencies": [
    {
      "name": "competency name",
      "rationale": "why this competency matters"
    }
  ],
  "risks": ["potential concern1", "potential concern2"]
}`
        },
        {
          role: "user",
          content: `Analyze this job description and extract the structured information${hiringManager ? ` (Hiring Manager: ${hiringManager}, Department: ${department})` : ''}:\n\n${jobDescription}`
        }
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    try {
      console.log('Raw OpenAI response:', content);
      
      // Clean the response - sometimes OpenAI adds extra text
      let cleanContent = content.trim();
      
      // Find JSON block if it's wrapped in markdown
      const jsonMatch = cleanContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanContent = jsonMatch[1].trim();
      }
      
      // Remove any text before first { or after last }
      const startBrace = cleanContent.indexOf('{');
      const endBrace = cleanContent.lastIndexOf('}');
      if (startBrace !== -1 && endBrace !== -1 && endBrace > startBrace) {
        cleanContent = cleanContent.substring(startBrace, endBrace + 1);
      }
      
      console.log('Cleaned content for parsing:', cleanContent);
      
      const extractedData = JSON.parse(cleanContent);
      return NextResponse.json(extractedData);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response. Raw content:', content);
      console.error('Parse error:', parseError);
      
      // Return a fallback response so the UI doesn't break
      return NextResponse.json({
        level: "Senior",
        function: "Engineering",
        mustHaves: ["Technical expertise", "Communication skills", "Problem solving"],
        niceToHaves: ["Leadership experience", "Domain knowledge"],
        competencies: [
          { name: "Technical Skills", rationale: "Core requirement for the role" },
          { name: "Collaboration", rationale: "Need to work with teams" }
        ],
        risks: ["Could not parse AI response - using fallback data"]
      });
    }

  } catch (error) {
    console.error('OpenAI extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze job description', details: error.message },
      { status: 500 }
    );
  }
}
