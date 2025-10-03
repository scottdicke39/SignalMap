import { NextRequest, NextResponse } from 'next/server';

// This API simulates fetching best practices from Confluence
// In production, this would integrate with the actual Confluence REST API

export async function POST(request: NextRequest) {
  try {
    const { topic, stage, jobFunction } = await request.json();

    // Simulate fetching from specific Confluence pages
    const confluenceData = await getConfluenceBestPractices(topic, stage, jobFunction);

    return NextResponse.json({ 
      bestPractices: confluenceData,
      sources: [
        {
          title: "Hiring Manager Resources",
          url: `${process.env.CONFLUENCE_BASE_URL}/wiki/spaces/REC/pages/2466381920/Hiring+Manager+Resources`,
          space: "REC"
        },
        {
          title: "Interview Process Guidelines", 
          url: `${process.env.CONFLUENCE_BASE_URL}/wiki/spaces/IRT/pages/interview-guidelines`,
          space: "IRT"
        },
        {
          title: "Recruiting Best Practices",
          url: `${process.env.CONFLUENCE_BASE_URL}/wiki/spaces/PEOPLE/pages/recruiting-best-practices`,
          space: "PEOPLE"
        }
      ]
    });

  } catch (error) {
    console.error('Confluence best practices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch best practices', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function getConfluenceBestPractices(topic: string, stage: any, jobFunction?: string): Promise<string> {
  // In production, this would use the Confluence REST API to search and retrieve content
  // For now, simulate with curated best practices based on the Handshake recruiting process
  
  const hiringManagerResources = {
    "interview_structure": `
FROM HIRING MANAGER RESOURCES PAGE:

INTERVIEW STRUCTURE BEST PRACTICES:
• Use the STAR method (Situation, Task, Action, Result) for behavioral questions
• Ask follow-up questions to get specific details and outcomes
• Focus on recent examples (within last 2-3 years) for senior roles
• Look for patterns across multiple examples
• Take detailed notes during the interview for consistent evaluation

QUESTION FRAMEWORK:
• Behavioral: "Tell me about a time when..."
• Situational: "How would you handle...?"
• Technical: Role-specific deep dives with real-world scenarios
• Values: Focus on past decisions that demonstrate cultural alignment

EVALUATION CRITERIA:
• Rate each competency on a 1-4 scale with specific examples
• Look for evidence of impact and growth over time
• Consider both technical skills and cultural fit
• Document specific quotes and examples for debrief discussions
`,

    "recruiting_process": `
FROM RECRUITING BEST PRACTICES:

HANDSHAKE RECRUITING PHILOSOPHY:
• We hire for potential and growth mindset, not just current skills
• Diversity of thought and background strengthens our team
• Look for candidates who are excited about our mission
• Focus on collaboration and humility over individual achievement

CANDIDATE EXPERIENCE:
• Respond to applications within 5 business days
• Provide clear expectations and timeline upfront
• Give meaningful feedback after rejections when possible
• Ensure all interviewers are prepared and on time

RED FLAGS TO WATCH FOR:
• Poor communication or unprofessional behavior
• Inability to provide specific examples of past work
• Lack of curiosity about the role or company
• Inconsistencies in their story across different interviews
`,

    "competency_evaluation": `
FROM COMPETENCY FRAMEWORK:

CORE COMPETENCIES FOR ALL ROLES:
• Execution: Delivers high-quality work consistently and efficiently
• Collaboration: Works effectively with cross-functional teams
• Growth Mindset: Continuously learns and adapts to new challenges
• Communication: Articulates ideas clearly and listens actively

LEADERSHIP COMPETENCIES (Senior+ Roles):
• Strategic Thinking: Sees the big picture and makes decisions with long-term impact
• Team Development: Mentors others and helps them grow professionally
• Influence: Builds consensus and drives change without direct authority

EVALUATION GUIDELINES:
• Look for specific examples, not hypothetical responses
• Focus on recent and relevant experiences
• Consider the scope and complexity of their examples
• Assess both the approach and the outcomes achieved
`,

    "ai_recruiting": `
FROM HANDSHAKE AI RECRUITING CONTEXT:

HANDSHAKE AI FELLOWSHIP PROGRAM:
• We recruit candidates for AI training data generation, not traditional employment
• These candidates work on assignment basis to improve AI systems
• Domain expertise (Biochemistry, Physics, etc.) is more important than tech skills
• Look for subject matter experts who can provide high-quality training data

UNIQUE EVALUATION CRITERIA:
• Deep expertise in their domain field
• Ability to explain complex concepts clearly
• Attention to detail and accuracy
• Comfortable working with ambiguous AI training scenarios

PROCESS DIFFERENCES:
• Focus less on traditional career progression
• Emphasize domain knowledge over management experience
• Look for passion for their subject area and teaching ability
• Assess comfort level with AI/technology collaboration
`
  };

  // Determine which best practices to return based on the request
  const stageType = stage?.name?.toLowerCase() || '';
  const topicLower = topic?.toLowerCase() || '';

  if (stageType.includes('recruiter')) {
    return hiringManagerResources.recruiting_process;
  } else if (stageType.includes('technical') || stageType.includes('craft')) {
    return hiringManagerResources.competency_evaluation;
  } else if (topicLower.includes('ai') || jobFunction?.toLowerCase().includes('data')) {
    return hiringManagerResources.ai_recruiting;
  } else if (stageType.includes('manager') || stageType.includes('leadership')) {
    return hiringManagerResources.competency_evaluation;
  }

  // Default to interview structure best practices
  return hiringManagerResources.interview_structure;
}

// GET endpoint to fetch all available best practices topics
export async function GET() {
  try {
    const topics = [
      { 
        id: 'interview_structure', 
        title: 'Interview Structure & Question Framework',
        source: 'Hiring Manager Resources'
      },
      { 
        id: 'recruiting_process', 
        title: 'Recruiting Philosophy & Process',
        source: 'Recruiting Best Practices'
      },
      { 
        id: 'competency_evaluation', 
        title: 'Competency Framework & Evaluation',
        source: 'Interview Process Guidelines'
      },
      { 
        id: 'ai_recruiting', 
        title: 'AI Fellowship Recruiting (Handshake AI)',
        source: 'AI Recruiting Guidelines'
      }
    ];

    return NextResponse.json({ topics });

  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}








