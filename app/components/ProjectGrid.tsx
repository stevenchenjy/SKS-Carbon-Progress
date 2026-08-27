import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import type { PublicProject } from '@/lib/projects/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

function formatMetricValue(value: number | null, unit: string): string {
  if (value === null) return 'Awaiting reviewed data';
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  return unit === 'USD' ? `$${formatted}` : `${formatted} ${unit}`;
}

export function ProjectGrid({ projects, metadata }: { projects: PublicProject[]; metadata: ProviderMetadata }) {
  if (projects.length === 0) {
    return <div className="content-empty" role="status"><strong>No public projects available</strong><p>Reviewed project snapshots will appear here when they are ready to share.</p></div>;
  }

  return (
    <div className="projects-grid">
      {projects.map((project, index) => (
        <article className="project-card" key={project.id}>
          <div className="project-number">{String(index + 1).padStart(2, '0')}</div>
          <div className="project-body">
            <div className="project-meta"><span>{project.category}</span><DataQualityBadge quality={project.quality} /></div>
            <h2>{project.title}</h2>
            <p>{project.summary}</p>
            {(project.metrics ?? []).length > 0 ? (
              <section className="project-metrics" aria-label={`${project.title} public metrics`}>
                {(project.metrics ?? []).map((metric) => (
                  <article key={metric.id}>
                    <div><span>{metric.label}</span><DataQualityBadge quality={metric.quality} /></div>
                    <strong>{formatMetricValue(metric.value, metric.unit)}</strong>
                    <small>{metric.periodStart && metric.periodEnd ? `${metric.periodStart} to ${metric.periodEnd}` : 'Reporting period awaiting review'}</small>
                    <p className="metric-source">Source: {metric.sourceLabel}</p>
                    {metric.methodologyNote ? <p>Method: {metric.methodologyNote}</p> : null}
                    {metric.equivalencies.map((equivalency) => (
                      <p className="metric-equivalency" key={`${metric.id}-${equivalency.label}`}>
                        Approx. {equivalency.value.toLocaleString('en-US')} {equivalency.unit} · {equivalency.label}. {equivalency.methodology}{' '}
                        <a href={equivalency.sourceReference}>Factor source ↗</a>
                      </p>
                    ))}
                    {metric.evidenceReference ? <a className="verification-link" href={metric.evidenceReference}>View metric evidence ↗</a> : null}
                  </article>
                ))}
              </section>
            ) : null}
            <dl>
              <div><dt>Status</dt><dd>{project.status}</dd></div>
              <div><dt>{metadata.synthetic ? 'Sample milestone' : 'Public milestone'}</dt><dd>{project.milestone.label}</dd></div>
              <div>
                <dt>Reported result</dt>
                <dd>
                  {project.impact ?? 'Not measured or reported'} <DataQualityBadge quality={project.impactQuality} />
                  {project.verificationReference ? <a className="verification-link" href={project.verificationReference}>View verification evidence ↗</a> : null}
                </dd>
              </div>
              <div><dt>Next public step</dt><dd>{project.nextPublicStep ?? 'Awaiting a reviewed update'}</dd></div>
              <div><dt>{metadata.synthetic ? 'Mock update' : 'Updated'}</dt><dd>{project.updatedAt}</dd></div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}
