import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="brand footer-brand" href="/">
          <span className="brand-mark" aria-hidden="true">SKS</span>
          <span><strong>Sustainability Progress</strong><small>Public prototype</small></span>
        </Link>
        <p>A foundation for future sustainability transparency, campus learning, and carefully reviewed reporting.</p>
      </div>
      <div className="footer-links">
        <span>Explore</span>
        <Link href="/">Overview</Link>
        <Link href="/start">START</Link>
        <Link href="/carbon">Carbon Neutrality Plan</Link>
        <Link href="/projects">Active projects</Link>
        <Link href="/energy">Monitored energy preview</Link>
      </div>
      <div className="footer-note">
        <span>Data status</span>
        <strong>Source-aware</strong>
        <p>Each public data view identifies its source, quality, and prototype status.</p>
      </div>
      <div className="footer-bottom">
        <span>Storm King School · Public prototype</span>
        <span>Measure carefully. Explain clearly.</span>
      </div>
    </footer>
  );
}
