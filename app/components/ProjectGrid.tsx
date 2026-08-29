import { DataNotes } from '@/app/components/DataNotes';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import type { PublicProject, PublicProjectMetric } from '@/lib/projects/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

function formatMetricValue(value: number | null, unit: string): string {
  if (value === null) return 'Awaiting reviewed data';
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  return unit === 'USD' ? `$${formatted}` : `${formatted} ${unit}`;
}

function periodLabel(metric: PublicProjectMetric): string {
  return metric.periodStart && metric.periodEnd
    ? `${metric.periodStart} to ${metric.periodEnd}`
    : 'Reporting period awaiting review';
}

function caseStudyQuestion(project: PublicProject, metadata: ProviderMetadata): string {
  if (!metadata.synthetic) return project.summary;
  if (project.id === 'clynk-container-collection') {
    return 'How many eligible containers were returned through the named program, and during which reporting period?';
  }
  if (project.id === 'campus-composting') {
    return 'How much food-scrap material was collected within a documented campus boundary and period?';
  }
  return project.summary;
}

function resultNoteLabel(project: PublicProject, metadata: ProviderMetadata): string {
  if (metadata.synthetic || project.impactQuality === 'pending' || project.impactQuality === 'prototype') return 'Result note';
  return project.impactQuality === 'verified' ? 'Verified result' : 'Reported result';
}

function caseStudyEvidenceStep(project: PublicProject): string {
  return project.nextPublicStep ?? project.milestone.label;
}

export function ProjectGrid({ projects, metadata }: { projects: PublicProject[]; metadata: ProviderMetadata }) {
  if (projects.length === 0) {
    return (
      <div className="content-empty" role="status">
        <strong>No public projects available</strong>
        <p>Reviewed project snapshots will appear here when they are ready to share.</p>
      </div>
    );
  }

  return (
    <div className="case-study-list">
      {projects.map((project, index) => {
        const primaryMetric = project.metrics[0];
        return (
          <article className="case-study" id={project.id} key={project.id}>
            <header className="case-study-header">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><p>{project.category}</p><h3>{project.title}</h3></div>
              <div className="case-status"><DataQualityBadge quality={project.quality} /><strong>{project.status}</strong></div>
            </header>

            <div className="case-story">
              <div><h4>{metadata.synthetic ? 'Reporting question' : 'Public record'}</h4><p>{caseStudyQuestion(project, metadata)}</p></div>
              <div><h4>Evidence needed</h4><p>{caseStudyEvidenceStep(project)}</p></div>
            </div>

            <div className="case-evidence">
              <div className="case-metric">
                <span>{primaryMetric?.label ?? 'Public result'}</span>
                <strong>{primaryMetric ? formatMetricValue(primaryMetric.value, primaryMetric.unit) : 'Awaiting reviewed data'}</strong>
                <small>{primaryMetric ? periodLabel(primaryMetric) : 'No approved metric supplied'}</small>
                <small>Source: {primaryMetric?.sourceLabel ?? 'Not supplied'}</small>
              </div>
              <dl>
                <div><dt>Status</dt><dd>{project.milestone.stage}</dd></div>
                <div><dt>Next evidence milestone</dt><dd>{project.nextPublicStep ?? project.milestone.label}</dd></div>
              </dl>
            </div>

            <DataNotes
              className="project-notes"
              id={`${project.id}-data-notes`}
              metadata={metadata}
              summaryDetail={metadata.synthetic ? 'Prototype record' : `Updated ${project.updatedAt}`}
              title="Project data notes"
            >
                <p>{project.summary}</p>
                <dl className="project-record-facts">
                  <div><dt>Public milestone</dt><dd>{project.milestone.label}</dd></div>
                  <div><dt>{resultNoteLabel(project, metadata)}</dt><dd>{project.impact ?? 'Not measured or reported'} · <DataQualityBadge quality={project.impactQuality} /></dd></div>
                  <div><dt>Record updated</dt><dd>{project.updatedAt}</dd></div>
                </dl>
                {!metadata.synthetic && project.verificationReference ? <a className="verification-link" href={project.verificationReference}>View verification evidence ↗</a> : null}
                {project.metrics.map((metric) => (
                  <section className="metric-note" key={metric.id} aria-labelledby={`${project.id}--${metric.id}`}>
                    <header><h4 id={`${project.id}--${metric.id}`}>{metric.label}</h4><DataQualityBadge quality={metric.quality} /></header>
                    <p><strong>{formatMetricValue(metric.value, metric.unit)}</strong> · {periodLabel(metric)}</p>
                    <p>Source: {metric.sourceLabel}</p>
                    {metric.methodologyNote ? <p>Method: {metric.methodologyNote}</p> : null}
                    {metric.evidenceReference ? <a className="verification-link" href={metric.evidenceReference}>View metric evidence ↗</a> : null}
                    {metric.equivalencies.map((equivalency) => (
                      <p className="metric-equivalency" key={`${metric.id}-${equivalency.label}`}>
                        Approx. {equivalency.value.toLocaleString('en-US')} {equivalency.unit} · {equivalency.label}. {equivalency.methodology}{' '}
                        <a href={equivalency.sourceReference}>Factor source ↗</a>
                      </p>
                    ))}
                  </section>
                ))}
            </DataNotes>
          </article>
        );
      })}
    </div>
  );
}
