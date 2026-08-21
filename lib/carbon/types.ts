import type { DataQuality } from '@/lib/data-quality';

export interface CarbonScopeSummary {
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  source: string;
  value: number | null;
  unit: string;
  quality: DataQuality;
  note: string;
}

export interface CarbonOverview {
  baselineYear: number | null;
  latestReportingYear: number | null;
  reductionPercent: number | null;
  emissionsTrend: string;
  reportingStatus: string;
  quality: DataQuality;
  scopeBreakdown: CarbonScopeSummary[];
}

export interface CarbonHistoryPoint {
  year: number;
  value: number | null;
  unit: string;
  kind: 'inventory' | 'scenario';
  milestone: 'inventory' | 'reduction project' | 'verification milestone';
  note: string;
  quality: DataQuality;
}

export interface CarbonMethodology {
  reportingBoundary: string;
  baselineDefinition: string;
  emissionsFactors: string;
  reportingYear: string;
  dataQualityStatus: DataQuality;
  approach: string[];
}
