import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('id, owner_id, is_public')
      .eq('slug', params.slug)
      .single();

    if (folderError || !folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    if (!folder.is_public && folder.owner_id !== user?.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('media')
      .select(`*, profiles(username, display_name, avatar_url)`)
      .eq('folder_id', folder.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Generate signed URLs for private content or public URLs
    const mediaWithUrls = data?.map(item => {
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(item.file_path);

      const thumbnailUrl = item.thumbnail_path
        ? supabase.storage.from('media').getPublicUrl(item.thumbnail_path).data.publicUrl
        : null;

      return {
        ...item,
        public_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
      };
    });

    return NextResponse.json({ data: mediaWithUrls, is_owner: folder.owner_id === user?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
