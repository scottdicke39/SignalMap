import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64 for storage (or use Supabase Storage in production)
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Save to database
    const { data, error } = await supabase
      .from('uploaded_files')
      .insert({
        user_id: userId || 'anonymous@handshake.com',
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_content: base64,
        extracted_data: metadata.extractedData || null,
        intake_id: metadata.intakeId || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, file: data });
  } catch (error: any) {
    console.error('File save error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = supabase
      .from('uploaded_files')
      .select('id, file_name, file_type, file_size, created_at, extracted_data')
      .order('created_at', { ascending: false })
      .limit(20);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ files: data || [] });
  } catch (error: any) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get files' },
      { status: 500 }
    );
  }
}

