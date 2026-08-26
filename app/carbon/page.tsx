import type { Metadata } from 'next';
import { DataBarChart } from '@/app/components/DataBarChart';
import { CarbonScopeGrid } from '@/app/components/CarbonScopeGrid';
import { CarbonTimeline } from '@/app/components/CarbonTimeline';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { getCarbonProvider } from '@/lib/carbon/server';
import { unavailableMetadata } from '@/lib/provider-metadata';
import type { CarbonMethodology, CarbonOverview } from '@/lib/carbon/types';
import { dataQualityDescription } from '@/lib/claim-safety';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Carbon methodology | SKS Carbon Progress',
  description: 'Explore the prototype reporting boundary, carbon inventory structure, timeline, and future data-quality approach.',
};

const qualityLegend = [
  { quality: 'measured' as const, text: dataQualityDescription('measured') },
  { quality: 'estimated' as const, text: dataQualityDescription('estimated') },
  { quality: 'verified' as const, text: dataQualityDescription('verified') },
  { quality: 'prototype' as const, text: dataQualityDescription('prototype') },
];

async function loadCarbonPageData() {
  try {
    const provider = getCarbonProvider();
    const [overview, history, methodology, providerMetadata] = await Promise.all([
      provider.getOverview(),
      provider.getHistory(),
      provider.getMethodology(),
      provider.getMetadata(),
    ]);
    return { overview, history, methodology, providerMetadata };
  } catch {
    const overview: CarbonOverview = {
      baselineYear: null,
      latestReportingYear: null,
      reductionPercent: null,
      emissionsTrend: 'Source unavailable',
      reportingStatus: 'Unavailable',
      quality: 'pending',
      scopeBreakdown: [],
      totals: null,
    };
    const methodology: CarbonMethodology = {
      reportingBoundary: 'The selected carbon source is unavailable; no reporting boundary is being inferred.',
      baselineDefinition: 'Awaiting an available, reviewed source.',
      emissionsFactors: 'Awaiting an available, reviewed source.',
      reportingYear: 'Awaiting an available, reviewed source.',
      dataQualityStatus: 'pending',
      approach: ['No result is substituted when the configured source fails.'],
    };
    return {
      overview,
      history: [],
      methodology,
      providerMetadata: unavailableMetadata('Carbon data', 'The carbon source could not be loaded. No values were inferred or replaced with mock data.'),
    };
  }
}

export default async function CarbonPage() {
  const { overview, history, methodology, providerMetadata } = await loadCarbonPageData();
  const historyUnit = history.find((point) => point.unit)?.unit ?? 'unit not supplied';

  return (
    <main id="main-content">
      <section className="page-hero carbon-hero">
        <p className="eyebrow"><span /> Carbon methodology</p>
        <h1 aria-label="Show the boundary. Name the uncertainty.">Show the boundary.<br /><em>Name the uncertainty.</em></h1>
        <p>A credible public inventory explains what is counted, how it is calculated, and which findings have actually been reviewed.</p>
        <div className="page-index"><span>01</span><span>Inventory</span><span>02</span><span>Timeline</span><span>03</span><span>How we measure</span></div>
      </section>

      <PrototypeNotice metadata={providerMetadata} />

      <section className="section-pad inventory-section" aria-labelledby="inventory-heading">
        <div className="section-intro split-intro">
          <div><p className="eyebrow"><span /> 01 / Carbon inventory</p><h2 id="inventory-heading">Three scopes,<br /><em>one clear boundary.</em></h2></div>
          <p>{providerMetadata.synthetic ? 'No scope total has been loaded. These cards demonstrate how future activity data, status, and source notes would be separated.' : 'Scope cards separate inventory values, units, data-quality status, and source notes.'}</p>
        </div>
        <CarbonScopeGrid scopes={overview.scopeBreakdown} metadata={providerMetadata} />
        {overview.totals ? (
          <section className="carbon-totals" aria-labelledby="carbon-totals-heading">
            <div>
              <span>Explicit accounting totals</span>
              <h3 id="carbon-totals-heading">Gross, offsets, and net—without inferred arithmetic.</h3>
              <p>{overview.totals.calculationMethod ?? 'No offsets or net-emissions calculation method was supplied.'}</p>
            </div>
            <dl>
              <div><dt>Gross emissions</dt><dd>{overview.totals.grossEmissions ?? 'Not supplied'}{overview.totals.grossEmissions === null ? null : ` ${overview.totals.unit}`}</dd></div>
              <div><dt>Offsets</dt><dd>{overview.totals.offsets ?? 'Not supplied'}{overview.totals.offsets === null ? null : ` ${overview.totals.unit}`}</dd></div>
              <div><dt>Net emissions</dt><dd>{overview.totals.netEmissions ?? 'Not supplied'}{overview.totals.netEmissions === null ? null : ` ${overview.totals.unit}`}</dd></div>
            </dl>
          </section>
        ) : null}
        <div className="method-grid">
          <article><span>Reporting boundary</span><p>{methodology.reportingBoundary}</p></article>
          <article><span>Methodology</span><p>{methodology.approach.join(' ')}</p></article>
          <article><span>Data quality status</span><div><DataQualityBadge quality={methodology.dataQualityStatus} /><p>{providerMetadata.disclosure}</p></div></article>
        </div>
      </section>

      <section className="carbon-trend-section section-pad" aria-labelledby="trend-heading">
        <div className="trend-heading">
          <div><p className="eyebrow"><span /> {providerMetadata.synthetic ? 'Synthetic pathway' : 'Reported pathway'}</p><h2 id="trend-heading">{providerMetadata.synthetic ? <>An example trend,<br /><em>not a school result.</em></> : <>Carbon history,<br /><em>with provenance.</em></>}</h2></div>
          <p>{providerMetadata.synthetic ? 'The indexed series deliberately avoids invented tonnes of carbon. Inventory examples and future scenarios remain visibly distinct.' : 'Inventory results and scenarios remain visibly distinct, with units and data-quality language supplied by the provider.'}</p>
        </div>
        <div className="carbon-chart-shell">
          <DataBarChart points={history.map((point) => ({ label: `${point.year} · ${point.kind}`, value: point.value }))} title="Carbon history and scenario" unit={historyUnit} tone="lime" isSynthetic={providerMetadata.synthetic} />
        </div>
      </section>

      <section className="section-pad timeline-section" aria-labelledby="timeline-heading">
        <div className="section-intro"><p className="eyebrow"><span /> 02 / Carbon timeline</p><h2 id="timeline-heading">From inventory to <em>verification.</em></h2></div>
        <CarbonTimeline history={history} />
      </section>

      <section className="measure-section section-pad" aria-labelledby="measure-heading">
        <div className="section-intro split-intro light-intro">
          <div><p className="eyebrow"><span /> 03 / How we measure</p><h2 id="measure-heading">A result is only as useful as its <em>explanation.</em></h2></div>
          <p>{providerMetadata.synthetic ? 'Before real data is connected, the school will need to approve a consistent calculation and review process.' : 'The selected provider supplies the approved calculation context and review status shown below.'}</p>
        </div>
        <div className="measure-grid">
          <article><span>01</span><h3>Baseline</h3><p>{methodology.baselineDefinition}</p></article>
          <article><span>02</span><h3>Emissions factors</h3><p>{methodology.emissionsFactors}</p></article>
          <article><span>03</span><h3>Reporting year</h3><p>{methodology.reportingYear}</p></article>
        </div>
        <div className="quality-legend">
          <div><h3>Data-quality language</h3><p>{providerMetadata.synthetic ? 'These badges are a future reporting legend. Only “Prototype” applies to content on this site today.' : `The active carbon provider reports this dataset as “${providerMetadata.status}.”`}</p></div>
          <div className="quality-list">
            {qualityLegend.map((item) => <article key={item.quality}><DataQualityBadge quality={item.quality} /><p>{item.text}</p></article>)}
          </div>
        </div>
      </section>
    </main>
  );
}
