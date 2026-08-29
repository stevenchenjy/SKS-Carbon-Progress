import type { ProviderMetadata } from '@/lib/provider-metadata';
import { disclosureHeading } from '@/lib/claim-safety';

interface PrototypeNoticeProps {
  compact?: boolean;
  detailsHref?: string;
  heading?: string;
  message?: string;
  metadata?: ProviderMetadata;
}

export function PrototypeNotice({
  compact = false,
  detailsHref,
  heading,
  message,
  metadata,
}: PrototypeNoticeProps) {
  return (
    <aside className={compact ? 'prototype-notice compact' : 'prototype-notice'} role="note">
      <span className="notice-symbol" aria-hidden="true">i</span>
      <p>
        <strong>{heading ?? disclosureHeading(metadata)}.</strong>{' '}
        {message ?? metadata?.disclosure ?? 'Values are simulated to test the platform. They are not Storm King School results, claims, or verified achievements.'}
      </p>
      {detailsHref ? <a href={detailsHref}>How to read this report <span aria-hidden="true">→</span></a> : null}
    </aside>
  );
}
