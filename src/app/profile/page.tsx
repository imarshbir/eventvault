'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ToastProvider, useToast } from '@/components/Toast';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Edit2, Save, X, LogOut, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function ProfileInner() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ display_name: '', bio: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setEmail(user.email || '');
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setProfile(data);
            setForm({ display_name: data.display_name || '', bio: data.bio || '' });
          }
          setLoading(false);
        });
    });
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('profiles')
      .update({ display_name: form.display_name.trim() || null, bio: form.bio.trim() || null })
      .eq('id', profile.id);
    setSaving(false);
    if (error) { toast('error', 'Failed to update profile'); return; }
    setProfile((p: any) => ({ ...p, ...form }));
    setEditing(false);
    toast('success', 'Profile updated!');
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    // Delete all user's content via API then sign out
    const supabase = createClient();
    // Delete folders (cascades to media)
    await supabase.from('folders').delete().eq('owner_id', profile.id);
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ padding: '120px 24px', maxWidth: 600, margin: '0 auto' }}>
        <div className="skeleton" style={{ height: 120, borderRadius: 16, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 60, borderRadius: 12 }} />
      </div>
    </div>
  );

  const initial = profile?.display_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || 'U';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '88px 24px 80px' }}>
        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-3)', fontSize: 14, marginBottom: 32,
        }}>
          <ArrowLeft size={14} /> Dashboard
        </Link>

        {/* Profile Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 20,
        }}>
          {/* Banner */}
          <div style={{
            height: 80,
            background: 'linear-gradient(135deg, var(--accent-dim), rgba(168,85,247,0.15))',
            borderBottom: '1px solid var(--border)',
          }} />

          <div style={{ padding: '0 28px 28px' }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: 'linear-gradient(135deg, var(--accent), #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'white',
              border: '3px solid var(--bg-2)',
              marginTop: -36, marginBottom: 16,
            }}>{initial}</div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
                  {profile?.display_name || profile?.username}
                </h1>
                <p style={{ color: 'var(--text-3)', fontSize: 14 }}>@{profile?.username}</p>
              </div>
              {!editing && (
                <button onClick={() => setEditing(true)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-3)', border: '1px solid var(--border)',
                  color: 'var(--text-2)', fontSize: 13, cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}>
                  <Edit2 size={13} /> Edit
                </button>
              )}
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', gap: 24, margin: '20px 0',
              paddingBottom: 20, borderBottom: '1px solid var(--border)',
            }}>
              <Stat label="Member since" value={new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} />
              <Stat label="Status" value={profile?.is_suspended ? '⛔ Suspended' : '✓ Active'} />
            </div>

            {/* Edit Form */}
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                    Display Name
                  </label>
                  <input
                    value={form.display_name}
                    onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                    placeholder="Your display name"
                    maxLength={60}
                    style={{
                      width: '100%', padding: '10px 14px',
                      background: 'var(--bg-3)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-1)',
                      fontSize: 15, fontFamily: 'var(--font-body)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                    Bio
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell people about yourself…"
                    maxLength={200}
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 14px',
                      background: 'var(--bg-3)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-1)',
                      fontSize: 15, fontFamily: 'var(--font-body)', resize: 'vertical',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleSave} disabled={saving} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent)', border: 'none',
                    color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}>
                    <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button onClick={() => setEditing(false)} style={{
                    padding: '10px 16px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-3)', border: '1px solid var(--border)',
                    color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <InfoRow icon={<Mail size={14} />} label="Email" value={email} />
                <InfoRow icon={<User size={14} />} label="Username" value={`@${profile?.username}`} />
                {profile?.bio && (
                  <div style={{ marginTop: 4, color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>
                    {profile.bio}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Account Actions</h2>
          </div>
          <div style={{ padding: '8px' }}>
            <ActionBtn icon={<LogOut size={15} />} label="Sign Out" onClick={handleSignOut} />
            <ActionBtn
              icon={<Trash2 size={15} />}
              label="Delete Account"
              onClick={() => setDeleteConfirm(true)}
              danger
            />
          </div>
        </div>

        {/* Suspended warning */}
        {profile?.is_suspended && (
          <div style={{
            marginTop: 20, padding: '16px 20px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: 14,
          }}>
            <strong>Your account has been suspended.</strong>
            {profile.suspension_reason && <p style={{ marginTop: 4, opacity: 0.8 }}>Reason: {profile.suspension_reason}</p>}
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 24,
          }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: 32, maxWidth: 400, width: '100%',
            }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 12, color: 'var(--danger)' }}>
                Delete Account
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 24 }}>
                This will permanently delete your account, all folders, and all uploaded media. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setDeleteConfirm(false)} style={{
                  flex: 1, padding: '11px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-3)', border: '1px solid var(--border)',
                  color: 'var(--text-1)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14,
                }}>
                  Cancel
                </button>
                <button onClick={handleDeleteAccount} style={{
                  flex: 1, padding: '11px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--danger)', border: 'none',
                  color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
                }}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: 'var(--text-3)' }}>{icon}</span>
      <span style={{ color: 'var(--text-3)', fontSize: 13, width: 70 }}>{label}</span>
      <span style={{ color: 'var(--text-1)', fontSize: 14 }}>{value}</span>
    </div>
  );
}

function ActionBtn({ icon, label, onClick, danger }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '12px 20px', borderRadius: 'var(--radius-sm)',
        background: hov ? (danger ? 'rgba(239,68,68,0.08)' : 'var(--surface-2)') : 'transparent',
        border: 'none', cursor: 'pointer',
        color: danger ? 'var(--danger)' : 'var(--text-2)',
        fontSize: 14, fontFamily: 'var(--font-body)',
        transition: 'all 0.15s',
      }}
    >
      {icon} {label}
    </button>
  );
}

export default function ProfilePage() {
  return <ToastProvider><ProfileInner /></ToastProvider>;
}
