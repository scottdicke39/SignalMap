import { NextResponse } from 'next/server';
import GleanClient from '@/lib/glean-client';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Check if Glean is configured
    const gleanApiKey = process.env.GLEAN_API_KEY;
    const gleanBaseUrl = process.env.GLEAN_BASE_URL || 'https://joinhandshake.glean.com/api/v1';

    if (!gleanApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Glean API key not configured',
        fallbackMessage: 'Please configure GLEAN_API_KEY in your environment variables.'
      });
    }

    // Initialize Glean client
    const gleanClient = new GleanClient({
      baseUrl: gleanBaseUrl,
      apiKey: gleanApiKey
    });

    // Query the RecruitingBot Glean Agent
    const result = await gleanClient.askRecruitingAgent(question);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        fallbackMessage: 'Could not reach Glean AI Agent. Please try rephrasing your question.'
      });
    }

    return NextResponse.json({
      success: true,
      answer: result.answer,
      source: 'Glean AI Agent'
    });

  } catch (error: any) {
    console.error('Error querying Glean Agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        fallbackMessage: 'An error occurred while processing your question.'
      },
      { status: 500 }
    );
  }
}




