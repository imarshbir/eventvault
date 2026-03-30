'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ToastProvider, useToast } from '@/components/Toast';
import { FolderOpen, Save, ArrowLeft, Globe, Lock, Trash2 } from 'lucide-react';

function EditFolderInner() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', description: '', is_public: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/folders/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setForm({ name: d.data.name, description: d.data.description || '', is_public: d.data.is_public });
        }
        setLoading(false);
      });
  }, [slug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch(`/api/folders/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Failed to save'); return; }
    toast('success', 'Folder updated!');
    router.push(`/f/${data.data.slug}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/folders/${slug}`, { method: 'DELETE' });
    setDeleting(false);
    if (!res.ok) { toast('error', 'Failed to delete'); return; }
    router.push('/dashboard');
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text-1)',
    fontSize: 15, fontFamily: 'var(--font-body)',
    outline: 'none', transition: 'border-color 0.2s',
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '120px 24px' }}>
        <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '88px 24px 80px' }}>
        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-3)', fontSize: 14, marginBottom: 32,
        }}>
          <ArrowLeft size={14} /> Dashboard
        </Link>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '32px',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--accent-dim)', border: '1px solid rgba(108,99,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <FolderOpen size={24} style={{ color: 'var(--accent-2)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
            Edit Folder
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 28 }}>
            Update your album's name, description, or visibility.
          </p>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>
                Folder Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required minLength={2} maxLength={80}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>
                Description <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                maxLength={500} rows={3}
                placeholder="What's this album about?"
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>
                Visibility
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { val: true, icon: Globe, label: 'Public', hint: 'Anyone with the link' },
                  { val: false, icon: Lock, label: 'Private', hint: 'Only you can view' },
                ].map(({ val, icon: Icon, label, hint }) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, is_public: val }))}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      gap: 4, padding: '14px 16px', borderRadius: 'var(--radius-sm)',
                      background: form.is_public === val ? 'var(--accent-dim)' : 'var(--bg-3)',
                      border: `2px solid ${form.is_public === val ? 'var(--accent)' : 'var(--border)'}`,
                      cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon size={14} style={{ color: form.is_public === val ? 'var(--accent-2)' : 'var(--text-3)' }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: form.is_public === val ? 'var(--text-1)' : 'var(--text-2)' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', fontSize: 14 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button type="submit" disabled={saving || form.name.trim().length < 2} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px', borderRadius: 'var(--radius-sm)',
                background: 'var(--accent)', border: 'none',
                color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)', opacity: saving ? 0.7 : 1,
              }}>
                <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div style={{
          marginTop: 20,
          background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius-xl)', padding: '24px 28px',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--danger)', marginBottom: 8 }}>
            Danger Zone
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 16 }}>
            Deleting this folder permanently removes all media inside it. This cannot be undone.
          </p>
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 18px', borderRadius: 'var(--radius-sm)',
              background: 'transparent', border: '1px solid var(--danger)',
              color: 'var(--danger)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            <Trash2 size={14} /> Delete Folder
          </button>
        </div>

        {/* Delete Confirm */}
        {confirmDelete && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 24,
          }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: 32, maxWidth: 400, width: '100%',
            }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 12, color: 'var(--danger)' }}>
                Delete "{form.name}"?
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 24 }}>
                All photos and videos inside will be permanently deleted. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmDelete(false)} style={{
                  flex: 1, padding: '11px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-3)', border: '1px solid var(--border)',
                  color: 'var(--text-1)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14,
                }}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting} style={{
                  flex: 1, padding: '11px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--danger)', border: 'none',
                  color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
                }}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditFolderPage() {
  return <ToastProvider><EditFolderInner /></ToastProvider>;
}
