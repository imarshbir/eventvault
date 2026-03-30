import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — EventVault',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--text-3)', fontSize: 14, marginBottom: 32,
          }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={20} color="white" />
              </div>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: 800, marginBottom: 12,
            }}>Privacy Policy</h1>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 36, color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7 }}>
            <p>EventVault is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights regarding that data.</p>

            {[
              {
                title: '1. Data We Collect',
                content: (
                  <>
                    <p><strong style={{color:'var(--text-1)'}}>Account data:</strong> When you register, we collect your email address, username, and display name.</p>
                    <p><strong style={{color:'var(--text-1)'}}>Content data:</strong> Files you upload (photos and videos), folder names, and descriptions.</p>
                    <p><strong style={{color:'var(--text-1)'}}>Usage data:</strong> Basic analytics such as view and download counts on media items.</p>
                    <p><strong style={{color:'var(--text-1)'}}>Technical data:</strong> IP address and browser information collected automatically via our infrastructure provider (Supabase / Vercel).</p>
                  </>
                )
              },
              {
                title: '2. How We Use Your Data',
                content: (
                  <>
                    <p>We use your data to: operate and improve the Service, authenticate your account, display your content to others as intended, respond to support requests, and enforce our Terms & Conditions.</p>
                    <p>We do not sell your personal data to third parties. We do not serve targeted advertising.</p>
                  </>
                )
              },
              {
                title: '3. Data Sharing',
                content: (
                  <>
                    <p>Content you upload to public folders is visible to anyone with the folder link, including users who are not signed in.</p>
                    <p>We use Supabase for database and file storage, and Vercel for hosting. These providers may process your data subject to their own privacy policies.</p>
                    <p>We may disclose data if required by law or to protect the safety of users, particularly in cases involving illegal content such as child exploitation material.</p>
                  </>
                )
              },
              {
                title: '4. Data Retention',
                content: (
                  <p>We retain your data for as long as your account is active. If you delete your account, your profile and uploaded content will be permanently deleted within 30 days. Reports involving serious violations may be retained for longer as required by law.</p>
                )
              },
              {
                title: '5. Cookies',
                content: (
                  <p>We use essential session cookies to keep you signed in. We do not use tracking or advertising cookies. You can disable cookies in your browser, but this will prevent you from signing in.</p>
                )
              },
              {
                title: '6. Your Rights',
                content: (
                  <>
                    <p>Depending on your jurisdiction, you may have rights to: access the personal data we hold about you, request correction of inaccurate data, request deletion of your data ("right to be forgotten"), and object to or restrict certain processing.</p>
                    <p>To exercise any of these rights, contact us through the platform.</p>
                  </>
                )
              },
              {
                title: '7. Security',
                content: (
                  <p>We implement industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and row-level security on our database. However, no system is completely secure and we cannot guarantee absolute security.</p>
                )
              },
              {
                title: '8. Children\'s Privacy',
                content: (
                  <p>EventVault is not directed at children under 13. We do not knowingly collect personal data from children under 13. If we become aware that a child under 13 has created an account, we will delete the account and associated data immediately.</p>
                )
              },
              {
                title: '9. Changes to This Policy',
                content: (
                  <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the platform. Your continued use of the Service after changes are posted constitutes acceptance.</p>
                )
              },
            ].map(({ title, content }) => (
              <section key={title}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>{title}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{content}</div>
              </section>
            ))}
          </div>

          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <Link href="/terms" style={{ color: 'var(--accent-2)', fontSize: 14 }}>
              View Terms & Conditions →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
