import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateCarbonInventoryDocument } from '@/lib/carbon/validation';
import { validateEnergyImpact, validateEnergyPoints, validateEnergySnapshot } from '@/lib/energy/validation';
import { validateStartPublicSnapshot } from '@/lib/projects/validation';
import { requireHttpUrl } from '@/lib/providers/config';
import { HttpJsonSource } from '@/lib/providers/http-json-source';
import { validateRoadmapConfigDocument } from '@/lib/roadmap/validation';
import { validateSiteContentSnapshot } from '@/lib/site-content/validation';
import { isPublicHttpUrl, normalizePublicHttpUrl } from '@/lib/validation/runtime';

interface MutableCarbonFixture {
  source: { synthetic: boolean; publicationStatus: string };
  overview: { quality: string; scopeBreakdown: Array<{ quality: string }> };
  methodology: { dataQualityStatus: string };
  history: Array<{ quality: string }>;
}

interface MutableProjectFixture {
  source: { synthetic: boolean; publicationStatus: string; quality: string };
  publicProjects: Array<{
    id: string;
    impact: string | null;
    quality: string;
    impactQuality: string;
    metrics: Array<{ id: string; quality: string }>;
  }>;
}

interface MutableRoadmapFixture {
  source: { synthetic: boolean; publicationStatus: string; quality: string };
  areas: Array<{ progress: { quality: string } }>;
}

interface MutableSiteContentFixture {
  source: { synthetic: boolean; publicationStatus: string; quality: string };
  overview: { sourceReferences: string[] };
  carbonPlan: { quality: string };
}

const carbonFixture = JSON.parse(readFileSync('fixtures/carbon-inventory.example.json', 'utf8')) as MutableCarbonFixture;
const projectFixture = JSON.parse(readFileSync('fixtures/start-public-snapshot.example.json', 'utf8')) as MutableProjectFixture;
const roadmapFixture = JSON.parse(readFileSync('fixtures/roadmap-config.example.json', 'utf8')) as MutableRoadmapFixture;
const siteContentFixture = JSON.parse(readFileSync('fixtures/site-content.example.json', 'utf8')) as MutableSiteContentFixture;

function realCarbonDocument(publicationStatus: 'draft' | 'reported') {
  const value = structuredClone(carbonFixture);
  value.source.synthetic = false;
  value.source.publicationStatus = publicationStatus;
  value.overview.quality = 'estimated';
  value.methodology.dataQualityStatus = 'estimated';
  for (const scope of value.overview.scopeBreakdown) {
    if (scope.quality === 'prototype') scope.quality = 'estimated';
  }
  for (const point of value.history) {
    if (point.quality === 'prototype') point.quality = 'estimated';
  }
  return value;
}

function realProjectSnapshot(publicationStatus: 'draft' | 'reported') {
  const value = structuredClone(projectFixture);
  value.source.synthetic = false;
  value.source.publicationStatus = publicationStatus;
  value.source.quality = 'pending';
  for (const project of value.publicProjects) {
    project.quality = 'pending';
    project.impactQuality = 'pending';
    for (const metric of project.metrics) metric.quality = 'pending';
  }
  return value;
}

function realRoadmapDocument(publicationStatus: 'draft' | 'reported') {
  const value = structuredClone(roadmapFixture);
  value.source.synthetic = false;
  value.source.publicationStatus = publicationStatus;
  value.source.quality = 'pending';
  for (const area of value.areas) area.progress.quality = 'pending';
  return value;
}

function realSiteContentSnapshot(publicationStatus: 'draft' | 'reported') {
  const value = structuredClone(siteContentFixture);
  value.source.synthetic = false;
  value.source.publicationStatus = publicationStatus;
  value.source.quality = 'pending';
  value.carbonPlan.quality = 'pending';
  return value;
}

describe('public URL validation', () => {
  it.each([
    'https://user:password@example.org/report',
    'http://localhost/report',
    'http://service.local/report',
    'http://127.0.0.1/report',
    'http://10.20.30.40/report',
    'http://169.254.10.20/report',
    'http://172.20.0.1/report',
    'http://192.168.1.1/report',
    'http://[::1]/report',
    'http://[fc00::1]/report',
    'http://[fe80::1]/report',
    'http://[fec0::1]/report',
    'http://[feff::1]/report',
    'http://[::ffff:127.0.0.1]/report',
    'http://[::127.0.0.1]/report',
    'http://198.18.0.1/report',
  ])('rejects credential-bearing or direct local-network URL %s', (url) => {
    expect(isPublicHttpUrl(url)).toBe(false);
    expect(() => normalizePublicHttpUrl(url)).toThrow();
  });

  it('accepts and normalizes a public HTTP(S) URL', () => {
    expect(normalizePublicHttpUrl('https://example.org/reports/public.pdf')).toBe('https://example.org/reports/public.pdf');
    expect(isPublicHttpUrl('http://data.example.org/public.json')).toBe(true);
    expect(isPublicHttpUrl('https://[2606:4700:4700::1111]/public.json')).toBe(true);
  });

  it('disables redirects and rejects a changed or unsafe final response URL', async () => {
    let observedRequestUrl = '';
    let observedRedirect: RequestRedirect | undefined;
    const fetcherFor = (responseUrl: string): typeof fetch => (async (input, init) => {
      observedRequestUrl = String(input);
      observedRedirect = init?.redirect;
      const response = Response.json({ ok: true });
      Object.defineProperty(response, 'url', { value: responseUrl });
      return response;
    }) as typeof fetch;

    const direct = new HttpJsonSource({
      url: 'https://example.org/public.json#ignored-fragment',
      fetcher: fetcherFor('https://example.org/public.json'),
    });
    await expect(direct.load()).resolves.toEqual({ ok: true });
    expect(observedRequestUrl).toBe('https://example.org/public.json');
    expect(observedRedirect).toBe('error');

    await expect(new HttpJsonSource({
      url: 'https://example.org/public.json',
      fetcher: fetcherFor('https://cdn.example.org/public.json'),
    }).load()).rejects.toMatchObject({ code: 'PROVIDER_UNAVAILABLE' });

    await expect(new HttpJsonSource({
      url: 'https://example.org/public.json',
      fetcher: fetcherFor('http://127.0.0.1/private.json'),
    }).load()).rejects.toMatchObject({ code: 'PROVIDER_UNAVAILABLE' });
  });

  it('applies the same restriction to provider endpoint configuration and content references', () => {
    expect(() => requireHttpUrl('CARBON_DATA_URL', {
      NODE_ENV: 'test',
      CARBON_DATA_URL: 'http://127.0.0.1/private.json',
    })).toThrow(/public HTTP\(S\)/i);

    const content = structuredClone(siteContentFixture);
    content.overview.sourceReferences = ['https://user:token@example.org/report'];
    expect(() => validateSiteContentSnapshot(content)).toThrow(/public HTTP\(S\)/i);
  });
});

describe('energy null semantics', () => {
  const coverage = {
    kind: 'selected-devices',
    label: 'Test devices',
    monitoredDeviceCount: 2,
    note: 'Selected devices only.',
  };

  it.each(['measured', 'estimated'] as const)('rejects a null history value labeled %s', (quality) => {
    expect(() => validateEnergyPoints([{
      timestamp: '2026-08-20T12:00:00Z',
      label: 'Noon',
      value: null,
      unit: 'kW',
      quality,
    }], 'kW', new Date('2026-08-20T13:00:00Z'))).toThrow(/pending or prototype when value is null/i);
  });

  it('permits an honest pending null history value and preserves genuine zero', () => {
    const values = validateEnergyPoints([
      { timestamp: '2026-08-20T11:00:00Z', label: 'Missing', value: null, unit: 'kW', quality: 'pending' },
      { timestamp: '2026-08-20T12:00:00Z', label: 'Zero', value: 0, unit: 'kW', quality: 'measured' },
    ], 'kW', new Date('2026-08-20T13:00:00Z'));
    expect(values.map((point) => point.value)).toEqual([null, 0]);
  });

  it('rejects measured or estimated null impact and all-null current readings', () => {
    expect(() => validateEnergyImpact({
      avoidedEnergyKwh: null,
      comparisonMethod: 'Test method',
      quality: 'estimated',
    })).toThrow(/pending or prototype/i);

    expect(() => validateEnergySnapshot({
      currentPowerKw: null,
      energyTodayKwh: null,
      weeklyTrendPercent: null,
      lastUpdatedAt: '2026-08-20T12:00:00Z',
      quality: 'measured',
      coverage,
    }, new Date('2026-08-20T13:00:00Z'))).toThrow(/all current energy readings are unavailable/i);

    expect(validateEnergySnapshot({
      currentPowerKw: null,
      energyTodayKwh: null,
      weeklyTrendPercent: null,
      lastUpdatedAt: '2026-08-20T12:00:00Z',
      quality: 'pending',
      coverage,
    }, new Date('2026-08-20T13:00:00Z')).currentPowerKw).toBeNull();
  });
});

describe('START public identifier validation', () => {
  it.each([
    'Uppercase-id',
    'contains spaces',
    'contains_underscore',
    '-leading-hyphen',
    'trailing-hyphen-',
    'double--hyphen',
  ])('rejects invalid project id %s', (id) => {
    const value = structuredClone(projectFixture);
    value.publicProjects[0].id = id;
    expect(() => validateStartPublicSnapshot(value)).toThrow(/publicProjects\[0\]\.id must be a lowercase kebab-case slug/i);
  });

  it.each([
    'Metric-ID',
    'metric id',
    'metric_id',
    '-metric-id',
    'metric-id-',
    'metric--id',
  ])('rejects invalid metric id %s', (id) => {
    const value = structuredClone(projectFixture);
    value.publicProjects[0].metrics[0].id = id;
    expect(() => validateStartPublicSnapshot(value)).toThrow(/publicProjects\[0\]\.metrics\[0\]\.id must be a lowercase kebab-case slug/i);
  });

  it('preserves project and per-project metric duplicate checks', () => {
    const duplicateProject = structuredClone(projectFixture);
    duplicateProject.publicProjects.push(structuredClone(duplicateProject.publicProjects[0]));
    expect(() => validateStartPublicSnapshot(duplicateProject)).toThrow(/publicProjects contains duplicate id public-example/i);

    const duplicateMetric = structuredClone(projectFixture);
    duplicateMetric.publicProjects[0].metrics.push(structuredClone(duplicateMetric.publicProjects[0].metrics[0]));
    expect(() => validateStartPublicSnapshot(duplicateMetric)).toThrow(/metrics contains duplicate id sample-count/i);
  });

  it('permits a pending descriptive impact in a synthetic project snapshot', () => {
    const value = structuredClone(projectFixture);
    value.publicProjects[0].impact = 'Expected benefit is being documented; no measured quantity is reported.';
    value.publicProjects[0].impactQuality = 'pending';
    expect(validateStartPublicSnapshot(value).publicProjects[0].impact).toBe(value.publicProjects[0].impact);
  });
});

describe('public snapshot publication gating', () => {
  it('accepts explicitly reported real documents', () => {
    expect(validateCarbonInventoryDocument(realCarbonDocument('reported')).source.publicationStatus).toBe('reported');
    expect(validateStartPublicSnapshot(realProjectSnapshot('reported')).source.publicationStatus).toBe('reported');
    expect(validateRoadmapConfigDocument(realRoadmapDocument('reported')).source.publicationStatus).toBe('reported');
    expect(validateSiteContentSnapshot(realSiteContentSnapshot('reported')).source.publicationStatus).toBe('reported');
  });

  it('fails closed for real documents still marked draft', () => {
    expect(() => validateCarbonInventoryDocument(realCarbonDocument('draft'))).toThrow(/must be reported/i);
    expect(() => validateStartPublicSnapshot(realProjectSnapshot('draft'))).toThrow(/must be reported/i);
    expect(() => validateRoadmapConfigDocument(realRoadmapDocument('draft'))).toThrow(/must be reported/i);
    expect(() => validateSiteContentSnapshot(realSiteContentSnapshot('draft'))).toThrow(/must be reported/i);
  });
});
