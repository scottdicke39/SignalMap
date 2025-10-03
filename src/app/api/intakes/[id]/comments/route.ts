import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { user_email, user_name, comment, section } = await request.json();

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { error: 'Comment text is required' },
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

    // Create comment
    const { data, error } = await supabase
      .from('intake_comments')
      .insert({
        intake_id: params.id,
        user_email,
        user_name,
        comment,
        section,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('intake_activity').insert({
      intake_id: params.id,
      user_email,
      user_name,
      action: 'comment_added',
      details: { section, comment: comment.substring(0, 100) },
    });

    return NextResponse.json({ comment: data });
  } catch (error: any) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const includeResolved = searchParams.get('includeResolved') === 'true';

    let query = supabase
      .from('intake_comments')
      .select('*')
      .eq('intake_id', params.id);

    if (section) {
      query = query.eq('section', section);
    }

    if (!includeResolved) {
      query = query.eq('resolved', false);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ comments: data || [] });
  } catch (error: any) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get comments' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { commentId, resolved, resolved_by } = await request.json();

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = { resolved };
    if (resolved) {
      updateData.resolved_by = resolved_by;
      updateData.resolved_at = new Date().toISOString();
    } else {
      updateData.resolved_by = null;
      updateData.resolved_at = null;
    }

    const { data, error } = await supabase
      .from('intake_comments')
      .update(updateData)
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ comment: data });
  } catch (error: any) {
    console.error('Update comment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('intake_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

