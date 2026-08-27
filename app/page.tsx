import Link from 'next/link';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { unavailableMetadata } from '@/lib/provider-metadata';
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
    if (url.hostname === 'sks.org') return 'Storm King School';
    if (url.hostname === 'www.un.org') return 'United Nations';
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'Source';
  }
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

export default async function Home() {
  const { overview, start, carbonPlan, metadata } = await loadSiteContent();

  const areas = [
    {
      index: '01',
      title: 'Overview',
      description: 'What sustainability means here, and how place and school values shape the work.',
      href: '#overview',
      status: 'Public context',
    },
    {
      index: '02',
      title: 'START',
      description: 'A working coordination system for projects, evidence, review, and public-ready updates.',
      href: '/start',
      status: start.adoptionStatus === 'confirmed' ? 'Adoption confirmed' : 'Purpose drafted',
    },
    {
      index: '03',
      title: 'Carbon Neutrality Plan',
      description: 'The proposed framework for defining, measuring, reducing, and transparently reporting emissions.',
      href: '/carbon',
      status: carbonPlan.status,
    },
    {
      index: '04',
      title: 'Projects',
      description: 'Active work such as CLYNK and composting, with outcome fields ready for reviewed evidence.',
      href: '/projects',
      status: 'Metrics pending',
    },
  ];

  return (
    <main id="main-content">
      <section className="hero-shell overview-hero-shell">
        <div className="hero-copy">
          <p className="eyebrow"><span /> A school shaped by the mountain</p>
          <h1 aria-label="Sustainability where we live and learn.">Sustainability,<br /><em>where we live</em> and learn.</h1>
          <p className="hero-intro">
            Storm King’s setting makes stewardship immediate. This platform is
            designed to connect the school’s values, its sustainability work,
            and carefully reviewed evidence—without presenting placeholders as results.
          </p>
          <div className="stage-line">
            <span>Current stage</span>
            <strong>Building the public evidence base</strong>
            <DataQualityBadge quality={metadata.status} />
          </div>
          <div className="hero-actions">
            <Link className="primary-button" href="/start">Understand START <span>↗</span></Link>
            <Link className="text-link" href="/carbon">Explore the carbon framework <span>→</span></Link>
          </div>
        </div>

        <aside className="progress-card" aria-label="Public reporting readiness">
          <div className="card-topline">
            <span>Public reporting readiness</span>
            <span className="quality-dot">{carbonPlan.status}</span>
          </div>
          <div className="progress-visual">
            <div className="progress-ring readiness-ring" role="img" aria-label="Define and approve the baseline before publishing progress">
              <div><strong>Define</strong><span>measure · review</span></div>
            </div>
          </div>
          <p>
            An emissions-reduction percentage will appear only after Storm King
            approves a goal, baseline, reporting boundary, target, and calculation method.
          </p>
          <div className="card-footer"><span>Place</span><i /><span>System</span><i /><span>Action</span></div>
        </aside>
      </section>

      <PrototypeNotice metadata={metadata} />

      <section className="definition-section section-pad" id="overview" aria-labelledby="overview-heading">
        <div className="section-intro split-intro">
          <div>
            <p className="eyebrow"><span /> 01 / Overview</p>
            <h2 id="overview-heading">Care for today.<br /><em>Keep choices open.</em></h2>
          </div>
          <p>{overview.sustainabilityDefinition}</p>
        </div>

        <div className="place-panel">
          <span>Why this place matters</span>
          <p>{overview.placeContext}</p>
          {overview.sourceReferences.length > 0 ? (
            <div className="source-links" aria-label="Overview sources">
              {overview.sourceReferences.map((reference) => (
                <a href={reference} key={reference} rel="noreferrer" target="_blank">
                  {sourceName(reference)} <span>↗</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="values-section section-pad" aria-labelledby="values-heading">
        <div className="section-intro split-intro light-intro">
          <div>
            <p className="eyebrow"><span /> Sustainability and school values</p>
            <h2 id="values-heading">A way to practice<br /><em>what Storm King values.</em></h2>
          </div>
          <p>Each value becomes a practical standard for how projects are measured, explained, and improved.</p>
        </div>
        <div className="values-grid">
          {overview.valueAlignment.map((item, index) => (
            <article key={item.value}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.value}</h3>
              <p>{item.statement}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="four-areas-section section-pad" aria-labelledby="areas-heading">
        <div className="section-intro split-intro">
          <div>
            <p className="eyebrow"><span /> Four connected areas</p>
            <h2 id="areas-heading">From shared purpose<br /><em>to reviewed progress.</em></h2>
          </div>
          <p>The structure follows a simple sequence: define the purpose, coordinate the work, establish the carbon plan, and publish evidence-backed project outcomes.</p>
        </div>
        <div className="area-link-grid">
          {areas.map((area) => (
            <Link href={area.href} key={area.index}>
              <span className="area-index">{area.index}</span>
              <small>{area.status}</small>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
              <strong>Explore <span>→</span></strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="story-section section-pad">
        <p className="eyebrow"><span /> How public reporting should work</p>
        <div className="story-grid">
          <h2>Transparency is not just a number. It is a practice.</h2>
          <div>
            <p>Future results should be useful to a student encountering climate data for the first time and credible to someone reviewing the methodology.</p>
            <div className="story-steps">
              <article><span>01</span><h3>Measure</h3><p>Define boundaries and keep missing data distinct from zero.</p></article>
              <article><span>02</span><h3>Review</h3><p>Confirm the method, evidence, owner, and reporting period.</p></article>
              <article><span>03</span><h3>Publish</h3><p>Share approved fields and retain the source behind each claim.</p></article>
            </div>
          </div>
        </div>
      </section>

      <section className="participation-section section-pad" aria-labelledby="participation-heading">
        <div className="section-intro split-intro">
          <div><p className="eyebrow"><span /> Take part</p><h2 id="participation-heading">Turn public data<br /><em>into shared learning.</em></h2></div>
          <p>This prototype does not collect names, emails, or ideas. Participation should use existing school channels until an approved public process exists.</p>
        </div>
        <div className="participation-grid">
          <article><span>Students</span><h3>Build through existing clubs.</h3><p>Turn a campus question into a project with a clear owner, milestone, and way to learn from the result.</p><a href="https://sks.org/student-life/clubs-and-activities/">Explore SKS clubs <span>↗</span></a></article>
          <article><span>Faculty</span><h3>Use data as a learning tool.</h3><p>Start with the measurement boundary and help students ask what a number can—and cannot—show.</p><Link href="/carbon">Explore the framework <span>→</span></Link></article>
          <article><span>Families & partners</span><h3>Follow reviewed public work.</h3><p>See the project fields designed for future approved milestones, outcomes, and evidence.</p><Link href="/projects">View active projects <span>→</span></Link></article>
        </div>
      </section>
    </main>
  );
}
