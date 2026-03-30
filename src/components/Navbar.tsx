'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Camera, FolderOpen, LogOut, Menu, X, Plus, User as UserIcon, ChevronDown } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from('profiles').select('username').eq('id', data.user.id).single()
          .then(({ data: p }) => { if (p) setUsername(p.username); });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Camera size={22} strokeWidth={1.5} />
          <span>EventVault</span>
        </Link>

        <div className={styles.desktopLinks}>
          {user ? (
            <>
              <Link href="/dashboard" className={styles.navLink}>My Folders</Link>
              <Link href="/folders/new" className={styles.btn}>
                <Plus size={16} /> New Folder
              </Link>
              <div className={styles.userMenu}>
                <button className={styles.userBtn} onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className={styles.avatar}>{username?.[0]?.toUpperCase() || '?'}</div>
                  <span>{username}</span>
                  <ChevronDown size={14} />
                </button>
                {dropdownOpen && (
                  <div className={styles.dropdown}>
                    <Link href="/dashboard" className={styles.dropItem}>
                      <FolderOpen size={15} /> Dashboard
                    </Link>
                    <Link href="/profile" className={styles.dropItem}>
                      <UserIcon size={15} /> Profile
                    </Link>
                    <div className={styles.dropDivider} />
                    <button className={`${styles.dropItem} ${styles.dropDanger}`} onClick={handleLogout}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>Sign In</Link>
              <Link href="/signup" className={styles.btnPrimary}>Get Started</Link>
            </>
          )}
        </div>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {user ? (
            <>
              <div className={styles.mobileUser}>
                <div className={styles.avatarLg}>{username?.[0]?.toUpperCase() || '?'}</div>
                <span>{username}</span>
              </div>
              <Link href="/dashboard" className={styles.mobileLink}>My Folders</Link>
              <Link href="/folders/new" className={styles.mobileLink}>New Folder</Link>
              <Link href="/profile" className={styles.mobileLink}>Profile</Link>
              <button className={`${styles.mobileLink} ${styles.mobileDanger}`} onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.mobileLink}>Sign In</Link>
              <Link href="/signup" className={`${styles.mobileLink} ${styles.mobileAccent}`}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
