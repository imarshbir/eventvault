import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: folder, error } = await supabase
      .from('folders')
      .select(`*, profiles(id, username, display_name, avatar_url)`)
      .eq('slug', params.slug)
      .single();

    if (error || !folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // If private, only owner can access
    if (!folder.is_public && folder.owner_id !== user?.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ data: folder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, description, is_public } = body;

    const { data: folder, error: fetchError } = await supabase
      .from('folders')
      .select('owner_id')
      .eq('slug', params.slug)
      .single();

    if (fetchError || !folder) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (folder.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (is_public !== undefined) updates.is_public = is_public;

    const { data, error } = await supabase
      .from('folders')
      .update(updates)
      .eq('slug', params.slug)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: folder, error: fetchError } = await supabase
      .from('folders')
      .select('id, owner_id')
      .eq('slug', params.slug)
      .single();

    if (fetchError || !folder) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (folder.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Get all media to delete from storage
    const { data: mediaList } = await supabase
      .from('media')
      .select('file_path, thumbnail_path')
      .eq('folder_id', folder.id);

    if (mediaList && mediaList.length > 0) {
      const paths = mediaList.flatMap(m => [
        m.file_path,
        ...(m.thumbnail_path ? [m.thumbnail_path] : [])
      ]);
      await supabase.storage.from('media').remove(paths);
    }

    const { error } = await supabase.from('folders').delete().eq('id', folder.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
