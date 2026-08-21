import type { Metadata } from 'next';
import { SiteFooter } from '@/app/components/SiteFooter';
import { SiteHeader } from '@/app/components/SiteHeader';
import './globals.css';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sks-carbon-progress.stevenchenjy.chatgpt.site';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'SKS Carbon Progress | Public Climate Transparency',
  description: 'A public prototype for sharing Storm King School’s future climate measurement, action, and learning.',
  openGraph: {
    title: 'SKS Carbon Progress',
    description: 'A transparent climate journey — public prototype.',
    type: 'website',
    images: [{ url: '/og.png', width: 1729, height: 910, alt: 'SKS Carbon Progress — A transparent climate journey' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SKS Carbon Progress',
    description: 'A transparent climate journey — public prototype.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
