import { NextRequest, NextResponse } from 'next/server';
import GleanClient from '@/lib/glean-client';

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, managerHint } = await request.json();

    if (!managerHint) {
      return NextResponse.json(
        { error: 'Manager name is required for Glean lookup' },
        { status: 400 }
      );
    }

    // Check if Glean is configured
    const gleanBaseUrl = process.env.GLEAN_BASE_URL;
    const gleanApiKey = process.env.GLEAN_API_KEY;
    const gleanBearerToken = process.env.GLEAN_BEARER_TOKEN;

    if (!gleanBaseUrl || (!gleanApiKey && !gleanBearerToken)) {
      console.warn('Glean not configured, falling back to mock data');
      const fallbackData = await generateRealisticOrgData(managerHint, jobTitle);
      return NextResponse.json(fallbackData);
    }

    // Initialize real Glean client
    const gleanClient = new GleanClient({
      baseUrl: gleanBaseUrl,
      apiKey: gleanApiKey || '',
      bearerToken: gleanBearerToken
    });

    try {
      // Try real Glean API call
      console.log(`Attempting Glean lookup for manager: ${managerHint}`);
      const orgContext = await gleanClient.getOrgContextByManager(managerHint);
      
      console.log('Glean lookup successful:', orgContext);
      return NextResponse.json(orgContext);

    } catch (gleanError) {
      console.error('Glean API call failed, falling back to mock:', gleanError);
      
      // Fallback to enhanced mock data if Glean fails
      const fallbackData: any = await generateRealisticOrgData(managerHint, jobTitle);
      fallbackData._source = 'fallback'; // Indicate this is fallback data
      fallbackData._gleanError = gleanError instanceof Error ? gleanError.message : 'Unknown error';
      
      return NextResponse.json(fallbackData);
    }

  } catch (error) {
    console.error('Glean org lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch org context', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Simplified org data generation that works with any manager name
async function generateRealisticOrgData(managerHint?: string, jobTitle?: string) {
  // Always use the manager name provided by user if available
  let manager = managerHint || "TBD Manager";
  let department = "Operations"; // Default to Operations
  
  // Infer department from job title or common role patterns
  if (jobTitle) {
    const jobLower = jobTitle.toLowerCase();
    if (jobLower.includes('engineer') || jobLower.includes('developer') || jobLower.includes('technical')) {
      department = 'Engineering';
    } else if (jobLower.includes('design') || jobLower.includes('ux') || jobLower.includes('ui')) {
      department = 'Design';
    } else if (jobLower.includes('product') || jobLower.includes('pm')) {
      department = 'Product';
    } else if (jobLower.includes('data') || jobLower.includes('ml') || jobLower.includes('analytics') || jobLower.includes('ai')) {
      department = 'Data/AI';
    } else if (jobLower.includes('marketing') || jobLower.includes('growth')) {
      department = 'Marketing';
    } else if (jobLower.includes('sales') || jobLower.includes('account')) {
      department = 'Sales';
    } else if (jobLower.includes('operation') || jobLower.includes('delivery') || jobLower.includes('program') || jobLower.includes('project')) {
      department = 'Operations';
    }
  }

  // Generate realistic team members (always different from manager)
  const teamPool = [
    'Alex Chen', 'Sarah Kim', 'Mike Rodriguez', 'Emily Watson', 'David Park', 
    'Maya Patel', 'Chris Johnson', 'Sam Lee', 'Jessica Liu', 'Ryan Torres',
    'Ashley Brown', 'Kevin Zhang', 'Rachel Smith', 'Eric Turcotte',
    'Amanda Singh', 'Jason Lee', 'Maria Gonzalez', 'Tom Wilson', 'Lydia Nash',
    'Ryan Nguyen', 'Anna Chen', 'Mike Taylor', 'Sofia Patel', 'James Kim',
    'Lisa Chang', 'Carlos Mendez', 'Rachel Green', 'Tony Adams', 'Jessica Park'
  ];

  const titles = [
    'Senior Manager', 'Staff Manager', 'Principal', 'Director', 'Senior Director',
    'Senior Associate', 'Staff Associate', 'Lead', 'Senior Lead', 'Principal Lead'
  ];

  // Generate 2-4 team members with titles (exclude manager name if it matches)
  const teamSize = Math.floor(Math.random() * 3) + 2;
  const teamMembers = [];
  const usedNames = new Set();
  
  // Extract first name of manager to avoid conflicts
  const managerFirstName = manager.split(' ')[0].toLowerCase();
  
  for (let i = 0; i < teamSize && teamMembers.length < 4; i++) {
    const person = teamPool[Math.floor(Math.random() * teamPool.length)];
    const personFirstName = person.split(' ')[0].toLowerCase();
    
    // Skip if name is already used or matches manager's first name
    if (usedNames.has(person) || personFirstName === managerFirstName) {
      continue;
    }
    
    usedNames.add(person);
    const title = titles[Math.floor(Math.random() * titles.length)];
    teamMembers.push(`${person} - ${title}`);
  }

  // Generate cross-functional stakeholders
  const crossFuncMembers = [];
  const crossFuncRoles = ['Product Manager', 'Engineering Lead', 'Design Lead', 'Data Analyst', 'Marketing Partner'];
  
  for (let i = 0; i < 2; i++) {
    const person = teamPool[Math.floor(Math.random() * teamPool.length)];
    const personFirstName = person.split(' ')[0].toLowerCase();
    
    // Skip if already used or matches manager
    if (usedNames.has(person) || personFirstName === managerFirstName) {
      continue;
    }
    
    usedNames.add(person);
    const role = crossFuncRoles[Math.floor(Math.random() * crossFuncRoles.length)];
    crossFuncMembers.push(`${person} - ${role}`);
  }

  return {
    manager: manager, // Use exactly what user provided
    department: department,
    team: teamMembers,
    crossFunc: crossFuncMembers
  };
}

// Helper functions - replace with actual Glean queries
function inferManagerFromTitle(jobTitle?: string): string {
  if (!jobTitle) return "TBD";
  
  if (jobTitle.toLowerCase().includes('design')) return "Jordan May";
  if (jobTitle.toLowerCase().includes('engineer')) return "Alex Chen";  
  if (jobTitle.toLowerCase().includes('product')) return "Sarah Kim";
  if (jobTitle.toLowerCase().includes('data')) return "Ryan Nguyen";
  if (jobTitle.toLowerCase().includes('marketing')) return "Lisa Chang";
  if (jobTitle.toLowerCase().includes('sales')) return "Brian Wilson";
  
  return "Jordan May"; // Default fallback
}
