import type { ReactNode } from 'react';
import {
  freshnessLabel,
  publicationLabel,
  qualityLabel,
  sourceTypeLabel,
  verificationLabel,
} from '@/lib/claim-safety';
import type { ProviderMetadata } from '@/lib/provider-metadata';

interface DataNotesProps {
  children?: ReactNode;
  className?: string;
  id?: string;
  metadata: ProviderMetadata;
  summaryDetail?: string;
  title?: string;
}

function observedAtLabel(value: string | null): string {
  if (!value) return 'Not supplied';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined,
    timeZone: value.includes('T') ? 'America/New_York' : 'UTC',
  }).format(date);
}

function availabilityLabel(value: ProviderMetadata['availability']): string {
  if (value === 'available') return 'Available';
  if (value === 'partial') return 'Partial';
  return 'Unavailable';
}

export function DataNotes({
  children,
  className,
  id = 'data-notes',
  metadata,
  summaryDetail,
  title = 'Data notes',
}: DataNotesProps) {
  const sourceStatus = metadata.availability === 'unavailable'
    ? 'Source unavailable'
    : metadata.synthetic
      ? 'Synthetic prototype'
      : 'Real source';

  return (
    <details className={className ? `data-notes ${className}` : 'data-notes'} id={id}>
      <summary>
        <span>{title}</span>
        <small>{summaryDetail ?? (metadata.synthetic ? 'Prototype source' : metadata.sourceLabel)}</small>
      </summary>
      <div className="data-notes-body">
        <p>{metadata.disclosure}</p>
        <dl>
          <div><dt>Source</dt><dd>{metadata.sourceLabel}</dd></div>
          <div><dt>Source status</dt><dd>{sourceStatus}</dd></div>
          <div><dt>Availability</dt><dd>{availabilityLabel(metadata.availability)}</dd></div>
          <div><dt>Coverage</dt><dd>{metadata.coverage.label}</dd></div>
          <div><dt>Quality</dt><dd>{qualityLabel(metadata.status)}</dd></div>
          <div><dt>Publication</dt><dd>{publicationLabel(metadata.publicationStatus)}</dd></div>
          <div><dt>Freshness</dt><dd>{freshnessLabel(metadata.freshness.state)}</dd></div>
          <div><dt>Source updated</dt><dd>{observedAtLabel(metadata.freshness.observedAt)}</dd></div>
          <div><dt>Period</dt><dd>{metadata.reportingPeriod?.label ?? 'Not supplied'}</dd></div>
          <div><dt>Source type</dt><dd>{sourceTypeLabel(metadata.sourceType ?? (metadata.synthetic ? 'synthetic' : 'unknown'))}</dd></div>
          <div>
            <dt>Verification</dt>
            <dd>
              {metadata.verification ? verificationLabel(metadata) : 'Not supplied'}
              {!metadata.synthetic && metadata.verification?.reference ? (
                <> · <a href={metadata.verification.reference}>View evidence ↗</a></>
              ) : null}
            </dd>
          </div>
        </dl>
        <p className="data-notes-method"><strong>Coverage note:</strong> {metadata.coverage.note}</p>
        {metadata.methodologyNote ? <p className="data-notes-method"><strong>Method note:</strong> {metadata.methodologyNote}</p> : null}
        {children ? <div className="data-notes-extra">{children}</div> : null}
      </div>
    </details>
  );
}
