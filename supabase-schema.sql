-- ============================================================
-- EventVault - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FOLDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  cover_url TEXT,
  media_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MEDIA TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL, -- 'image' or 'video'
  mime_type TEXT NOT NULL,
  thumbnail_path TEXT,
  duration INTEGER, -- for videos, in seconds
  width INTEGER,
  height INTEGER,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "Profiles are publicly readable" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Folders: public read if public, owner full access
CREATE POLICY "Public folders are readable by all" ON public.folders
  FOR SELECT USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Authenticated users can create folders" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their folders" ON public.folders
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their folders" ON public.folders
  FOR DELETE USING (auth.uid() = owner_id);

-- Media: readable if folder is public or user is authenticated member
CREATE POLICY "Media readable if folder is public" ON public.media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.folders f
      WHERE f.id = folder_id AND (f.is_public = true OR f.owner_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can upload media" ON public.media
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.folders f WHERE f.id = folder_id
    )
  );

CREATE POLICY "Owners can delete media from their folders" ON public.media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.folders f
      WHERE f.id = folder_id AND f.owner_id = auth.uid()
    )
  );

-- Reports
CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (reporter_id = auth.uid());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Create media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  41943040, -- 40MB in bytes
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Media bucket public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete own uploads or folder owners can delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' AND
    auth.uid() IS NOT NULL
  );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update folder media count
CREATE OR REPLACE FUNCTION public.update_folder_media_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.folders SET media_count = media_count + 1, updated_at = NOW()
    WHERE id = NEW.folder_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.folders SET media_count = GREATEST(0, media_count - 1), updated_at = NOW()
    WHERE id = OLD.folder_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_media_change
  AFTER INSERT OR DELETE ON public.media
  FOR EACH ROW EXECUTE FUNCTION public.update_folder_media_count();

-- Generate unique slug for folders
CREATE OR REPLACE FUNCTION public.generate_folder_slug(folder_name TEXT, owner_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(folder_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  base_slug := substring(base_slug, 1, 40);
  
  IF base_slug = '' THEN
    base_slug := 'folder';
  END IF;
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.folders WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
