'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Film, Check, AlertCircle } from 'lucide-react';
import styles from './UploadModal.module.css';

interface Props {
  folderId: string;
  onClose: () => void;
  onSuccess: (media: any) => void;
}

const MAX_SIZE = 40 * 1024 * 1024;
const ALLOWED = ['image/jpeg','image/jpg','image/png','image/gif','image/webp','video/mp4','video/webm','video/ogg','video/quicktime','video/x-msvideo'];

interface FileItem {
  file: File;
  title: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  progress: number;
}

export default function UploadModal({ folderId, onClose, onSuccess }: Props) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (rawFiles: FileList | File[]) => {
    const arr = Array.from(rawFiles);
    const items: FileItem[] = arr.map(file => {
      if (!ALLOWED.includes(file.type)) return { file, title: file.name, status: 'error' as const, error: 'Unsupported type', progress: 0 };
      if (file.size > MAX_SIZE) return { file, title: file.name, status: 'error' as const, error: 'Exceeds 40MB limit', progress: 0 };
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      return { file, title: file.name.replace(/\.[^/.]+$/, ''), preview, status: 'pending' as const, progress: 0 };
    });
    setFiles(prev => [...prev, ...items]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, j) => j !== i));

  const updateTitle = (i: number, title: string) =>
    setFiles(prev => prev.map((f, j) => j === i ? { ...f, title } : f));

  const uploadAll = async () => {
    const pending = files.filter(f => f.status === 'pending');
    if (!pending.length) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;
      setFiles(prev => prev.map((f, j) => j === i ? { ...f, status: 'uploading', progress: 20 } : f));

      const fd = new FormData();
      fd.append('file', files[i].file);
      fd.append('folder_id', folderId);
      fd.append('title', files[i].title || files[i].file.name);

      try {
        const res = await fetch('/api/media/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Upload failed');
        setFiles(prev => prev.map((f, j) => j === i ? { ...f, status: 'done', progress: 100 } : f));
        onSuccess(json.data);
      } catch (err: any) {
        setFiles(prev => prev.map((f, j) => j === i ? { ...f, status: 'error', error: err.message, progress: 0 } : f));
      }
    }
    setUploading(false);
  };

  const allDone = files.length > 0 && files.every(f => f.status === 'done' || f.status === 'error');
  const hasPending = files.some(f => f.status === 'pending');

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && !uploading && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Upload Media</h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={uploading}><X size={20} /></button>
        </div>

        {files.length === 0 ? (
          <div
            className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={32} strokeWidth={1.5} className={styles.dropIcon} />
            <p className={styles.dropText}>Drag & drop files here</p>
            <p className={styles.dropSub}>or click to browse</p>
            <p className={styles.dropHint}>Images & Videos • Max 40MB per file</p>
            <input ref={inputRef} type="file" multiple accept={ALLOWED.join(',')} onChange={e => e.target.files && processFiles(e.target.files)} className={styles.hiddenInput} />
          </div>
        ) : (
          <div className={styles.fileList}>
            {files.map((item, i) => (
              <div key={i} className={`${styles.fileItem} ${styles[item.status]}`}>
                <div className={styles.filePreview}>
                  {item.preview ? (
                    <img src={item.preview} alt="" className={styles.thumb} />
                  ) : (
                    <div className={styles.thumbPlaceholder}>
                      {item.file.type.startsWith('video/') ? <Film size={20} /> : <Image size={20} />}
                    </div>
                  )}
                </div>
                <div className={styles.fileMeta}>
                  {item.status === 'pending' ? (
                    <input
                      className={styles.titleInput}
                      value={item.title}
                      onChange={e => updateTitle(i, e.target.value)}
                      placeholder="Title..."
                    />
                  ) : (
                    <span className={styles.fileName}>{item.title}</span>
                  )}
                  <span className={styles.fileSize}>{(item.file.size / 1024 / 1024).toFixed(1)} MB</span>
                  {item.error && <span className={styles.fileError}>{item.error}</span>}
                </div>
                <div className={styles.fileStatus}>
                  {item.status === 'done' && <Check size={18} className={styles.iconDone} />}
                  {item.status === 'error' && <AlertCircle size={18} className={styles.iconError} />}
                  {item.status === 'uploading' && <div className={styles.spinner} />}
                  {item.status === 'pending' && (
                    <button className={styles.removeBtn} onClick={() => removeFile(i)}><X size={16} /></button>
                  )}
                </div>
              </div>
            ))}
            <button
              className={styles.addMore}
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={14} /> Add more files
            </button>
            <input ref={inputRef} type="file" multiple accept={ALLOWED.join(',')} onChange={e => e.target.files && processFiles(e.target.files)} className={styles.hiddenInput} />
          </div>
        )}

        <div className={styles.footer}>
          {allDone ? (
            <button className={styles.doneBtn} onClick={onClose}>Done</button>
          ) : (
            <>
              <button className={styles.cancelBtn} onClick={onClose} disabled={uploading}>Cancel</button>
              <button
                className={styles.uploadBtn}
                onClick={uploadAll}
                disabled={!hasPending || uploading}
              >
                {uploading ? 'Uploading...' : `Upload ${files.filter(f=>f.status==='pending').length} file${files.filter(f=>f.status==='pending').length !== 1 ? 's' : ''}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
