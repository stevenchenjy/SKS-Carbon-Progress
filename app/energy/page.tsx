import type { Metadata } from 'next';
import { DataBarChart } from '@/app/components/DataBarChart';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { getEnergyProvider } from '@/lib/energy/server';

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

export const metadata: Metadata = {
  title: 'Energy preview | SKS Carbon Progress',
  description: 'A simulated public energy monitoring interface prepared for a future reviewed Revert Tech data connection.',
};

export default async function EnergyPage() {
  const provider = getEnergyProvider();
  const [snapshot, hourly, weekly, impact, providerMetadata] = await Promise.all([
    provider.getCurrentUsage(),
    provider.getHistoricalUsage('24h'),
    provider.getHistoricalUsage('7d'),
    provider.getImpactSummary(),
    provider.getMetadata(),
  ]);

  const metrics = [
    { label: 'Current Power', value: snapshot.currentPowerKw, unit: 'kW', quality: snapshot.quality, note: providerMetadata.synthetic ? 'Simulated monitored demand' : 'Current provider reading' },
    { label: "Today's Energy", value: snapshot.energyTodayKwh, unit: 'kWh', quality: snapshot.quality, note: providerMetadata.synthetic ? 'Synthetic daily total' : 'Provider-supplied daily total' },
    { label: 'Weekly Trend', value: snapshot.weeklyTrendPercent, unit: '%', quality: snapshot.quality, note: providerMetadata.synthetic ? 'Versus a synthetic prior week' : 'Versus the provider comparison period' },
    { label: 'Avoided Energy', value: impact.avoidedEnergyKwh, unit: 'kWh', quality: impact.quality, note: providerMetadata.synthetic ? 'Illustrative estimate only' : impact.comparisonMethod },
  ];

  return (
    <main>
      <section className="page-hero energy-page-hero">
        <p className="eyebrow"><span /> Public energy preview</p>
        <h1 aria-label="See when campus energy changes.">See when campus<br /><em>energy changes.</em></h1>
        <p>{providerMetadata.synthetic ? 'A simulated interface for exploring demand patterns today and preparing for a future reviewed Revert Tech feed.' : `A public interface for exploring demand patterns supplied by ${providerMetadata.sourceLabel}.`}</p>
        <div className="energy-live-label"><i /><span>{providerMetadata.sourceLabel}</span><strong>Last {providerMetadata.synthetic ? 'mock ' : ''}update · {formatTimestamp(snapshot.lastUpdatedAt)}</strong></div>
      </section>

      <div className="exact-source-banner">{providerMetadata.disclosure}</div>
      <PrototypeNotice compact metadata={providerMetadata} />

      <section className="section-pad current-energy-section" aria-labelledby="current-energy-heading">
        <div className="section-intro split-intro">
          <div><p className="eyebrow"><span /> Current energy</p><h2 id="current-energy-heading">A campus pulse,<br /><em>built for questions.</em></h2></div>
          <p>{providerMetadata.synthetic ? 'Each reading is a deterministic mock value. Units and labels test the public experience; they do not describe actual school consumption.' : `Readings use the units, update time, and quality status supplied by ${providerMetadata.sourceLabel}.`}</p>
        </div>
        <div className="metric-grid">
          {metrics.map((metric, index) => (
            <article className="metric-card" key={metric.label}>
              <div><span>0{index + 1}</span><DataQualityBadge quality={metric.quality} /></div>
              <h3>{metric.label}</h3>
              <strong>{metric.value ?? 'Awaiting data'} {metric.value === null ? null : <small>{metric.unit}</small>}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="energy-charts section-pad" aria-labelledby="energy-charts-heading">
        <div className="section-intro split-intro light-intro">
          <div><p className="eyebrow"><span /> Usage patterns</p><h2 id="energy-charts-heading">From one day<br />to <em>one week.</em></h2></div>
          <p>Charts include accessible text tables and a defined empty state so a missing future feed does not turn into a misleading zero.</p>
        </div>
        <div className="charts-grid">
          <article>
            <div className="chart-title"><div><span>24-hour usage</span><h3>Hourly demand</h3></div><small>{providerMetadata.synthetic ? 'Simulated' : 'Reported'} · kW</small></div>
            <DataBarChart points={hourly.map((point) => ({ label: point.label, value: point.value }))} title="24-hour usage chart" unit="kW" sparseLabels tone="lime" isSynthetic={providerMetadata.synthetic} />
          </article>
          <article>
            <div className="chart-title"><div><span>7-day usage</span><h3>Daily energy</h3></div><small>{providerMetadata.synthetic ? 'Simulated' : 'Reported'} · kWh</small></div>
            <DataBarChart points={weekly.map((point) => ({ label: point.label, value: point.value }))} title="7-day usage chart" unit="kWh" tone="lime" isSynthetic={providerMetadata.synthetic} />
          </article>
        </div>
      </section>

      <section className="integration-section section-pad">
        <div><p className="eyebrow"><span /> {providerMetadata.synthetic ? 'Future integration' : 'Current integration'}</p><h2>{providerMetadata.synthetic ? <>Ready for reviewed data.<br /><em>Not connected yet.</em></> : <>Reviewed provider.<br /><em>Connection active.</em></>}</h2></div>
        <div className="integration-details">
          <p>The interface talks only to an <code>EnergyProvider</code>. {providerMetadata.synthetic ? 'A future Revert adapter can replace the mock provider without redesigning the page.' : 'The selected provider supplies readings, provenance, disclosure, and update time.'}</p>
          <dl><div><dt>Expected configuration</dt><dd><code>REVERT_API_URL</code><br /><code>REVERT_API_KEY</code></dd></div><div><dt>Current source</dt><dd>{providerMetadata.sourceLabel}</dd></div></dl>
          <small>{providerMetadata.synthetic ? 'No endpoint has been guessed. No credentials are stored. No scraping is used.' : providerMetadata.disclosure}</small>
        </div>
      </section>
    </main>
  );
}
