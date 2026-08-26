import type { ProjectProvider } from '@/lib/projects/provider';
import type { PublicProject } from '@/lib/projects/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

const metadata: ProviderMetadata = {
  synthetic: true,
  status: 'prototype',
  provider: 'mock-public-projects',
  sourceLabel: 'Local fictional public projects',
  disclosure: 'Prototype project data only. Every project card is a fictional interface example.',
  availability: 'partial',
  publicationStatus: 'prototype',
  freshness: { state: 'not-applicable', observedAt: '2026-08-14', staleAfterMinutes: null },
  coverage: {
    kind: 'public-subset',
    label: 'Fictional public project subset',
    note: 'Only public-safe example fields are represented.',
    monitoredDeviceCount: null,
  },
  reportingPeriod: null,
  sourceType: 'synthetic',
  verification: { state: 'not-applicable', reference: null, note: 'Fictional project cards are not verified results.' },
  methodologyNote: 'Synthetic public-project field and privacy-boundary demonstration.',
};

const mockProjects: PublicProject[] = [
  {
    id: 'materials-sorting-studio',
    title: 'Materials Sorting Studio',
    category: 'Waste & Circularity',
    status: 'Active',
    summary: 'A fictional public update showing how a classroom materials-sorting exercise could be explained.',
    milestone: { label: 'Pilot measurement underway', stage: 'Active', target: 'Illustrative fall cycle' },
    impact: 'Example impact field — no measured result yet',
    impactQuality: 'prototype',
    verificationReference: null,
    nextPublicStep: 'Review the fictional pilot measurement approach',
    updatedAt: '2026-08-14',
    quality: 'prototype',
  },
  {
    id: 'building-energy-walkthrough',
    title: 'Building Energy Walkthrough',
    category: 'Energy & Buildings',
    status: 'Learning',
    summary: 'A prototype story about students mapping when selected equipment uses electricity.',
    milestone: { label: 'Sample observation map drafted', stage: 'Learning', target: 'Illustrative winter review' },
    impact: 'Learning outcome only — energy impact not calculated',
    impactQuality: 'prototype',
    verificationReference: null,
    nextPublicStep: 'Discuss sample observations in a learning session',
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
    impact: null,
    impactQuality: 'prototype',
    verificationReference: null,
    nextPublicStep: 'Define a public-safe methodology before measuring results',
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
    impact: null,
    impactQuality: 'prototype',
    verificationReference: null,
    nextPublicStep: 'Complete a privacy review before any future collection',
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
