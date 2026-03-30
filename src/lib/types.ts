export type MediaType = 'image' | 'video';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_suspended: boolean;
  created_at: string;
}

export interface Folder {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  slug: string;
  is_public: boolean;
  cover_url: string | null;
  media_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Media {
  id: string;
  folder_id: string;
  uploader_id: string | null;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: MediaType;
  mime_type: string;
  thumbnail_path: string | null;
  duration: number | null;
  width: number | null;
  height: number | null;
  download_count: number;
  view_count: number;
  is_flagged: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string | null;
  media_id: string | null;
  folder_id: string | null;
  reason: string;
  details: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface ApiResponse<T = void> {
  data?: T;
  error?: string;
}
