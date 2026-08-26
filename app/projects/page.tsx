import type { Metadata } from 'next';
import { ProjectGrid } from '@/app/components/ProjectGrid';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { getProjectProvider } from '@/lib/projects/server';
import { unavailableMetadata } from '@/lib/provider-metadata';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Public projects | SKS Carbon Progress',
  description: 'Explore synthetic examples of how reviewed campus sustainability project updates could be shared publicly.',
};

async function loadProjectsPageData() {
  try {
    const provider = getProjectProvider();
    const [projects, providerMetadata] = await Promise.all([provider.getPublicProjects(), provider.getMetadata()]);
    return { projects, providerMetadata };
  } catch {
    return {
      projects: [],
      providerMetadata: unavailableMetadata('Project data', 'The public project source could not be loaded. No private or synthetic replacement records are being shown.'),
    };
  }
}

export default async function ProjectsPage() {
  const { projects, providerMetadata } = await loadProjectsPageData();

  return (
    <main id="main-content">
      <section className="page-hero projects-hero">
        <p className="eyebrow"><span /> Public project stories</p>
        <h1 aria-label="Progress lives in what we learn.">Progress lives in<br /><em>what we learn.</em></h1>
        <p>{providerMetadata.availability === 'unavailable' ? 'The selected public project source is unavailable. No private or synthetic replacement records are shown.' : providerMetadata.synthetic ? 'Sample public updates connect campus action to milestones while keeping private operations and personal information out of view.' : 'Reviewed public updates connect campus action to milestones while keeping private operations and personal information out of view.'}</p>
        <div className="project-hero-count"><strong>{projects.length}</strong><span>{providerMetadata.synthetic ? 'synthetic project cards' : 'public project cards'}<br />{providerMetadata.synthetic ? 'for interface testing' : providerMetadata.sourceLabel}</span></div>
      </section>

      <PrototypeNotice metadata={providerMetadata} />

      <section className="section-pad projects-section" aria-labelledby="projects-heading">
        <div className="section-intro split-intro">
          <div><p className="eyebrow"><span /> Example portfolio</p><h2 id="projects-heading">Actions with<br /><em>visible milestones.</em></h2></div>
          <p>{providerMetadata.synthetic ? 'Each card demonstrates a reviewed milestone, next step, and result status. All current records are fictional examples.' : `Every card uses the approved public fields supplied by ${providerMetadata.sourceLabel}.`}</p>
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
        <span>Public review policy</span>
        <h2>{providerMetadata.synthetic ? 'Publish only approved fields' : providerMetadata.sourceLabel}</h2>
        <p>{providerMetadata.synthetic ? 'Future updates should include only reviewed public summaries, milestones, next steps, dated results, and evidence. Private operational records stay outside this site.' : providerMetadata.disclosure}</p>
      </section>
    </main>
  );
}
