'use client';

import Link from 'next/link';
import { useState } from 'react';

const links = [
  { href: '/carbon', label: 'Carbon' },
  { href: '/energy', label: 'Energy' },
  { href: '/projects', label: 'Projects' },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="SKS Carbon Progress home">
        <span className="brand-mark" aria-hidden="true">SKS</span>
        <span>
          <strong>Carbon Progress</strong>
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
            <Link href="/" onClick={closeMobileMenu}>Home</Link>
            {links.map((link) => <Link href={link.href} key={link.href} onClick={closeMobileMenu}>{link.label}</Link>)}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
