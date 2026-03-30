import Link from 'next/link';
import { Layers, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: 'linear-gradient(135deg, var(--accent), #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, boxShadow: '0 0 40px var(--accent-glow)',
      }}>
        <Layers size={28} color="white" />
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(60px, 10vw, 120px)',
        fontWeight: 800, lineHeight: 1,
        background: 'linear-gradient(135deg, var(--text-1), var(--text-3))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: 16,
      }}>404</h1>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 10 }}>Page not found</h2>
      <p style={{ color: 'var(--text-2)', fontSize: 16, marginBottom: 32, maxWidth: 360 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 24px', borderRadius: 'var(--radius)',
        background: 'var(--accent)', color: 'white',
        fontSize: 15, fontWeight: 600,
      }}>
        <ArrowLeft size={16} /> Go Home
      </Link>
    </div>
  );
}
