import type { DataQuality } from '@/lib/data-quality';

export type CarbonUnit = 'tCO2e' | 'kgCO2e' | 'illustrative index';
export type CarbonAccountingUnit = Exclude<CarbonUnit, 'illustrative index'>;

export interface CarbonTotals {
  grossEmissions: number | null;
  offsets: number | null;
  netEmissions: number | null;
  unit: CarbonAccountingUnit;
  calculationMethod: string | null;
}

export interface CarbonScopeSummary {
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  source: string;
  value: number | null;
  unit: CarbonUnit;
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
  totals: CarbonTotals | null;
}

export interface CarbonHistoryPoint {
  year: number;
  value: number | null;
  unit: CarbonUnit;
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
