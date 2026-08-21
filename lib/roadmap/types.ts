import type { DataQuality } from '@/lib/data-quality';

export interface RoadmapProgress {
  stage: 'Listen' | 'Measure' | 'Act' | 'Learn';
  percent: number;
  quality: DataQuality;
}

export interface RoadmapArea {
  id: string;
  title: string;
  summary: string;
  progress: RoadmapProgress;
  exampleActions: string[];
  futureGoals: string[];
}
