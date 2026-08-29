import type { Metadata } from 'next';
import { DataBarChart } from '@/app/components/DataBarChart';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { getEnergyProvider } from '@/lib/energy/server';
import { unavailableMetadata } from '@/lib/provider-metadata';
import type { EnergyImpact, EnergySnapshot } from '@/lib/energy/types';
import { freshnessLabel } from '@/lib/claim-safety';

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

export const metadata: Metadata = {
  title: 'Energy preview | SKS Carbon Progress',
  description: 'A simulated public energy monitoring interface prepared for a future reviewed Revert Tech data connection.',
};

async function loadEnergyPageData() {
  try {
    const provider = getEnergyProvider();
    const [snapshot, hourly, weekly, impact, providerMetadata] = await Promise.all([
      provider.getCurrentUsage(),
      provider.getHistoricalUsage('24h'),
      provider.getHistoricalUsage('7d'),
      provider.getImpactSummary(),
      provider.getMetadata(),
    ]);
    return { snapshot, hourly, weekly, impact, providerMetadata };
  } catch {
    const snapshot: EnergySnapshot = {
      currentPowerKw: null,
      energyTodayKwh: null,
      weeklyTrendPercent: null,
      lastUpdatedAt: '',
      quality: 'pending',
      coverage: { kind: 'unknown', label: 'Coverage unavailable', monitoredDeviceCount: null, note: 'No monitored-energy coverage claim is available.' },
    };
    const impact: EnergyImpact = {
      avoidedEnergyKwh: null,
      comparisonMethod: 'No reviewed comparison is available.',
      quality: 'pending',
    };
    return {
      snapshot,
      hourly: [],
      weekly: [],
      impact,
      providerMetadata: unavailableMetadata('Energy data', 'The monitored-energy source could not be loaded. No values were inferred or replaced with mock data.'),
    };
  }
}

export default async function EnergyPage() {
  const { snapshot, hourly, weekly, impact, providerMetadata } = await loadEnergyPageData();

  const metrics = [
    { label: 'Current Monitored Power', value: snapshot.currentPowerKw, unit: 'kW', quality: snapshot.quality, note: providerMetadata.synthetic ? 'Simulated selected-device load' : 'Current monitored load' },
    { label: "Today's Monitored Energy", value: snapshot.energyTodayKwh, unit: 'kWh', quality: snapshot.quality, note: providerMetadata.synthetic ? 'Synthetic selected-device total' : 'Provider-supplied monitored total' },
    { label: 'Weekly Trend', value: snapshot.weeklyTrendPercent, unit: '%', quality: snapshot.quality, note: providerMetadata.synthetic ? 'Versus a synthetic prior week' : 'Versus the provider comparison period' },
    { label: 'Avoided Energy', value: impact.avoidedEnergyKwh, unit: 'kWh', quality: impact.quality, note: providerMetadata.synthetic ? 'Illustrative estimate only' : impact.comparisonMethod },
  ];

  return (
    <main id="main-content">
      <section className="page-hero energy-page-hero">
        <p className="eyebrow"><span /> Public energy preview</p>
        <h1 aria-label="See when monitored energy changes.">See when monitored<br /><em>energy changes.</em></h1>
        <p>{providerMetadata.availability === 'unavailable' ? 'The selected monitored-energy source is unavailable. No reading has been inferred or replaced.' : providerMetadata.synthetic ? 'A simulated selected-device interface for exploring patterns and preparing for a future reviewed Revert Tech feed.' : `A public interface for exploring the monitored coverage supplied by ${providerMetadata.sourceLabel}.`}</p>
        <div className="energy-live-label"><i /><span>{providerMetadata.sourceLabel}</span><strong>Last {providerMetadata.synthetic ? 'mock ' : ''}update · {formatTimestamp(snapshot.lastUpdatedAt)}</strong></div>
      </section>

      <div className="exact-source-banner">{providerMetadata.disclosure}</div>
      <PrototypeNotice compact metadata={providerMetadata} />

      <section className="section-pad current-energy-section" aria-labelledby="current-energy-heading">
        <div className="section-intro split-intro">
          <div><p className="eyebrow"><span /> Monitored energy</p><h2 id="current-energy-heading">A visible signal,<br /><em>built for questions.</em></h2></div>
          <p>{providerMetadata.coverage.note} {providerMetadata.synthetic ? 'Each reading is deterministic mock data and does not describe actual school consumption.' : `Readings use the update time and quality status supplied by ${providerMetadata.sourceLabel}.`}</p>
        </div>
        <div className="coverage-panel" role="note">
          <div><span>What this covers</span><strong>{providerMetadata.coverage.label}</strong></div>
          <div><span>Monitored devices</span><strong>{providerMetadata.coverage.monitoredDeviceCount ?? 'Not supplied'}</strong></div>
          <div><span>Freshness</span><strong>{providerMetadata.synthetic ? 'Simulation · not live' : freshnessLabel(providerMetadata.freshness.state)}</strong></div>
          <p>Monitored smart-plug load is not presented as total campus electricity unless the source explicitly confirms campus-wide coverage.</p>
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
            <div className="chart-title"><div><span>24-hour monitored usage</span><h3>Hourly monitored power</h3></div><small>{providerMetadata.synthetic ? 'Simulated' : 'Reported'} · kW</small></div>
            <DataBarChart points={hourly.map((point) => ({ label: point.label, value: point.value }))} title="24-hour usage chart" unit="kW" sparseLabels tone="lime" isSynthetic={providerMetadata.synthetic} />
          </article>
          <article>
            <div className="chart-title"><div><span>7-day monitored usage</span><h3>Daily monitored energy</h3></div><small>{providerMetadata.synthetic ? 'Simulated' : 'Reported'} · kWh</small></div>
            <DataBarChart points={weekly.map((point) => ({ label: point.label, value: point.value }))} title="7-day usage chart" unit="kWh" tone="lime" isSynthetic={providerMetadata.synthetic} />
          </article>
        </div>
      </section>

      <section className="integration-section section-pad">
        <div><p className="eyebrow"><span /> How to read this</p><h2>{providerMetadata.synthetic ? <>A preview with limits.<br /><em>Not a campus total.</em></> : <>Source and coverage.<br /><em>Kept in view.</em></>}</h2></div>
        <div className="integration-details">
          <p>Power in kW describes the rate of monitored electricity use. Energy in kWh describes how much monitored electricity accumulated over time. Neither becomes a whole-campus result without confirmed campus-wide coverage.</p>
          <dl><div><dt>Current source</dt><dd>{providerMetadata.sourceLabel}</dd></div><div><dt>Coverage</dt><dd>{providerMetadata.coverage.label}</dd></div></dl>
          <small>{providerMetadata.disclosure}</small>
        </div>
      </section>
    </main>
  );
}
