import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Layers, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions — EventVault',
  description: 'Read EventVault\'s Terms and Conditions before using the platform.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--text-3)', fontSize: 14, marginBottom: 32,
            transition: 'color 0.2s',
          }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, var(--accent), #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Layers size={20} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
                Event<span style={{ color: 'var(--accent-2)' }}>Vault</span>
              </span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: 800, marginBottom: 12, lineHeight: 1.1,
            }}>
              Terms & Conditions
            </h1>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <Section title="1. Acceptance of Terms">
              <p>By accessing or using EventVault ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service.</p>
              <p>EventVault reserves the right to update these terms at any time. Continued use of the Service after changes are posted constitutes acceptance of the revised terms.</p>
            </Section>

            <Section title="2. Account Registration">
              <p>To contribute content or create folders, you must register an account. You agree to:</p>
              <ul>
                <li>Provide accurate, complete, and current information during registration</li>
                <li>Maintain the security of your password and account</li>
                <li>Promptly notify us of any unauthorized use of your account</li>
                <li>Be at least 13 years of age to use this Service</li>
                <li>Use only one account per person</li>
              </ul>
              <p>You are responsible for all activity that occurs under your account.</p>
            </Section>

            <Section title="3. Content Policy">
              <p>You retain ownership of content you upload. By uploading, you grant EventVault a worldwide, non-exclusive, royalty-free licence to host, store, and display your content solely for the purpose of operating the Service.</p>
              <p>You agree <strong>not</strong> to upload or share content that:</p>
              <ul>
                <li>Contains nudity, sexual acts, or sexually suggestive material of any kind</li>
                <li>Involves, exploits, or sexualises minors in any way whatsoever</li>
                <li>Promotes, glorifies, or facilitates violence, self-harm, or terrorism</li>
                <li>Constitutes harassment, hate speech, or targeted abuse</li>
                <li>Infringes any third-party intellectual property, privacy, or publicity rights</li>
                <li>Contains malware, viruses, or any harmful computer code</li>
                <li>Is misleading, fraudulent, or deceptive</li>
                <li>Violates any applicable local, national, or international law</li>
              </ul>
            </Section>

            <Section title="4. Account Suspension & Termination" highlight>
              <p><strong>EventVault operates a strict zero-tolerance policy for prohibited content.</strong></p>
              <p>Your account may be <strong>immediately and permanently suspended</strong> if:</p>
              <ul>
                <li>Any content you upload or share is reported and found to contain 18+ / adult material, explicit sexual content, or nudity</li>
                <li>You upload content that sexualises or exploits minors — this will also be reported to the relevant law enforcement authorities</li>
                <li>You repeatedly violate our content policy</li>
                <li>You engage in abusive behaviour toward other users</li>
                <li>You attempt to circumvent our safety systems</li>
                <li>You use the Service for any unlawful purpose</li>
              </ul>
              <p>Upon suspension, all content you have uploaded may be permanently removed without prior notice or recourse. EventVault is not liable for any losses resulting from account suspension due to policy violations.</p>
              <p>You may voluntarily delete your account at any time from your profile settings.</p>
            </Section>

            <Section title="5. Uploading Content">
              <p>The following upload limits apply to all users:</p>
              <ul>
                <li><strong>Maximum file size:</strong> 40 MB per file</li>
                <li><strong>Supported image formats:</strong> JPEG, PNG, WebP, GIF</li>
                <li><strong>Supported video formats:</strong> MP4, WebM, MOV, OGG, AVI</li>
              </ul>
              <p>EventVault reserves the right to remove any content that violates these Terms without notice.</p>
            </Section>

            <Section title="6. Folder Ownership & Contributor Access">
              <p>When you create a folder, you are its owner. As an owner you may:</p>
              <ul>
                <li>Delete any media within the folder, including media uploaded by contributors</li>
                <li>Edit the folder name, description, and visibility settings</li>
                <li>Delete the entire folder and all its contents</li>
              </ul>
              <p>Contributors (signed-in users who are not the folder owner) may upload media but cannot delete any content. Any user can view and download media from public folders without signing in.</p>
            </Section>

            <Section title="7. Reporting Content">
              <p>If you encounter content that violates these Terms, please use the in-app report feature. We review all reports and will take appropriate action, which may include content removal and account suspension. False or malicious reports may result in action against the reporting account.</p>
            </Section>

            <Section title="8. Privacy">
              <p>Your use of the Service is also governed by our <Link href="/privacy" style={{ color: 'var(--accent-2)' }}>Privacy Policy</Link>, which is incorporated into these Terms by reference. By using EventVault, you consent to the collection and use of your information as described in the Privacy Policy.</p>
            </Section>

            <Section title="9. Intellectual Property">
              <p>EventVault and its logo, interface, and original content are owned by EventVault and protected by applicable intellectual property laws. You may not copy, reproduce, or distribute any part of the Service without our written permission.</p>
            </Section>

            <Section title="10. Disclaimers & Limitation of Liability">
              <p>The Service is provided "as is" without warranties of any kind, express or implied. EventVault does not warrant that the Service will be uninterrupted, error-free, or completely secure.</p>
              <p>To the maximum extent permitted by law, EventVault shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, revenue, or profits arising out of your use of the Service.</p>
            </Section>

            <Section title="11. Governing Law">
              <p>These Terms are governed by and construed in accordance with applicable law. Any disputes shall be resolved through binding arbitration or in the courts of competent jurisdiction.</p>
            </Section>

            <Section title="12. Contact">
              <p>If you have questions about these Terms, please contact us through the platform. We aim to respond to all inquiries within 3 business days.</p>
            </Section>
          </div>

          <div style={{
            marginTop: 48, padding: '24px', borderRadius: 'var(--radius)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
              By creating an account, you confirm that you have read and agree to these Terms & Conditions.
            </p>
            <Link href="/signup" style={{
              display: 'inline-flex', marginTop: 16, padding: '10px 24px',
              borderRadius: 'var(--radius-sm)', background: 'var(--accent)',
              color: 'white', fontSize: 14, fontWeight: 600,
            }}>
              Create Account
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function Section({ title, children, highlight }: {
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <section style={{
      padding: highlight ? '24px' : '0',
      borderRadius: highlight ? 'var(--radius)' : '0',
      background: highlight ? 'rgba(239,68,68,0.05)' : 'transparent',
      border: highlight ? '1px solid rgba(239,68,68,0.2)' : 'none',
    }}>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
        marginBottom: 16, color: highlight ? 'var(--danger)' : 'var(--text-1)',
      }}>
        {title}
      </h2>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 12,
        color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7,
      }}>
        {children}
      </div>
      <style>{`
        section ul { padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
        section li { color: var(--text-2); font-size: 15px; line-height: 1.6; }
        section strong { color: var(--text-1); }
      `}</style>
    </section>
  );
}
