import type { Metadata } from 'next';
import Link from 'next/link';
import { DataNotes } from '@/app/components/DataNotes';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { StartWorkflowList } from '@/app/components/StartWorkflowList';
import { getProjectProvider } from '@/lib/projects/server';
import type { PublicProject } from '@/lib/projects/types';
import { unavailableMetadata, type ProviderMetadata } from '@/lib/provider-metadata';
import { getSiteContentProvider } from '@/lib/site-content/server';
import type { StartContent } from '@/lib/site-content/types';

const START_SOURCE_URL = 'https://www.greenschoolsalliance.org/about-start';

const startCapabilities = [
  {
    title: 'Blueprint',
    description: 'A step-by-step roadmap for turning broad goals into coordinated work.',
  },
  {
    title: 'Benchmark',
    description: 'A shared set of measures for understanding current conditions and gaps.',
  },
  {
    title: 'Analytics',
    description: 'Tools for following operational information such as energy, emissions, water, and waste.',
  },
  {
    title: 'Resources',
    description: 'Project guidance and reporting resources that support practical action.',
  },
  {
    title: 'Collaborate',
    description: 'A common workspace for plans, responsibilities, evidence, and progress.',
  },
  {
    title: 'Community',
    description: 'Ways for participating schools to exchange lessons and practices.',
  },
] as const;

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'START Command Center | Storm King Sustainability Field Report',
  description: 'See how Storm King can move student sustainability work from an idea through evidence review to a careful public report.',
  alternates: { canonical: '/start' },
};

const unavailableStart: StartContent = {
  introduction: 'The selected START source could not be loaded.',
  adoptionRationale: null,
  adoptionStatus: 'working-purpose',
  owner: null,
  adoptionDate: null,
  workflow: [],
  privacyBoundary: 'No private information is exposed when the source is unavailable.',
  snapshotCadence: null,
};

interface ProjectLoadResult {
  available: boolean;
  projectMetadata: ProviderMetadata;
  projects: PublicProject[];
}

async function loadStartPageData() {
  const [contentResult, projectsResult] = await Promise.all([
    (async () => {
      try {
        const provider = getSiteContentProvider();
        const [start, metadata] = await Promise.all([provider.getStart(), provider.getMetadata()]);
        return { start, metadata };
      } catch {
        return {
          start: unavailableStart,
          metadata: unavailableMetadata(
            'START content',
            'The selected START source could not be loaded. No adoption history or status has been inferred.',
          ),
        };
      }
    })(),
    (async (): Promise<ProjectLoadResult> => {
      try {
        const provider = getProjectProvider();
        const [projects, projectMetadata] = await Promise.all([
          provider.getPublicProjects(),
          provider.getMetadata(),
        ]);
        return { available: true, projectMetadata, projects };
      } catch {
        return {
          available: false,
          projectMetadata: unavailableMetadata(
            'Project data',
            'The public project source could not be loaded. No replacement records or counts have been inferred.',
          ),
          projects: [],
        };
      }
    })(),
  ]);

  return { ...contentResult, ...projectsResult };
}

function projectCountLabel(available: boolean, projects: PublicProject[]): string {
  return available ? String(projects.length) : 'Unavailable';
}

function metricCountLabel(available: boolean, projects: PublicProject[]): string {
  if (!available) return 'Unavailable';
  const valueCount = projects.flatMap((project) => project.metrics).filter((metric) => metric.value !== null).length;
  return String(valueCount);
}

export default async function StartPage() {
  const { start, metadata, available, projectMetadata, projects } = await loadStartPageData();
  const siteContentAvailable = metadata.availability !== 'unavailable';
  const projectDataAvailable = available && projectMetadata.availability !== 'unavailable';
  const adoptionStatus = !siteContentAvailable
    ? 'Unavailable'
    : start.adoptionStatus === 'confirmed'
      ? 'Confirmed'
      : 'Working purpose';

  return (
    <main id="main-content" className="page-shell page-start">
      <section className="page-hero page-hero-start" aria-labelledby="start-page-title">
        <div className="page-hero-copy">
          <p className="page-context">START Command Center</p>
          <h1 id="start-page-title">One workflow, from student idea to public evidence.</h1>
          <p>
            Storm King can use a shared process to organize sustainability work, review its evidence,
            and publish only the fields the school approves.
          </p>
        </div>
        <dl className="page-hero-status" aria-label="START publication status">
          <div>
            <dt>Current status</dt>
            <dd>{adoptionStatus}</dd>
          </div>
          <div>
            <dt>Data quality</dt>
            <dd><DataQualityBadge quality={metadata.status} /></dd>
          </div>
        </dl>
      </section>

      <section className="page-notice" aria-label="Report status and data notes">
        <PrototypeNotice
          compact
          metadata={metadata}
          heading={metadata.synthetic ? 'Public prototype' : undefined}
          message={metadata.synthetic ? 'School results appear here only after evidence review and approval.' : undefined}
          detailsHref="#start-data-notes"
        />
      </section>

      <section className="report-section workflow-section" aria-labelledby="workflow-heading">
        <div className="section-heading">
          <h2 id="workflow-heading">Command Center workflow</h2>
          <p>
            This public-safe preview follows the workflow supplied by the selected START content source.
            Internal notes and approval discussions stay outside the report.
          </p>
        </div>

        <article className="workflow-command-center" aria-label="Public workflow preview">
          <header className="workflow-header">
            <div>
              <span>Public workflow preview</span>
              <strong>Review before release</strong>
            </div>
            <span className="workflow-status">{start.workflow.length > 0 ? `${start.workflow.length} stages` : siteContentAvailable ? 'No stages supplied' : 'Unavailable'}</span>
          </header>
          {start.workflow.length > 0 ? (
            <StartWorkflowList steps={start.workflow} />
          ) : (
            <p className="workflow-empty">{siteContentAvailable ? 'The selected source contains no public workflow steps.' : 'Workflow steps are unavailable from the selected source.'}</p>
          )}
        </article>
      </section>

      <section className="report-section snapshot-section" aria-labelledby="snapshot-heading">
        <div className="section-heading">
          <h2 id="snapshot-heading">What the public snapshot can show</h2>
          <p>Counts describe records in this preview, not environmental outcomes or verified achievements.</p>
        </div>

        <dl className="snapshot-grid">
          <div className="snapshot-item">
            <dt>Project entries</dt>
            <dd>{projectCountLabel(projectDataAvailable, projects)}</dd>
            <small>Public-safe records from the selected project source</small>
          </div>
          <div className="snapshot-item">
            <dt>Metric values supplied</dt>
            <dd>{metricCountLabel(projectDataAvailable, projects)}</dd>
            <small>Each value still requires its source, period, method, and quality label</small>
          </div>
          <div className="snapshot-item">
            <dt>Snapshot cadence</dt>
            <dd>{siteContentAvailable ? start.snapshotCadence ?? 'Pending' : 'Unavailable'}</dd>
            <small>No cadence is claimed until the school approves one</small>
          </div>
        </dl>

        <div className="snapshot-actions">
          <Link href="/projects">Read the project case studies <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="report-section start-definition" aria-labelledby="definition-heading">
        <div className="section-heading">
          <h2 id="definition-heading">What START means</h2>
        </div>
        <div className="start-definition-copy">
          <p>
            {start.introduction}{' '}
            <a href={START_SOURCE_URL} target="_blank" rel="noopener noreferrer">
              Read the official START overview <span aria-hidden="true">↗</span>
            </a>
          </p>
          {start.adoptionRationale ? <p>{start.adoptionRationale}</p> : null}
        </div>

        <details className="start-capabilities">
          <summary>Explore START’s general platform capabilities</summary>
          <div className="start-capabilities-grid">
            {startCapabilities.map((capability) => (
              <article key={capability.title}>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </article>
            ))}
          </div>
          <p className="start-capabilities-note">
            These descriptions paraphrase the Green Schools Alliance’s overview. They do not confirm
            Storm King adoption dates, governance, or results.
          </p>
        </details>
      </section>

      <section className="report-section privacy-section" aria-labelledby="privacy-heading">
        <div className="section-heading">
          <h2 id="privacy-heading">The public/private boundary</h2>
          <p>{start.privacyBoundary}</p>
        </div>
        <div className="privacy-grid">
          <article className="privacy-public">
            <h3>Eligible for public review</h3>
            <ul>
              <li>Approved summaries and statuses</li>
              <li>Dated metrics with units and methods</li>
              <li>Public evidence or verification links</li>
            </ul>
          </article>
          <article className="privacy-private">
            <h3>Kept inside the Command Center</h3>
            <ul>
              <li>Student or staff personal information</li>
              <li>Internal notes and approval discussions</li>
              <li>Unresolved concerns, blockers, or private documents</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="report-section notes-section" aria-label="START provenance">
        <DataNotes id="start-data-notes" metadata={metadata} title="START data notes" />
        <DataNotes id="start-project-data-notes" metadata={projectMetadata} title="Snapshot data notes" />
      </section>
    </main>
  );
}
