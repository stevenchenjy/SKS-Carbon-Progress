import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-intro">
        <Link className="brand footer-brand" href="/">
          <span className="brand-mark" aria-hidden="true">SKS</span>
          <span><strong>Sustainability Field Report</strong><small>Storm King School</small></span>
        </Link>
        <p>Student work, documented with the context needed to understand it.</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link href="/" prefetch={false}>Overview</Link>
        <Link href="/start" prefetch={false}>START</Link>
        <Link href="/carbon" prefetch={false}>Carbon plan</Link>
        <Link href="/projects" prefetch={false}>Projects</Link>
        <Link href="/energy" prefetch={false}>Energy preview</Link>
      </nav>
      <div className="footer-bottom">
        <span>Public prototype · school results appear after review</span>
        <span>Names, emails, private notes, and approval discussions stay outside this site.</span>
      </div>
    </footer>
  );
}
