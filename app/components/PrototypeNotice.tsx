import type { ProviderMetadata } from '@/lib/provider-metadata';
import { disclosureHeading, freshnessLabel, publicationLabel, qualityLabel, sourceTypeLabel, verificationLabel } from '@/lib/claim-safety';

export function PrototypeNotice({ compact = false, metadata }: { compact?: boolean; metadata?: ProviderMetadata }) {
  return (
    <aside className={compact ? 'prototype-notice compact' : 'prototype-notice'} role="note">
      <span className="notice-symbol" aria-hidden="true">i</span>
      <div>
        <strong>{disclosureHeading(metadata)}</strong>
        <p>{metadata?.disclosure ?? 'Values are simulated to test the platform. They are not Storm King School results, claims, or verified achievements.'}</p>
        {metadata ? (
          <ul className="source-context" aria-label="Data source context">
            <li><span>Source</span><strong>{metadata.sourceLabel}</strong></li>
            <li><span>Coverage</span><strong>{metadata.coverage.label}</strong></li>
            <li><span>Quality</span><strong>{qualityLabel(metadata.status)}</strong></li>
            <li><span>Publication</span><strong>{publicationLabel(metadata.publicationStatus)}</strong></li>
            <li><span>Freshness</span><strong>{freshnessLabel(metadata.freshness.state)}</strong></li>
            {metadata.reportingPeriod ? <li><span>Period</span><strong>{metadata.reportingPeriod.label}</strong></li> : null}
            {metadata.sourceType ? <li><span>Source type</span><strong>{sourceTypeLabel(metadata.sourceType)}</strong></li> : null}
            {metadata.verification ? (
              <li>
                <span>Verification</span>
                <strong>{verificationLabel(metadata)}</strong>
                {!metadata.synthetic && metadata.verification.reference ? <a href={metadata.verification.reference}>View evidence ↗</a> : null}
              </li>
            ) : null}
          </ul>
        ) : null}
        {!compact && metadata?.methodologyNote ? <p className="source-method"><strong>Method note</strong> {metadata.methodologyNote}</p> : null}
      </div>
    </aside>
  );
}
