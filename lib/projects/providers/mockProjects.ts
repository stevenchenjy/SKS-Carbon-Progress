import type { ProjectProvider } from '@/lib/projects/provider';
import type { PublicProject } from '@/lib/projects/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

const metadata: ProviderMetadata = {
  synthetic: true,
  status: 'prototype',
  provider: 'mock-public-projects',
  sourceLabel: 'Local fictional public projects',
  disclosure: 'Prototype project data only. Every project card is a fictional interface example.',
};

const mockProjects: PublicProject[] = [
  {
    id: 'composting-expansion',
    title: 'Composting Expansion',
    category: 'Waste & Circularity',
    status: 'Active',
    summary: 'A sample public update showing how a dining-hall organics pilot could be explained.',
    milestone: { label: 'Pilot measurement underway', stage: 'Active', target: 'Illustrative fall cycle' },
    impact: 'Example impact field — no measured result yet',
    updatedAt: '2026-08-14',
    quality: 'prototype',
  },
  {
    id: 'building-energy-walkthrough',
    title: 'Building Energy Walkthrough',
    category: 'Energy & Buildings',
    status: 'Learning',
    summary: 'A prototype story about students mapping where and when campus energy is used.',
    milestone: { label: 'Sample observation map drafted', stage: 'Learning', target: 'Illustrative winter review' },
    impact: 'Learning outcome only — energy impact not calculated',
    updatedAt: '2026-08-09',
    quality: 'prototype',
  },
  {
    id: 'low-carbon-menu-lab',
    title: 'Low-Carbon Menu Lab',
    category: 'Food Systems',
    status: 'Exploring',
    summary: 'An example of how food, climate literacy, and community feedback could connect.',
    milestone: { label: 'Sample inquiry questions prepared', stage: 'Exploring', target: 'Illustrative spring workshop' },
    impact: 'Future methodology required before any claim',
    updatedAt: '2026-07-28',
    quality: 'prototype',
  },
  {
    id: 'commute-pattern-study',
    title: 'Commute Pattern Study',
    category: 'Transportation',
    status: 'Exploring',
    summary: 'A privacy-conscious placeholder for future aggregate transportation learning.',
    milestone: { label: 'Public-safe data design in review', stage: 'Planning', target: 'No collection scheduled' },
    impact: 'No participant or student data collected',
    updatedAt: '2026-07-16',
    quality: 'prototype',
  },
];

export class MockProjectProvider implements ProjectProvider {
  async getMetadata(): Promise<ProviderMetadata> {
    return structuredClone(metadata);
  }

  async getPublicProjects(): Promise<PublicProject[]> {
    return structuredClone(mockProjects);
  }
}
