'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="error-page">
      <p className="eyebrow"><span /> Data temporarily unavailable</p>
      <h1>This prototype view could not be loaded.</h1>
      <p>No result is being inferred from missing data. Try loading the view again.</p>
      <button type="button" onClick={reset}>Try again</button>
    </main>
  );
}
