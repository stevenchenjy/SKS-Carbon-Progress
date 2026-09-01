import type { Metadata } from 'next';
import { SiteFooter } from '@/app/components/SiteFooter';
import { SiteHeader } from '@/app/components/SiteHeader';
import './globals.css';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sks-carbon-progress.stevenchenjy.chatgpt.site';
const siteTitle = 'Storm King Sustainability Field Report';
const siteDescription = 'A public record connecting whole-school sustainability benchmarks, campus greenhouse-gas accounting, and reviewed evidence at Storm King School.';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: siteTitle,
  description: siteDescription,
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
    url: '/',
    siteName: siteTitle,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Storm King Sustainability Field Report' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
