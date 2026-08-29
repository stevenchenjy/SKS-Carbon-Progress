'use client';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="error-page" id="main-content">
      <p className="page-kicker">Data temporarily unavailable</p>
      <h1>This report view could not be loaded.</h1>
      <p>No result is being inferred from missing data. Try loading the view again.</p>
      <button type="button" onClick={reset}>Try again</button>
    </main>
  );
}
