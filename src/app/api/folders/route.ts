import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('folders')
      .select(`*, profiles(username, display_name, avatar_url)`)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, description, is_public } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Folder name must be at least 2 characters' }, { status: 400 });
    }

    // Generate slug server-side
    const { data: slugData, error: slugError } = await supabase
      .rpc('generate_folder_slug', { folder_name: name, owner_id: user.id });

    if (slugError) throw slugError;

    const { data, error } = await supabase
      .from('folders')
      .insert({
        owner_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        slug: slugData,
        is_public: is_public !== false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
