import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EventVault — Share Your Moments',
  description: 'Upload, organize, and share event photos and videos with anyone. Create beautiful albums for your special moments.',
  keywords: 'event photos, video sharing, album, gallery, moments',
  openGraph: {
    title: 'EventVault — Share Your Moments',
    description: 'Upload, organize, and share event photos and videos with anyone.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise">{children}</body>
    </html>
  );
}
