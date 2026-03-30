'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FolderPlus, ArrowLeft, Globe, Lock } from 'lucide-react';
import styles from './new.module.css';

export default function NewFolderPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, is_public: isPublic }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Failed to create folder'); return; }
    router.push(`/f/${data.data.slug}`);
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <Link href="/dashboard" className={styles.back}><ArrowLeft size={16} /> Back to Dashboard</Link>
          <div className={styles.iconWrap}><FolderPlus size={28} strokeWidth={1.5} /></div>
          <h1 className={styles.title}>Create New Folder</h1>
          <p className={styles.sub}>Set up an event album and start collecting memories.</p>

          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Folder Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sarah's Wedding 2024"
                className={styles.input}
                required
                minLength={2}
                maxLength={80}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Description <span className={styles.optional}>(optional)</span></label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Tell contributors what this album is about…"
                className={styles.textarea}
                rows={3}
                maxLength={500}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Visibility</label>
              <div className={styles.visibilityToggle}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${isPublic ? styles.toggleActive : ''}`}
                  onClick={() => setIsPublic(true)}
                >
                  <Globe size={16} /> Public
                  <span className={styles.toggleHint}>Anyone with the link can view</span>
                </button>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${!isPublic ? styles.toggleActive : ''}`}
                  onClick={() => setIsPublic(false)}
                >
                  <Lock size={16} /> Private
                  <span className={styles.toggleHint}>Only you can view</span>
                </button>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.btn} disabled={loading || name.trim().length < 2}>
              {loading ? <><span className={styles.spinner} /> Creating…</> : <><FolderPlus size={18} /> Create Folder</>}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
