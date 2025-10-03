import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET - List all intakes for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('intakes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ intakes: data });
  } catch (error: any) {
    console.error('Error fetching intakes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new intake
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const intakeData = {
      ...body,
      created_by: user.email || user.id,
      status: body.status || 'draft',
    };

    const { data, error } = await supabase
      .from('intakes')
      .insert([intakeData])
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('intake_activity').insert({
      intake_id: data.id,
      user_email: user.email || user.id,
      action: 'created',
      details: { title: data.title }
    });

    return NextResponse.json({ intake: data });
  } catch (error: any) {
    console.error('Error creating intake:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

