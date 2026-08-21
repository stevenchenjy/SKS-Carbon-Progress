import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import type { PublicProject } from '@/lib/projects/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

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
            <dl>
              <div><dt>Status</dt><dd>{project.status}</dd></div>
              <div><dt>{metadata.synthetic ? 'Sample milestone' : 'Public milestone'}</dt><dd>{project.milestone.label}</dd></div>
              <div><dt>Impact</dt><dd>{project.impact}</dd></div>
              <div><dt>{metadata.synthetic ? 'Mock update' : 'Updated'}</dt><dd>{project.updatedAt}</dd></div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}
