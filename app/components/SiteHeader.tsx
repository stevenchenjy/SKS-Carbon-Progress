'use client';

import Link from 'next/link';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/start', label: 'START' },
  { href: '/carbon', label: 'Carbon Neutrality Plan' },
  { href: '/projects', label: 'Projects' },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="SKS Sustainability Progress home">
        <span className="brand-mark" aria-hidden="true">SKS</span>
        <span>
          <strong>Sustainability Progress</strong>
          <small>Storm King School</small>
        </span>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>
      <span className="prototype-pill">Public prototype</span>
      <div className="mobile-menu">
        <button
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen((open) => !open)}
          type="button"
        >
          Menu
        </button>
        {isMenuOpen ? (
          <nav aria-label="Mobile navigation" id="mobile-navigation">
            {links.map((link) => <Link href={link.href} key={link.href} onClick={closeMobileMenu}>{link.label}</Link>)}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
