import { NextRequest, NextResponse } from 'next/server';

// CodeSignal API Integration for Tech Screen Test Suggestions
// Documentation: https://docs.codesignal.com/

export async function POST(request: NextRequest) {
  try {
    const { jobFunction, competencies, experienceLevel, techStack } = await request.json();

    // TODO: Replace with actual CodeSignal API integration
    // const codeSignalClient = new CodeSignalAPI({
    //   apiKey: process.env.CODESIGNAL_API_KEY,
    //   organizationId: process.env.CODESIGNAL_ORG_ID
    // });

    // For now, return mock test suggestions based on job function
    const suggestedTests = await getSuggestedTests(jobFunction, competencies, experienceLevel, techStack);

    return NextResponse.json({
      tests: suggestedTests,
      integration: {
        platform: "CodeSignal",
        setupRequired: true,
        apiEndpoint: "https://app.codesignal.com/api/v1/",
        documentation: "https://docs.codesignal.com/"
      }
    });

  } catch (error) {
    console.error('CodeSignal test suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to get CodeSignal test suggestions', details: error.message },
      { status: 500 }
    );
  }
}

async function getSuggestedTests(jobFunction?: string, competencies?: string[], experienceLevel?: string, techStack?: string[]) {
  // Mock CodeSignal test suggestions - replace with actual API calls
  const testDatabase = {
    'Engineering': {
      'Entry': [
        {
          id: 'cs_general_coding_entry',
          name: 'General Coding Assessment - Entry Level',
          description: 'Basic programming concepts, algorithms, and data structures',
          duration: 60,
          skills: ['Problem Solving', 'Basic Algorithms', 'Code Quality'],
          languages: ['Python', 'JavaScript', 'Java', 'C++'],
          difficulty: 'Easy',
          questionCount: 3
        },
        {
          id: 'cs_frontend_basics',
          name: 'Frontend Development Basics',
          description: 'HTML, CSS, JavaScript fundamentals and basic React',
          duration: 45,
          skills: ['HTML/CSS', 'JavaScript', 'React Basics'],
          languages: ['JavaScript', 'HTML/CSS'],
          difficulty: 'Easy',
          questionCount: 4
        }
      ],
      'Mid': [
        {
          id: 'cs_fullstack_mid',
          name: 'Full Stack Development Assessment',
          description: 'API design, database queries, and frontend integration',
          duration: 90,
          skills: ['API Design', 'Database', 'Frontend/Backend Integration'],
          languages: ['Python', 'JavaScript', 'SQL'],
          difficulty: 'Medium',
          questionCount: 4
        },
        {
          id: 'cs_algorithms_mid',
          name: 'Algorithms & Data Structures',
          description: 'Medium complexity algorithmic problems and optimization',
          duration: 75,
          skills: ['Algorithms', 'Data Structures', 'Optimization'],
          languages: ['Python', 'Java', 'C++', 'JavaScript'],
          difficulty: 'Medium',
          questionCount: 3
        }
      ],
      'Senior': [
        {
          id: 'cs_system_design_senior',
          name: 'System Design & Architecture',
          description: 'Large-scale system design, performance, and scalability',
          duration: 120,
          skills: ['System Design', 'Architecture', 'Scalability'],
          languages: ['Python', 'Java', 'Go'],
          difficulty: 'Hard',
          questionCount: 2
        },
        {
          id: 'cs_leadership_coding',
          name: 'Senior Engineering Assessment',
          description: 'Complex algorithms with code review and mentoring scenarios',
          duration: 90,
          skills: ['Advanced Algorithms', 'Code Review', 'Technical Leadership'],
          languages: ['Python', 'Java', 'C++'],
          difficulty: 'Hard',
          questionCount: 3
        }
      ]
    },
    'Data Science': {
      'Mid': [
        {
          id: 'cs_data_analysis',
          name: 'Data Analysis & Visualization',
          description: 'Data manipulation, statistical analysis, and visualization',
          duration: 90,
          skills: ['Data Analysis', 'Statistics', 'Visualization'],
          languages: ['Python', 'R', 'SQL'],
          difficulty: 'Medium',
          questionCount: 4
        }
      ],
      'Senior': [
        {
          id: 'cs_ml_engineering',
          name: 'Machine Learning Engineering',
          description: 'Model building, evaluation, and production deployment',
          duration: 120,
          skills: ['Machine Learning', 'Model Deployment', 'Data Engineering'],
          languages: ['Python'],
          difficulty: 'Hard',
          questionCount: 3
        }
      ]
    },
    'Product': [
      {
        id: 'cs_product_analysis',
        name: 'Product Analytics & SQL',
        description: 'SQL queries for product metrics and basic data analysis',
        duration: 60,
        skills: ['SQL', 'Analytics', 'Product Metrics'],
        languages: ['SQL', 'Python'],
        difficulty: 'Medium',
        questionCount: 3
      }
    ]
  };

  // Determine job category
  const jobLower = jobFunction?.toLowerCase() || '';
  let category = 'Engineering'; // default
  
  if (jobLower.includes('data') || jobLower.includes('ml') || jobLower.includes('scientist')) {
    category = 'Data Science';
  } else if (jobLower.includes('product') || jobLower.includes('pm')) {
    category = 'Product';
  }

  // Determine level
  const level = experienceLevel === 'Senior' ? 'Senior' : 
                experienceLevel === 'Entry' || experienceLevel === 'Junior' ? 'Entry' : 
                'Mid';

  const categoryTests = testDatabase[category as keyof typeof testDatabase];
  
  if (Array.isArray(categoryTests)) {
    return categoryTests;
  } else if (categoryTests && typeof categoryTests === 'object') {
    return categoryTests[level as keyof typeof categoryTests] || categoryTests['Mid'] || [];
  }

  return [];
}

// GET endpoint to fetch available test categories
export async function GET() {
  try {
    const categories = {
      Engineering: ['Entry', 'Mid', 'Senior'],
      'Data Science': ['Mid', 'Senior'], 
      Product: ['General'],
      Design: ['Portfolio Review'] // Note: Design typically uses portfolio, not coding tests
    };

    return NextResponse.json({ 
      categories,
      note: "CodeSignal is primarily for technical roles. Design roles typically use portfolio reviews instead.",
      setupInstructions: [
        "1. Sign up for CodeSignal for Teams",
        "2. Get API key from CodeSignal dashboard", 
        "3. Add CODESIGNAL_API_KEY to environment variables",
        "4. Configure organization settings in CodeSignal"
      ]
    });

  } catch (error) {
    console.error('Error fetching CodeSignal categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test categories' },
      { status: 500 }
    );
  }
}








