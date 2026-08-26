import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import Link from 'next/link';
import type { RoadmapArea } from '@/lib/roadmap/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

const numbers = ['01', '02', '03', '04', '05'];

export function RoadmapGrid({ areas, metadata }: { areas: RoadmapArea[]; metadata: ProviderMetadata }) {
  if (areas.length === 0) {
    return <div className="content-empty" role="status"><strong>No roadmap areas yet</strong><p>Future public pathways will appear here after review.</p></div>;
  }

  return (
    <div className="roadmap-grid">
      {areas.map((area, index) => (
        <article className="roadmap-card" key={area.id}>
          <div className="roadmap-card-top"><span>{numbers[index] ?? String(index + 1).padStart(2, '0')}</span><DataQualityBadge quality={area.progress.quality} /></div>
          <h3>{area.title}</h3>
          <p>{area.summary}</p>
          <div className="roadmap-stage">
            <span>{metadata.synthetic ? 'Example stage' : 'Current stage'}</span><strong>{area.progress.stage}</strong>
            {area.progress.percent !== null && area.progress.metricLabel ? (
              <>
                <div className="progress-track" aria-label={`${area.progress.percent} percent progress against ${area.progress.metricLabel}`}>
                  <i style={{ width: `${area.progress.percent}%` }} />
                </div>
                <small>{area.progress.metricLabel}</small>
              </>
            ) : <small>Qualitative stage · no percentage assigned</small>}
          </div>
          <div className="roadmap-lists">
            <div><span>{metadata.synthetic ? 'Example actions' : 'Current actions'}</span><ul>{area.exampleActions.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><span>Future goals</span><ul>{area.futureGoals.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>
          {area.target || area.methodologyNote || area.linkedPublicProjectIds.length > 0 ? (
            <div className="roadmap-context">
              {area.target ? <p><span>Approved target</span>{area.target}</p> : null}
              {area.methodologyNote ? <p><span>Method</span>{area.methodologyNote}</p> : null}
              {area.linkedPublicProjectIds.length > 0 ? <Link href="/projects">{area.linkedPublicProjectIds.length} linked public project{area.linkedPublicProjectIds.length === 1 ? '' : 's'} →</Link> : null}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
