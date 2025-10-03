import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { shared_with, permission, shared_by } = await request.json();

    // Validate permission
    if (!['view', 'edit', 'approve'].includes(permission)) {
      return NextResponse.json(
        { error: 'Invalid permission. Must be view, edit, or approve' },
        { status: 400 }
      );
    }

    // Check if intake exists
    const { data: intake, error: intakeError } = await supabase
      .from('intakes')
      .select('id')
      .eq('id', params.id)
      .single();

    if (intakeError || !intake) {
      return NextResponse.json(
        { error: 'Intake not found' },
        { status: 404 }
      );
    }

    // Check if already shared with this user
    const { data: existingShare } = await supabase
      .from('intake_shares')
      .select('id, permission')
      .eq('intake_id', params.id)
      .eq('shared_with', shared_with)
      .single();

    if (existingShare) {
      // Update existing share
      const { data, error } = await supabase
        .from('intake_shares')
        .update({ permission, shared_by })
        .eq('id', existingShare.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ share: data, updated: true });
    } else {
      // Create new share
      const { data, error } = await supabase
        .from('intake_shares')
        .insert({
          intake_id: params.id,
          shared_with,
          permission,
          shared_by,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ share: data, created: true });
    }
  } catch (error: any) {
    console.error('Share intake error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to share intake' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('intake_shares')
      .select('*')
      .eq('intake_id', params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ shares: data || [] });
  } catch (error: any) {
    console.error('Get shares error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get shares' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('intake_shares')
      .delete()
      .eq('id', shareId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete share error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete share' },
      { status: 500 }
    );
  }
}

