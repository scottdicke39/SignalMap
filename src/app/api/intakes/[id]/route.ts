import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET - Get single intake
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('intakes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ intake: data });
  } catch (error: any) {
    console.error('Error fetching intake:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update intake
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Create version snapshot before updating
    const { data: currentData } = await supabase
      .from('intakes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (currentData) {
      // Get current version count
      const { count } = await supabase
        .from('intake_versions')
        .select('*', { count: 'exact', head: true })
        .eq('intake_id', params.id);

      // Save version
      await supabase.from('intake_versions').insert({
        intake_id: params.id,
        version_number: (count || 0) + 1,
        data: currentData,
        changed_by: user.email || user.id,
        change_summary: body.change_summary || 'Updated intake'
      });
    }

    // Update intake
    const { data, error } = await supabase
      .from('intakes')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('intake_activity').insert({
      intake_id: params.id,
      user_email: user.email || user.id,
      action: 'updated',
      details: { fields: Object.keys(body) }
    });

    return NextResponse.json({ intake: data });
  } catch (error: any) {
    console.error('Error updating intake:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete intake
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('intakes')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting intake:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

