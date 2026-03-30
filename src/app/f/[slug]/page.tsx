'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ToastProvider, useToast } from '@/components/Toast';
import UploadModal from '@/components/UploadModal';
import MediaViewer from '@/components/MediaViewer';
import { Folder, Media } from '@/lib/types';
import {
  Upload, Image as ImageIcon, Film, Globe, Lock,
  Link as LinkIcon, Calendar, FolderOpen, ArrowLeft, Play
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import styles from './folder.module.css';

type MediaWithUrl = Media & { public_url: string; thumbnail_url?: string };

function FolderPageInner() {
  const { slug } = useParams() as { slug: string };
  const [folder, setFolder] = useState<Folder | null>(null);
  const [media, setMedia] = useState<MediaWithUrl[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const { toast } = useToast();
  const router = useRouter();

  const load = useCallback(async () => {
    const [folderRes, mediaRes] = await Promise.all([
      fetch(`/api/folders/${slug}`),
      fetch(`/api/folders/${slug}/media`),
    ]);

    if (!folderRes.ok) {
      const d = await folderRes.json();
      setError(d.error || 'Not found');
      setLoading(false);
      return;
    }

    const [folderData, mediaData] = await Promise.all([folderRes.json(), mediaRes.json()]);
    setFolder(folderData.data);
    setMedia(mediaData.data || []);
    setIsOwner(mediaData.is_owner || false);
    setIsLoggedIn(mediaData.is_owner !== undefined);
    setLoading(false);
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  // Check login status separately for upload button
  useEffect(() => {
    fetch('/api/folders').then(r => { if (r.ok) setIsLoggedIn(true); }).catch(() => {});
  }, []);

  const handleUploadSuccess = (newMedia: MediaWithUrl) => {
    setMedia(prev => [newMedia, ...prev]);
    toast('success', 'File uploaded successfully!');
  };

  const handleDelete = (id: string) => {
    setMedia(prev => prev.filter(m => m.id !== id));
    toast('success', 'File deleted');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast('success', 'Link copied!');
  };

  const filtered = filter === 'all' ? media : media.filter(m => m.file_type === filter);

  if (loading) return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.loadWrap}>
        <div className={styles.loadSpinner} />
        <p className={styles.loadText}>Loading album…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.errorWrap}>
        <FolderOpen size={48} strokeWidth={1} className={styles.errorIcon} />
        <h2 className={styles.errorTitle}>{error === 'Access denied' ? 'Private Folder' : 'Folder Not Found'}</h2>
        <p className={styles.errorSub}>{error === 'Access denied' ? 'This folder is private.' : 'This link may be invalid or the folder was deleted.'}</p>
        <Link href="/" className={styles.errorBtn}><ArrowLeft size={16} /> Go Home</Link>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        {/* Folder Header */}
        <div className={styles.folderHeader}>
          <div className={styles.folderInfo}>
            <div className={styles.folderMeta}>
              <span className={`${styles.badge} ${folder?.is_public ? styles.badgePublic : styles.badgePrivate}`}>
                {folder?.is_public ? <Globe size={11} /> : <Lock size={11} />}
                {folder?.is_public ? 'Public' : 'Private'}
              </span>
              {isOwner && <span className={styles.ownerBadge}>Owner</span>}
            </div>
            <h1 className={styles.folderName}>{folder?.name}</h1>
            {folder?.description && <p className={styles.folderDesc}>{folder.description}</p>}
            <div className={styles.folderStats}>
              <span className={styles.statItem}><Calendar size={13} /> Created {formatDistanceToNow(new Date(folder!.created_at), { addSuffix: true })}</span>
              <span className={styles.statItem}><ImageIcon size={13} /> {media.length} item{media.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className={styles.folderActions}>
            <button className={styles.shareBtn} onClick={copyLink}>
              <LinkIcon size={16} /> Copy Link
            </button>
            {isLoggedIn && (
              <button className={styles.uploadBtn} onClick={() => setShowUpload(true)}>
                <Upload size={16} /> Upload
              </button>
            )}
            {!isLoggedIn && (
              <Link href={`/login?redirect=/f/${slug}`} className={styles.uploadBtn}>
                Sign in to Upload
              </Link>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        {media.length > 0 && (
          <div className={styles.filterBar}>
            {(['all', 'image', 'video'] as const).map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' && `All (${media.length})`}
                {f === 'image' && `Photos (${media.filter(m => m.file_type === 'image').length})`}
                {f === 'video' && `Videos (${media.filter(m => m.file_type === 'video').length})`}
              </button>
            ))}
          </div>
        )}

        {/* Media Grid */}
        {filtered.length === 0 ? (
          <div className={styles.emptyMedia}>
            <ImageIcon size={40} strokeWidth={1} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>{media.length === 0 ? 'No media yet' : 'No items match this filter'}</p>
            <p className={styles.emptySub}>
              {media.length === 0
                ? isLoggedIn
                  ? 'Be the first to upload a photo or video!'
                  : 'Sign in to upload media to this album.'
                : 'Try a different filter.'
              }
            </p>
          </div>
        ) : (
          <div className={styles.grid} style={{ animationDelay: '0.1s' }}>
            {filtered.map((item, i) => (
              <button
                key={item.id}
                className={styles.mediaCard}
                onClick={() => setViewerIdx(filtered.indexOf(item))}
              >
                <div className={styles.mediaThumb}>
                  {item.file_type === 'image' ? (
                    <img
                      src={item.thumbnail_url || item.public_url}
                      alt={item.title}
                      className={styles.mediaImg}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.videoThumb}>
                      <Play size={28} className={styles.playIcon} />
                      <span className={styles.videoLabel}>Video</span>
                    </div>
                  )}
                  <div className={styles.mediaOverlay}>
                    <span className={styles.mediaTitle}>{item.title}</span>
                    <span className={styles.mediaSize}>{(item.file_size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showUpload && folder && (
        <UploadModal
          folderId={folder.id}
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {viewerIdx !== null && (
        <MediaViewer
          media={filtered}
          startIndex={viewerIdx}
          isOwner={isOwner}
          onClose={() => setViewerIdx(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default function FolderPage() {
  return <ToastProvider><FolderPageInner /></ToastProvider>;
}
