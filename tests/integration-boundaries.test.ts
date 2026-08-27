import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { CarbonInventoryProvider } from '@/lib/carbon/providers/carbonInventoryProvider';
import { validateCarbonInventoryDocument } from '@/lib/carbon/validation';
import { classifyFreshness } from '@/lib/energy/validation';
import { RevertProvider, type RevertTransport } from '@/lib/energy/providers/revertProvider';
import { MemoryRevertCache } from '@/lib/energy/revert-cache';
import { StartSnapshotProvider } from '@/lib/projects/providers/startSnapshotProvider';
import { validateStartPublicSnapshot } from '@/lib/projects/validation';
import { ConfigRoadmapProvider } from '@/lib/roadmap/providers/configRoadmapProvider';
import { validateRoadmapConfigDocument } from '@/lib/roadmap/validation';
import { getProviderDiagnostics, getProviderSelections } from '@/lib/providers/config';
import { PayloadValidationError, ProviderError } from '@/lib/providers/errors';
import type { JsonSource } from '@/lib/providers/http-json-source';
import { safeApiResponse } from '@/lib/api/responses';
import { GET as getEnergyLive } from '@/app/api/energy/live/route';

const carbonFixture = JSON.parse(readFileSync('fixtures/carbon-inventory.example.json', 'utf8')) as unknown;
const startFixture = JSON.parse(readFileSync('fixtures/start-public-snapshot.example.json', 'utf8')) as unknown;
const roadmapFixture = JSON.parse(readFileSync('fixtures/roadmap-config.example.json', 'utf8')) as unknown;
const revertFixture = JSON.parse(readFileSync('fixtures/revert-normalized.example.json', 'utf8')) as {
  snapshot: unknown;
  history24h: unknown;
  history7d: unknown;
  impact: unknown;
};
const source = (value: unknown): JsonSource => ({ load: async () => structuredClone(value) });
const testEnv = (values: Record<string, string> = {}): NodeJS.ProcessEnv => ({ NODE_ENV: 'test', ...values });

afterEach(() => {
  delete process.env.ENERGY_PROVIDER;
  delete process.env.REVERT_API_URL;
  delete process.env.REVERT_API_KEY;
  delete process.env.REVERT_STALE_AFTER_MINUTES;
  delete process.env.REVERT_CACHE_TTL_SECONDS;
  delete process.env.CARBON_PROVIDER;
  delete process.env.CARBON_DATA_URL;
  delete process.env.PROJECT_PROVIDER;
  delete process.env.START_PUBLIC_SNAPSHOT_URL;
  delete process.env.ROADMAP_PROVIDER;
  delete process.env.ROADMAP_DATA_URL;
  delete process.env.SITE_CONTENT_PROVIDER;
  delete process.env.SITE_CONTENT_URL;
});

describe('external data validation boundaries', () => {
  it('normalizes a carbon document while preserving genuine zero and missing scope data', async () => {
    const normalized = validateCarbonInventoryDocument(carbonFixture);
    expect(normalized.overview.scopeBreakdown[1].value).toBe(0);
    expect(normalized.overview.scopeBreakdown[2].value).toBeNull();
    expect(normalized.overview.scopeBreakdown.map((scope) => scope.quality)).toEqual(['verified', 'estimated', 'pending']);
    expect(normalized.overview.totals).toBeNull();

    const provider = new CarbonInventoryProvider(source(carbonFixture));
    expect((await provider.getMetadata()).availability).toBe('partial');
    expect((await provider.getOverview()).reductionPercent).toBeNull();
  });

  it('accepts explicit carbon accounting totals without calculating them and rejects unsupported net accounting', () => {
    const withTotals = structuredClone(carbonFixture) as {
      overview: { totals: unknown };
    };
    withTotals.overview.totals = {
      grossEmissions: 100,
      offsets: 10,
      netEmissions: 92,
      unit: 'tCO2e',
      calculationMethod: 'Synthetic values deliberately do not follow simple subtraction.',
    };
    expect(validateCarbonInventoryDocument(withTotals).overview.totals).toMatchObject({ grossEmissions: 100, offsets: 10, netEmissions: 92 });

    const missingMethod = structuredClone(withTotals) as { overview: { totals: { calculationMethod: null } } };
    missingMethod.overview.totals.calculationMethod = null;
    expect(() => validateCarbonInventoryDocument(missingMethod)).toThrow(/calculationMethod/i);
  });

  it('rejects carbon source timestamps that are implausibly in the future', () => {
    const future = structuredClone(carbonFixture) as { source: { updatedAt: string } };
    future.source.updatedAt = '2026-08-23T12:10:00Z';
    expect(() => validateCarbonInventoryDocument(future, new Date('2026-08-23T12:00:00Z'))).toThrow(/future/i);
  });

  it('rejects informal and impossible dates instead of relying on permissive date parsing', () => {
    const informal = structuredClone(carbonFixture) as { source: { updatedAt: string } };
    informal.source.updatedAt = 'August 22, 2026';
    expect(() => validateCarbonInventoryDocument(informal)).toThrow(/ISO timestamp/i);

    const impossible = structuredClone(carbonFixture) as { source: { reportingPeriod: { start: string } } };
    impossible.source.reportingPeriod.start = '2026-02-30';
    expect(() => validateCarbonInventoryDocument(impossible)).toThrow(/ISO date/i);
  });

  it('rejects malformed carbon units and non-finite values instead of converting them to null', () => {
    const malformed = structuredClone(carbonFixture) as {
      overview: { scopeBreakdown: Array<{ unit: unknown; value: unknown }> };
    };
    malformed.overview.scopeBreakdown[0].unit = 'mystery-unit';
    malformed.overview.scopeBreakdown[0].value = Number.POSITIVE_INFINITY;
    expect(() => validateCarbonInventoryDocument(malformed)).toThrow(PayloadValidationError);
    try {
      validateCarbonInventoryDocument(malformed);
    } catch (error) {
      expect((error as PayloadValidationError).issues.join(' ')).toMatch(/unit|finite number/);
    }
  });

  it('validates a configured roadmap contract without forcing numerical progress', async () => {
    const normalized = validateRoadmapConfigDocument(roadmapFixture);
    expect(normalized.areas[0]).toMatchObject({ target: null, progress: { percent: null, metricLabel: null } });
    const provider = new ConfigRoadmapProvider(source(roadmapFixture));
    expect(await provider.getMetadata()).toMatchObject({ sourceType: 'configured-roadmap', synthetic: true });

    const fakePrecision = structuredClone(roadmapFixture) as { areas: Array<{ progress: { percent: number | null; metricLabel: string | null } }> };
    fakePrecision.areas[0].progress.percent = 50;
    fakePrecision.areas[0].progress.metricLabel = null;
    expect(() => validateRoadmapConfigDocument(fakePrecision)).toThrow(/both be supplied/i);
  });

  it('accepts a sanitized START snapshot and keeps an unreported result machine-readable', async () => {
    const normalized = validateStartPublicSnapshot(startFixture);
    expect(normalized.publicProjects[0].impact).toBeNull();
    const provider = new StartSnapshotProvider(source(startFixture));
    expect((await provider.getPublicProjects())[0]).toMatchObject({ impact: null, impactQuality: 'prototype' });
    expect((await provider.getMetadata()).coverage.kind).toBe('public-subset');
  });

  it('rejects extra private START fields and verified results without public evidence', () => {
    const privatePayload = structuredClone(startFixture) as unknown as { publicProjects: Array<Record<string, unknown>> };
    privatePayload.publicProjects[0].internalNotes = 'must never cross the boundary';
    expect(() => validateStartPublicSnapshot(privatePayload)).toThrow(PayloadValidationError);

    const unsupportedVerification = structuredClone(startFixture) as unknown as { publicProjects: Array<Record<string, unknown>> };
    unsupportedVerification.publicProjects[0].impact = 'Synthetic result';
    unsupportedVerification.publicProjects[0].impactQuality = 'verified';
    expect(() => validateStartPublicSnapshot(unsupportedVerification)).toThrow(/invalid upstream payload/i);

    const unsupportedUpdateVerification = structuredClone(startFixture) as unknown as { publicProjects: Array<Record<string, unknown>> };
    unsupportedUpdateVerification.publicProjects[0].quality = 'verified';
    expect(() => validateStartPublicSnapshot(unsupportedUpdateVerification)).toThrow(/verificationReference/i);

    const mislabeledSyntheticSource = structuredClone(startFixture) as unknown as { source: Record<string, unknown> };
    mislabeledSyntheticSource.source.quality = 'verified';
    expect(() => validateStartPublicSnapshot(mislabeledSyntheticSource)).toThrow(/synthetic snapshot/i);
  });

  it('requires periods and evidence for published project metrics and rejects future periods', () => {
    const real = structuredClone(startFixture) as unknown as {
      source: Record<string, unknown>;
      publicProjects: Array<{ quality: string; impactQuality: string; metrics: Array<Record<string, unknown>> }>;
    };
    real.source.synthetic = false;
    real.source.publicationStatus = 'reported';
    real.source.quality = 'pending';
    real.publicProjects[0].quality = 'pending';
    real.publicProjects[0].impactQuality = 'pending';
    const metric = real.publicProjects[0].metrics[0];
    metric.value = 1;
    metric.quality = 'measured';
    expect(() => validateStartPublicSnapshot(real)).toThrow(/periodStart and periodEnd are required/i);

    metric.periodStart = '2026-08-01';
    metric.periodEnd = '2026-08-23';
    expect(() => validateStartPublicSnapshot(real)).toThrow(/periodEnd must not be after source.generatedAt/i);

    metric.periodEnd = '2026-08-20';
    metric.metricType = 'estimated-emissions-avoided';
    metric.methodologyNote = 'Reviewed test model.';
    metric.evidenceReference = null;
    metric.equivalencies = [{ label: 'test equivalent', value: 1, unit: 'units', methodology: 'Test factor.', sourceReference: '' }];
    expect(() => validateStartPublicSnapshot(real)).toThrow(/evidenceReference|sourceReference/i);
  });
});

describe('Revert readiness and energy semantics', () => {
  it('reports the placeholder connection as unavailable rather than measured', async () => {
    const provider = new RevertProvider({ apiUrl: 'https://example.test', apiKey: 'test-only', staleAfterMinutes: 30 });
    expect(await provider.getMetadata()).toMatchObject({ availability: 'unavailable', status: 'pending', synthetic: false });
    expect(await provider.checkHealth()).toMatchObject({ state: 'transport-missing' });
    await expect(provider.getCurrentUsage()).rejects.toMatchObject({ code: 'PROVIDER_UNAVAILABLE' });
  });

  it('validates a partial-coverage transport, preserves zero, and identifies stale data', async () => {
    const transport: RevertTransport = {
      getCurrentUsage: async () => structuredClone(revertFixture.snapshot),
      getHistoricalUsage: async () => structuredClone(revertFixture.history24h),
    };
    const provider = new RevertProvider(
      { apiUrl: 'https://example.test', apiKey: 'test-only', staleAfterMinutes: 30 },
      transport,
      () => new Date('2026-08-22T12:00:00Z'),
    );
    expect((await provider.getCurrentUsage()).currentPowerKw).toBe(0);
    expect(await provider.getMetadata()).toMatchObject({ freshness: { state: 'stale' }, coverage: { kind: 'selected-devices', monitoredDeviceCount: 3 } });
    expect((await provider.getImpactSummary()).avoidedEnergyKwh).toBeNull();
  });

  it('supports an injected health check and shared validated cache without exposing vendor details', async () => {
    let currentCalls = 0;
    const transport: RevertTransport = {
      checkHealth: async () => undefined,
      getCurrentUsage: async () => {
        currentCalls += 1;
        return structuredClone(revertFixture.snapshot);
      },
      getHistoricalUsage: async (range) => structuredClone(range === '24h' ? revertFixture.history24h : revertFixture.history7d),
      getImpactSummary: async () => structuredClone(revertFixture.impact),
    };
    const cache = new MemoryRevertCache();
    const config = { apiUrl: 'https://example.test', apiKey: 'test-only', staleAfterMinutes: 30, cacheTtlSeconds: 60 };
    const now = () => new Date('2026-08-22T10:10:00Z');
    const first = new RevertProvider(config, transport, now, cache);
    const second = new RevertProvider(config, transport, now, cache);

    expect(await first.checkHealth()).toMatchObject({ state: 'ready' });
    expect((await first.getCurrentUsage()).currentPowerKw).toBe(0);
    expect(await second.getMetadata()).toMatchObject({ freshness: { state: 'cached' } });
    expect(currentCalls).toBe(1);
  });

  it('expires cached snapshots and histories and refetches through the transport', async () => {
    let currentCalls = 0;
    let historyCalls = 0;
    let currentTime = new Date('2026-08-22T10:10:00Z');
    const transport: RevertTransport = {
      getCurrentUsage: async () => {
        currentCalls += 1;
        return structuredClone(revertFixture.snapshot);
      },
      getHistoricalUsage: async () => {
        historyCalls += 1;
        return structuredClone(revertFixture.history24h);
      },
    };
    const provider = new RevertProvider(
      { apiUrl: 'https://example.test', apiKey: 'test-only', staleAfterMinutes: 30, cacheTtlSeconds: 60 },
      transport,
      () => new Date(currentTime),
    );

    await provider.getCurrentUsage();
    await provider.getCurrentUsage();
    await provider.getHistoricalUsage('24h');
    await provider.getHistoricalUsage('24h');
    expect({ currentCalls, historyCalls }).toEqual({ currentCalls: 1, historyCalls: 1 });

    currentTime = new Date('2026-08-22T10:11:01Z');
    await provider.getCurrentUsage();
    await provider.getHistoricalUsage('24h');
    expect({ currentCalls, historyCalls }).toEqual({ currentCalls: 2, historyCalls: 2 });
  });

  it('rejects malformed normalized transport values', async () => {
    const transport: RevertTransport = {
      getCurrentUsage: async () => ({ currentPowerKw: Infinity }),
      getHistoricalUsage: async () => [],
    };
    const provider = new RevertProvider({ apiUrl: 'https://example.test', apiKey: 'test-only', staleAfterMinutes: 30 }, transport);
    await expect(provider.getCurrentUsage()).rejects.toMatchObject({ code: 'INVALID_UPSTREAM_DATA' });
  });

  it('rejects unsupported verified energy language when no evidence contract exists', async () => {
    const verifiedSnapshot = structuredClone(revertFixture.snapshot) as { quality: string };
    verifiedSnapshot.quality = 'verified';
    const transport: RevertTransport = {
      getCurrentUsage: async () => verifiedSnapshot,
      getHistoricalUsage: async () => [],
    };
    const provider = new RevertProvider({ apiUrl: 'https://example.test', apiKey: 'test-only', staleAfterMinutes: 30 }, transport);
    await expect(provider.getCurrentUsage()).rejects.toMatchObject({ code: 'INVALID_UPSTREAM_DATA' });
  });

  it('classifies fresh and stale observations independently from quality', () => {
    expect(classifyFreshness('2026-08-22T11:45:00Z', 30, new Date('2026-08-22T12:00:00Z'))).toBe('live');
    expect(classifyFreshness('2026-08-22T10:00:00Z', 30, new Date('2026-08-22T12:00:00Z'))).toBe('stale');
    expect(classifyFreshness('2026-08-22T12:03:00Z', 30, new Date('2026-08-22T12:00:00Z'))).toBe('live');
  });
});

describe('provider configuration and safe failures', () => {
  it('defaults every domain to mock and reports readiness without secret values', () => {
    const env = testEnv();
    expect(getProviderSelections(env)).toEqual({ carbon: 'mock', energy: 'mock', projects: 'mock', roadmap: 'mock', siteContent: 'mock' });
    expect(getProviderDiagnostics(env).every((item) => item.ready)).toBe(true);
  });

  it('rejects unsupported selectors and reports missing selected-provider configuration', () => {
    expect(() => getProviderSelections(testEnv({ ENERGY_PROVIDER: 'mystery' }))).toThrow(ProviderError);
    const diagnostics = getProviderDiagnostics(testEnv({ ENERGY_PROVIDER: 'revert' }));
    expect(diagnostics.find((item) => item.domain === 'energy')).toMatchObject({ ready: false, missing: ['REVERT_API_URL', 'REVERT_API_KEY'] });
    expect(getProviderDiagnostics(testEnv({ ROADMAP_PROVIDER: 'config' })).find((item) => item.domain === 'roadmap')).toMatchObject({ ready: false, missing: ['ROADMAP_DATA_URL'] });
    expect(getProviderDiagnostics(testEnv({ CARBON_PROVIDER: 'inventory', CARBON_DATA_URL: 'file:///private.json' })).find((item) => item.domain === 'carbon')).toMatchObject({ ready: false, invalid: ['CARBON_DATA_URL'] });
    expect(getProviderDiagnostics(testEnv({ SITE_CONTENT_PROVIDER: 'snapshot' })).find((item) => item.domain === 'site-content')).toMatchObject({ ready: false, missing: ['SITE_CONTENT_URL'] });
    expect(getProviderDiagnostics(testEnv({ SITE_CONTENT_PROVIDER: 'snapshot', SITE_CONTENT_URL: 'file:///private.json' })).find((item) => item.domain === 'site-content')).toMatchObject({ ready: false, invalid: ['SITE_CONTENT_URL'] });
  });

  it('returns safe API errors without leaking internal details', async () => {
    const response = await safeApiResponse(async () => {
      throw new ProviderError('PROVIDER_UNAVAILABLE', { detail: 'secret=https://private.example/token' });
    });
    expect(response.status).toBe(503);
    const body = JSON.stringify(await response.json());
    expect(body).toContain('PROVIDER_UNAVAILABLE');
    expect(body).not.toContain('private.example');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('fails closed when a real provider is selected without configuration', async () => {
    process.env.ENERGY_PROVIDER = 'revert';
    const response = await getEnergyLive();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: { code: 'PROVIDER_MISCONFIGURED', message: 'The selected data source is not configured.' },
    });
  });
});
