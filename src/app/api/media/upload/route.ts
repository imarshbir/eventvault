import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if user is suspended
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_suspended')
      .eq('id', user.id)
      .single();

    if (profile?.is_suspended) {
      return NextResponse.json({ error: 'Your account has been suspended.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderId = formData.get('folder_id') as string | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!folderId) return NextResponse.json({ error: 'Folder ID required' }, { status: 400 });

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 40MB limit' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported' }, { status: 400 });
    }

    // Verify folder exists (publicly accessible or owned by user)
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('id, owner_id, is_public')
      .eq('id', folderId)
      .single();

    if (folderError || !folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const fileType = ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video';
    const ext = file.name.split('.').pop() || 'bin';
    const uniqueId = uuidv4();
    const filePath = `${user.id}/${folderId}/${uniqueId}.${ext}`;

    // Upload file to storage
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Save metadata to DB
    const { data: media, error: dbError } = await supabase
      .from('media')
      .insert({
        folder_id: folderId,
        uploader_id: user.id,
        title: title?.trim() || file.name.replace(/\.[^/.]+$/, ''),
        description: description?.trim() || null,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        file_type: fileType,
        mime_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup storage on DB error
      await supabase.storage.from('media').remove([filePath]);
      throw dbError;
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);

    return NextResponse.json({
      data: { ...media, public_url: urlData.publicUrl }
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
