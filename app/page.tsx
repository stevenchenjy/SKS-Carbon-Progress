import Link from 'next/link';
import { DataBarChart } from '@/app/components/DataBarChart';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { RoadmapGrid } from '@/app/components/RoadmapGrid';
import { getCarbonProvider } from '@/lib/carbon/server';
import { getEnergyProvider } from '@/lib/energy/server';
import { getRoadmapProvider } from '@/lib/roadmap/server';
import { unavailableMetadata } from '@/lib/provider-metadata';
import type { CarbonOverview } from '@/lib/carbon/types';
import type { EnergyImpact, EnergySnapshot } from '@/lib/energy/types';

export const dynamic = 'force-dynamic';

function formatTimestamp(value: string): string {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return 'Awaiting update';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  }).format(timestamp);
}

const emptyCarbon: CarbonOverview = {
  baselineYear: null,
  latestReportingYear: null,
  reductionPercent: null,
  emissionsTrend: 'Source unavailable',
  reportingStatus: 'Unavailable',
  quality: 'pending',
  scopeBreakdown: [],
  totals: null,
};

const emptyEnergy: EnergySnapshot = {
  currentPowerKw: null,
  energyTodayKwh: null,
  weeklyTrendPercent: null,
  lastUpdatedAt: '',
  quality: 'pending',
  coverage: { kind: 'unknown', label: 'Coverage unavailable', monitoredDeviceCount: null, note: 'No energy coverage claim is available.' },
};

const emptyImpact: EnergyImpact = {
  avoidedEnergyKwh: null,
  comparisonMethod: 'No reviewed comparison is available.',
  quality: 'pending',
};

async function loadCarbonHome() {
  try {
    const provider = getCarbonProvider();
    const [carbon, history, metadata] = await Promise.all([provider.getOverview(), provider.getHistory(), provider.getMetadata()]);
    return { carbon, history, metadata };
  } catch {
    return {
      carbon: structuredClone(emptyCarbon),
      history: [],
      metadata: unavailableMetadata('Carbon data', 'The carbon source could not be loaded. No value has been inferred or replaced with mock data.'),
    };
  }
}

async function loadEnergyHome() {
  try {
    const provider = getEnergyProvider();
    const [energy, impact, history, metadata] = await Promise.all([
      provider.getCurrentUsage(),
      provider.getImpactSummary(),
      provider.getHistoricalUsage('24h'),
      provider.getMetadata(),
    ]);
    return { energy, impact, history, metadata };
  } catch {
    return {
      energy: structuredClone(emptyEnergy),
      impact: structuredClone(emptyImpact),
      history: [],
      metadata: unavailableMetadata('Energy data', 'The monitored-energy source could not be loaded. No replacement value is being shown.'),
    };
  }
}

async function loadRoadmapHome() {
  try {
    const provider = getRoadmapProvider();
    const [areas, metadata] = await Promise.all([provider.getAreas(), provider.getMetadata()]);
    return { areas, metadata };
  } catch {
    return {
      areas: [],
      metadata: unavailableMetadata('Roadmap data', 'The roadmap source could not be loaded. Other public information remains available.'),
    };
  }
}

export default async function Home() {
  const [carbonResult, energyResult, roadmapResult] = await Promise.all([loadCarbonHome(), loadEnergyHome(), loadRoadmapHome()]);
  const { carbon, history: carbonHistory, metadata: carbonMetadata } = carbonResult;
  const { energy, impact, history: energyHistory, metadata: energyMetadata } = energyResult;
  const { areas: roadmap, metadata: roadmapMetadata } = roadmapResult;
  const carbonUnit = carbonHistory.find((point) => point.unit)?.unit ?? 'unit not supplied';

  const overview = [
    { label: carbonMetadata.synthetic ? 'Illustrative baseline' : 'Baseline year', value: carbon.baselineYear === null ? 'Awaiting data' : String(carbon.baselineYear), note: carbonMetadata.sourceLabel },
    { label: carbonMetadata.synthetic ? 'Latest mock inventory' : 'Latest inventory', value: carbon.latestReportingYear === null ? 'Awaiting data' : String(carbon.latestReportingYear), note: carbon.emissionsTrend },
    { label: 'Reduction', value: carbon.reductionPercent === null ? (carbonMetadata.synthetic ? 'Mock only' : 'Awaiting data') : `${carbon.reductionPercent}%`, note: carbonMetadata.synthetic ? 'No school result loaded' : carbonMetadata.sourceLabel },
    { label: 'Reporting status', value: carbon.reportingStatus, note: `Quality: ${carbonMetadata.status}` },
  ];

  return (
    <main id="main-content">
      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow"><span /> A transparent climate journey</p>
          <h1 aria-label="Our path to a lower-carbon campus.">Our path to a<br /><em>lower-carbon</em> campus.</h1>
          <p className="hero-intro">
            A future home for sharing how Storm King School measures, learns,
            and acts toward a lower-carbon campus. Careful measurement
            turns ambition into a journey the whole community can understand.
          </p>
          <div className="stage-line"><span>Current stage</span><strong>Prototype foundation</strong><DataQualityBadge quality="prototype" /></div>
          <div className="hero-actions">
            <Link className="primary-button" href="/carbon">Explore example methodology <span>↗</span></Link>
            <Link className="text-link" href="/projects">View sample projects <span>→</span></Link>
          </div>
        </div>

        <aside className="progress-card" aria-label="Prototype readiness stage">
          <div className="card-topline">
            <span>Current readiness</span>
            <span className="quality-dot">Prototype</span>
          </div>
          <div className="progress-visual">
            <div className="progress-ring readiness-ring" role="img" aria-label="Build the baseline before publishing progress">
              <div><strong>Build</strong><span>the baseline</span></div>
            </div>
          </div>
          <p>No progress percentage is assigned until the school approves a target, baseline, boundary, and defensible metric.</p>
          <div className="card-footer"><span>Define</span><i /> <span>Measure</span><i /> <span>Review</span></div>
        </aside>
      </section>

      <section className="overview-section section-pad" aria-labelledby="overview-heading">
        <div className="section-intro split-intro">
          <div><p className="eyebrow"><span /> Where are we now?</p><h2 id="overview-heading">Carbon progress,<br /><em>with context.</em></h2></div>
          <p>{carbonMetadata.availability === 'unavailable' ? 'The selected carbon source is unavailable. No result has been inferred or replaced with mock data.' : carbonMetadata.synthetic ? 'This prototype uses an indexed sample pathway to demonstrate the reporting structure. It does not contain a real inventory or reduction result.' : `This overview summarizes the inventory pathway supplied by ${carbonMetadata.sourceLabel}, with quality and provenance kept visible.`}</p>
        </div>
        <PrototypeNotice compact metadata={carbonMetadata} />
        <div className="overview-grid overview-grid-four">
          {overview.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          ))}
        </div>
        <div className="trend-panel">
          <div className="trend-copy">
            <DataQualityBadge quality={carbon.quality} />
            <h3>{carbonMetadata.synthetic ? 'Illustrative emissions index' : 'Reported emissions pathway'}</h3>
            <p>{carbonMetadata.synthetic ? 'A normalized sample series shows how historical inventories and future scenarios could sit together without confusing projections with results.' : `The pathway supplied by ${carbonMetadata.sourceLabel} distinguishes reported inventories from scenarios and keeps the provider unit visible.`}</p>
            <Link className="text-link" href="/carbon">Read how measurement will work <span>→</span></Link>
          </div>
          <DataBarChart
            points={carbonHistory.map((point) => ({ label: String(point.year), value: point.value }))}
            title={carbonMetadata.synthetic ? 'Illustrative carbon pathway' : 'Reported carbon pathway'}
            unit={carbonUnit}
            tone="lime"
            isSynthetic={carbonMetadata.synthetic}
          />
        </div>
      </section>

      <section className="roadmap-section section-pad" aria-labelledby="roadmap-heading">
        <div className="section-intro split-intro light-intro">
          <div><p className="eyebrow"><span /> What moves us forward?</p><h2 id="roadmap-heading">Five pathways.<br /><em>One shared direction.</em></h2></div>
          <p>{roadmapMetadata.availability === 'unavailable' ? 'The selected roadmap source is unavailable. Other public information remains accessible.' : roadmapMetadata.synthetic ? 'These qualitative example stages test how day-to-day action could connect with long-term goals without inventing percentage progress.' : 'Current stages connect day-to-day action with long-term goals, using the status supplied by the roadmap provider.'}</p>
        </div>
        <PrototypeNotice compact metadata={roadmapMetadata} />
        <RoadmapGrid areas={roadmap} metadata={roadmapMetadata} />
      </section>

      <section className="energy-preview section-pad" aria-labelledby="energy-heading">
        <div className="energy-visual">
          <div className="energy-visual-top"><span>{energyMetadata.sourceLabel}</span><DataQualityBadge quality={energyMetadata.status} /></div>
          <DataBarChart
            points={energyHistory.map((point) => ({ label: point.label, value: point.value }))}
            title="Twenty-four hour monitored electricity preview"
            unit="kW"
            sparseLabels
            tone="lime"
            isSynthetic={energyMetadata.synthetic}
          />
        </div>
        <div className="energy-copy">
          <p className="eyebrow"><span /> Monitored energy preview</p>
          <h2 id="energy-heading">Make monitored energy <em>visible.</em></h2>
          <p>Timely monitored-energy information can help students ask better questions without mistaking selected smart plugs for total campus electricity.</p>
          <p className="exact-source-note">{energyMetadata.disclosure}</p>
          <div className="energy-metrics">
            <div><span>Current monitored power</span><strong>{energy.currentPowerKw ?? '—'} <small>kW</small></strong></div>
            <div><span>Monitored energy today</span><strong>{energy.energyTodayKwh ?? '—'} <small>kWh</small></strong></div>
            <div><span>Estimated avoided energy</span><strong>{impact.avoidedEnergyKwh ?? '—'} <small>kWh</small></strong></div>
            <div><span>Last {energyMetadata.synthetic ? 'simulated ' : ''}update</span><strong className="time-value">{formatTimestamp(energy.lastUpdatedAt)}</strong></div>
          </div>
          <Link className="primary-button" href="/energy">Open the energy preview <span>↗</span></Link>
        </div>
      </section>

      <section className="story-section section-pad">
        <p className="eyebrow"><span /> The story behind the data</p>
        <div className="story-grid">
          <h2>Transparency is not just a number. It is a practice.</h2>
          <div>
            <p>Future results should be useful to a student encountering climate data for the first time and credible to a partner reviewing the methodology.</p>
            <div className="story-steps">
              <article><span>01</span><h3>Measure</h3><p>Define boundaries and make data quality visible.</p></article>
              <article><span>02</span><h3>Explain</h3><p>Connect campus numbers to understandable action.</p></article>
              <article><span>03</span><h3>Learn</h3><p>Invite questions, reflection, and better decisions.</p></article>
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
          <article><span>Students</span><h3>Build through existing clubs.</h3><p>Explore how student-led groups can turn a question into a campus learning project.</p><a href="https://sks.org/student-life/clubs-and-activities/">Explore SKS clubs <span>↗</span></a></article>
          <article><span>Faculty</span><h3>Use data as a learning tool.</h3><p>Start with the measurement boundary and help students ask what a number can—and cannot—show.</p><Link href="/carbon">Explore methodology <span>→</span></Link></article>
          <article><span>Families & partners</span><h3>Follow reviewed public work.</h3><p>See the project fields designed for future approved milestones and results.</p><Link href="/projects">View public projects <span>→</span></Link></article>
        </div>
      </section>
    </main>
  );
}
