import type { DataQuality } from '@/lib/data-quality';

export interface RoadmapProgress {
  stage: 'Planning' | 'Baseline established' | 'Pilot' | 'Implementation' | 'Scaling' | 'Institutionalized';
  percent: number | null;
  metricLabel: string | null;
  quality: DataQuality;
}

export interface RoadmapArea {
  id: string;
  title: string;
  summary: string;
  target: string | null;
  progress: RoadmapProgress;
  exampleActions: string[];
  futureGoals: string[];
  linkedPublicProjectIds: string[];
  methodologyNote: string | null;
}
