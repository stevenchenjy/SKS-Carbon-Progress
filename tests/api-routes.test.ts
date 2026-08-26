import { describe, expect, it } from 'vitest';
import { GET as getCarbonOverview } from '@/app/api/carbon/overview/route';
import { carbonOverviewResponse } from '@/app/api/carbon/overview/route';
import { GET as getCarbonHistory, carbonHistoryResponse } from '@/app/api/carbon/history/route';
import { GET as getEnergyLive, energyLiveResponse } from '@/app/api/energy/live/route';
import { GET as getEnergyHistory, energyHistoryResponse } from '@/app/api/energy/history/route';
import { GET as getProjects, projectsResponse } from '@/app/api/projects/route';
import { GET as getRoadmap, roadmapResponse } from '@/app/api/roadmap/route';
import type { CarbonProvider } from '@/lib/carbon/provider';
import type { EnergyProvider } from '@/lib/energy/provider';
import type { ProjectProvider } from '@/lib/projects/provider';
import type { RoadmapProvider } from '@/lib/roadmap/provider';
import type { ProviderMetadata } from '@/lib/provider-metadata';
import { ProviderError } from '@/lib/providers/errors';
import { CarbonInventoryProvider } from '@/lib/carbon/providers/carbonInventoryProvider';

const reportedMetadata: ProviderMetadata = {
  synthetic: false,
  status: 'measured',
  provider: 'test-provider',
  sourceLabel: 'Test reported source',
  disclosure: 'Reported test source.',
  availability: 'available',
  publicationStatus: 'reported',
  freshness: { state: 'not-applicable', observedAt: '2026-08-22T12:00:00Z', staleAfterMinutes: null },
  coverage: { kind: 'public-subset', label: 'Test public subset', note: 'Test coverage.', monitoredDeviceCount: null },
  reportingPeriod: null,
};

const emptyCarbonProvider: CarbonProvider = {
  getMetadata: async () => structuredClone(reportedMetadata),
  getOverview: async () => ({
    baselineYear: null,
    latestReportingYear: null,
    reductionPercent: null,
    emissionsTrend: 'No reported trend',
    reportingStatus: 'Pending',
    quality: 'pending',
    scopeBreakdown: [],
    totals: null,
  }),
  getHistory: async () => [],
  getMethodology: async () => ({
    reportingBoundary: 'Test boundary',
    baselineDefinition: 'Not supplied',
    emissionsFactors: 'Not supplied',
    reportingYear: 'Not supplied',
    dataQualityStatus: 'pending',
    approach: [],
  }),
};

const staleEnergyProvider: EnergyProvider = {
  getMetadata: async () => ({
    ...structuredClone(reportedMetadata),
    freshness: { state: 'stale', observedAt: '2026-08-20T12:00:00Z', staleAfterMinutes: 30 },
    coverage: { kind: 'selected-devices', label: 'Two test devices', note: 'Selected devices only.', monitoredDeviceCount: 2 },
  }),
  getCurrentUsage: async () => ({
    currentPowerKw: null,
    energyTodayKwh: 0,
    weeklyTrendPercent: null,
    lastUpdatedAt: '2026-08-20T12:00:00Z',
    quality: 'measured',
    coverage: { kind: 'selected-devices', label: 'Two test devices', note: 'Selected devices only.', monitoredDeviceCount: 2 },
  }),
  getHistoricalUsage: async () => [],
  getImpactSummary: async () => ({ avoidedEnergyKwh: null, comparisonMethod: 'Not supported', quality: 'pending' }),
};

const emptyProjectProvider: ProjectProvider = {
  getMetadata: async () => structuredClone(reportedMetadata),
  getPublicProjects: async () => [],
};

const emptyRoadmapProvider: RoadmapProvider = {
  getMetadata: async () => structuredClone(reportedMetadata),
  getAreas: async () => [],
};

describe('prototype API routes', () => {
  it('labels every successful response as synthetic prototype data', async () => {
    const responses = await Promise.all([
      getCarbonOverview(),
      getCarbonHistory(),
      getEnergyLive(),
      getEnergyHistory(new Request('https://example.test/api/energy/history?range=24h')),
      getProjects(),
      getRoadmap(),
    ]);

    for (const response of responses) {
      expect(response.status).toBe(200);
      const body = await response.json() as { meta: { synthetic: boolean; status: string } };
      expect(body.meta.synthetic).toBe(true);
      expect(body.meta.status).toBe('prototype');
    }
  });

  it('preserves empty arrays, null values, genuine zero, stale freshness, and provenance', async () => {
    const carbonOverview = await carbonOverviewResponse(() => emptyCarbonProvider);
    const carbonHistory = await carbonHistoryResponse(() => emptyCarbonProvider);
    const energyLive = await energyLiveResponse(() => staleEnergyProvider);
    const energyHistory = await energyHistoryResponse(new Request('https://example.test/api/energy/history?range=24h'), () => staleEnergyProvider);
    const projects = await projectsResponse(() => emptyProjectProvider);
    const roadmap = await roadmapResponse(() => emptyRoadmapProvider);

    expect((await carbonOverview.json() as { data: { baselineYear: null } }).data.baselineYear).toBeNull();
    expect((await carbonHistory.json() as { data: unknown[] }).data).toEqual([]);
    const energyBody = await energyLive.json() as { data: { snapshot: { currentPowerKw: null; energyTodayKwh: number } }; meta: ProviderMetadata };
    expect(energyBody.data.snapshot.currentPowerKw).toBeNull();
    expect(energyBody.data.snapshot.energyTodayKwh).toBe(0);
    expect(energyBody.meta.freshness.state).toBe('stale');
    expect((await energyHistory.json() as { data: unknown[]; meta: ProviderMetadata }).data).toEqual([]);
    expect((await projects.json() as { data: unknown[] }).data).toEqual([]);
    expect((await roadmap.json() as { data: unknown[] }).data).toEqual([]);
    expect(energyLive.headers.get('Cache-Control')).toBe('no-store');
  });

  it('normalizes unavailable and misconfigured failures across every route without leaking details', async () => {
    const unavailable = () => {
      throw new ProviderError('PROVIDER_UNAVAILABLE', { detail: 'secret=https://private.example/vendor' });
    };
    const responses = await Promise.all([
      carbonOverviewResponse(unavailable),
      carbonHistoryResponse(unavailable),
      energyLiveResponse(unavailable),
      energyHistoryResponse(new Request('https://example.test/api/energy/history?range=7d'), unavailable),
      projectsResponse(unavailable),
      roadmapResponse(unavailable),
    ]);
    for (const response of responses) {
      expect(response.status).toBe(503);
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      const body = JSON.stringify(await response.json());
      expect(body).toContain('PROVIDER_UNAVAILABLE');
      expect(body).not.toContain('private.example');
    }

    const misconfigured = await carbonOverviewResponse(() => {
      throw new ProviderError('PROVIDER_MISCONFIGURED', { detail: 'CARBON_DATA_URL=https://private.example' });
    });
    expect(misconfigured.status).toBe(503);
    expect(JSON.stringify(await misconfigured.json())).not.toContain('CARBON_DATA_URL');
  });

  it('maps malformed upstream payloads to the safe 502 contract through an actual provider', async () => {
    const malformedProvider = new CarbonInventoryProvider({ load: async () => ({ schemaVersion: 1, privatePayload: 'must not leak' }) });
    const response = await carbonOverviewResponse(() => malformedProvider);
    expect(response.status).toBe(502);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({
      error: {
        code: 'INVALID_UPSTREAM_DATA',
        message: 'The selected data source returned data that could not be safely used.',
      },
    });
  });

  it('returns seven days when requested and rejects unsupported ranges', async () => {
    const valid = await getEnergyHistory(new Request('https://example.test/api/energy/history?range=7d'));
    const validBody = await valid.json() as { data: unknown[]; meta: { range: string; disclosure: string } };
    expect(validBody.data).toHaveLength(7);
    expect(validBody.meta.range).toBe('7d');
    expect(validBody.meta.disclosure).toBe('Prototype data from simulated Revert Smart Plug feed.');
    expect(valid.headers.get('Cache-Control')).toBe('no-store');

    const invalid = await getEnergyHistory(new Request('https://example.test/api/energy/history?range=year'));
    expect(invalid.status).toBe(400);
    expect(invalid.headers.get('Cache-Control')).toBe('no-store');
    expect(await invalid.json()).toEqual({ error: { code: 'INVALID_REQUEST', message: 'Range must be 24h or 7d.' } });
  });
});
