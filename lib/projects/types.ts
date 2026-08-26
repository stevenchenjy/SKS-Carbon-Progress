import type { DataQuality } from '@/lib/data-quality';

export interface ProjectMilestone {
  label: string;
  stage: 'Exploring' | 'Planning' | 'Active' | 'Learning';
  target: string;
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
  verificationReference: string | null;
  nextPublicStep: string | null;
  updatedAt: string;
  quality: DataQuality;
}
