import type { Metadata } from 'next';
import Link from 'next/link';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { getProjectProvider } from '@/lib/projects/server';
import type { PublicProject } from '@/lib/projects/types';
import { unavailableMetadata } from '@/lib/provider-metadata';
import { getSiteContentProvider } from '@/lib/site-content/server';
import type { StartContent } from '@/lib/site-content/types';

const START_SOURCE_URL = 'https://www.greenschoolsalliance.org/about-start';

const startCapabilities = [
  {
    title: 'Blueprint',
    description: 'A structured, step-by-step roadmap helps a school move from broad sustainability ambitions to coordinated action.',
  },
  {
    title: 'Benchmark',
    description: 'A set of 53 metrics helps schools establish where they are, identify gaps, and recognize areas of strength.',
  },
  {
    title: 'Analytics',
    description: 'Schools can follow energy, emissions, water, and waste information to understand patterns and improve efficiency.',
  },
  {
    title: 'Resources',
    description: 'Project-based guidance, reporting resources, and practical toolkits help teams turn findings into action.',
  },
  {
    title: 'Collaborate',
    description: 'A central hub brings plans, responsibilities, project work, and progress tracking into one shared space.',
  },
  {
    title: 'Community',
    description: 'Participating schools can connect with peers, exchange lessons, and learn from sustainability practices elsewhere.',
  },
] as const;

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'START | SKS Sustainability Progress',
  description: 'Learn how the working START system can connect sustainability projects, evidence, review, and public learning at Storm King School.',
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
          metadata: unavailableMetadata('START content', 'The selected START source could not be loaded. No adoption history or status has been inferred.'),
        };
      }
    })(),
    (async () => {
      try {
        const provider = getProjectProvider();
        return await provider.getPublicProjects();
      } catch {
        return [] as PublicProject[];
      }
    })(),
  ]);

  return { ...contentResult, projects: projectsResult };
}

export default async function StartPage() {
  const { start, metadata, projects } = await loadStartPageData();
  const reviewedMetricCount = projects.flatMap((project) => project.metrics).filter((metric) => metric.value !== null).length;

  return (
    <main id="main-content">
      <section className="page-hero start-hero">
        <p className="eyebrow"><span /> 02 / START</p>
        <h1 aria-label="From ideas to organized action.">From ideas to<br /><em>organized action.</em></h1>
        <p>{start.introduction}</p>
        <div className="stage-line">
          <span>Public status</span>
          <strong>{start.adoptionStatus === 'confirmed' ? 'Institutional adoption confirmed' : 'Working purpose drafted · adoption history awaiting confirmation'}</strong>
          <DataQualityBadge quality={metadata.status} />
        </div>
      </section>

      <PrototypeNotice metadata={metadata} />

      <section className="section-pad start-definition-section" aria-labelledby="start-definition-heading">
        <div className="section-intro split-intro">
          <div>
            <p className="eyebrow"><span /> What START is</p>
            <h2 id="start-definition-heading">A consistent path<br /><em>from work to publication.</em></h2>
          </div>
          <p>START stands for Sustainability Tracking, Analytics &amp; Roadmap Tool. The Green Schools Alliance describes it as a platform created by schools for schools to structure, measure, and accelerate whole-school sustainability. Storm King’s adoption history, ownership, and approved rationale still await school confirmation.</p>
        </div>

        <div className="start-rationale-grid">
          <article>
            <span>Why use a shared system?</span>
            <h3>Keep action and evidence together.</h3>
            <p>{start.adoptionRationale ?? 'The proposed purpose is to bring projects, responsibilities, milestones, source records, and review into one process. This explains why the system is useful; it does not claim why or when Storm King adopted it.'}</p>
          </article>
          <dl>
            <div><dt>Official expansion</dt><dd>Sustainability Tracking, Analytics &amp; Roadmap Tool</dd></div>
            <div><dt>Adoption rationale</dt><dd>{start.adoptionRationale ?? 'Not yet approved for publication'}</dd></div>
            <div><dt>System owner</dt><dd>{start.owner ?? 'Not yet named publicly'}</dd></div>
            <div><dt>Adoption date</dt><dd>{start.adoptionDate ?? 'Not yet confirmed'}</dd></div>
            <div><dt>Snapshot cadence</dt><dd>{start.snapshotCadence ?? 'Not yet approved'}</dd></div>
            <div><dt>Platform source</dt><dd><a className="start-source-link" href={START_SOURCE_URL} target="_blank" rel="noreferrer">Green Schools Alliance ↗</a></dd></div>
          </dl>
        </div>
      </section>

      <section className="start-capabilities-section section-pad" aria-labelledby="start-capabilities-heading">
        <div className="section-intro split-intro">
          <div>
            <p className="eyebrow"><span /> How the platform works</p>
            <h2 id="start-capabilities-heading">Six tools for a<br /><em>whole-school journey.</em></h2>
          </div>
          <div className="start-capabilities-intro">
            <p>START combines planning, measurement, operational analysis, practical resources, teamwork, and peer learning. Together, these functions give a school a repeatable way to understand current performance and organize what comes next.</p>
            <a href={START_SOURCE_URL} target="_blank" rel="noreferrer">Learn about START from the Green Schools Alliance <span>↗</span></a>
          </div>
        </div>
        <div className="start-capabilities-grid">
          {startCapabilities.map((capability, index) => (
            <article key={capability.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
            </article>
          ))}
        </div>
        <p className="start-source-note">Platform descriptions are paraphrased from the Green Schools Alliance’s official START overview. They explain START generally and do not confirm Storm King-specific adoption dates, results, or governance.</p>
      </section>

      <section className="start-workflow-section section-pad" aria-labelledby="start-workflow-heading">
        <div className="section-intro split-intro light-intro">
          <div><p className="eyebrow"><span /> Proposed workflow</p><h2 id="start-workflow-heading">Review before<br /><em>public release.</em></h2></div>
          <p>Only approved public fields should move from the internal workspace to this site.</p>
        </div>
        <ol className="start-workflow-grid">
          {start.workflow.map((step, index) => (
            <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>
          ))}
        </ol>
      </section>

      <section className="start-snapshot-section section-pad" aria-labelledby="snapshot-heading">
        <div className="section-intro split-intro">
          <div><p className="eyebrow"><span /> Public START snapshot</p><h2 id="snapshot-heading">A limited view,<br /><em>designed for trust.</em></h2></div>
          <p>No approved live START snapshot has been connected. The figures below describe the prototype structure, not institutional results.</p>
        </div>
        <div className="snapshot-grid">
          <article><span>Reporting period</span><strong>Pending</strong><small>No approved period supplied</small></article>
          <article><span>Named project placeholders</span><strong>{projects.length}</strong><small>CLYNK and composting identified by the user</small></article>
          <article><span>Reviewed public metrics</span><strong>{reviewedMetricCount}</strong><small>Values remain unpublished until evidence review</small></article>
          <article><span>Snapshot owner</span><strong>Pending</strong><small>No owner claim supplied</small></article>
        </div>
        <div className="snapshot-actions">
          <Link className="primary-button" href="/projects">View project fields <span>↗</span></Link>
          <span>Future updates can come from a governed spreadsheet or approved START snapshot endpoint.</span>
        </div>
      </section>

      <section className="privacy-section start-privacy-section section-pad">
        <div><p className="eyebrow"><span /> Public/private boundary</p><h2>Share the evidence.<br /><em>Protect the workspace.</em></h2></div>
        <div className="privacy-grid">
          <article><span>Eligible for public review</span><ul><li>Approved summaries and statuses</li><li>Dated metrics with units and methods</li><li>Public evidence or verification links</li></ul></article>
          <article><span>Never exposed here</span><ul><li>Student or staff personal information</li><li>Internal notes and approval discussions</li><li>Unresolved concerns or private documents</li></ul></article>
        </div>
        <p className="privacy-boundary-note">{start.privacyBoundary}</p>
      </section>
    </main>
  );
}
