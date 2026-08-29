import type { Metadata } from 'next';
import { DataNotes } from '@/app/components/DataNotes';
import { ProjectGrid } from '@/app/components/ProjectGrid';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { qualityLabel } from '@/lib/claim-safety';
import { getProjectProvider } from '@/lib/projects/server';
import type { PublicProject } from '@/lib/projects/types';
import { unavailableMetadata, type ProviderMetadata } from '@/lib/provider-metadata';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Projects | Storm King Sustainability Field Report',
  description: 'Read public-safe case studies for Storm King School sustainability projects, including their status and next evidence milestone.',
};

async function loadProjectsPageData() {
  try {
    const provider = getProjectProvider();
    const [projects, providerMetadata] = await Promise.all([
      provider.getPublicProjects(),
      provider.getMetadata(),
    ]);
    return { projects, providerMetadata };
  } catch {
    return {
      projects: [],
      providerMetadata: unavailableMetadata(
        'Project data',
        'The public project source could not be loaded. No private or synthetic replacement records are being shown.',
      ),
    };
  }
}

export function projectsHeroDescription(projects: PublicProject[], metadata: ProviderMetadata): string {
  if (metadata.availability === 'unavailable') {
    return 'The selected public project source is unavailable. No private or synthetic replacement records are shown.';
  }
  if (projects.length === 0) {
    return metadata.synthetic
      ? 'The connected prototype currently contains no named public project records.'
      : 'The reviewed source is connected but currently contains no public project records.';
  }
  const projectNames = projects.map((project) => project.title).join(' and ');
  return metadata.synthetic
    ? `Student and school teams are building the evidence needed to report ${projectNames} clearly.`
    : `Reviewed records from ${metadata.sourceLabel} connect action to milestones without exposing the private workspace.`;
}

export function projectsNoticeMessage(projects: PublicProject[], metadata: ProviderMetadata): string | undefined {
  if (!metadata.synthetic) return undefined;
  return projects.length > 0
    ? 'Project names are visible; results appear only after source and method review.'
    : 'The prototype source is connected, but it currently contains no named public project records.';
}

export default async function ProjectsPage() {
  const { projects, providerMetadata } = await loadProjectsPageData();

  return (
    <main id="main-content">
      <section className="page-hero projects-hero">
        <div>
          <h1>Projects underway on campus.</h1>
          <p>{projectsHeroDescription(projects, providerMetadata)}</p>
        </div>
        <dl className="hero-facts">
          <div><dt>Public records</dt><dd>{providerMetadata.availability === 'unavailable' ? 'Unavailable' : projects.length}</dd></div>
          <div><dt>Result state</dt><dd>{providerMetadata.availability === 'unavailable' ? 'Unavailable' : projects.length === 0 ? 'No records' : providerMetadata.synthetic ? 'Pending review' : qualityLabel(providerMetadata.status)}</dd></div>
          <div><dt>Coverage</dt><dd>{providerMetadata.coverage.label}</dd></div>
        </dl>
      </section>

      <PrototypeNotice
        detailsHref={projects.length > 0 ? `#${projects[0].id}-data-notes` : '#project-data-notes'}
        heading={providerMetadata.synthetic ? 'Public prototype' : undefined}
        message={projectsNoticeMessage(projects, providerMetadata)}
        metadata={providerMetadata}
      />

      <section className="report-section projects-section" aria-labelledby="projects-heading">
        <header className="section-heading">
          <h2 id="projects-heading">Current case studies</h2>
          <p>A blank result means unavailable, not zero. Each record shows one primary metric area and the next evidence needed for publication.</p>
        </header>
        <ProjectGrid projects={projects} metadata={providerMetadata} />
      </section>

      <section className="report-section accounting-section" aria-labelledby="accounting-heading">
        <header className="section-heading compact-heading">
          <h2 id="accounting-heading">Rules before results</h2>
          <p>Project benefits stay separate from carbon credits and the school inventory unless an approved accounting method connects them.</p>
        </header>
        <div className="rule-list">
          <article><span>CLYNK</span><h3>Use the account report.</h3><p>Publish the vendor-reported container count and proceeds for the same period. Do not derive containers from bags or dollars.</p></article>
          <article><span>Composting</span><h3>Weigh the material.</h3><p>Track food scraps by period. If a greenhouse-gas benefit is modeled, name the disposal baseline and EPA WARM version.</p></article>
          <article><span>Carbon language</span><h3>Keep ledgers separate.</h3><p>Recycling and composting outcomes are project benefits. They are not retired carbon credits or automatic inventory reductions.</p></article>
        </div>
        <p className="source-note">Storm King’s <a href="https://sks.org/sks-green-team-composting-2024/">2024 composting story</a> documents historical activity. It is not reused as a current result because the present method and reporting period still need confirmation.</p>
      </section>

      {projects.length === 0 ? (
        <section className="report-section notes-section" aria-label="Project provenance">
          <DataNotes id="project-data-notes" metadata={providerMetadata} title="Project data notes" />
        </section>
      ) : null}
    </main>
  );
}
