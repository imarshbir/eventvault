'use client';

import { useEffect, useCallback, useState } from 'react';
import { X, Download, ChevronLeft, ChevronRight, Flag, Trash2 } from 'lucide-react';
import styles from './MediaViewer.module.css';
import { Media } from '@/lib/types';

interface Props {
  media: (Media & { public_url: string; thumbnail_url?: string })[];
  startIndex: number;
  isOwner: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function MediaViewer({ media, startIndex, isOwner, onClose, onDelete }: Props) {
  const [idx, setIdx] = useState(startIndex);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const current = media[idx];

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx(i => Math.min(media.length - 1, i + 1)), [media.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  const handleDownload = async () => {
    try {
      const res = await fetch(current.public_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = current.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch { }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this file permanently?')) return;
    setDeleting(true);
    const res = await fetch(`/api/media/${current.id}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) {
      onDelete(current.id);
      if (media.length === 1) onClose();
      else setIdx(i => Math.min(i, media.length - 2));
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: current.id, reason: reportReason }),
    });
    setReportSent(true);
    setTimeout(() => { setReporting(false); setReportSent(false); setReportReason(''); }, 2000);
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.viewer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.info}>
            <span className={styles.mediaTitle}>{current.title}</span>
            <span className={styles.counter}>{idx + 1} / {media.length}</span>
          </div>
          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={handleDownload} title="Download">
              <Download size={18} />
            </button>
            {!isOwner && (
              <button className={`${styles.actionBtn} ${styles.reportBtn}`} onClick={() => setReporting(!reporting)} title="Report">
                <Flag size={18} />
              </button>
            )}
            {isOwner && (
              <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={handleDelete} disabled={deleting} title="Delete">
                <Trash2 size={18} />
              </button>
            )}
            <button className={`${styles.actionBtn} ${styles.closeBtn}`} onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        {/* Media */}
        <div className={styles.content}>
          {idx > 0 && (
            <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={prev}>
              <ChevronLeft size={24} />
            </button>
          )}
          {current.file_type === 'image' ? (
            <img src={current.public_url} alt={current.title} className={styles.image} />
          ) : (
            <video
              src={current.public_url}
              controls
              autoPlay
              className={styles.video}
              key={current.id}
            />
          )}
          {idx < media.length - 1 && (
            <button className={`${styles.navBtn} ${styles.navNext}`} onClick={next}>
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Meta bar */}
        <div className={styles.meta}>
          {current.description && <p className={styles.desc}>{current.description}</p>}
          <div className={styles.metaRight}>
            <span className={styles.metaItem}>{(current.file_size / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        </div>

        {/* Report panel */}
        {reporting && (
          <div className={styles.reportPanel}>
            {reportSent ? (
              <p className={styles.reportSent}>✓ Report submitted. Thank you.</p>
            ) : (
              <>
                <p className={styles.reportLabel}>Report this content</p>
                <select className={styles.reportSelect} value={reportReason} onChange={e => setReportReason(e.target.value)}>
                  <option value="">Select reason…</option>
                  <option value="18+ content">18+ / Adult content</option>
                  <option value="harassment">Harassment or bullying</option>
                  <option value="spam">Spam or misleading</option>
                  <option value="violence">Violence or graphic content</option>
                  <option value="other">Other</option>
                </select>
                <button className={styles.reportSubmit} onClick={handleReport} disabled={!reportReason}>
                  Submit Report
                </button>
              </>
            )}
          </div>
        )}

        {/* Thumbnail strip */}
        {media.length > 1 && (
          <div className={styles.strip}>
            {media.map((m, i) => (
              <button key={m.id} className={`${styles.stripItem} ${i === idx ? styles.stripActive : ''}`} onClick={() => setIdx(i)}>
                {m.file_type === 'image' ? (
                  <img src={m.thumbnail_url || m.public_url} alt="" className={styles.stripThumb} />
                ) : (
                  <div className={styles.stripVideo}>▶</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
