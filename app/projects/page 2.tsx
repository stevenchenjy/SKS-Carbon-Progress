import type { Metadata } from 'next';
import { ProjectGrid } from '@/app/components/ProjectGrid';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { getProjectProvider } from '@/lib/projects/server';
import { unavailableMetadata } from '@/lib/provider-metadata';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Active Projects | SKS Sustainability Progress',
  description: 'Explore CLYNK, composting, and the reviewed metrics designed for Storm King School sustainability projects.',
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
        <p className="eyebrow"><span /> 04 / Active Projects</p>
        <h1 aria-label="Turn campus action into evidence.">Turn campus action<br /><em>into evidence.</em></h1>
        <p>{providerMetadata.availability === 'unavailable' ? 'The selected public project source is unavailable. No private or synthetic replacement records are shown.' : providerMetadata.synthetic ? 'CLYNK and composting were identified as active work by the user. Their result fields remain empty until Storm King confirms the status, reporting period, source records, and calculation method.' : 'Reviewed public updates connect campus action to milestones while keeping private operations and personal information out of view.'}</p>
        <div className="project-hero-count"><strong>{projects.length}</strong><span>{providerMetadata.synthetic ? 'named project placeholders' : 'reviewed public projects'}<br />{providerMetadata.synthetic ? 'results still pending' : providerMetadata.sourceLabel}</span></div>
      </section>

      <PrototypeNotice metadata={providerMetadata} />

      <section className="section-pad projects-section" aria-labelledby="projects-heading">
        <div className="section-intro split-intro">
          <div><p className="eyebrow"><span /> Current portfolio structure</p><h2 id="projects-heading">Activity, impact,<br /><em>and evidence kept distinct.</em></h2></div>
          <p>{providerMetadata.synthetic ? 'The project names are supplied, but no count, weight, proceeds, carbon benefit, or equivalency is being claimed. A blank metric means unavailable—not zero.' : `Every card uses the approved public fields supplied by ${providerMetadata.sourceLabel}.`}</p>
        </div>
        <ProjectGrid projects={projects} metadata={providerMetadata} />
      </section>

      <section className="project-accounting-section section-pad" aria-labelledby="project-accounting-heading">
        <div className="section-intro split-intro light-intro">
          <div><p className="eyebrow"><span /> Honest project accounting</p><h2 id="project-accounting-heading">Useful outcomes.<br /><em>Not invented offsets.</em></h2></div>
          <p>Each project needs a dated source, unit, reporting period, method, and review status before its result can move from “pending” to public.</p>
        </div>
        <div className="accounting-rules-grid">
          <article><span>CLYNK</span><h3>Use the account report.</h3><p>Publish the vendor-reported container count and proceeds for the same period. Do not derive containers from bags or dollars.</p></article>
          <article><span>Composting</span><h3>Weigh the material.</h3><p>Track food scraps by period. If a greenhouse-gas benefit is modeled, name the disposal baseline and EPA WARM version.</p></article>
          <article><span>Carbon language</span><h3>Keep ledgers separate.</h3><p>Recycling and composting outcomes are project benefits. They are not carbon credits and do not reduce the school inventory unless the approved inventory method says so.</p></article>
        </div>
        <p className="historical-source-note">Storm King’s <a href="https://sks.org/sks-green-team-composting-2024/">2024 composting story</a> reported historical activity. Those figures are not presented as current totals because the measurement method and current reporting period still need confirmation.</p>
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
        <p>{providerMetadata.synthetic ? 'Future updates should include only reviewed summaries, milestones, dated metrics, units, methods, and evidence. Private operational records stay outside this site.' : providerMetadata.disclosure}</p>
      </section>
    </main>
  );
}
