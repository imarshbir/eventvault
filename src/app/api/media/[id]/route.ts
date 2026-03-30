import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get media with folder owner info
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select(`id, file_path, thumbnail_path, folder_id, folders(owner_id)`)
      .eq('id', params.id)
      .single();

    if (fetchError || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const folderOwnerId = (media.folders as any)?.owner_id;

    // Only folder owner can delete
    if (folderOwnerId !== user.id) {
      return NextResponse.json({ error: 'Only the folder owner can delete media' }, { status: 403 });
    }

    // Delete from storage
    const pathsToDelete = [media.file_path];
    if (media.thumbnail_path) pathsToDelete.push(media.thumbnail_path);

    const { error: storageError } = await supabase.storage
      .from('media')
      .remove(pathsToDelete);

    if (storageError) console.error('Storage delete error:', storageError);

    // Delete from DB
    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .eq('id', params.id);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // Track view count and return media
    const { data: media, error } = await supabase
      .from('media')
      .select(`*, profiles(username, display_name)`)
      .eq('id', params.id)
      .single();

    if (error || !media) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Increment view count
    await supabase
      .from('media')
      .update({ view_count: media.view_count + 1 })
      .eq('id', params.id);

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(media.file_path);

    return NextResponse.json({
      data: { ...media, public_url: urlData.publicUrl }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
