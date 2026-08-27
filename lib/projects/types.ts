import type { DataQuality } from '@/lib/data-quality';

export interface ProjectMilestone {
  label: string;
  stage: 'Exploring' | 'Planning' | 'Active' | 'Learning';
  target: string;
}

export type ProjectMetricType =
  | 'activity-count'
  | 'mass-diverted'
  | 'estimated-emissions-avoided'
  | 'certified-offset-retired'
  | 'funds-raised'
  | 'other';

export interface ProjectMetricEquivalency {
  label: string;
  value: number;
  unit: string;
  methodology: string;
  sourceReference: string;
}

export interface PublicProjectMetric {
  id: string;
  label: string;
  metricType: ProjectMetricType;
  value: number | null;
  unit: string;
  periodStart: string | null;
  periodEnd: string | null;
  quality: DataQuality;
  sourceLabel: string;
  methodologyNote: string | null;
  evidenceReference: string | null;
  equivalencies: ProjectMetricEquivalency[];
}

export interface PublicProject {
  id: string;
  title: string;
  category: 'Energy & Buildings' | 'Waste & Circularity' | 'Food Systems' | 'Transportation' | 'Education & Engagement';
  status: 'Exploring' | 'Active' | 'Learning';
  summary: string;
  milestone: ProjectMilestone;
  impact: string | null;
  impactQuality: DataQuality;
  metrics: PublicProjectMetric[];
  verificationReference: string | null;
  nextPublicStep: string | null;
  updatedAt: string;
  quality: DataQuality;
}
