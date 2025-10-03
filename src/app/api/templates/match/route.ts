import { NextRequest, NextResponse } from 'next/server';

// TODO: Import actual Confluence and Ashby clients
// import { ConfluenceClient } from '@/lib/confluence';
// import { AshbyClient } from '@/lib/ashby';

export async function POST(request: NextRequest) {
  try {
    const { signals, jobFunction, jobLevel } = await request.json();

    if (!signals || !Array.isArray(signals)) {
      return NextResponse.json({ 
        error: 'Signals array is required' 
      }, { status: 400 });
    }

    // Enhanced template matching with job context
    const confluenceTemplates = await searchConfluenceTemplates(signals, jobFunction, jobLevel);
    const ashbyTemplates = await searchAshbyTemplates(signals, jobFunction, jobLevel);

    const allTemplates = [...confluenceTemplates, ...ashbyTemplates]
      .filter(t => t.score > 0.5) // Higher threshold for better matches
      .sort((a, b) => b.score - a.score) // Sort by relevance score
      .slice(0, 6); // Limit to top 6 most relevant results

    return NextResponse.json(allTemplates);

  } catch (error) {
    console.error('Template matching error:', error);
    return NextResponse.json(
      { error: 'Failed to match templates', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// TODO: Replace with actual Confluence API search
async function searchConfluenceTemplates(signals: string[], jobFunction?: string, jobLevel?: string) {
  // Mock implementation with function-based filtering
  const allMockTemplates = [
    {
      source: "confluence" as const,
      id: "TPL-UX-LEVEL3",
      title: "UX/PD Loop — L3/L4",
      functionTypes: ["Design", "Product Design", "UX"],
      keywords: ["Design", "UX", "Portfolio", "Craft", "Visual", "User Experience"],
      url: `${process.env.CONFLUENCE_BASE_URL}/pages/TPL-UX-LEVEL3`,
      notes: "Design interview template for mid-senior level"
    },
    {
      source: "confluence" as const,
      id: "TPL-ENG-SYSTEM",
      title: "Engineering — System Design",
      functionTypes: ["Engineering", "Software Engineer", "Backend", "Full Stack"],
      keywords: ["Engineering", "System", "Technical", "Architecture", "Code", "Backend"],
      url: `${process.env.CONFLUENCE_BASE_URL}/pages/TPL-ENG-SYSTEM`,
      notes: "Technical interview template for system design"
    },
    {
      source: "confluence" as const,
      id: "TPL-PM-STRATEGY",
      title: "Product Management — Strategy & Execution", 
      functionTypes: ["Product", "Product Management", "PM"],
      keywords: ["Product", "Strategy", "Execution", "Vision", "Roadmap"],
      url: `${process.env.CONFLUENCE_BASE_URL}/pages/TPL-PM-STRATEGY`,
      notes: "PM interview focusing on strategic thinking"
    },
    {
      source: "confluence" as const,
      id: "TPL-DATA-ANALYSIS",
      title: "Data Science — Analysis & Modeling",
      functionTypes: ["Data", "Data Science", "Analytics", "ML"],
      keywords: ["Data", "Analysis", "Modeling", "Statistics", "Machine Learning"],
      url: `${process.env.CONFLUENCE_BASE_URL}/pages/TPL-DATA-ANALYSIS`,
      notes: "Data science technical interview template"
    },
    {
      source: "confluence" as const,
      id: "TPL-GENERAL-LEADERSHIP",
      title: "General Leadership & Collaboration",
      functionTypes: [], // Universal - applies to all functions
      keywords: ["Leadership", "Management", "Collaboration", "Communication"],
      url: `${process.env.CONFLUENCE_BASE_URL}/pages/TPL-GENERAL-LEADERSHIP`,
      notes: "Universal leadership evaluation template"
    }
  ];

  // Filter by job function first
  const functionallyRelevantTemplates = allMockTemplates.filter(template => {
    if (!jobFunction) return true; // If no function specified, include all
    if (template.functionTypes.length === 0) return true; // Universal templates
    
    // Check if job function matches any of the template's function types
    return template.functionTypes.some(funcType => 
      jobFunction.toLowerCase().includes(funcType.toLowerCase()) ||
      funcType.toLowerCase().includes(jobFunction.toLowerCase())
    );
  });

  // Calculate scores for functionally relevant templates
  const scoredTemplates = functionallyRelevantTemplates.map(template => ({
    source: template.source,
    id: template.id,
    title: template.title,
    url: template.url,
    notes: template.notes,
    score: calculateEnhancedRelevanceScore(signals, template.keywords, jobFunction, template.functionTypes)
  }));

  return scoredTemplates.filter(t => t.score > 0.4);
}

// TODO: Replace with actual Ashby API search  
async function searchAshbyTemplates(signals: string[], jobFunction?: string, jobLevel?: string) {
  // Mock implementation with better function-aware forms
  const allMockForms = [
    {
      source: "ashby" as const,
      id: "FORM-COMMUNICATION",
      title: "Communication & Presentation",
      functionTypes: [], // Universal
      keywords: ["Communication", "Collaboration", "Presentation", "Articulation"],
      notes: "Structured rubric for evaluating communication skills"
    },
    {
      source: "ashby" as const,
      id: "FORM-EXECUTION",
      title: "Execution & Results Delivery", 
      functionTypes: [], // Universal
      keywords: ["Execution", "Delivery", "Results", "Performance", "Achievement"],
      notes: "Assessment form for execution and delivery"
    },
    {
      source: "ashby" as const,
      id: "FORM-ENG-PROBLEM",
      title: "Engineering — Technical Problem Solving",
      functionTypes: ["Engineering", "Software Engineer", "Full Stack", "Backend"],
      keywords: ["Problem Solving", "Technical", "Algorithm", "Code", "System Design"],
      notes: "Technical problem solving evaluation for engineers"
    },
    {
      source: "ashby" as const,
      id: "FORM-DESIGN-CRAFT",
      title: "Design — Craft & Portfolio Review",
      functionTypes: ["Design", "Product Design", "UX", "UI"],
      keywords: ["Design", "Portfolio", "Craft", "Visual", "User Experience", "Aesthetics"],
      notes: "Design craft evaluation and portfolio review"
    },
    {
      source: "ashby" as const,
      id: "FORM-DATA-TECHNICAL",
      title: "Data Science — Technical Assessment",
      functionTypes: ["Data", "Data Science", "Analytics", "ML"],
      keywords: ["Data", "Analysis", "Statistics", "Machine Learning", "Modeling"],
      notes: "Technical assessment for data science roles"
    },
    {
      source: "ashby" as const,
      id: "FORM-LEADERSHIP",
      title: "Leadership & People Management",
      functionTypes: [], // Universal but more relevant for senior roles
      keywords: ["Leadership", "Management", "Team", "Mentoring", "Direction"],
      notes: "Evaluates leadership and people management skills"
    }
  ];

  // Filter by job function
  const functionallyRelevantForms = allMockForms.filter(form => {
    if (!jobFunction) return true;
    if (form.functionTypes.length === 0) return true; // Universal forms
    
    return form.functionTypes.some(funcType => 
      jobFunction.toLowerCase().includes(funcType.toLowerCase()) ||
      funcType.toLowerCase().includes(jobFunction.toLowerCase())
    );
  });

  // Calculate scores
  const scoredForms = functionallyRelevantForms.map(form => ({
    source: form.source,
    id: form.id,
    title: form.title,
    notes: form.notes,
    score: calculateEnhancedRelevanceScore(signals, form.keywords, jobFunction, form.functionTypes)
  }));

  return scoredForms.filter(f => f.score > 0.4);
}

function calculateEnhancedRelevanceScore(
  signals: string[], 
  templateKeywords: string[], 
  jobFunction?: string,
  templateFunctions: string[] = []
): number {
  if (signals.length === 0 || templateKeywords.length === 0) return 0;

  const signalsLower = signals.map(s => s.toLowerCase());
  const keywordsLower = templateKeywords.map(k => k.toLowerCase());
  
  // Signal matching score (0-1)
  let signalMatches = 0;
  for (const signal of signalsLower) {
    for (const keyword of keywordsLower) {
      if (signal.includes(keyword) || keyword.includes(signal)) {
        signalMatches++;
        break; // Count each signal only once
      }
    }
  }
  const signalScore = signalMatches / signals.length;

  // Function alignment score (0-1)
  let functionScore = 0.5; // Default neutral score
  if (jobFunction && templateFunctions.length > 0) {
    const jobFunctionLower = jobFunction.toLowerCase();
    const templateFunctionsLower = templateFunctions.map(f => f.toLowerCase());
    
    const functionMatch = templateFunctionsLower.some(tf => 
      jobFunctionLower.includes(tf) || tf.includes(jobFunctionLower)
    );
    
    functionScore = functionMatch ? 1.0 : 0.2; // Strong bonus for function match, penalty for mismatch
  } else if (jobFunction && templateFunctions.length === 0) {
    functionScore = 0.8; // Universal templates get slight bonus
  }

  // Combined score with weighting
  const combinedScore = (signalScore * 0.6) + (functionScore * 0.4);
  
  // Add slight randomization to prevent identical scores
  const randomFactor = 0.95 + (Math.random() * 0.1); // 0.95 to 1.05
  
  return Math.min(1.0, Math.max(0, combinedScore * randomFactor));
}

// Legacy function for backward compatibility
function calculateRelevanceScore(signals: string[], templateKeywords: string[]): number {
  return calculateEnhancedRelevanceScore(signals, templateKeywords);
}
