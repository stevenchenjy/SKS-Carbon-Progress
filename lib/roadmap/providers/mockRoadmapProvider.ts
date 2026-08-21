import type { RoadmapProvider } from '@/lib/roadmap/provider';
import type { RoadmapArea } from '@/lib/roadmap/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

const metadata: ProviderMetadata = {
  synthetic: true,
  status: 'prototype',
  provider: 'mock-roadmap',
  sourceLabel: 'Local synthetic roadmap provider',
  disclosure: 'Prototype roadmap stages and progress only. No school achievement is being reported.',
};

const roadmap: RoadmapArea[] = [
  {
    id: 'energy-buildings',
    title: 'Energy & Buildings',
    summary: 'Understand demand, improve operations, and plan smarter upgrades.',
    progress: { stage: 'Measure', percent: 42, quality: 'prototype' },
    exampleActions: ['Map sample plug loads', 'Draft a building walkthrough'],
    futureGoals: ['Connect reviewed Revert data', 'Publish a verified energy baseline'],
  },
  {
    id: 'waste-circularity',
    title: 'Waste & Circularity',
    summary: 'Keep materials in use and make campus waste patterns visible.',
    progress: { stage: 'Act', percent: 56, quality: 'prototype' },
    exampleActions: ['Prototype a composting update', 'Test clearer sorting signs'],
    futureGoals: ['Add consistent weight data', 'Document diversion methods'],
  },
  {
    id: 'food-systems',
    title: 'Food Systems',
    summary: 'Explore how menu choices, sourcing, and learning fit together.',
    progress: { stage: 'Listen', percent: 24, quality: 'prototype' },
    exampleActions: ['Gather sample questions', 'Map possible data sources'],
    futureGoals: ['Define a public-safe measure', 'Co-design student learning'],
  },
  {
    id: 'transportation',
    title: 'Transportation',
    summary: 'Learn from aggregate travel patterns without exposing identities.',
    progress: { stage: 'Listen', percent: 18, quality: 'prototype' },
    exampleActions: ['Draft privacy rules', 'Explore aggregate categories'],
    futureGoals: ['Set a reporting boundary', 'Publish only reviewed summaries'],
  },
  {
    id: 'education-engagement',
    title: 'Education & Engagement',
    summary: 'Turn campus measurement into questions students can investigate.',
    progress: { stage: 'Learn', percent: 64, quality: 'prototype' },
    exampleActions: ['Prototype data stories', 'Connect projects to classes'],
    futureGoals: ['Invite student interpretation', 'Share an annual learning brief'],
  },
];

export class MockRoadmapProvider implements RoadmapProvider {
  async getMetadata(): Promise<ProviderMetadata> {
    return structuredClone(metadata);
  }

  async getAreas(): Promise<RoadmapArea[]> {
    return structuredClone(roadmap);
  }
}
