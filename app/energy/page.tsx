import type { Metadata } from 'next';
import Link from 'next/link';
import { DataBarChart } from '@/app/components/DataBarChart';
import { DataNotes } from '@/app/components/DataNotes';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { energyMetricQuality } from '@/app/energy/metric-quality';
import { freshnessLabel } from '@/lib/claim-safety';
import { getEnergyProvider } from '@/lib/energy/server';
import type { EnergyHistoryRange, EnergyPoint, EnergySnapshot } from '@/lib/energy/types';
import { unavailableMetadata, type ProviderMetadata } from '@/lib/provider-metadata';

export const dynamic = 'force-dynamic';

const unavailableSnapshot: EnergySnapshot = {
  currentPowerKw: null,
  energyTodayKwh: null,
  weeklyTrendPercent: null,
  lastUpdatedAt: '',
  quality: 'pending',
  coverage: {
    kind: 'unknown',
    label: 'Coverage unavailable',
    monitoredDeviceCount: null,
    note: 'No monitored-energy coverage claim is available.',
  },
};

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

function formatMetric(value: number | null, unit: string): string {
  if (value === null) return 'Awaiting data';
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)} ${unit}`;
}

export const metadata: Metadata = {
  title: 'Energy preview | Storm King Sustainability Field Report',
  description: 'A selected-device energy preview with explicit coverage, source, freshness, and accessible time-series data.',
};

async function loadEnergyPageData(range: EnergyHistoryRange): Promise<{
  snapshot: EnergySnapshot;
  history: EnergyPoint[];
  providerMetadata: ProviderMetadata;
}> {
  let provider: ReturnType<typeof getEnergyProvider>;
  try {
    provider = getEnergyProvider();
  } catch {
    return {
      snapshot: unavailableSnapshot,
      history: [],
      providerMetadata: unavailableMetadata(
        'Energy data',
        'The monitored-energy source could not be configured. No values were inferred or replaced with mock data.',
      ),
    };
  }

  const [snapshotResult, historyResult, metadataResult] = await Promise.allSettled([
    provider.getCurrentUsage(),
    provider.getHistoricalUsage(range),
    provider.getMetadata(),
  ]);

  if (metadataResult.status === 'rejected') {
    return {
      snapshot: unavailableSnapshot,
      history: [],
      providerMetadata: unavailableMetadata(
        'Energy data',
        'The monitored-energy source metadata could not be loaded, so no source values are being published.',
      ),
    };
  }

  return {
    snapshot: snapshotResult.status === 'fulfilled' ? snapshotResult.value : unavailableSnapshot,
    history: historyResult.status === 'fulfilled' ? historyResult.value : [],
    providerMetadata: metadataResult.value,
  };
}

interface EnergyPageProps {
  searchParams?: Promise<{ range?: string | string[] }>;
}

export default async function EnergyPage({ searchParams }: EnergyPageProps = {}) {
  const params = searchParams ? await searchParams : {};
  const range: EnergyHistoryRange = params.range === '7d' ? '7d' : '24h';
  const { snapshot, history, providerMetadata } = await loadEnergyPageData(range);
  const hasSnapshot = snapshot.currentPowerKw !== null || snapshot.energyTodayKwh !== null;
  const historyUnit = range === '24h' ? 'kW' : 'kWh';

  return (
    <main id="main-content">
      <section className="page-hero energy-hero">
        <div>
          <h1>A monitored signal, not a campus total.</h1>
          <p>
            {providerMetadata.availability === 'unavailable'
              ? 'The selected monitored-energy source is unavailable. No reading has been inferred or replaced.'
              : providerMetadata.synthetic
                ? 'This deterministic simulation tests a selected-device public view. It does not describe Storm King School electricity use.'
                : `This view reports only the monitored coverage supplied by ${providerMetadata.sourceLabel}.`}
          </p>
        </div>
        <dl className="hero-facts energy-coverage-facts">
          <div><dt>Coverage</dt><dd>{providerMetadata.coverage.label}</dd></div>
          <div><dt>Devices</dt><dd>{providerMetadata.coverage.monitoredDeviceCount ?? 'Not supplied'}</dd></div>
          <div><dt>Freshness</dt><dd>{providerMetadata.synthetic ? 'Simulation · not live' : freshnessLabel(providerMetadata.freshness.state)}</dd></div>
        </dl>
      </section>

      <PrototypeNotice
        detailsHref="#energy-data-notes"
        heading={providerMetadata.synthetic ? 'Public prototype' : undefined}
        message={providerMetadata.synthetic ? 'Readings are simulated selected-device values, not school performance.' : undefined}
        metadata={providerMetadata}
      />

      <section className="report-section energy-current-section" aria-labelledby="energy-current-heading">
        <header className="section-heading">
          <h2 id="energy-current-heading">Current monitored view</h2>
          <p>{providerMetadata.coverage.note} Missing values remain unavailable rather than becoming zero.</p>
        </header>

        <div className="energy-metric-list">
          <article>
            <div>
              <h3>Current monitored power</h3>
              <DataQualityBadge quality={energyMetricQuality(snapshot.currentPowerKw, snapshot.quality)} />
            </div>
            <strong>{formatMetric(snapshot.currentPowerKw, 'kW')}</strong>
            <p>Rate of electricity use across the selected monitored coverage.</p>
          </article>
          <article>
            <div>
              <h3>Today’s monitored energy</h3>
              <DataQualityBadge quality={energyMetricQuality(snapshot.energyTodayKwh, snapshot.quality)} />
            </div>
            <strong>{formatMetric(snapshot.energyTodayKwh, 'kWh')}</strong>
            <p>Electricity accumulated today across the selected monitored coverage.</p>
          </article>
        </div>
        <p className="energy-updated">{hasSnapshot ? `Last ${providerMetadata.synthetic ? 'mock ' : ''}update: ${formatTimestamp(snapshot.lastUpdatedAt)}` : 'No current reading is available.'}</p>
      </section>

      <section className="report-section energy-chart-section" aria-labelledby="energy-chart-heading">
        <header className="section-heading compact-heading">
          <h2 id="energy-chart-heading">Monitored usage over time</h2>
          <div className="range-control" aria-label="Energy chart time range">
            <Link aria-current={range === '24h' ? 'page' : undefined} href="/energy?range=24h" scroll={false}>24 hours</Link>
            <Link aria-current={range === '7d' ? 'page' : undefined} href="/energy?range=7d" scroll={false}>7 days</Link>
          </div>
        </header>

        <div className="chart-shell">
          <div className="chart-title">
            <div><span>{range === '24h' ? 'Hourly monitored power' : 'Daily monitored energy'}</span><h3>{range === '24h' ? 'Last 24 hours' : 'Last 7 days'}</h3></div>
            <small>{providerMetadata.synthetic ? 'Simulated' : 'Reported'} · {historyUnit}</small>
          </div>
          <DataBarChart
            isSynthetic={providerMetadata.synthetic}
            points={history.map((point) => ({ label: point.label, value: point.value }))}
            sparseLabels={range === '24h'}
            title={range === '24h' ? '24-hour monitored power' : '7-day monitored energy'}
            tone="forest"
            unit={historyUnit}
          />
        </div>
        <dl className="chart-context">
          <div><dt>Time range</dt><dd>{range === '24h' ? '24 hours' : '7 days'}</dd></div>
          <div><dt>Timezone</dt><dd>America/New_York</dd></div>
          <div><dt>Source</dt><dd>{providerMetadata.sourceLabel}</dd></div>
        </dl>
      </section>

      <section className="report-section energy-reading-section" aria-labelledby="energy-reading-heading">
        <header className="section-heading compact-heading">
          <h2 id="energy-reading-heading">How to read the units</h2>
          <p>Power in kW is a rate at a point in time. Energy in kWh is an amount accumulated over time. Neither represents the whole campus without confirmed campus-wide coverage.</p>
        </header>
      </section>

      <section className="report-section notes-section" aria-label="Energy provenance">
        <DataNotes id="energy-data-notes" metadata={providerMetadata} title="Energy data notes" />
      </section>
    </main>
  );
}
