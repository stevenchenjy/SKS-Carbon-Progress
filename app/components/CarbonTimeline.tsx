import { dataQualityLabels } from '@/lib/data-quality';
import type { CarbonHistoryPoint } from '@/lib/carbon/types';

export function CarbonTimeline({ history }: { history: CarbonHistoryPoint[] }) {
  if (history.length === 0) {
    return <div className="content-empty" role="status"><strong>No carbon timeline available</strong><p>Inventory, project, and verification milestones will appear when the provider returns them.</p></div>;
  }

  return (
    <ol className="carbon-timeline">
      {history.map((item, index) => (
        <li key={`${item.year}-${item.milestone}-${index}`}>
          <div className="timeline-marker"><span>{index + 1}</span></div>
          <strong>{item.year}</strong>
          <h3>{item.milestone.replace(/^./, (letter) => letter.toUpperCase())}</h3>
          <p>{item.note}</p>
          <small>{item.kind === 'scenario' ? 'Future scenario' : dataQualityLabels[item.quality]}</small>
        </li>
      ))}
    </ol>
  );
}
