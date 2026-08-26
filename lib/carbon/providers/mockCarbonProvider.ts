import type { CarbonProvider } from '@/lib/carbon/provider';
import type { CarbonHistoryPoint, CarbonMethodology, CarbonOverview } from '@/lib/carbon/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

const metadata: ProviderMetadata = {
  synthetic: true,
  status: 'prototype',
  provider: 'mock-carbon',
  sourceLabel: 'Local synthetic carbon provider',
  disclosure: 'Prototype carbon data only. No real school inventory or reduction result is loaded.',
  availability: 'partial',
  publicationStatus: 'prototype',
  freshness: { state: 'not-applicable', observedAt: '2026-08-22T00:00:00-04:00', staleAfterMinutes: null },
  coverage: {
    kind: 'inventory-boundary',
    label: 'Illustrative scope structure',
    note: 'The prototype does not define or claim an approved school reporting boundary.',
    monitoredDeviceCount: null,
  },
  reportingPeriod: { start: '2025-01-01', end: '2026-12-31', label: 'Illustrative 2025–2026 structure' },
  sourceType: 'synthetic',
  verification: { state: 'not-applicable', reference: null, note: 'Synthetic prototype data is not eligible for verification.' },
  methodologyNote: 'Illustrative scope and scenario structure only.',
};

const overview: CarbonOverview = {
  baselineYear: 2025,
  latestReportingYear: 2026,
  reductionPercent: null,
  emissionsTrend: 'Illustrative pathway only',
  reportingStatus: 'Prototype',
  quality: 'prototype',
  scopeBreakdown: [
    {
      scope: 'Scope 1',
      source: 'Direct campus sources',
      value: null,
      unit: 'illustrative index',
      quality: 'prototype',
      note: 'Mock structure — no school result loaded',
    },
    {
      scope: 'Scope 2',
      source: 'Purchased electricity',
      value: null,
      unit: 'illustrative index',
      quality: 'prototype',
      note: 'Mock structure — no school result loaded',
    },
    {
      scope: 'Scope 3',
      source: 'Indirect value-chain sources',
      value: null,
      unit: 'illustrative index',
      quality: 'pending',
      note: 'Pending future data collection',
    },
  ],
  totals: null,
};

const history: CarbonHistoryPoint[] = [
  { year: 2025, value: 100, unit: 'illustrative index', kind: 'inventory', milestone: 'inventory', note: 'Example baseline structure established', quality: 'prototype' },
  { year: 2026, value: 94, unit: 'illustrative index', kind: 'inventory', milestone: 'inventory', note: 'Sample reporting cycle demonstrated', quality: 'prototype' },
  { year: 2027, value: 87, unit: 'illustrative index', kind: 'scenario', milestone: 'reduction project', note: 'Illustrative scenario connects action to data', quality: 'prototype' },
  { year: 2028, value: 79, unit: 'illustrative index', kind: 'scenario', milestone: 'verification milestone', note: 'External review would be recorded here', quality: 'prototype' },
];

const methodology: CarbonMethodology = {
  reportingBoundary: 'A future inventory will define which campus operations and activities are included before results are published.',
  baselineDefinition: 'The baseline year shown in this prototype is an example field, not an approved Storm King School baseline.',
  emissionsFactors: 'Future calculations will document the source, geography, and version of every emissions factor used.',
  reportingYear: 'Each inventory will identify the period covered and the date of any later correction.',
  dataQualityStatus: 'prototype',
  approach: [
    'Separate directly measured activity from estimates.',
    'Keep assumptions and missing-data decisions visible.',
    'Add third-party verification status only when evidence exists.',
  ],
};

export class MockCarbonProvider implements CarbonProvider {
  async getMetadata(): Promise<ProviderMetadata> {
    return structuredClone(metadata);
  }

  async getOverview(): Promise<CarbonOverview> {
    return structuredClone(overview);
  }

  async getHistory(): Promise<CarbonHistoryPoint[]> {
    return structuredClone(history);
  }

  async getMethodology(): Promise<CarbonMethodology> {
    return structuredClone(methodology);
  }
}
