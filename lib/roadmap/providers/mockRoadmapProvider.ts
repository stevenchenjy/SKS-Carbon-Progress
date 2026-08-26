import type { RoadmapProvider } from '@/lib/roadmap/provider';
import type { RoadmapArea } from '@/lib/roadmap/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

const metadata: ProviderMetadata = {
  synthetic: true,
  status: 'prototype',
  provider: 'mock-roadmap',
  sourceLabel: 'Local synthetic roadmap provider',
  disclosure: 'Prototype roadmap stages and progress only. No school achievement is being reported.',
  availability: 'available',
  publicationStatus: 'prototype',
  freshness: { state: 'not-applicable', observedAt: '2026-08-22', staleAfterMinutes: null },
  coverage: {
    kind: 'not-applicable',
    label: 'Five illustrative action areas',
    note: 'Roadmap stages are qualitative examples rather than measured performance.',
    monitoredDeviceCount: null,
  },
  reportingPeriod: null,
  sourceType: 'synthetic',
  verification: { state: 'not-applicable', reference: null, note: 'Synthetic roadmap stages are not verified achievements.' },
  methodologyNote: 'Qualitative prototype stages are used because no reviewed progress metric is available.',
};

const roadmap: RoadmapArea[] = [
  {
    id: 'energy-buildings',
    title: 'Energy & Buildings',
    summary: 'Understand demand, improve operations, and plan smarter upgrades.',
    target: null,
    progress: { stage: 'Baseline established', percent: null, metricLabel: null, quality: 'prototype' },
    exampleActions: ['Map sample plug loads', 'Draft a building walkthrough'],
    futureGoals: ['Connect reviewed Revert data', 'Publish a verified energy baseline'],
    linkedPublicProjectIds: [],
    methodologyNote: 'Synthetic qualitative stage; no progress percentage or school target is assigned.',
  },
  {
    id: 'waste-circularity',
    title: 'Waste & Circularity',
    summary: 'Keep materials in use and make campus waste patterns visible.',
    target: null,
    progress: { stage: 'Pilot', percent: null, metricLabel: null, quality: 'prototype' },
    exampleActions: ['Prototype a materials audit', 'Test clearer sorting signs'],
    futureGoals: ['Add consistent weight data', 'Document diversion methods'],
    linkedPublicProjectIds: [],
    methodologyNote: 'Synthetic qualitative stage; no progress percentage or school target is assigned.',
  },
  {
    id: 'food-systems',
    title: 'Food Systems',
    summary: 'Explore how menu choices, sourcing, and learning fit together.',
    target: null,
    progress: { stage: 'Planning', percent: null, metricLabel: null, quality: 'prototype' },
    exampleActions: ['Gather sample questions', 'Map possible data sources'],
    futureGoals: ['Define a public-safe measure', 'Co-design student learning'],
    linkedPublicProjectIds: [],
    methodologyNote: 'Synthetic qualitative stage; no progress percentage or school target is assigned.',
  },
  {
    id: 'transportation',
    title: 'Transportation',
    summary: 'Learn from aggregate travel patterns without exposing identities.',
    target: null,
    progress: { stage: 'Planning', percent: null, metricLabel: null, quality: 'prototype' },
    exampleActions: ['Draft privacy rules', 'Explore aggregate categories'],
    futureGoals: ['Set a reporting boundary', 'Publish only reviewed summaries'],
    linkedPublicProjectIds: [],
    methodologyNote: 'Synthetic qualitative stage; no progress percentage or school target is assigned.',
  },
  {
    id: 'education-engagement',
    title: 'Education & Engagement',
    summary: 'Turn campus measurement into questions students can investigate.',
    target: null,
    progress: { stage: 'Pilot', percent: null, metricLabel: null, quality: 'prototype' },
    exampleActions: ['Prototype data stories', 'Connect projects to classes'],
    futureGoals: ['Invite student interpretation', 'Share an annual learning brief'],
    linkedPublicProjectIds: [],
    methodologyNote: 'Synthetic qualitative stage; no progress percentage or school target is assigned.',
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
