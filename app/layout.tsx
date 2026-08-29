import type { Metadata } from 'next';
import { SiteFooter } from '@/app/components/SiteFooter';
import { SiteHeader } from '@/app/components/SiteHeader';
import './globals.css';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sks-carbon-progress.stevenchenjy.chatgpt.site';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'Storm King Sustainability Field Report',
  description: 'Student sustainability work at Storm King School, documented with its status, source, method, and next evidence milestone.',
  openGraph: {
    title: 'Storm King Sustainability Field Report',
    description: 'Student sustainability work, measured carefully and reported with context.',
    type: 'website',
    images: [{ url: '/images/topographic-field.webp', width: 1584, height: 993, alt: 'Topographic lines and a river form for Storm King School' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Storm King Sustainability Field Report',
    description: 'Student sustainability work, measured carefully and reported with context.',
    images: ['/images/topographic-field.webp'],
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
