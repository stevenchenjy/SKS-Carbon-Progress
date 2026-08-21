export default function Loading() {
  return (
    <main className="loading-page" aria-busy="true" aria-live="polite">
      <p className="eyebrow"><span /> Loading public prototype</p>
      <div className="loading-line wide" /><div className="loading-line medium" />
      <div className="loading-cards"><i /><i /><i /></div>
      <span className="sr-only">Loading climate transparency content</span>
    </main>
  );
}
