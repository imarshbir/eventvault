import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';
import { Camera, Share2, ShieldCheck, Download, FolderOpen, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot} />
            Now in open beta
          </div>
          <h1 className={styles.heroTitle}>
            Every moment,<br />
            <span className={styles.heroAccent}>perfectly preserved.</span>
          </h1>
          <p className={styles.heroSub}>
            Create shared albums for your events. Upload photos and videos, share a link, let everyone contribute — all in one beautiful space.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/signup" className={styles.ctaPrimary}>Start for free</Link>
            <Link href="/login" className={styles.ctaSecondary}>Sign in</Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}><strong>40MB</strong><span>per upload</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><strong>Free</strong><span>to use</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><strong>Secure</strong><span>& private</span></div>
          </div>
        </section>

        {/* Features */}
        <section className={styles.features}>
          <div className={styles.featuresGrid}>
            {[
              { icon: FolderOpen, title: 'Organized Albums', desc: 'Create folders for every event. Wedding, birthday, trip — keep everything neatly separated.' },
              { icon: Share2, title: 'Shareable Links', desc: 'Share a single link and anyone can view, browse, and download the album — no account needed.' },
              { icon: Users, title: 'Contributor Access', desc: 'Signed-in users can contribute to your album. Everyone adds their perspective.' },
              { icon: ShieldCheck, title: 'Owner Control', desc: 'Only the folder owner can delete content. Contributors can upload; they cannot remove.' },
              { icon: Download, title: 'Full Downloads', desc: 'Download any photo or video in its original quality. Your memories, your files.' },
              { icon: Camera, title: 'Photos & Videos', desc: 'Upload images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) up to 40MB each.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className={styles.featureCard}>
                <div className={styles.featureIcon}><Icon size={22} strokeWidth={1.5} /></div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ready to share your moments?</h2>
            <p className={styles.ctaDesc}>Create your first album in under a minute.</p>
            <Link href="/signup" className={styles.ctaPrimary}>Create your free account</Link>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <Camera size={18} strokeWidth={1.5} />
              <span>EventVault</span>
            </div>
            <div className={styles.footerLinks}>
              <Link href="/terms" className={styles.footerLink}>Terms & Conditions</Link>
              <Link href="/privacy" className={styles.footerLink}>Privacy</Link>
            </div>
            <p className={styles.footerCopy}>© {new Date().getFullYear()} EventVault. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
