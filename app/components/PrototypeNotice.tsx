import type { ProviderMetadata } from '@/lib/provider-metadata';

export function PrototypeNotice({ compact = false, metadata }: { compact?: boolean; metadata?: ProviderMetadata }) {
  const isSynthetic = metadata?.synthetic ?? true;
  return (
    <aside className={compact ? 'prototype-notice compact' : 'prototype-notice'} role="note">
      <span className="notice-symbol" aria-hidden="true">i</span>
      <div>
        <strong>{isSynthetic ? 'Prototype data only' : metadata?.sourceLabel}</strong>
        <p>{metadata?.disclosure ?? 'Values are simulated to test the platform. They are not Storm King School results, claims, or verified achievements.'}</p>
      </div>
    </aside>
  );
}
