'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/start', label: 'START' },
  { href: '/carbon', label: 'Carbon Neutrality Plan' },
  { href: '/projects', label: 'Projects' },
];

export function SiteHeader() {
  const pathname = usePathname();

  const isCurrent = (href: string) => href === '/' ? pathname === href : pathname.startsWith(href);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Storm King Sustainability Field Report home">
        <span className="brand-mark" aria-hidden="true">SKS</span>
        <span>
          <strong>Sustainability Field Report</strong>
          <small>Storm King School</small>
        </span>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {links.map((link) => <Link aria-current={isCurrent(link.href) ? 'page' : undefined} href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>
      <details className="mobile-menu" key={pathname}>
        <summary className="mobile-menu-button">
          <span>Menu</span><i aria-hidden="true" />
        </summary>
        <nav aria-label="Mobile navigation">
          {links.map((link) => <Link aria-current={isCurrent(link.href) ? 'page' : undefined} href={link.href} key={link.href}>{link.label}</Link>)}
        </nav>
      </details>
    </header>
  );
}
