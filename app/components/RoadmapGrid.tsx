import { DataQualityBadge } from '@/app/components/DataQualityBadge';
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
          <div className="roadmap-card-top"><span>{numbers[index]}</span><DataQualityBadge quality={area.progress.quality} /></div>
          <h3>{area.title}</h3>
          <p>{area.summary}</p>
          <div className="roadmap-stage">
            <span>{metadata.synthetic ? 'Example stage' : 'Current stage'}</span><strong>{area.progress.stage}</strong>
            <div className="progress-track" aria-label={`${area.progress.percent} percent ${metadata.synthetic ? 'illustrative' : 'reported'} progress`}>
              <i style={{ width: `${area.progress.percent}%` }} />
            </div>
          </div>
          <div className="roadmap-lists">
            <div><span>{metadata.synthetic ? 'Example actions' : 'Current actions'}</span><ul>{area.exampleActions.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><span>Future goals</span><ul>{area.futureGoals.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>
        </article>
      ))}
    </div>
  );
}
