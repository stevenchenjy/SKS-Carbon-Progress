import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import type { CarbonScopeSummary } from '@/lib/carbon/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

function scopeValueStatus(item: CarbonScopeSummary, metadata: ProviderMetadata): string | null {
  if (metadata.availability === 'unavailable') return 'Source unavailable';
  if (metadata.synthetic) return 'Pending school data';
  if (metadata.publicationStatus !== 'reported') return 'Not published';
  if (item.value === null) return 'Pending';
  return null;
}

function formatMeasuredValue(value: number | null): string {
  if (value === null) return 'Pending';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}

export function CarbonScopeGrid({ scopes, metadata }: { scopes: CarbonScopeSummary[]; metadata: ProviderMetadata }) {
  if (scopes.length === 0) {
    return (
      <div className="scope-empty" role="status">
        <strong>No carbon inventory available</strong>
        <p>Scope records will appear when the selected provider returns a reviewed public inventory.</p>
      </div>
    );
  }

  return (
    <div className="scope-grid">
      {scopes.map((item) => {
        const status = scopeValueStatus(item, metadata);

        return (
          <article className="scope-card" key={item.scope}>
            <div className="scope-heading">
              <h3>{item.scope}</h3>
              <DataQualityBadge quality={item.quality} />
            </div>
            <p className="scope-source">{item.source}</p>
            <p className="scope-value">
              {status ?? (
                <>
                  <strong>{formatMeasuredValue(item.value)}</strong>
                  <span>{item.unit}</span>
                </>
              )}
            </p>
            <p className="scope-note">{item.note}</p>
          </article>
        );
      })}
    </div>
  );
}
