import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import type { CarbonScopeSummary } from '@/lib/carbon/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

export function CarbonScopeGrid({ scopes, metadata }: { scopes: CarbonScopeSummary[]; metadata: ProviderMetadata }) {
  if (scopes.length === 0) {
    return <div className="content-empty" role="status"><strong>No carbon inventory available</strong><p>Scope results will appear here when the selected provider returns a reviewed inventory.</p></div>;
  }

  return (
    <div className="scope-grid">
      {scopes.map((item, index) => (
        <article className="scope-card" key={item.scope}>
          <div className="scope-top"><span>0{index + 1}</span><DataQualityBadge quality={item.quality} /></div>
          <h3>{item.scope}</h3>
          <p>{item.source}</p>
          <strong>{item.value === null ? (metadata.synthetic ? 'Mock' : 'Awaiting data') : item.value}</strong>
          <small>{item.value === null ? item.note : `${item.unit} · ${item.note}`}</small>
        </article>
      ))}
    </div>
  );
}
