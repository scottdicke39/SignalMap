import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { jobTitle } = await request.json();

    if (!jobTitle) {
      return NextResponse.json({ 
        error: 'Job title is required' 
      }, { status: 400 });
    }

    const ashbyApiKey = process.env.ASHBY_API_KEY;
    
    if (!ashbyApiKey) {
      console.log('⚠️  ASHBY_API_KEY not configured');
      return NextResponse.json({ 
        job: null,
        message: 'Ashby integration not configured' 
      });
    }

    // Search for jobs in Ashby
    const response = await fetch('https://api.ashbyhq.com/job.list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(ashbyApiKey + ':').toString('base64')}`
      },
      body: JSON.stringify({
        // Don't filter by status - get all jobs to ensure we find it
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ashby API error:', response.status, errorText);
      return NextResponse.json({ 
        job: null,
        error: `Ashby API error: ${response.status}` 
      }, { status: response.status });
    }

    const data = await response.json();
    const jobs = data.results || [];

    console.log('🔍 Ashby API Response:', JSON.stringify(data, null, 2).substring(0, 500));
    console.log(`📊 Found ${jobs.length} total jobs in Ashby`);
    console.log(`🔍 Searching for: "${jobTitle}"`);
    
    // Show first few job titles for debugging
    if (jobs.length > 0) {
      console.log('First 10 job titles in Ashby:');
      jobs.slice(0, 10).forEach((job: any, index: number) => {
        console.log(`  ${index + 1}. "${job.title}" (ID: ${job.id})`);
      });
    } else {
      console.log('⚠️  No jobs returned from Ashby API');
    }

    // Search for job by title (case-insensitive, flexible matching)
    const searchTitleLower = jobTitle.toLowerCase().trim();
    const searchWords = searchTitleLower.split(/\s+/); // Split into words
    
    const matchedJob = jobs.find((job: any) => {
      const jobTitleLower = (job.title || '').toLowerCase();
      
      console.log(`  Checking: "${job.title}"`);
      
      // Try multiple matching strategies:
      // 1. Exact match
      if (jobTitleLower === searchTitleLower) return true;
      
      // 2. Contains full search string
      if (jobTitleLower.includes(searchTitleLower)) return true;
      
      // 3. All search words present in job title
      const allWordsMatch = searchWords.every((word: string) => jobTitleLower.includes(word));
      if (allWordsMatch && searchWords.length >= 2) return true;
      
      // 4. Reverse - search string contains job title
      if (searchTitleLower.includes(jobTitleLower)) return true;
      
      return false;
    });

    if (matchedJob) {
      console.log(`✅ Matched job: "${matchedJob.title}"`);
    } else {
      console.log(`❌ No match found`);
      console.log(`Available jobs:`, jobs.slice(0, 10).map((j: any) => j.title));
    }

    if (matchedJob) {
      // Fetch full job details
      const jobDetailResponse = await fetch('https://api.ashbyhq.com/job.info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(ashbyApiKey + ':').toString('base64')}`
        },
        body: JSON.stringify({
          jobId: matchedJob.id
        })
      });

      if (jobDetailResponse.ok) {
        const jobDetail = await jobDetailResponse.json();
        return NextResponse.json({ 
          job: {
            id: matchedJob.id,
            title: matchedJob.title,
            description: jobDetail.info?.description || jobDetail.info?.descriptionHtml || '',
            department: matchedJob.departmentName,
            location: matchedJob.locationName
          }
        });
      }
    }

    // Not found
    console.log(`❌ No job found matching "${jobTitle}"`);
    console.log(`Total jobs searched: ${jobs.length}`);
    
    return NextResponse.json({ 
      job: null,
      message: `No job found matching "${jobTitle}". Searched ${jobs.length} jobs.`,
      availableJobs: jobs.slice(0, 10).map((j: any) => j.title), // Show first 10 for reference
      searchedTitle: jobTitle,
      totalJobsSearched: jobs.length
    });

  } catch (error) {
    console.error('Search job error:', error);
    return NextResponse.json(
      { 
        job: null,
        error: 'Failed to search Ashby',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

