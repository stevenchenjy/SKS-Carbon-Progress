import type { Metadata } from 'next';
import { SiteFooter } from '@/app/components/SiteFooter';
import { SiteHeader } from '@/app/components/SiteHeader';
import './globals.css';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sks-carbon-progress.stevenchenjy.chatgpt.site';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'SKS Sustainability Progress | Public Transparency',
  description: 'A public prototype for sharing Storm King School’s sustainability purpose, coordination, carbon framework, projects, and learning.',
  openGraph: {
    title: 'SKS Sustainability Progress',
    description: 'Purpose, projects, evidence, and a transparent carbon framework — public prototype.',
    type: 'website',
    images: [{ url: '/og.png', width: 1729, height: 910, alt: 'SKS Sustainability Progress — public prototype' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SKS Sustainability Progress',
    description: 'Purpose, projects, evidence, and a transparent carbon framework — public prototype.',
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
