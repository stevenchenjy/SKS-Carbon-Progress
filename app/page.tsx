import Link from 'next/link';
import { DataBarChart } from '@/app/components/DataBarChart';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { RoadmapGrid } from '@/app/components/RoadmapGrid';
import { getCarbonProvider } from '@/lib/carbon/server';
import { getEnergyProvider } from '@/lib/energy/server';
import { getRoadmapProvider } from '@/lib/roadmap/server';
import type { ProviderMetadata } from '@/lib/provider-metadata';

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

function combinedMetadata(sources: ProviderMetadata[]): ProviderMetadata {
  const syntheticCount = sources.filter((source) => source.synthetic).length;
  return {
    synthetic: syntheticCount > 0,
    status: syntheticCount > 0 ? 'prototype' : 'measured',
    provider: 'homepage-provider-summary',
    sourceLabel: syntheticCount > 0 ? 'Prototype and source-labeled data' : 'Connected provider data',
    disclosure: syntheticCount === sources.length
      ? 'Every value shown in this prototype is synthetic. No real Storm King School performance claim is being made.'
      : syntheticCount > 0
        ? `${syntheticCount} homepage data source${syntheticCount === 1 ? ' is' : 's are'} still synthetic; each section identifies its own source.`
        : 'Homepage data is supplied by connected providers; each section identifies its source and quality status.',
  };
}

export default async function Home() {
  const carbonProvider = getCarbonProvider();
  const energyProvider = getEnergyProvider();
  const roadmapProvider = getRoadmapProvider();
  const [carbon, carbonHistory, carbonMetadata, energy, impact, energyHistory, energyMetadata, roadmap, roadmapMetadata] = await Promise.all([
    carbonProvider.getOverview(),
    carbonProvider.getHistory(),
    carbonProvider.getMetadata(),
    energyProvider.getCurrentUsage(),
    energyProvider.getImpactSummary(),
    energyProvider.getHistoricalUsage('24h'),
    energyProvider.getMetadata(),
    roadmapProvider.getAreas(),
    roadmapProvider.getMetadata(),
  ]);
  const homepageMetadata = combinedMetadata([carbonMetadata, energyMetadata, roadmapMetadata]);
  const carbonUnit = carbonHistory.find((point) => point.unit)?.unit ?? 'unit not supplied';

  const overview = [
    { label: carbonMetadata.synthetic ? 'Illustrative baseline' : 'Baseline year', value: carbon.baselineYear === null ? 'Awaiting data' : String(carbon.baselineYear), note: carbonMetadata.sourceLabel },
    { label: carbonMetadata.synthetic ? 'Latest mock inventory' : 'Latest inventory', value: carbon.latestReportingYear === null ? 'Awaiting data' : String(carbon.latestReportingYear), note: carbon.emissionsTrend },
    { label: 'Reduction', value: carbon.reductionPercent === null ? (carbonMetadata.synthetic ? 'Mock only' : 'Awaiting data') : `${carbon.reductionPercent}%`, note: carbonMetadata.synthetic ? 'No school result loaded' : carbonMetadata.sourceLabel },
    { label: 'Reporting status', value: carbon.reportingStatus, note: `Quality: ${carbonMetadata.status}` },
  ];

  return (
    <main>
      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow"><span /> A transparent climate journey</p>
          <h1 aria-label="Our path to a lower-carbon campus.">Our path to a<br /><em>lower-carbon</em> campus.</h1>
          <p className="hero-intro">
            A future home for sharing how Storm King School measures, learns,
            and acts on its path toward carbon neutrality. Careful measurement
            turns ambition into a journey the whole community can understand.
          </p>
          <div className="stage-line"><span>Current stage</span><strong>Prototype foundation</strong><DataQualityBadge quality="prototype" /></div>
          <div className="hero-actions">
            <Link className="primary-button" href="/carbon">Explore example methodology <span>↗</span></Link>
            <Link className="text-link" href="/projects">View sample projects <span>→</span></Link>
          </div>
        </div>

        <aside className="progress-card" aria-label="Illustrative progress scenario">
          <div className="card-topline">
            <span>Illustrative scenario</span>
            <span className="quality-dot">Mock data</span>
          </div>
          <div className="progress-visual">
            <div className="progress-ring" role="img" aria-label="34 percent illustrative progress">
              <div><strong>34%</strong><span>example only</span></div>
            </div>
          </div>
          <p>This sample indicator demonstrates how future verified progress could be communicated.</p>
          <div className="card-footer"><span>Measure</span><i /> <span>Act</span><i /> <span>Verify</span></div>
        </aside>
      </section>

      <PrototypeNotice metadata={homepageMetadata} />

      <section className="overview-section section-pad" aria-labelledby="overview-heading">
        <div className="section-intro split-intro">
          <div><p className="eyebrow"><span /> Where are we now?</p><h2 id="overview-heading">Carbon progress,<br /><em>with context.</em></h2></div>
          <p>{carbonMetadata.synthetic ? 'This prototype uses an indexed sample pathway to demonstrate the reporting structure. It does not contain a real inventory or reduction result.' : `This overview summarizes the inventory pathway supplied by ${carbonMetadata.sourceLabel}, with quality and provenance kept visible.`}</p>
        </div>
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
          <p>{roadmapMetadata.synthetic ? 'These example stages help test how the school could connect day-to-day action with long-term goals. Every progress bar is illustrative.' : 'Current stages connect day-to-day action with long-term goals, using the status supplied by the roadmap provider.'}</p>
        </div>
        <RoadmapGrid areas={roadmap} metadata={roadmapMetadata} />
      </section>

      <section className="energy-preview section-pad" aria-labelledby="energy-heading">
        <div className="energy-visual">
          <div className="energy-visual-top"><span>{energyMetadata.sourceLabel}</span><DataQualityBadge quality={energyMetadata.status} /></div>
          <DataBarChart
            points={energyHistory.map((point) => ({ label: point.label, value: point.value }))}
            title="Twenty-four hour electricity demand preview"
            unit="kW"
            sparseLabels
            tone="lime"
            isSynthetic={energyMetadata.synthetic}
          />
        </div>
        <div className="energy-copy">
          <p className="eyebrow"><span /> Live energy preview</p>
          <h2 id="energy-heading">Make campus energy <em>visible.</em></h2>
          <p>Timely energy information can help students ask better questions and help the community see when everyday choices matter.</p>
          <p className="exact-source-note">{energyMetadata.disclosure}</p>
          <div className="energy-metrics">
            <div><span>Current monitored demand</span><strong>{energy.currentPowerKw ?? '—'} <small>kW</small></strong></div>
            <div><span>Energy usage today</span><strong>{energy.energyTodayKwh ?? '—'} <small>kWh</small></strong></div>
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
    </main>
  );
}
