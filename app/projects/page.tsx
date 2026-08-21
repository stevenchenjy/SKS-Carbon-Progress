import type { Metadata } from 'next';
import { ProjectGrid } from '@/app/components/ProjectGrid';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { getProjectProvider } from '@/lib/projects/server';

export const metadata: Metadata = {
  title: 'Public projects | SKS Carbon Progress',
  description: 'Explore synthetic examples of how reviewed campus sustainability project updates could be shared publicly.',
};

export default async function ProjectsPage() {
  const provider = getProjectProvider();
  const [projects, providerMetadata] = await Promise.all([provider.getPublicProjects(), provider.getMetadata()]);

  return (
    <main>
      <section className="page-hero projects-hero">
        <p className="eyebrow"><span /> Public project stories</p>
        <h1 aria-label="Progress lives in what we learn.">Progress lives in<br /><em>what we learn.</em></h1>
        <p>{providerMetadata.synthetic ? 'Sample public updates connect campus action to milestones while keeping private operations and personal information out of view.' : 'Reviewed public updates connect campus action to milestones while keeping private operations and personal information out of view.'}</p>
        <div className="project-hero-count"><strong>{projects.length}</strong><span>{providerMetadata.synthetic ? 'synthetic project cards' : 'public project cards'}<br />{providerMetadata.synthetic ? 'for interface testing' : providerMetadata.sourceLabel}</span></div>
      </section>

      <PrototypeNotice metadata={providerMetadata} />

      <section className="section-pad projects-section" aria-labelledby="projects-heading">
        <div className="section-intro split-intro">
          <div><p className="eyebrow"><span /> Example portfolio</p><h2 id="projects-heading">Actions with<br /><em>visible milestones.</em></h2></div>
          <p>{providerMetadata.synthetic ? 'Each card includes the public fields planned for a future START Command Center snapshot. All current records are fictional examples.' : `Every card uses the public-safe fields supplied by ${providerMetadata.sourceLabel}.`}</p>
        </div>
        <ProjectGrid projects={projects} metadata={providerMetadata} />
      </section>

      <section className="privacy-section section-pad">
        <div><p className="eyebrow"><span /> Public by design</p><h2>Share the work.<br /><em>Protect the people.</em></h2></div>
        <div className="privacy-grid">
          <article><span>{providerMetadata.synthetic ? 'Included later' : 'Included publicly'}</span><ul><li>Reviewed public project summaries</li><li>Approved milestones</li><li>Verified results with provenance</li></ul></article>
          <article><span>Never exposed here</span><ul><li>Internal notes or approval discussions</li><li>Faculty emails or private concerns</li><li>Student identities or personal data</li></ul></article>
        </div>
      </section>

      <section className="source-section section-pad">
        <span>{providerMetadata.synthetic ? 'Future source' : 'Current source'}</span>
        <h2>{providerMetadata.synthetic ? 'START public project snapshot' : providerMetadata.sourceLabel}</h2>
        <p>{providerMetadata.synthetic ? 'A planned adapter will accept an approved JSON snapshot containing only public projects, milestones, and verified results. No connection exists in this prototype.' : providerMetadata.disclosure}</p>
      </section>
    </main>
  );
}
