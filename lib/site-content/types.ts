import type { DataQuality } from '@/lib/data-quality';

export type SchoolValueName = 'Truth' | 'Respect' | 'Responsibility' | 'Scholarship';

export interface SchoolValueAlignment {
  value: SchoolValueName;
  statement: string;
}

export interface SustainabilityOverviewContent {
  sustainabilityDefinition: string;
  placeContext: string;
  valueAlignment: SchoolValueAlignment[];
  sourceReferences: string[];
}

export type StartAdoptionStatus = 'working-purpose' | 'confirmed';

export interface StartContent {
  introduction: string;
  adoptionRationale: string | null;
  adoptionStatus: StartAdoptionStatus;
  owner: string | null;
  adoptionDate: string | null;
  workflow: string[];
  privacyBoundary: string;
  snapshotCadence: string | null;
}

export type CarbonPlanStatus =
  | 'Framework'
  | 'Baseline in progress'
  | 'Plan active'
  | 'On track'
  | 'At risk'
  | 'Achieved';

export interface CarbonFrameworkStage {
  id: string;
  title: string;
  description: string;
}

export interface CarbonNeutralityPlanContent {
  definition: string;
  goal: string | null;
  targetYear: number | null;
  baselineYear: number | null;
  latestReportingYear: number | null;
  inventoryBoundary: string | null;
  baselineGrossEmissionsTco2e: number | null;
  latestGrossEmissionsTco2e: number | null;
  targetGrossEmissionsTco2e: number | null;
  progressPercent: number | null;
  progressMetric: string | null;
  progressMethod: string | null;
  retiredOffsetsTco2e: number | null;
  offsetsMethod: string | null;
  offsetsEvidenceReference: string | null;
  status: CarbonPlanStatus;
  updatedAt: string | null;
  quality: DataQuality;
  framework: CarbonFrameworkStage[];
}

export interface SiteContentSnapshotSource {
  id: string;
  label: string;
  synthetic: boolean;
  generatedAt: string;
  publicationStatus: 'prototype' | 'draft' | 'reported';
  quality: DataQuality;
  methodologyNote: string;
}

export interface SiteContentSnapshot {
  schemaVersion: 1;
  source: SiteContentSnapshotSource;
  overview: SustainabilityOverviewContent;
  start: StartContent;
  carbonPlan: CarbonNeutralityPlanContent;
}
