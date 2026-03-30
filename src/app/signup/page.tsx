'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Camera, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import styles from '../auth.module.css';

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' });
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError('You must agree to the Terms & Conditions'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!/^[a-z0-9_]+$/.test(form.username)) { setError('Username may only contain lowercase letters, numbers and underscores'); return; }

    setLoading(true);
    setError('');
    const supabase = createClient();

    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { username: form.username, display_name: form.displayName || form.username },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
  };

  if (success) return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}><Camera size={24} strokeWidth={1.5} /><span>EventVault</span></Link>
        <div className={styles.successIcon}>✓</div>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.sub}>We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.</p>
        <Link href="/login" className={styles.btn} style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>Back to Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}><Camera size={24} strokeWidth={1.5} /><span>EventVault</span></Link>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Join EventVault — it&apos;s free</p>

        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <div className={styles.inputWrap}>
                <User size={16} className={styles.inputIcon} />
                <input type="text" value={form.username} onChange={e => update('username', e.target.value.toLowerCase())}
                  placeholder="yourhandle" className={styles.input} required autoComplete="username" pattern="[a-z0-9_]+" title="Lowercase letters, numbers, underscores only" />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Display Name</label>
              <div className={styles.inputWrap}>
                <User size={16} className={styles.inputIcon} />
                <input type="text" value={form.displayName} onChange={e => update('displayName', e.target.value)}
                  placeholder="Your Name" className={styles.input} autoComplete="name" />
              </div>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                placeholder="you@example.com" className={styles.input} required autoComplete="email" />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)}
                placeholder="Min. 8 characters" className={styles.input} required minLength={8} autoComplete="new-password" />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className={styles.checkbox} />
            <span>I agree to the <Link href="/terms" target="_blank" className={styles.link}>Terms & Conditions</Link>, including that accounts may be suspended for uploading 18+ or inappropriate content.</span>
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link href="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
