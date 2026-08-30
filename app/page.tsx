import Link from 'next/link';
import Image from 'next/image';
import { DataNotes } from '@/app/components/DataNotes';
import { OverviewWorkflowList } from '@/app/components/OverviewWorkflowList';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { getProjectProvider } from '@/lib/projects/server';
import type { PublicProject, PublicProjectMetric } from '@/lib/projects/types';
import { unavailableMetadata, type ProviderMetadata } from '@/lib/provider-metadata';
import { getSiteContentProvider } from '@/lib/site-content/server';
import type {
  CarbonNeutralityPlanContent,
  StartContent,
  SustainabilityOverviewContent,
} from '@/lib/site-content/types';

export const dynamic = 'force-dynamic';

const unavailableOverview: SustainabilityOverviewContent = {
  sustainabilityDefinition: 'Sustainability content is temporarily unavailable. No replacement claim has been inferred.',
  placeContext: 'The selected public-content source could not be loaded.',
  valueAlignment: [],
  sourceReferences: [],
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

const unavailablePlan: CarbonNeutralityPlanContent = {
  definition: 'The selected carbon-plan source could not be loaded.',
  goal: null,
  targetYear: null,
  baselineYear: null,
  latestReportingYear: null,
  inventoryBoundary: null,
  baselineGrossEmissionsTco2e: null,
  latestGrossEmissionsTco2e: null,
  targetGrossEmissionsTco2e: null,
  progressPercent: null,
  progressMetric: null,
  progressMethod: null,
  retiredOffsetsTco2e: null,
  offsetsMethod: null,
  offsetsEvidenceReference: null,
  status: 'Framework',
  updatedAt: null,
  quality: 'pending',
  framework: [],
};

function sourceName(value: string): string {
  try {
    const url = new URL(value);
    if (url.hostname === 'sks.org' && url.pathname.includes('/at-a-glance')) {
      return 'Storm King School — At a glance';
    }
    if (url.hostname === 'sks.org' && url.pathname.includes('/strategic-plan-2030')) {
      return 'Storm King School — Strategic Plan 2030';
    }
    if (url.hostname === 'sks.org') return 'Storm King School';
    if (url.hostname === 'www.un.org') return 'United Nations — Sustainable Development Goals';
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'Source';
  }
}

function formatMetric(metric: PublicProjectMetric | undefined): string {
  if (!metric || metric.value === null) return 'Result pending reviewed evidence';
  const value = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(metric.value);
  const amount = metric.unit === 'USD' ? `$${value}` : `${value} ${metric.unit}`;
  const period = metric.periodStart && metric.periodEnd ? `${metric.periodStart}–${metric.periodEnd}` : 'period not supplied';
  return `${amount} · ${period}`;
}

function projectAction(project: PublicProject, metadata: ProviderMetadata): string {
  if (metadata.synthetic && project.id === 'clynk-container-collection') {
    return 'Container collection with a reporting period and count awaiting an approved account report.';
  }
  if (metadata.synthetic && project.id === 'campus-composting') {
    return 'Food-scrap diversion with the weighing method and current result pending review.';
  }
  return project.summary;
}

export function projectRecordSummary(projects: PublicProject[], metadata: ProviderMetadata): string {
  if (metadata.availability === 'unavailable') return 'Source unavailable';
  if (projects.length === 0) return 'No public records';
  return metadata.synthetic
    ? `${projects.length} named records · results pending`
    : `${projects.length} public records · see source notes`;
}

export function workSectionSummary(projects: PublicProject[], metadata: ProviderMetadata): string {
  if (metadata.availability === 'unavailable') {
    return 'The START workflow remains visible. The selected project source is unavailable, so no project record has been substituted.';
  }
  if (projects.length === 0) {
    return 'The START workflow is visible. The connected project source currently contains no public-safe project records.';
  }
  const visibleParts = Math.min(projects.length, 2) + 1;
  const count = visibleParts === 3 ? 'Three' : visibleParts === 2 ? 'Two' : 'One';
  return `${count} parts of the reporting system are visible now. A status is not a result; evidence appears only after review.`;
}

function startSnapshotSummary(start: StartContent, metadata: ProviderMetadata): string {
  if (metadata.availability === 'unavailable') return 'Source unavailable';
  return start.adoptionStatus === 'confirmed'
    ? 'Adoption confirmed · snapshot pending'
    : 'Working purpose · snapshot pending';
}

function carbonProgressSummary(plan: CarbonNeutralityPlanContent, metadata: ProviderMetadata): string {
  if (metadata.availability === 'unavailable') return 'Source unavailable';
  return plan.progressPercent === null
    ? 'No approved percentage published'
    : `${plan.progressPercent}% reported`;
}

async function loadSiteContent() {
  try {
    const provider = getSiteContentProvider();
    const [overview, start, carbonPlan, metadata] = await Promise.all([
      provider.getOverview(),
      provider.getStart(),
      provider.getCarbonPlan(),
      provider.getMetadata(),
    ]);
    return { overview, start, carbonPlan, metadata };
  } catch {
    return {
      overview: unavailableOverview,
      start: unavailableStart,
      carbonPlan: unavailablePlan,
      metadata: unavailableMetadata(
        'Sustainability content',
        'The selected content source could not be loaded. No narrative, status, or result has been substituted.',
      ),
    };
  }
}

async function loadProjectContent(): Promise<{ projects: PublicProject[]; metadata: ProviderMetadata }> {
  try {
    const provider = getProjectProvider();
    const [projects, metadata] = await Promise.all([
      provider.getPublicProjects(),
      provider.getMetadata(),
    ]);
    return { projects, metadata };
  } catch {
    return {
      projects: [],
      metadata: unavailableMetadata(
        'Project data',
        'The selected public project source could not be loaded. No replacement result has been inferred.',
      ),
    };
  }
}

export default async function Home() {
  const [siteContent, projectContent] = await Promise.all([
    loadSiteContent(),
    loadProjectContent(),
  ]);
  const { overview, start, carbonPlan, metadata } = siteContent;
  const { projects, metadata: projectMetadata } = projectContent;

  return (
    <main id="main-content">
      <section className="field-hero">
        <div className="field-hero-copy">
          <h1>Student work, measured carefully.</h1>
          <p className="field-hero-lead">
            Students are building the system, projects, and evidence Storm King needs
            to report sustainability work clearly.
          </p>
          <Link className="primary-button" href="/projects">See the projects <span aria-hidden="true">→</span></Link>
        </div>
        <div className="field-hero-art" aria-hidden="true">
          <Image
            alt=""
            height="993"
            fetchPriority="high"
            sizes="(max-width: 760px) 100vw, 54vw"
            src="/images/topographic-field.webp"
            width="1584"
          />
        </div>
      </section>

      <PrototypeNotice
        detailsHref="#home-content-notes"
        heading={metadata.synthetic ? 'Public prototype' : undefined}
        message={metadata.synthetic ? 'School results appear after review.' : undefined}
        metadata={metadata}
      />

      <section className="report-section work-section" aria-labelledby="work-heading">
        <header className="section-heading">
          <h2 id="work-heading">What students have built</h2>
          <p>{workSectionSummary(projects, projectMetadata)}</p>
        </header>

        <div className="work-list">
          <article className="work-row">
            <div className="work-index">01</div>
            <div>
              <p className="work-type">Coordination system</p>
              <h3>START Command Center</h3>
            </div>
            <p>A shared workflow for moving student ideas through ownership, evidence, school review, and public release.</p>
            <div className="work-status">
              <span>{metadata.availability === 'unavailable' ? 'Unavailable' : start.adoptionStatus === 'confirmed' ? 'Confirmed' : 'Working purpose'}</span>
              <strong>{metadata.availability === 'unavailable' ? 'Source not connected' : 'Public snapshot pending'}</strong>
            </div>
            <Link href="/start" aria-label="Read about the START Command Center">Read <span aria-hidden="true">→</span></Link>
          </article>

          {projects.slice(0, 2).map((project, index) => (
            <article className="work-row" key={project.id}>
              <div className="work-index">{String(index + 2).padStart(2, '0')}</div>
              <div>
                <p className="work-type">{project.category}</p>
                <h3>{project.title}</h3>
              </div>
              <p>{projectAction(project, projectMetadata)}</p>
              <div className="work-status"><span>{project.status}</span><strong>{formatMetric(project.metrics[0])}</strong></div>
              <Link href={`/projects#${project.id}`} aria-label={`Read the ${project.title} case study`}>Read <span aria-hidden="true">→</span></Link>
            </article>
          ))}

          {projects.length === 0 ? (
            <div className="content-empty" role="status">
              <strong>{projectMetadata.availability === 'unavailable' ? 'Project records unavailable' : 'No public project records'}</strong>
              <p>{projectMetadata.availability === 'unavailable' ? 'No project names or results have been substituted.' : 'The connected source currently contains no public-safe project records.'}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="report-section process-section" aria-labelledby="process-heading">
        <header className="section-heading compact-heading">
          <h2 id="process-heading">How work becomes public</h2>
          <p>The field report keeps action and evidence in sequence.</p>
        </header>
        {start.workflow.length > 0 ? (
          <OverviewWorkflowList steps={start.workflow} />
        ) : (
          <div className="content-empty" role="status"><strong>Public workflow unavailable</strong><p>No replacement process has been inferred.</p></div>
        )}
      </section>

      <section className="report-section public-state-section" aria-labelledby="public-state-heading">
        <header className="section-heading compact-heading">
          <h2 id="public-state-heading">What is public now</h2>
          <p>Unavailable does not mean zero. It means the named source, period, method, or review is not yet connected.</p>
        </header>
        <dl className="public-state-list">
          <div><dt>Project records</dt><dd>{projectRecordSummary(projects, projectMetadata)}</dd></div>
          <div><dt>START snapshot</dt><dd>{startSnapshotSummary(start, metadata)}</dd></div>
          <div><dt>Carbon progress</dt><dd>{carbonProgressSummary(carbonPlan, metadata)}</dd></div>
        </dl>
        <Link className="text-link" href="/projects">Read the project case studies <span aria-hidden="true">→</span></Link>
      </section>

      <section className="report-section place-section" aria-labelledby="place-heading">
        <div>
          <h2 id="place-heading">Why this place matters</h2>
          <p>{overview.sustainabilityDefinition}</p>
        </div>
        <div>
          <p>{overview.placeContext}</p>
          {overview.sourceReferences.length > 0 ? (
            <div className="source-links" aria-label="Overview sources">
              {overview.sourceReferences.map((reference) => (
                <a href={reference} key={reference} rel="noreferrer" target="_blank">{sourceName(reference)} <span aria-hidden="true">↗</span></a>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="report-section notes-section" aria-label="Report provenance">
        <DataNotes id="home-content-notes" metadata={metadata} title="Narrative data notes" />
        <DataNotes id="home-project-notes" metadata={projectMetadata} title="Project data notes" />
      </section>
    </main>
  );
}
