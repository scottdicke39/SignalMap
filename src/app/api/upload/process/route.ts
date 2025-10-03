import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to extract text from different file types
async function extractText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const fileName = file.name.toLowerCase();

  try {
    if (fileName.endsWith('.pdf')) {
      // For PDF, we'll use a simple text extraction
      // In production, use pdf-parse or similar
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(Buffer.from(buffer));
      return data.text;
    } else if (fileName.endsWith('.docx')) {
      // For DOCX, use mammoth
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      return result.value;
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      // For plain text
      const decoder = new TextDecoder();
      return decoder.decode(buffer);
    } else {
      throw new Error(`Unsupported file type: ${fileName}`);
    }
  } catch (error: any) {
    console.error(`Error extracting text from ${fileName}:`, error);
    throw new Error(`Failed to extract text from ${fileName}: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Extract text from all files
    const extractedTexts = await Promise.all(
      files.map(async (file) => ({
        fileName: file.name,
        text: await extractText(file),
      }))
    );

    // Combine texts
    const combinedText = extractedTexts
      .map((item) => `--- ${item.fileName} ---\n${item.text}`)
      .join('\n\n');

    // Use AI to extract structured data
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at extracting structured information from job descriptions and recruiting playbooks.

Extract the following information and return it as valid JSON:

{
  "jobTitle": "extracted job title",
  "level": "L1-L9 or M3-M5 if mentioned",
  "department": "department or function",
  "jobDescription": "full job description text",
  "mustHaves": ["array of must-have requirements"],
  "niceToHaves": ["array of nice-to-have requirements"],
  "competencies": [
    {"name": "competency name", "rationale": "why it matters"}
  ],
  "hiringManager": "hiring manager name if mentioned",
  "interviewStages": ["any mentioned interview stages"],
  "summary": "brief summary of the role"
}

If a field is not found, use null. Be thorough and extract as much relevant information as possible.`,
        },
        {
          role: 'user',
          content: `Extract structured information from these documents:\n\n${combinedText}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const extractedData = JSON.parse(
      completion.choices[0].message.content || '{}'
    );

    return NextResponse.json({
      success: true,
      data: extractedData,
      filesProcessed: files.map((f) => f.name),
    });
  } catch (error: any) {
    console.error('File processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process files' },
      { status: 500 }
    );
  }
}

