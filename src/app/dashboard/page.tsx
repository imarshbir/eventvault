'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ToastProvider, useToast } from '@/components/Toast';
import { Plus, FolderOpen, Calendar, Image, Lock, Globe, Trash2, Edit, Link as LinkIcon, Copy } from 'lucide-react';
import { Folder } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import styles from './dashboard.module.css';

function DashboardInner() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/folders')
      .then(r => r.json())
      .then(d => { if (d.data) setFolders(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its media? This cannot be undone.`)) return;
    const res = await fetch(`/api/folders/${slug}`, { method: 'DELETE' });
    if (res.ok) {
      setFolders(prev => prev.filter(f => f.slug !== slug));
      toast('success', 'Folder deleted');
    } else {
      toast('error', 'Failed to delete folder');
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${slug}`);
    toast('success', 'Link copied to clipboard!');
  };

  if (loading) return (
    <div className={styles.loading}>
      {[1,2,3].map(i => <div key={i} className={`${styles.skeletonCard} skeleton`} />)}
    </div>
  );

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Folders</h1>
            <p className={styles.sub}>{folders.length} album{folders.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/folders/new" className={styles.newBtn}>
            <Plus size={18} /> New Folder
          </Link>
        </div>

        {folders.length === 0 ? (
          <div className={styles.empty}>
            <FolderOpen size={48} strokeWidth={1} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>No folders yet</h2>
            <p className={styles.emptySub}>Create your first album to start sharing event moments.</p>
            <Link href="/folders/new" className={styles.emptyBtn}><Plus size={16} /> Create Folder</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {folders.map(folder => (
              <div key={folder.id} className={styles.card}>
                <Link href={`/f/${folder.slug}`} className={styles.cardMain}>
                  <div className={styles.cardThumb}>
                    <FolderOpen size={32} strokeWidth={1} className={styles.cardIcon} />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <span className={`${styles.badge} ${folder.is_public ? styles.badgePublic : styles.badgePrivate}`}>
                        {folder.is_public ? <Globe size={11} /> : <Lock size={11} />}
                        {folder.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <h3 className={styles.cardName}>{folder.name}</h3>
                    {folder.description && <p className={styles.cardDesc}>{folder.description}</p>}
                    <div className={styles.cardMeta}>
                      <span className={styles.metaItem}><Image size={12} /> {folder.media_count} items</span>
                      <span className={styles.metaItem}><Calendar size={12} /> {formatDistanceToNow(new Date(folder.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </Link>
                <div className={styles.cardActions}>
                  <button className={styles.actionBtn} onClick={() => copyLink(folder.slug)} title="Copy share link">
                    <LinkIcon size={15} />
                  </button>
                  <Link href={`/folders/edit/${folder.slug}`} className={styles.actionBtn} title="Edit">
                    <Edit size={15} />
                  </Link>
                  <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(folder.slug, folder.name)} title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return <ToastProvider><DashboardInner /></ToastProvider>;
}
