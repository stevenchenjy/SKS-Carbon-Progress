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
      title: 'START',
      description: 'A working coordination system for projects, evidence, review, and public-ready updates.',
      href: '/start',
      status: start.adoptionStatus === 'confirmed' ? 'Adoption confirmed' : 'Purpose drafted',
    },
    {
      index: '02',
      title: 'Carbon Neutrality Plan',
      description: 'The proposed framework for defining, measuring, reducing, and transparently reporting emissions.',
      href: '/carbon',
      status: carbonPlan.status,
    },
    {
      index: '03',
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
          <p className="eyebrow"><span /> Student-initiated · school-wide</p>
          <h1 aria-label="Sustainability, student-led and school-wide.">Sustainability,<br /><em>student-led</em> and school-wide.</h1>
          <p className="hero-intro">
            Students initiate ideas and turn campus questions into projects.
            Faculty, staff, operations, families, and partners help carry that work
            across the school and connect it to carefully reviewed evidence.
          </p>
          <div className="stage-line">
            <span>Current stage</span>
            <strong>Turning student ideas into measurable action</strong>
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

      <section className="four-areas-section section-pad" aria-labelledby="areas-heading">
        <div className="section-intro areas-intro">
          <div>
            <p className="eyebrow"><span /> Three connected areas</p>
            <h2 id="areas-heading">Follow the work.</h2>
          </div>
        </div>
        <div className="area-link-grid three-area-grid">
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

      <section className="participation-section section-pad" aria-labelledby="participation-heading">
        <div className="section-intro split-intro">
          <div><p className="eyebrow"><span /> Data preview</p><h2 id="participation-heading">See school-wide action<br /><em>through data.</em></h2></div>
          <p>The charts show how a future public dashboard could connect student-led activity, evidence readiness, and participation across the school.</p>
        </div>
        <div className="illustrative-data-notice">
          <strong>Illustrative dashboard model</strong>
          <span>Example values only · not Storm King results</span>
        </div>
        <div className="data-graph-grid">
          <figure className="data-graph-panel activity-graph">
            <div className="data-graph-heading"><span>01 / Student project activity</span><strong>Momentum over time</strong></div>
            <div className="activity-bars" role="img" aria-label="Illustrative monthly project activity rising and falling across six periods">
              {[38, 56, 47, 72, 64, 88].map((value, index) => (
                <div className="activity-bar-column" key={value + index}>
                  <i style={{ height: `${value}%` }} />
                  <small>{['P1', 'P2', 'P3', 'P4', 'P5', 'P6'][index]}</small>
                </div>
              ))}
            </div>
            <figcaption>Example signal: ideas, milestones, and evidence updates by period</figcaption>
          </figure>

          <figure className="data-graph-panel readiness-graph">
            <div className="data-graph-heading"><span>02 / Evidence readiness</span><strong>From activity to proof</strong></div>
            <div className="readiness-bars">
              {[
                ['Project records', 82],
                ['Measured outcomes', 61],
                ['Reviewed evidence', 43],
              ].map(([label, value]) => (
                <div className="readiness-row" key={label}>
                  <span>{label}</span>
                  <div><i style={{ width: `${value}%` }} /></div>
                  <small>{value}%</small>
                </div>
              ))}
            </div>
            <figcaption>Example values show how data quality could become visible</figcaption>
          </figure>

          <figure className="data-graph-panel reach-graph">
            <div className="data-graph-heading"><span>03 / School-wide reach</span><strong>Students at the center</strong></div>
            <div className="reach-visual">
              <div className="reach-ring" role="img" aria-label="Illustrative participation model led by students and supported across the school">
                <div><strong>Student-led</strong><span>school-wide support</span></div>
              </div>
              <ul>
                <li><i className="student-swatch" /><span>Students</span><strong>50%</strong></li>
                <li><i className="faculty-swatch" /><span>Faculty</span><strong>25%</strong></li>
                <li><i className="operations-swatch" /><span>Operations</span><strong>15%</strong></li>
                <li><i className="partner-swatch" /><span>Partners</span><strong>10%</strong></li>
              </ul>
            </div>
            <figcaption>Example participation mix—not a measured headcount</figcaption>
          </figure>
        </div>
      </section>
    </main>
  );
}
