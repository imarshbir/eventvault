import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { media_id, folder_id, reason, details } = body;

    if (!reason) return NextResponse.json({ error: 'Reason required' }, { status: 400 });
    if (!media_id && !folder_id) return NextResponse.json({ error: 'Target required' }, { status: 400 });

    // Check if already reported by this user
    const query = supabase.from('reports').select('id').eq('reporter_id', user.id).eq('status', 'pending');
    if (media_id) query.eq('media_id', media_id);
    if (folder_id) query.eq('folder_id', folder_id);

    const { data: existing } = await query.single();
    if (existing) {
      return NextResponse.json({ error: 'You have already reported this content' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        media_id: media_id || null,
        folder_id: folder_id || null,
        reason,
        details: details || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Flag the media if enough reports
    if (media_id) {
      const { count } = await supabase
        .from('reports')
        .select('id', { count: 'exact' })
        .eq('media_id', media_id)
        .eq('status', 'pending');

      if (count && count >= 3) {
        await supabase.from('media').update({ is_flagged: true }).eq('id', media_id);
      }
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
