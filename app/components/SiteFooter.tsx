import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="brand footer-brand" href="/">
          <span className="brand-mark" aria-hidden="true">SKS</span>
          <span><strong>Carbon Progress</strong><small>Public prototype</small></span>
        </Link>
        <p>A foundation for future climate transparency, campus learning, and carefully verified reporting.</p>
      </div>
      <div className="footer-links">
        <span>Explore</span>
        <Link href="/carbon">Carbon methodology</Link>
        <Link href="/energy">Energy preview</Link>
        <Link href="/projects">Public projects</Link>
      </div>
      <div className="footer-note">
        <span>Data status</span>
        <strong>Source-aware</strong>
        <p>Each public data view identifies its source, quality, and prototype status.</p>
      </div>
      <div className="footer-bottom">
        <span>Storm King School · Prototype environment</span>
        <span>Measure carefully. Explain clearly.</span>
      </div>
    </footer>
  );
}
